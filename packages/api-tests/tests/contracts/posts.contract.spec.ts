import { test, expect } from '../../fixtures';
import { MEDIA_CDN_HOST } from '@casa-maiz/shared';

test.describe('GET /api/posts — contract', () => {
  test('returns a schema-valid paginated envelope', async ({ apiClient }) => {
    const result = await apiClient.getPosts({ limit: 10, depth: 1 });
    expect(result.docs.length).toBeGreaterThan(0);
  });

  test('hero images are served from the expected CDN host', async ({ apiClient }) => {
    const result = await apiClient.getPosts({ limit: 10, depth: 1 });
    const withHeroImage = result.docs.filter((doc) => doc.heroImage?.url);
    expect(withHeroImage.length).toBeGreaterThan(0);
    for (const doc of withHeroImage) {
      expect(doc.heroImage?.url).toContain(MEDIA_CDN_HOST);
    }
  });
});
