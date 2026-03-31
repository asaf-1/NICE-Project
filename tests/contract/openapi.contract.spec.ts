import { createCheckingAccountViaCurl } from '../../src/utils/curl';
import { env } from '../../src/config/env';
import { test, expect } from '../fixtures/bank.fixture';
import {
  assertMatchesOpenApiSchema,
  expectOperationDefined,
  getJsonResponseSchema,
  loadOpenApiDocument,
} from '../../src/contracts/openapi.contract';

test.describe('@contract @api OpenAPI Contract Coverage', () => {
  test('@parallel documents the critical suite endpoints in the local OpenAPI file', async () => {
    const document = loadOpenApiDocument();

    expectOperationDefined(document, '/login/{username}/{password}', 'get');
    expectOperationDefined(document, '/customers/{customerId}/accounts', 'get');
    expectOperationDefined(document, '/accounts/{accountId}', 'get');
    expectOperationDefined(document, '/createAccount', 'post');
    expectOperationDefined(document, '/accounts/{accountId}/transactions', 'get');
    expectOperationDefined(document, '/transfer', 'post');
  });

  test('@parallel exposes the expected core schemas in the local OpenAPI file', async () => {
    const document = loadOpenApiDocument();

    expect(document.components?.schemas?.Customer).toBeDefined();
    expect(document.components?.schemas?.Account).toBeDefined();
    expect(document.components?.schemas?.Transaction).toBeDefined();
  });

  test('matches critical live API payloads against the local OpenAPI schemas', async ({
    registeredUser,
    customer,
    defaultAccount,
    api,
  }) => {
    const document = loadOpenApiDocument();
    const customerSchema = getJsonResponseSchema(document, '/login/{username}/{password}', 'get');
    const accountsSchema = getJsonResponseSchema(document, '/customers/{customerId}/accounts', 'get');
    const accountSchema = getJsonResponseSchema(document, '/accounts/{accountId}', 'get');
    const createAccountSchema = getJsonResponseSchema(document, '/createAccount', 'post');
    const transactionsSchema = getJsonResponseSchema(document, '/accounts/{accountId}/transactions', 'get');

    const customerFromLogin = await api.login(registeredUser.username, registeredUser.password);
    const accounts = await api.getCustomerAccounts(customer.id);
    const account = await api.getAccount(defaultAccount.id);
    const transactions = await api.getTransactions(defaultAccount.id);
    const createAccountResult = await createCheckingAccountViaCurl({
      apiBaseUrl: env.apiBaseUrl,
      customerId: customer.id,
      fromAccountId: defaultAccount.id,
    });

    assertMatchesOpenApiSchema(customerFromLogin, customerSchema, document);
    assertMatchesOpenApiSchema(accounts, accountsSchema, document);
    assertMatchesOpenApiSchema(account, accountSchema, document);
    assertMatchesOpenApiSchema(transactions, transactionsSchema, document);
    assertMatchesOpenApiSchema(createAccountResult.body, createAccountSchema, document);
  });
});
