import { expectAccountShape, expectCustomerShape } from '../../src/assertions/bank.assertions';
import { test, expect } from '../fixtures/bank.fixture';
import { toCents } from '../../src/utils/currency';

test.describe('@smoke @regression Accounts Setup Smoke', () => {
  test('shows the default checking account consistently in UI and API', async ({
    registeredUser,
    api,
    accountsOverviewPage,
  }) => {
    const customer = await test.step('Load the registered customer through the API', async () => {
      const response = await api.login(registeredUser.username, registeredUser.password);

      expectCustomerShape(response, registeredUser);

      return response;
    });

    const defaultAccount = await test.step('Validate the default account through the API', async () => {
      const accounts = await api.getCustomerAccounts(customer.id);

      expect(accounts).toHaveLength(1);
      expectAccountShape(accounts[0], {
        customerId: customer.id,
        type: 'CHECKING',
      });
      expect(accounts[0].balance).toBeGreaterThan(0);

      return accounts[0];
    });

    await test.step('Validate the same account through the UI', async () => {
      await accountsOverviewPage.goto();
      await accountsOverviewPage.expectLoaded();

      try {
        await accountsOverviewPage.expectAccountVisible(defaultAccount.id);
      } catch {
        await accountsOverviewPage.refresh();
        await accountsOverviewPage.expectLoaded();
        await accountsOverviewPage.expectAccountVisible(defaultAccount.id);
      }

      await expect(accountsOverviewPage.getDisplayedAccountIds()).resolves.toEqual([defaultAccount.id]);
      expect(toCents(await accountsOverviewPage.getDisplayedBalance(defaultAccount.id))).toBe(
        toCents(defaultAccount.balance),
      );
    });
  });
});
