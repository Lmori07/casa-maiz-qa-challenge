import type { FormField } from '@casa-maiz/shared';
import { BasePage } from './base-page';

export class ContactPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/contact');
  }

  /** Locator derived from the field's own label, fetched live from the CMS — not hardcoded. */
  fieldInput(field: FormField) {
    return this.page.getByLabel(field.label ?? field.name, { exact: false });
  }

  submitButton(label: string) {
    return this.page.getByRole('button', { name: label });
  }

  async fillFields(fields: FormField[], values: Record<string, string>): Promise<void> {
    for (const field of fields) {
      const value = values[field.name];
      if (value === undefined) continue;
      await this.fieldInput(field).fill(value);
    }
  }
}
