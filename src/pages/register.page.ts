import { expect, Page } from '@playwright/test';
import { RegistrationUser } from '../types/bank';
import { waitForSecurityVerificationToClear } from '../utils/security-challenge';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('index.htm');
    await waitForSecurityVerificationToClear(this.page);
    await this.page.getByRole('link', { name: 'Register' }).click();

    await expect
      .poll(async () => {
        await waitForSecurityVerificationToClear(this.page);

        return await this.page.locator('#customer\\.firstName').isVisible().catch(() => false);
      }, {
        timeout: 45_000,
      })
      .toBe(true);
  }

  async register(user: RegistrationUser, confirmPassword = user.password): Promise<void> {
    await this.page.locator('#customer\\.firstName').fill(user.firstName);
    await this.page.locator('#customer\\.lastName').fill(user.lastName);
    await this.page.locator('#customer\\.address\\.street').fill(user.address.street);
    await this.page.locator('#customer\\.address\\.city').fill(user.address.city);
    await this.page.locator('#customer\\.address\\.state').fill(user.address.state);
    await this.page.locator('#customer\\.address\\.zipCode').fill(user.address.zipCode);
    await this.page.locator('#customer\\.phoneNumber').fill(user.phoneNumber);
    await this.page.locator('#customer\\.ssn').fill(user.ssn);
    await this.page.locator('#customer\\.username').fill(user.username);
    await this.page.locator('#customer\\.password').fill(user.password);
    await this.page.locator('#repeatedPassword').fill(confirmPassword);
    await this.page.getByRole('button', { name: 'Register' }).click();
    await waitForSecurityVerificationToClear(this.page);
  }

  async expectRegistrationSuccess(username: string): Promise<void> {
    await expect
      .poll(async () => {
        await waitForSecurityVerificationToClear(this.page);

        return await this.page.getByRole('heading', { name: `Welcome ${username}` }).isVisible().catch(() => false);
      }, {
        timeout: 45_000,
      })
      .toBe(true);

    await expect
      .poll(async () => {
        await waitForSecurityVerificationToClear(this.page);

        return await this.page
          .getByText('Your account was created successfully. You are now logged in.')
          .isVisible()
          .catch(() => false);
      }, {
        timeout: 45_000,
      })
      .toBe(true);
  }

  async expectPasswordMismatchError(message: string): Promise<void> {
    await expect
      .poll(async () => {
        await waitForSecurityVerificationToClear(this.page);

        return await this.page.getByText(message).isVisible().catch(() => false);
      }, {
        timeout: 45_000,
      })
      .toBe(true);
  }

  async expectDuplicateUsernameError(message: string): Promise<void> {
    await waitForSecurityVerificationToClear(this.page);
    await expect(this.page).toHaveURL(/register\.htm/);
    await expect(this.page.getByText(message, { exact: true })).toBeVisible();
  }
}
