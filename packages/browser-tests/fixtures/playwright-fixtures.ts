import { test as base, expect } from '@playwright/test';
import { CmsApiClient, loadEnv } from '@casa-maiz/shared';

const env = loadEnv();

type Fixtures = {
  apiClient: CmsApiClient;
};

/**
 * Injects a ready-made `apiClient` into every browser test, built the
 * exact same way `packages/api-tests/fixtures.ts` builds one. This is
 * what makes "does the rendered DOM match the live API data" assertions
 * a one-liner instead of custom per-spec plumbing.
 */
export const test = base.extend<Fixtures>({
  apiClient: async ({ request }, use) => {
    await use(new CmsApiClient(request, env.CMS_API_BASE_URL));
  },
});

export { expect };
