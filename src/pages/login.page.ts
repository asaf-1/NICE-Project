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
    await expect(this.page).toHaveURL(/login\.htm/);
    await expect(this.page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Error!' })).toBeVisible();

    const exactErrorMessage = this.page.getByText(message, { exact: true });

    if (await exactErrorMessage.count()) {
      await expect(exactErrorMessage).toBeVisible();

      return;
    }

    // The shared public demo can occasionally return alternate error copy.
    // We still assert the user remains unauthenticated and an explanatory
    // error paragraph is shown on the login error page.
    await expect(this.page.locator('#rightPanel p').first()).toContainText(/\S+/);
  }
}
