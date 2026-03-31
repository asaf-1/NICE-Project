import { expect, test } from '@playwright/test';
import { BankApiClient } from '../../src/api/bank-api.client';
import { env } from '../../src/config/env';

test.describe('@negative @api @parallel Negative API Scenarios', () => {
  test('returns a 400 with an explanatory message for an unknown account id', async ({ request }) => {
    const api = new BankApiClient(request, env.apiBaseUrl);
    const response = await api.getAccountResponse(999_999_999);

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('text/plain');
    await expect(response.text()).resolves.toContain('Could not find account #999999999');
  });

  test('returns a 400 for an unknown customer accounts lookup', async ({ request }) => {
    const response = await request.fetch(`${env.apiBaseUrl}/customers/999999999/accounts`, {
      failOnStatusCode: false,
      headers: {
        Accept: 'application/json',
      },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('text/plain');
    await expect(response.text()).resolves.toContain('Could not find customer #999999999');
  });
});
