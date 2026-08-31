import { test, expect } from '../../fixtures';

test.describe('GET /api/forms — contract', () => {
  test('returns a schema-valid paginated envelope', async ({ apiClient }) => {
    const result = await apiClient.getForms({ limit: 10 });
    expect(result.docs.length).toBeGreaterThan(0);
  });

  test('the Contact form defines the expected typed, required fields', async ({ apiClient }) => {
    const result = await apiClient.getForms({ limit: 10 });
    const contactForm = result.docs.find((form) => form.title === 'Contact Form');
    expect(contactForm).toBeDefined();

    const fieldNames = contactForm?.fields.map((field) => field.name);
    expect(fieldNames).toEqual(expect.arrayContaining(['full-name', 'email', 'message']));

    const emailField = contactForm?.fields.find((field) => field.name === 'email');
    expect(emailField?.blockType).toBe('email');
    expect(emailField?.required).toBe(true);
  });
});
