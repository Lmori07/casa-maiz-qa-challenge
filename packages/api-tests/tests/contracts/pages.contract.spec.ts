import { test, expect } from '../../fixtures';
import { KNOWN_PAGE_SLUGS } from '@casa-maiz/shared';

test.describe('GET /api/pages — contract', () => {
  test('returns a non-empty, schema-valid paginated envelope', async ({ apiClient }) => {
    // apiClient.getPages() validates the response against the Payload
    // envelope + page zod schemas internally and throws on mismatch —
    // reaching this line at all is the shape assertion.
    const result = await apiClient.getPages({ limit: 50 });
    expect(result.docs.length).toBeGreaterThan(0);
    expect(result.limit).toBe(50);
  });

  test('contains at least the known published pages (home, menu, contact)', async ({
    apiClient,
  }) => {
    // Superset assertion, not an exact-count check: this is a live, shared
    // CMS someone else can edit at any time — see docs/DATA-STRATEGY.md.
    const result = await apiClient.getPages({ limit: 50 });
    const slugs = result.docs.map((doc) => doc.slug);
    for (const knownSlug of KNOWN_PAGE_SLUGS) {
      expect(slugs).toContain(knownSlug);
    }
  });

  test('every returned page is published', async ({ apiClient }) => {
    const result = await apiClient.getPages({ limit: 50 });
    for (const doc of result.docs) {
      expect(doc._status).toBe('published');
    }
  });
});
