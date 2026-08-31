import type { Page } from '@playwright/test';

/**
 * The consumer app's branded 404 copy, confirmed via a direct fetch of
 * `/reservas` during recon (see docs/FINDINGS.md).
 */
export const NOT_FOUND_HEADING = 'Esta mesa no existe.';

export class NotFoundPage {
  constructor(private readonly page: Page) {}

  heading() {
    return this.page.getByText(NOT_FOUND_HEADING);
  }
}
