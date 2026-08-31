import { z } from 'zod';
import { relationshipSchema } from './common.schema';

/**
 * Every block observed across the 3 published pages carries `blockType`
 * and a per-block `channels` array (independent audience targeting from
 * the page-level `audience` field). Only `restaurantHero` and `formBlock`
 * have been inspected in depth via the live API; the rest are deliberately
 * left `.passthrough()` rather than guessed at, per the project's
 * data-strategy rule of never asserting shapes we haven't actually seen.
 */
const baseBlockSchema = z
  .object({
    blockType: z.string(),
    id: z.string().optional(),
    channels: z.array(z.string()).optional(),
  })
  .passthrough();

export const restaurantHeroBlockSchema = baseBlockSchema.extend({
  blockType: z.literal('restaurantHero'),
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
});

export const cardGridBlockSchema = baseBlockSchema.extend({
  blockType: z.literal('cardGrid'),
});

export const promoRailBlockSchema = baseBlockSchema.extend({
  blockType: z.literal('promoRail'),
});

export const textBlockSchema = baseBlockSchema.extend({
  blockType: z.literal('textBlock'),
});

export const imageBlockSchema = baseBlockSchema.extend({
  blockType: z.literal('imageBlock'),
});

export const formBlockSchema = baseBlockSchema.extend({
  blockType: z.literal('formBlock'),
  // Relationship into the `forms` collection — shape depends on query
  // depth (see relationshipSchema); use resolveRelationId() to get the id.
  form: relationshipSchema(z.object({ id: z.string() }).passthrough()),
  enableIntro: z.boolean().optional(),
});

export const layoutBlockSchema = z.discriminatedUnion('blockType', [
  restaurantHeroBlockSchema,
  cardGridBlockSchema,
  promoRailBlockSchema,
  textBlockSchema,
  imageBlockSchema,
  formBlockSchema,
]);

export type LayoutBlock = z.infer<typeof layoutBlockSchema>;
export type FormBlock = z.infer<typeof formBlockSchema>;
