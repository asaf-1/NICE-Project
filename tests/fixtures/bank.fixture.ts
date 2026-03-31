import { test as base, expect } from '@playwright/test';
import { BankApiClient } from '../../src/api/bank-api.client';
import { env } from '../../src/config/env';
import { createRegistrationUser } from '../../src/data/user.factory';
import { AccountsOverviewPage } from '../../src/pages/accounts-overview.page';
import { LoginPage } from '../../src/pages/login.page';
import { RegisterPage } from '../../src/pages/register.page';
import { TransferFundsPage } from '../../src/pages/transfer-funds.page';
import { Account, Customer, RegistrationUser } from '../../src/types/bank';

type BankFixtures = {
  user: RegistrationUser;
  registeredUser: RegistrationUser;
  customer: Customer;
  defaultAccount: Account;
  api: BankApiClient;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  accountsOverviewPage: AccountsOverviewPage;
  transferFundsPage: TransferFundsPage;
};

export const test = base.extend<BankFixtures>({
  user: async ({}, use) => {
    await use(createRegistrationUser());
  },

  registeredUser: async ({ registerPage, user }, use) => {
    await registerPage.goto();
    await registerPage.register(user);
    await registerPage.expectRegistrationSuccess(user.username);
    await use(user);
  },

  customer: async ({ api, registeredUser }, use) => {
    const customer = await api.login(registeredUser.username, registeredUser.password);

    await use(customer);
  },

  defaultAccount: async ({ api, customer }, use) => {
    const accounts = await api.getCustomerAccounts(customer.id);
    const defaultAccount = await api.getAccount(accounts[0].id);

    await use(defaultAccount);
  },

  api: async ({ request }, use) => {
    await use(new BankApiClient(request, env.apiBaseUrl));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  accountsOverviewPage: async ({ page }, use) => {
    await use(new AccountsOverviewPage(page));
  },

  transferFundsPage: async ({ page }, use) => {
    await use(new TransferFundsPage(page));
  },
});

export { expect } from '@playwright/test';
