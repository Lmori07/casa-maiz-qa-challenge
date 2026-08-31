/**
 * ============================================================================
 *  HIGH-RISK FILE — read before editing.
 *
 *  `POST /api/form-submissions` is the ONLY public write-capable endpoint
 *  found on this CMS. Every test in this file MUST send a body built by
 *  one of the `build*FormSubmission()` functions in
 *  `@casa-maiz/shared` (fixtures/invalid-payloads.ts) — both are
 *  deliberately invalid. DO NOT add a test case that sends a valid,
 *  well-formed submission: doing so would create a real document in the
 *  shared, third-party-hosted CMS, violating this project's "never
 *  mutate shared CMS data" constraint. See docs/RISK-MODEL.md.
 * ============================================================================
 */
import { test, expect } from '../../fixtures';
import {
  buildEmptyFormSubmission,
  buildInvalidFormSubmission,
  assertNeverPersisted,
} from '@casa-maiz/shared';

test.describe('POST /api/form-submissions — negative-path validation only', () => {
  test('an empty body is rejected with 400 and nothing is persisted', async ({ apiClient }) => {
    const response = await apiClient.postInvalidFormSubmission(buildEmptyFormSubmission());
    expect(response.status()).toBe(400);
    const body = await response.json();
    assertNeverPersisted(body);
  });

  test('a body referencing a non-existent form id is rejected and nothing is persisted', async ({
    apiClient,
  }) => {
    const response = await apiClient.postInvalidFormSubmission(buildInvalidFormSubmission());
    // Not asserting an exact status code here (only the empty-body case
    // was directly confirmed as 400 during recon) — the contract under
    // test is "this is rejected, not created", which a non-2xx status
    // proves regardless of the precise 4xx code Payload chooses.
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
    const body = await response.json();
    assertNeverPersisted(body);
  });
});
