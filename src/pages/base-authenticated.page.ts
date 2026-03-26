import { expect, Page } from '@playwright/test';
import { waitForSecurityVerificationToClear } from '../utils/security-challenge';

export abstract class BaseAuthenticatedPage {
  protected constructor(protected readonly page: Page) {}

  async expectAuthenticated(): Promise<void> {
    await waitForSecurityVerificationToClear(this.page);
    await expect(this.page.getByRole('heading', { name: 'Account Services' })).toBeVisible();
  }

  async openAccountsOverview(): Promise<void> {
    await this.page.getByRole('link', { name: 'Accounts Overview' }).click();
  }

  async openTransferFunds(): Promise<void> {
    await this.page.getByRole('link', { name: 'Transfer Funds' }).click();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Log Out' }).click();
  }
}
