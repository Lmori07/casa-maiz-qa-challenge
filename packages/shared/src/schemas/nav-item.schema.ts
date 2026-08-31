import { z } from 'zod';

/**
 * Shared by both globals (`/api/globals/header` and `/api/globals/footer`)
 * — Payload renders nav items identically in both, so the shape is defined
 * once here instead of duplicated per global.
 */
const customLinkSchema = z
  .object({
    type: z.literal('custom'),
    url: z.string(),
    label: z.string(),
    newTab: z.boolean().optional(),
  })
  .passthrough();

const referenceLinkSchema = z
  .object({
    type: z.literal('reference'),
    reference: z
      .object({
        relationTo: z.string(),
        value: z.union([
          z.string(),
          z.object({ id: z.string(), slug: z.string().optional() }).passthrough(),
        ]),
      })
      .passthrough(),
    label: z.string(),
    newTab: z.boolean().optional(),
  })
  .passthrough();

export const navLinkSchema = z.union([customLinkSchema, referenceLinkSchema]);

export const navItemSchema = z
  .object({
    id: z.string().optional(),
    link: navLinkSchema,
  })
  .passthrough();

export type NavLink = z.infer<typeof navLinkSchema>;
export type NavItem = z.infer<typeof navItemSchema>;
