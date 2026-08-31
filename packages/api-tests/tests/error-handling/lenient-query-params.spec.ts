import { test, expect } from '../../fixtures';

test.describe('Input-handling contract — query parameters', () => {
  test('an invalid `limit` value is tolerated rather than erroring (documented, not a bug)', async ({
    apiClient,
  }) => {
    // Confirmed during recon: Payload does not strictly type-check every
    // query param — `limit=abc` still returns 200. This test locks that
    // observed behavior in as an explicit contract so a future tightening
    // of input validation on the CMS side is a visible, intentional
    // change to this suite rather than a silent surprise.
    const response = await apiClient.raw('/api/pages', { limit: 'abc' });
    expect(response.status()).toBe(200);
  });
});
