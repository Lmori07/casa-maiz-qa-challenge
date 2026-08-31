import { z } from 'zod';
import { layoutBlockSchema } from './blocks.schema';
import { richTextSchema } from './rich-text.schema';

export const audienceSchema = z
  .object({
    platforms: z.array(z.string()).optional(),
    authenticationStates: z.array(z.string()).optional(),
    timezone: z.string().optional(),
  })
  .passthrough();

export const heroSchema = z
  .object({
    type: z.string(),
    richText: richTextSchema.optional(),
    links: z.array(z.unknown()).optional(),
    media: z.unknown().optional(),
  })
  .passthrough();

export const pageSchema = z
  .object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    title: z.string(),
    slug: z.string(),
    _status: z.string(),
    hero: heroSchema.optional(),
    layout: z.array(layoutBlockSchema).optional(),
    meta: z.unknown().optional(),
    audience: audienceSchema.optional(),
    editorialStatus: z.string().optional(),
    generateSlug: z.boolean().optional(),
    indexable: z.boolean().optional(),
    publicationStartsAt_tz: z.string().optional(),
    publicationEndsAt_tz: z.string().optional(),
  })
  .passthrough();

export type PageDoc = z.infer<typeof pageSchema>;
