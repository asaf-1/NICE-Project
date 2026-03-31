import { test } from '@playwright/test';
import { PARABANK_MESSAGES } from '../../src/constants/bank';
import { createRegistrationUser } from '../../src/data/user.factory';
import { LoginPage } from '../../src/pages/login.page';
import { RegisterPage } from '../../src/pages/register.page';
import { waitForSecurityVerificationToClear } from '../../src/utils/security-challenge';
import { expect } from '@playwright/test';

test.describe('@negative @auth Negative Authentication Scenarios', () => {
  test('shows an error for invalid login credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid-user', 'invalid-password');
    await loginPage.expectInvalidLogin(PARABANK_MESSAGES.invalidLogin);
  });

  test('keeps registration blocked when passwords do not match', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createRegistrationUser();

    await registerPage.goto();
    await registerPage.register(user, 'DifferentPassw0rd!');
    await registerPage.expectPasswordMismatchError(PARABANK_MESSAGES.passwordMismatch);
  });

  test('keeps unauthenticated users on the login experience when they open a protected page directly', async ({ page }) => {
    await page.goto('overview.htm');
    await waitForSecurityVerificationToClear(page);

    await expect(page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
  });
});
