import { test, expect } from '../../fixtures/playwright-fixtures';
import { NotFoundPage } from '../../pages/not-found.page';
import { extractNavLinks, internalLinksToVerify, KNOWN_PAGE_SLUGS } from '@casa-maiz/shared';

/**
 * This is the browser-suite counterpart the API suite's
 * navigation/nav-links.contract.spec.ts explicitly defers to: that spec
 * only probes HTTP status, and says "which specific links are broken ...
 * is tracked by the browser suite's navigation-integrity spec, which
 * actually renders each page instead of just probing status." This is
 * that spec.
 *
 * Nav items are live, CMS-managed content — not hardcoded here — so a link
 * rendering the branded not-found page isn't automatically a failure (the
 * CMS may legitimately link somewhere not yet published). What IS asserted
 * as a hard failure is any link to a confirmed `pages`-collection slug
 * (KNOWN_PAGE_SLUGS) resolving to not-found — that combination can only be
 * a regression.
 */
test.describe('Navigation integrity — every internal nav link actually renders', () => {
  test('each internal header/footer link resolves to its page or the branded not-found page', async ({
    page,
    apiClient,
  }, testInfo) => {
    const [header, footer] = await Promise.all([apiClient.getHeader(), apiClient.getFooter()]);
    const links = internalLinksToVerify(extractNavLinks(header, footer));
    expect(links.length).toBeGreaterThan(0);

    const results: Array<{ path: string; label: string; status: number | null; outcome: string }> = [];

    for (const link of links) {
      const response = await page.goto(link.path);
      const isNotFound = await new NotFoundPage(page).heading().isVisible().catch(() => false);

      results.push({
        path: link.path,
        label: link.label,
        status: response?.status() ?? null,
        outcome: isNotFound ? 'not-found' : 'rendered',
      });

      await expect(page.locator('body')).not.toBeEmpty();

      const isKnownPage = KNOWN_PAGE_SLUGS.some((slug) => link.path === `/${slug}`);
      if (isKnownPage) {
        expect(
          isNotFound,
          `${link.path} is a confirmed CMS page (${KNOWN_PAGE_SLUGS.join(', ')}) but rendered the not-found page`,
        ).toBe(false);
      }
    }

    await testInfo.attach('nav-link-render-outcomes.json', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
  });
});
