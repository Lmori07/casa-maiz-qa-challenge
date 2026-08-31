import { test, expect } from '../../fixtures';
import { payloadErrorResponseSchema } from '@casa-maiz/shared';

test.describe('Error-shape contract — 404s', () => {
  test('a syntactically-invalid document id returns a structured 404', async ({ apiClient }) => {
    const response = await apiClient.raw('/api/pages/not-a-valid-object-id');
    expect(response.status()).toBe(404);
    const body = payloadErrorResponseSchema.parse(await response.json());
    expect(body.errors[0].message).toBe('Not Found');
  });

  test('an unknown collection path returns 404', async ({ apiClient }) => {
    const response = await apiClient.raw('/api/this-collection-does-not-exist');
    expect(response.status()).toBe(404);
  });
});
