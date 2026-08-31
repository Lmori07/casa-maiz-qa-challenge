import { test, expect } from '../../fixtures';

test.describe('Error-shape contract — method not allowed', () => {
  test('GET /api/graphql is rejected (the endpoint is POST-only)', async ({ apiClient }) => {
    const response = await apiClient.raw('/api/graphql');
    expect(response.status()).toBe(405);
  });
});
