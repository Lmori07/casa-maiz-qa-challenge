import { test, expect } from '../../fixtures';

test.describe('GET /api/globals/header — contract', () => {
  test('returns a schema-valid header global with nav items', async ({ apiClient }) => {
    const header = await apiClient.getHeader();
    expect(header.globalType).toBe('header');
    expect(header.navItems.length).toBeGreaterThan(0);
  });
});
