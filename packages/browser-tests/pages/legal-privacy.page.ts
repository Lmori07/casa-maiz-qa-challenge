import { BasePage } from './base-page';

export class LegalPrivacyPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/legal/privacy_policy');
  }
}
