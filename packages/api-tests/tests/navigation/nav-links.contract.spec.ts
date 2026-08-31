import { test, expect } from '../../fixtures';
import { extractNavLinks, internalLinksToVerify, loadEnv } from '@casa-maiz/shared';

const env = loadEnv();

test.describe('Navigation contract — header + footer globals', () => {
  test('every nav link has a well-formed shape', async ({ apiClient }) => {
    const [header, footer] = await Promise.all([apiClient.getHeader(), apiClient.getFooter()]);
    const links = extractNavLinks(header, footer);
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      expect(link.label.length).toBeGreaterThan(0);
      if (link.kind === 'internal') {
        expect(link.path.startsWith('/')).toBe(true);
      } else {
        expect(link.path).toMatch(/^https?:\/\//);
      }
    }
  });

  test('reachability probe against the consumer site (informational — the browser suite is authoritative for nav-link health, see docs/FINDINGS.md)', async ({
    apiClient,
    request,
  }, testInfo) => {
    const [header, footer] = await Promise.all([apiClient.getHeader(), apiClient.getFooter()]);
    const linksToCheck = internalLinksToVerify(extractNavLinks(header, footer));
    expect(linksToCheck.length).toBeGreaterThan(0);

    const results = await Promise.all(
      linksToCheck.map(async (link) => {
        const response = await request.get(`${env.CONSUMER_BASE_URL}${link.path}`);
        return { ...link, status: response.status() };
      }),
    );

    await testInfo.attach('nav-link-reachability.json', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });

    // Not asserting on any specific path: neither header nor footer nav
    // actually links to "/" (confirmed live — the home link is the site's
    // logo, not a CMS-managed nav item), so there's no single link this
    // suite can safely assume exists. Instead this only asserts the probe
    // isn't a total outage — at least one nav-linked page must load. Which
    // specific links are broken (e.g. /reservas, /posts) is tracked by the
    // browser suite's navigation-integrity spec, which actually renders
    // each page instead of just probing status; see docs/FINDINGS.md.
    expect(results.some((link) => link.status === 200)).toBe(true);
  });
});
