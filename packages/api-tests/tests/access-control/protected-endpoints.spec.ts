import { test, expect } from '../../fixtures';
import { payloadErrorResponseSchema } from '@casa-maiz/shared';

test.describe('Access-control boundaries — read-protected endpoints', () => {
  test('GET /api/users is forbidden to anonymous callers', async ({ apiClient }) => {
    const response = await apiClient.raw('/api/users');
    expect(response.status()).toBe(403);
    const body = payloadErrorResponseSchema.parse(await response.json());
    expect(body.errors[0].message).toMatch(/not allowed/i);
  });

  test('GET /api/form-submissions (list) is forbidden to anonymous callers', async ({
    apiClient,
  }) => {
    const response = await apiClient.raw('/api/form-submissions');
    expect(response.status()).toBe(403);
    const body = payloadErrorResponseSchema.parse(await response.json());
    expect(body.errors[0].message).toMatch(/not allowed/i);
  });

  test('GET /api/access itself is public (introspection is not gated)', async ({ apiClient }) => {
    const response = await apiClient.raw('/api/access');
    expect(response.status()).toBe(200);
  });
});
