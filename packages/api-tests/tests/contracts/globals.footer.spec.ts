import { test, expect } from '../../fixtures';

test.describe('GET /api/globals/footer — contract', () => {
  test('returns a schema-valid footer global with nav items', async ({ apiClient }) => {
    const footer = await apiClient.getFooter();
    expect(footer.globalType).toBe('footer');
    expect(footer.navItems.length).toBeGreaterThan(0);
  });
});
