import { test, expect } from '../../fixtures';

test.describe('GET /api/categories — contract', () => {
  test('returns a schema-valid paginated envelope', async ({ apiClient }) => {
    const result = await apiClient.getCategories({ limit: 10 });
    expect(result.docs.length).toBeGreaterThan(0);
    for (const doc of result.docs) {
      expect(doc.slug).toBeTruthy();
    }
  });
});
