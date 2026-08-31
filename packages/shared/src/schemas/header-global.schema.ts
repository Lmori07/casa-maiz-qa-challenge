import { z } from 'zod';
import { navItemSchema } from './nav-item.schema';

export const headerGlobalSchema = z
  .object({
    id: z.string(),
    globalType: z.literal('header'),
    navItems: z.array(navItemSchema),
  })
  .passthrough();

export type HeaderGlobal = z.infer<typeof headerGlobalSchema>;
