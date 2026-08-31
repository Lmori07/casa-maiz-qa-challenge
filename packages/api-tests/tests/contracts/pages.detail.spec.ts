import { test, expect } from '../../fixtures';
import { resolveRelationId } from '@casa-maiz/shared';

test.describe('GET /api/pages?where[slug][equals]=... — detail contract', () => {
  test('the home page resolves and its restaurantHero block validates', async ({ apiClient }) => {
    const home = await apiClient.getPageBySlug('home');
    expect(home).toBeDefined();
    expect(home?.title).toBeTruthy();
    expect(home?.layout?.length).toBeGreaterThan(0);

    const hero = home?.layout?.find((block) => block.blockType === 'restaurantHero');
    expect(hero).toBeDefined();
  });

  test("the contact page's formBlock resolves to a real form document", async ({ apiClient }) => {
    const contact = await apiClient.getPageBySlug('contact');
    expect(contact).toBeDefined();

    const formBlock = contact?.layout?.find((block) => block.blockType === 'formBlock');
    expect(formBlock).toBeDefined();
    if (formBlock?.blockType !== 'formBlock') {
      throw new Error('expected a formBlock on the contact page');
    }

    const form = await apiClient.getFormById(resolveRelationId(formBlock.form));
    expect(form.fields.length).toBeGreaterThan(0);
  });

  test('an unknown slug resolves to no document rather than an error', async ({ apiClient }) => {
    const result = await apiClient.getPageBySlug('this-slug-does-not-exist-in-the-cms');
    expect(result).toBeUndefined();
  });
});
