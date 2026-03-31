import { expect, test } from '@playwright/test';
import { BankApiClient } from '../../src/api/bank-api.client';
import { env } from '../../src/config/env';

test.describe('@negative @api @parallel Account Creation Edge Cases', () => {
  test('returns a 400 when trying to create an account for an unknown customer', async ({ request }) => {
    const api = new BankApiClient(request, env.apiBaseUrl);
    const response = await api.createCheckingAccountResponse(999_999_999, 999_999_999);

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('text/plain');
    await expect(response.text()).resolves.toContain('Could not create new account for customer 999999999');
  });
});
