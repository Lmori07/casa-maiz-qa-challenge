import { test, expect } from '../../fixtures';

test.describe('GET /api/media — contract', () => {
  test('returns a schema-valid paginated envelope', async ({ apiClient }) => {
    const result = await apiClient.getMedia({ limit: 10 });
    expect(result.docs.length).toBeGreaterThan(0);
  });
});
