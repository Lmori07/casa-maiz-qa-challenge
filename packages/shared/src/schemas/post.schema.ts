import { z } from 'zod';
import { mediaSchema } from './media.schema';

export const postSchema = z
  .object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    title: z.string(),
    slug: z.string().optional(),
    heroImage: mediaSchema.optional(),
  })
  .passthrough();

export type PostDoc = z.infer<typeof postSchema>;
