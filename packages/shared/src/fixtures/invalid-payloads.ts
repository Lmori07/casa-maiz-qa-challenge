/**
 * `POST /api/form-submissions` is the ONLY public write-capable endpoint
 * found on the CMS (see docs/RISK-MODEL.md). To guarantee no test can ever
 * accidentally create a real submission in the shared CMS, these are the
 * ONLY functions permitted to build a body for that endpoint anywhere in
 * this repo — both are deliberately invalid and are expected to be
 * rejected with 400 before anything is persisted.
 *
 * DO NOT add a "valid payload" builder here or anywhere else. If a test
 * needs to prove the happy path works, it must do so through the browser
 * suite's `page.route` interception (see packages/browser-tests), which
 * never lets a request reach the real backend.
 */

/** Empty body — missing every required field, including the `form` relationship. */
export function buildEmptyFormSubmission(): Record<string, never> {
  return {};
}

/** Non-empty but invalid: `form` references a relationship id that doesn't exist. */
export function buildInvalidFormSubmission(): { form: string; submissionData: unknown[] } {
  return {
    form: '000000000000000000000000',
    submissionData: [],
  };
}

/**
 * Defense-in-depth: even though every caller already asserts the HTTP
 * status is a rejection, this additionally proves the response body
 * carries no `doc`/`id` — the shape Payload returns on a successful
 * create — so a future change to what counts as a "rejection" status
 * can't silently start treating a real created document as a pass.
 */
export function assertNeverPersisted(body: unknown): void {
  if (body !== null && typeof body === 'object') {
    if ('doc' in body || 'id' in body) {
      throw new Error(
        `A form-submission response body unexpectedly looks like a created document: ${JSON.stringify(body)}`,
      );
    }
  }
}
