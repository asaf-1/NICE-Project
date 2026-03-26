import { expect, Locator, Page } from '@playwright/test';
import { BaseAuthenticatedPage } from './base-authenticated.page';
import { parseCurrency } from '../utils/currency';

export class AccountsOverviewPage extends BaseAuthenticatedPage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('overview.htm');
  }

  async expectLoaded(): Promise<void> {
    await this.expectAuthenticated();
    await expect(this.page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
  }

  async refresh(): Promise<void> {
    await this.page.reload();
  }

  async expectAccountVisible(accountId: number): Promise<void> {
    await expect(this.page.getByRole('link', { name: String(accountId), exact: true })).toBeVisible();
  }

  async getDisplayedBalance(accountId: number): Promise<number> {
    const row = this.accountRow(accountId);
    const balanceText = await row.locator('td').nth(1).innerText();

    return parseCurrency(balanceText);
  }

  async getDisplayedAccountIds(): Promise<number[]> {
    const accountLinks = this.accountTable().locator('a');
    const accountTexts = await accountLinks.allTextContents();

    return accountTexts.map((value) => Number(value));
  }

  private accountRow(accountId: number): Locator {
    return this.accountTable().locator('tr').filter({
      has: this.page.getByRole('link', { name: String(accountId), exact: true }),
    });
  }

  private accountTable(): Locator {
    return this.page.locator('table').filter({
      has: this.page.getByRole('columnheader', { name: 'Account' }),
    });
  }
}
