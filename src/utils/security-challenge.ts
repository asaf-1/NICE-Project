import { expect, Page } from '@playwright/test';

export async function waitForSecurityVerificationToClear(page: Page): Promise<void> {
  const verificationHeading = page.getByRole('heading', { name: 'Performing security verification' });

  if (await verificationHeading.isVisible().catch(() => false)) {
    await expect(verificationHeading).toBeHidden({ timeout: 30_000 });
  }
}

