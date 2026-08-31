import { test, expect } from '../../fixtures/playwright-fixtures';
import { LegalPrivacyPage } from '../../pages/legal-privacy.page';

/**
 * `/legal/privacy_policy` isn't a `pages`-collection document (it's outside
 * `KNOWN_PAGE_SLUGS`), so there's no CMS API response to source this
 * heading from — unlike home/menu/contact. "Aviso de privacidad" is
 * confirmed live via a direct fetch of the route during recon, the same
 * way NOT_FOUND_HEADING was confirmed in pages/not-found.page.ts.
 */
test.describe('Legal — Privacy Policy page', () => {
  test('loads and shows the privacy notice heading', async ({ page }) => {
    const legalPage = new LegalPrivacyPage(page);
    await legalPage.open();

    await expect(page.getByText('Aviso de privacidad', { exact: false }).first()).toBeVisible();
  });
});
