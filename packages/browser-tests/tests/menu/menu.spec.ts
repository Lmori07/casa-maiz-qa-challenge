import { test, expect } from '../../fixtures/playwright-fixtures';
import { MenuPage } from '../../pages/menu.page';
import type { LayoutBlock } from '@casa-maiz/shared';

/**
 * `cardGrid.cards` isn't part of the shared zod schema — it's deliberately
 * left `.passthrough()` there (only restaurantHero/formBlock are fully
 * typed, see packages/shared/src/schemas/blocks.schema.ts). Confirmed live
 * via a direct API fetch for this spec specifically.
 */
type MenuCard = { title: string; description?: string; price?: string };
type CardGridWithCards = Extract<LayoutBlock, { blockType: 'cardGrid' }> & { cards: MenuCard[] };

test.describe('Menu page', () => {
  test('renders every dish card served by the CMS', async ({ page, apiClient }) => {
    const menu = await apiClient.getPageBySlug('menu');
    expect(menu).toBeDefined();

    const cardGridBlock = menu?.layout?.find((block) => block.blockType === 'cardGrid');
    expect(cardGridBlock).toBeDefined();
    const cardGrid = cardGridBlock as CardGridWithCards | undefined;
    expect(cardGrid?.cards.length).toBeGreaterThan(0);

    const menuPage = new MenuPage(page);
    await menuPage.open();

    for (const card of cardGrid?.cards ?? []) {
      await expect(menuPage.textContent(card.title)).toBeVisible();
      if (card.price) {
        await expect(menuPage.textContent(card.price)).toBeVisible();
      }
    }
  });
});
