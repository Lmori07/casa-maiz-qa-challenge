import { BasePage } from './base-page';

export class HomePage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/');
  }

  /**
   * Content is intentionally located by its live text rather than a
   * hardcoded CSS/role selector — the exact markup wasn't confirmed via a
   * live DOM inspection tool during this build (see docs/FINDINGS.md), and
   * matching on text fetched from the same API the page renders from keeps
   * the assertion resilient to markup changes AND to live content edits.
   */
  textContent(text: string) {
    return this.page.getByText(text, { exact: false });
  }
}
