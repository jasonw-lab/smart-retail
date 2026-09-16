import { expect, type Page } from '@playwright/test';

/**
 * Select an option from a Radix UI select component by its field label.
 * Avoids arbitrary timeouts by waiting for the combobox to update and the popover to close.
 */
export async function selectOptionByFieldLabel(page: Page, label: string, option: string) {
  const field = page.locator('div.space-y-2', { hasText: label });
  const trigger = field.locator('[role="combobox"]').first();
  await trigger.click();
  const optionItem = page.getByRole('option', { name: option, exact: true });
  await expect(optionItem).toBeVisible({ timeout: 5000 });
  await optionItem.click();
  await expect(trigger).toHaveText(option);
  await expect(optionItem).not.toBeVisible({ timeout: 5000 });
}
