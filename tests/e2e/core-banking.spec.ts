import { expect, test } from '@playwright/test';
import { BankApiClient } from '../../src/api/bank-api.client';
import { expectAccountShape, expectCustomerShape } from '../../src/assertions/bank.assertions';
import { env } from '../../src/config/env';
import { createRegistrationUser } from '../../src/data/user.factory';
import { AccountsOverviewPage } from '../../src/pages/accounts-overview.page';
import { LoginPage } from '../../src/pages/login.page';
import { RegisterPage } from '../../src/pages/register.page';
import { TransferFundsPage } from '../../src/pages/transfer-funds.page';
import { createCheckingAccountViaCurl } from '../../src/utils/curl';
import { sumBalances, toCents } from '../../src/utils/currency';

test.describe('Core Banking Flow', () => {
  test('validates the full UI + API + curl journey', async ({ page, request }, testInfo) => {
    const user = createRegistrationUser();
    const api = new BankApiClient(request, env.apiBaseUrl);
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);
    const accountsOverviewPage = new AccountsOverviewPage(page);
    const transferFundsPage = new TransferFundsPage(page);

    await test.step('Register a new customer via UI', async () => {
      await registerPage.goto();
      await registerPage.register(user);
      await registerPage.expectRegistrationSuccess(user.username);
    });

    await test.step('Log out and log back in via UI', async () => {
      await accountsOverviewPage.logout();
      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await accountsOverviewPage.expectAuthenticated();
    });

    const customer = await test.step('Get customer id via API', async () => {
      const response = await api.login(user.username, user.password);

      expectCustomerShape(response, user);

      return response;
    });

    const existingAccount = await test.step('Get the existing customer account via API', async () => {
      const accounts = await api.getCustomerAccounts(customer.id);

      expect(accounts).toHaveLength(1);
      expectAccountShape(accounts[0], {
        customerId: customer.id,
        type: 'CHECKING',
      });

      const response = await api.getAccount(accounts[0].id);

      expectAccountShape(response, {
        id: accounts[0].id,
        customerId: customer.id,
        type: 'CHECKING',
      });

      return response;
    });

    const initialTotalCents = toCents(existingAccount.balance);

    const createAccountResult = await test.step('Create a new checking account via curl', async () => {
      const response = await createCheckingAccountViaCurl({
        apiBaseUrl: env.apiBaseUrl,
        customerId: customer.id,
        fromAccountId: existingAccount.id,
      });

      await testInfo.attach('create-account-curl-command.txt', {
        body: response.command,
        contentType: 'text/plain',
      });
      await testInfo.attach('create-account-curl-response.json', {
        body: response.rawBody,
        contentType: 'application/json',
      });

      expect(response.statusCode).toBe(200);
      expectAccountShape(response.body, {
        customerId: customer.id,
        type: 'CHECKING',
      });
      expect(response.body.id).not.toBe(existingAccount.id);

      return response;
    });

    const refreshedAccountsAfterCreation = await test.step('Verify the created account through API and UI', async () => {
      await expect
        .poll(async () => {
          const accounts = await api.getCustomerAccounts(customer.id);

          return accounts.length;
        })
        .toBe(2);

      const accounts = await api.getCustomerAccounts(customer.id);
      const sourceAccount = accounts.find((account) => account.id === existingAccount.id);
      const newAccount = accounts.find((account) => account.id === createAccountResult.body.id);

      expect(sourceAccount).toBeDefined();
      expect(newAccount).toBeDefined();

      expectAccountShape(sourceAccount!, {
        id: existingAccount.id,
        customerId: customer.id,
        balance: existingAccount.balance - env.openingDeposit,
      });
      expectAccountShape(newAccount!, {
        id: createAccountResult.body.id,
        customerId: customer.id,
        type: 'CHECKING',
        balance: env.openingDeposit,
      });
      expect(toCents(sumBalances(accounts.map((account) => account.balance)))).toBe(initialTotalCents);

      await accountsOverviewPage.goto();
      await accountsOverviewPage.expectLoaded();
      await accountsOverviewPage.expectAccountVisible(createAccountResult.body.id);
      await expect(accountsOverviewPage.getDisplayedAccountIds()).resolves.toContain(createAccountResult.body.id);
      await expect(accountsOverviewPage.getDisplayedBalance(createAccountResult.body.id)).resolves.toBe(
        env.openingDeposit,
      );

      return {
        sourceAccount: sourceAccount!,
        newAccount: newAccount!,
      };
    });

    await test.step('Transfer money between accounts in the UI', async () => {
      await transferFundsPage.goto();
      await transferFundsPage.expectLoaded();
      await transferFundsPage.transfer({
        amount: env.transferAmount,
        fromAccountId: refreshedAccountsAfterCreation.sourceAccount.id,
        toAccountId: refreshedAccountsAfterCreation.newAccount.id,
      });
      await transferFundsPage.expectTransferComplete({
        amount: env.transferAmount,
        fromAccountId: refreshedAccountsAfterCreation.sourceAccount.id,
        toAccountId: refreshedAccountsAfterCreation.newAccount.id,
      });
    });

    await test.step('Validate updated balances via API', async () => {
      const updatedSourceAccount = await api.getAccount(refreshedAccountsAfterCreation.sourceAccount.id);
      const updatedNewAccount = await api.getAccount(refreshedAccountsAfterCreation.newAccount.id);
      const allAccounts = await api.getCustomerAccounts(customer.id);

      expectAccountShape(updatedSourceAccount, {
        id: refreshedAccountsAfterCreation.sourceAccount.id,
        customerId: customer.id,
        balance: refreshedAccountsAfterCreation.sourceAccount.balance - env.transferAmount,
      });
      expectAccountShape(updatedNewAccount, {
        id: refreshedAccountsAfterCreation.newAccount.id,
        customerId: customer.id,
        balance: refreshedAccountsAfterCreation.newAccount.balance + env.transferAmount,
      });
      expect(toCents(sumBalances(allAccounts.map((account) => account.balance)))).toBe(initialTotalCents);
    });

    await test.step('Log out', async () => {
      await transferFundsPage.logout();
      await expect(page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
    });
  });
});

