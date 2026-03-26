import { expect, Page } from '@playwright/test';
import { BaseAuthenticatedPage } from './base-authenticated.page';
import { TransferDetails } from '../types/bank';
import { formatCurrency } from '../utils/currency';
import { waitForSecurityVerificationToClear } from '../utils/security-challenge';

export class TransferFundsPage extends BaseAuthenticatedPage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('transfer.htm');
    await waitForSecurityVerificationToClear(this.page);
  }

  async expectLoaded(): Promise<void> {
    await this.expectAuthenticated();
    await expect(this.page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();
  }

  async transfer(details: TransferDetails): Promise<void> {
    await this.page.locator('#amount').fill(String(details.amount));
    await this.page.locator('#fromAccountId').selectOption(String(details.fromAccountId));
    await this.page.locator('#toAccountId').selectOption(String(details.toAccountId));
    await this.page.getByRole('button', { name: 'Transfer' }).click();
    await waitForSecurityVerificationToClear(this.page);
  }

  async expectTransferComplete(details: TransferDetails): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Transfer Complete!' })).toBeVisible();
    await expect(
      this.page.getByText(
        `${formatCurrency(details.amount)} has been transferred from account #${details.fromAccountId} to account #${details.toAccountId}.`,
      ),
    ).toBeVisible();
  }
}
