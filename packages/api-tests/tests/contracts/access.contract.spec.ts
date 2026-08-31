import { test, expect } from '../../fixtures';

test.describe('GET /api/access — contract', () => {
  test('publicly exposes a field-level access matrix', async ({ apiClient }) => {
    const access = await apiClient.getAccess();
    expect(access.collections).toBeDefined();
    expect(access.collections.pages).toBeDefined();
  });

  test("the matrix's public-read claim for `pages` matches what actually happens on the wire", async ({
    apiClient,
  }) => {
    const access = await apiClient.getAccess();
    const pagesAccess = access.collections.pages as { fields?: { title?: { read?: boolean } } };
    expect(pagesAccess.fields?.title?.read).toBe(true);

    // Cross-check the claim against the real, observed response.
    const response = await apiClient.raw('/api/pages', { limit: '1' });
    expect(response.status()).toBe(200);
  });
});
