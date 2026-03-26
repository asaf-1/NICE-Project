import { expect, Page } from '@playwright/test';
import { RegistrationUser } from '../types/bank';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('register.htm');
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
  }

  async expectRegistrationSuccess(username: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: `Welcome ${username}` })).toBeVisible();
    await expect(this.page.getByText('Your account was created successfully. You are now logged in.')).toBeVisible();
  }

  async expectPasswordMismatchError(message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}

