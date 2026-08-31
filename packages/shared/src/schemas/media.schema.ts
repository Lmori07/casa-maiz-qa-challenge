import { z } from 'zod';

export const mediaSizeSchema = z
  .object({
    // Confirmed via a live 400-doc /api/media sweep: source images smaller
    // than a given size's target dimensions don't get that crop generated,
    // and Payload returns `null` (not an absent key) for every field of
    // that size variant — `url` included. Nullable, not just optional.
    url: z.string().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    mimeType: z.string().nullable().optional(),
    filesize: z.number().nullable().optional(),
    filename: z.string().nullable().optional(),
  })
  .passthrough();

export const mediaSchema = z
  .object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    alt: z.string().optional(),
    url: z.string().optional(),
    filename: z.string().optional(),
    mimeType: z.string().optional(),
    filesize: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    sizes: z.record(z.string(), mediaSizeSchema).optional(),
  })
  .passthrough();

export type MediaDoc = z.infer<typeof mediaSchema>;
