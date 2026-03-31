import { expect, test } from '@playwright/test';
import { env } from '../../src/config/env';

test.describe('@negative @api @parallel Transfer Edge Cases', () => {
  test('returns a 400 when transferring between unknown accounts', async ({ request }) => {
    const response = await request.fetch(
      `${env.apiBaseUrl}/transfer?fromAccountId=999999999&toAccountId=999999998&amount=25`,
      {
        method: 'POST',
        failOnStatusCode: false,
        headers: {
          Accept: 'text/plain, application/json',
        },
      },
    );

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('text/plain');
    await expect(response.text()).resolves.toContain('Could not find account number 999999999 and/or 999999998');
  });
});
