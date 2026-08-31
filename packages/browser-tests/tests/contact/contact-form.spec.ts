import { test, expect } from '../../fixtures/playwright-fixtures';
import { ContactPage } from '../../pages/contact.page';
import { resolveRelationId, type FormDefinition } from '@casa-maiz/shared';
import { extractPlainText } from '../../utils/lexical-text';

/** Resolves the Contact page's formBlock into its full form definition. */
async function getContactForm(apiClient: {
  getPageBySlug: (slug: string) => Promise<{ layout?: unknown[] } | undefined>;
  getFormById: (id: string) => Promise<FormDefinition>;
}): Promise<FormDefinition> {
  const contact = await apiClient.getPageBySlug('contact');
  const formBlock = (contact?.layout as Array<{ blockType: string; form?: unknown }> | undefined)?.find(
    (block) => block.blockType === 'formBlock',
  );
  if (!formBlock) {
    throw new Error('expected a formBlock on the contact page');
  }
  return apiClient.getFormById(resolveRelationId(formBlock.form as string | { id: string }));
}

test.describe('Contact page — form', () => {
  test('renders exactly the fields the CMS form definition declares', async ({ page, apiClient }) => {
    const form = await getContactForm(apiClient);
    expect(form.fields.length).toBeGreaterThan(0);

    const contactPage = new ContactPage(page);
    await contactPage.open();

    for (const field of form.fields) {
      await expect(contactPage.fieldInput(field)).toBeVisible();
    }
    await expect(contactPage.submitButton(form.submitButtonLabel ?? 'Submit')).toBeVisible();
  });

  /**
   * `postInvalidFormSubmission` is the only sanctioned way to hit this
   * endpoint with a real request (see fixtures/invalid-payloads.ts) — no
   * "valid payload" builder is allowed to exist anywhere in this repo. So
   * this test never lets ANY submission reach the real backend: it routes
   * the request to `route.abort()` and asserts the browser's own required-
   * field validation stops the click before that route is ever hit.
   */
  test('blocks submission client-side when a required field is empty', async ({ page, apiClient }) => {
    const form = await getContactForm(apiClient);

    let submissionAttempted = false;
    await page.route('**/api/form-submissions', (route) => {
      submissionAttempted = true;
      route.abort();
    });

    const contactPage = new ContactPage(page);
    await contactPage.open();
    await contactPage.submitButton(form.submitButtonLabel ?? 'Submit').click();

    expect(
      submissionAttempted,
      'submitting a completely empty form should never reach /api/form-submissions',
    ).toBe(false);
  });

  /**
   * Proves the happy path without ever creating a real document in the
   * shared CMS: the one write-capable request is intercepted and fulfilled
   * locally (`page.route`), exactly the escape hatch invalid-payloads.ts
   * names as the only legitimate way to test a "valid" submission.
   */
  test('a successful submission renders the CMS-defined confirmation copy', async ({ page, apiClient }) => {
    const form = await getContactForm(apiClient);

    let requestReceived = false;
    await page.route('**/api/form-submissions', async (route) => {
      requestReceived = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ doc: { id: 'mock-submission-id' } }),
      });
    });

    const contactPage = new ContactPage(page);
    await contactPage.open();

    const values: Record<string, string> = {
      'full-name': 'QA Test',
      email: 'qa-test@example.com',
      phone: '5555555555',
      message: 'Automated test submission — intercepted locally, never sent to the real backend.',
    };
    await contactPage.fillFields(form.fields, values);
    await contactPage.submitButton(form.submitButtonLabel ?? 'Submit').click();

    await expect
      .poll(() => requestReceived, { message: 'expected the intercepted route to be hit' })
      .toBe(true);

    if (form.confirmationType === 'message' && form.confirmationMessage) {
      const confirmationText = extractPlainText(form.confirmationMessage);
      if (confirmationText) {
        await expect(page.getByText(confirmationText, { exact: false })).toBeVisible();
      }
    }
  });
});
