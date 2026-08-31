import { BasePage } from './base-page';

export class MenuPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/menu');
  }

  textContent(text: string) {
    return this.page.getByText(text, { exact: false });
  }
}
