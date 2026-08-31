import { test, expect } from '../../fixtures/playwright-fixtures';
import { HomePage } from '../../pages/home.page';

test.describe('Home page', () => {
  test('renders the restaurantHero content served by the CMS', async ({ page, apiClient }) => {
    const home = await apiClient.getPageBySlug('home');
    expect(home).toBeDefined();

    const hero = home?.layout?.find((block) => block.blockType === 'restaurantHero');
    expect(hero).toBeDefined();
    if (hero?.blockType !== 'restaurantHero') {
      throw new Error('expected a restaurantHero block on the home page');
    }

    const homePage = new HomePage(page);
    await homePage.open();

    if (hero.headline) {
      await expect(homePage.textContent(hero.headline)).toBeVisible();
    }
    if (hero.description) {
      await expect(homePage.textContent(hero.description)).toBeVisible();
    }
  });
});
