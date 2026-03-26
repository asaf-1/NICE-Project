import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('index.htm');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator('input[name="username"]').fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.getByRole('button', { name: 'Log In' }).click();
  }

  async openRegister(): Promise<void> {
    await this.page.getByRole('link', { name: 'Register' }).click();
  }

  async expectInvalidLogin(message: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Error!' })).toBeVisible();
    await expect(this.page.getByText(message)).toBeVisible();
  }
}

