import { test, expect } from '../../fixtures/playwright-fixtures';
import { NotFoundPage } from '../../pages/not-found.page';

test.describe('404 handling', () => {
  test('an unknown route returns 404 and renders the branded not-found page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    expect(response?.status()).toBe(404);

    await expect(new NotFoundPage(page).heading()).toBeVisible();
  });
});
