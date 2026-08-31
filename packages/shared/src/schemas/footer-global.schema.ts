import { z } from 'zod';
import { navItemSchema } from './nav-item.schema';

export const footerGlobalSchema = z
  .object({
    id: z.string(),
    globalType: z.literal('footer'),
    navItems: z.array(navItemSchema),
  })
  .passthrough();

export type FooterGlobal = z.infer<typeof footerGlobalSchema>;
