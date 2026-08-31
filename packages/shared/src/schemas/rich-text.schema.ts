import { z } from 'zod';

/**
 * Payload's rich-text fields store a Lexical editor state — a deeply
 * nested, open-ended node tree. We only need enough structure to prove
 * "this is a Lexical document", not to validate every node type the
 * editor can produce, so this is deliberately loose.
 */
export const richTextSchema = z
  .object({
    root: z
      .object({
        type: z.string(),
        children: z.array(z.unknown()),
      })
      .passthrough(),
  })
  .passthrough();

export type RichText = z.infer<typeof richTextSchema>;
