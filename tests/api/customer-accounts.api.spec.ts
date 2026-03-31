import { expect } from '@playwright/test';
import { expectAccountShape, expectCustomerShape } from '../../src/assertions/bank.assertions';
import { test } from '../fixtures/bank.fixture';

test.describe('@api @regression Customer Accounts API', () => {
  test('returns the expected customer and one default checking account after registration', async ({
    registeredUser,
    api,
  }) => {
    const customer = await test.step('Load the customer through the API login endpoint', async () => {
      const response = await api.login(registeredUser.username, registeredUser.password);

      expectCustomerShape(response, registeredUser);

      return response;
    });

    const accounts = await test.step('Load the customer accounts through the API', async () => {
      const response = await api.getCustomerAccounts(customer.id);

      expect(response).toHaveLength(1);
      expectAccountShape(response[0], {
        customerId: customer.id,
        type: 'CHECKING',
      });
      expect(response[0].balance).toBeGreaterThan(0);

      return response;
    });

    await test.step('Load the individual account through the API', async () => {
      const account = await api.getAccount(accounts[0].id);

      expectAccountShape(account, {
        id: accounts[0].id,
        customerId: customer.id,
        type: 'CHECKING',
      });
      expect(account.balance).toBeGreaterThan(0);
    });
  });
});
