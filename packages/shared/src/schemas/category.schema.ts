import { z } from 'zod';

export const breadcrumbSchema = z
  .object({
    doc: z.string().optional(),
    url: z.string().optional(),
    label: z.string().optional(),
    id: z.string().optional(),
  })
  .passthrough();

export const categorySchema = z
  .object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    title: z.string(),
    slug: z.string(),
    breadcrumbs: z.array(breadcrumbSchema).optional(),
  })
  .passthrough();

export type CategoryDoc = z.infer<typeof categorySchema>;
