import { test as base, expect } from '@playwright/test';
import { CmsApiClient, loadEnv } from '@casa-maiz/shared';

const env = loadEnv();

type Fixtures = {
  apiClient: CmsApiClient;
};

/**
 * Every spec in this suite gets a ready-made `apiClient`, built the exact
 * same way `packages/browser-tests/fixtures/playwright-fixtures.ts` builds
 * one — same class, same construction — so contract assumptions asserted
 * here and cross-consistency checks asserted in the browser suite are
 * backed by identical request/parse logic.
 */
export const test = base.extend<Fixtures>({
  apiClient: async ({ request }, use) => {
    await use(new CmsApiClient(request, env.CMS_API_BASE_URL));
  },
});

export { expect };
