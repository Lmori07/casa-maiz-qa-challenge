import { test, expect } from '../../fixtures/playwright-fixtures';
import { NotFoundPage } from '../../pages/not-found.page';

/**
 * The rendered primary navigation is NOT sourced from the CMS's
 * header/footer globals: confirmed live, `/api/globals/header` and
 * `/api/globals/footer` return "Posts"/"Contact"/"Admin"/"Source
 * Code"/"Payload", and NONE of those labels appear anywhere in the
 * rendered page. The real nav (labeled "Navegación principal" in the DOM)
 * is hardcoded in the consumer app: Inicio, Menú, Reservar, Privacidad.
 *
 * So unlike navigation/navigation-integrity.spec.ts (which walks the
 * CMS-declared links from the API), this spec walks the actual nav
 * links as rendered, extracted from the DOM rather than from any API —
 * that's the only way to catch a regression in navigation the CMS content
 * model doesn't even know exists.
 */
test.describe('Primary navigation — as actually rendered', () => {
  test('every link in the rendered primary nav resolves to a real page, not the branded not-found page', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav).toBeVisible();

    const links = await nav.getByRole('link').all();
    expect(links.length).toBeGreaterThan(0);

    const entries = await Promise.all(
      links.map(async (link) => ({
        label: (await link.innerText()).trim(),
        href: await link.getAttribute('href'),
      })),
    );

    const results: Array<{ label: string; href: string | null; status: number | null; outcome: string }> =
      [];

    for (const { label, href } of entries) {
      if (!href || /^https?:\/\//.test(href)) continue;

      const response = await page.goto(href);
      const isNotFound = await new NotFoundPage(page).heading().isVisible().catch(() => false);

      results.push({
        label,
        href,
        status: response?.status() ?? null,
        outcome: isNotFound ? 'not-found' : 'rendered',
      });

      expect
        .soft(isNotFound, `primary nav link "${label}" (${href}) resolves to the branded not-found page`)
        .toBe(false);
    }

    await testInfo.attach('primary-nav-render-outcomes.json', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
  });
});
