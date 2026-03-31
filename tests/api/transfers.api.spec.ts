import { test, expect } from '../fixtures/bank.fixture';
import { createCheckingAccountViaCurl } from '../../src/utils/curl';
import { env } from '../../src/config/env';
import { toCents } from '../../src/utils/currency';

test.describe('@api @regression Transfer Transactions API', () => {
  test('records matching debit and credit transactions after a transfer', async ({
    api,
    customer,
    defaultAccount,
  }) => {
    const createAccountResult = await test.step('Create a new target account for the customer', async () => {
      return createCheckingAccountViaCurl({
        apiBaseUrl: env.apiBaseUrl,
        customerId: customer.id,
        fromAccountId: defaultAccount.id,
      });
    });

    const snapshot = await test.step('Wait for both accounts to exist', async () => {
      await expect
        .poll(async () => {
          const accounts = await api.getCustomerAccounts(customer.id);
          const sourceAccount = accounts.find((account) => account.id === defaultAccount.id);
          const targetAccount = accounts.find((account) => account.id === createAccountResult.body.id);

          if (!sourceAccount || !targetAccount) {
            return null;
          }

          return {
            sourceBalanceCents: toCents(sourceAccount.balance),
            targetBalanceCents: toCents(targetAccount.balance),
          };
        }, {
          timeout: 30_000,
        })
        .not.toBeNull();

      const accounts = await api.getCustomerAccounts(customer.id);
      const sourceAccount = accounts.find((account) => account.id === defaultAccount.id)!;
      const targetAccount = accounts.find((account) => account.id === createAccountResult.body.id)!;

      return {
        sourceAccount,
        targetAccount,
      };
    });

    await test.step('Transfer funds through the API', async () => {
      const response = await api.transferFunds(
        snapshot.sourceAccount.id,
        snapshot.targetAccount.id,
        env.transferAmount,
      );

      expect(response.trim().length).toBeGreaterThan(0);
    });

    await test.step('Validate balances and transaction history through the API', async () => {
      await expect
        .poll(async () => {
          const sourceAccount = await api.getAccount(snapshot.sourceAccount.id);
          const targetAccount = await api.getAccount(snapshot.targetAccount.id);
          const sourceTransactions = await api.getTransactions(snapshot.sourceAccount.id);
          const targetTransactions = await api.getTransactions(snapshot.targetAccount.id);

          const matchingSourceTransaction = sourceTransactions.find(
            (transaction) =>
              transaction.type === 'Debit' && toCents(transaction.amount) === toCents(env.transferAmount),
          );
          const matchingTargetTransaction = targetTransactions.find(
            (transaction) =>
              transaction.type === 'Credit' && toCents(transaction.amount) === toCents(env.transferAmount),
          );

          return {
            sourceBalanceCents: toCents(sourceAccount.balance),
            targetBalanceCents: toCents(targetAccount.balance),
            hasSourceTransfer: Boolean(matchingSourceTransaction),
            hasTargetTransfer: Boolean(matchingTargetTransaction),
          };
        }, {
          timeout: 30_000,
        })
        .toEqual({
          sourceBalanceCents: toCents(snapshot.sourceAccount.balance - env.transferAmount),
          targetBalanceCents: toCents(snapshot.targetAccount.balance + env.transferAmount),
          hasSourceTransfer: true,
          hasTargetTransfer: true,
        });
    });
  });
});
