import { z } from 'zod';

const baseFormFieldSchema = z
  .object({
    blockType: z.string(),
    name: z.string(),
    label: z.string().optional(),
    width: z.number().optional(),
    required: z.boolean().optional(),
    id: z.string().optional(),
  })
  .passthrough();

export const textFieldSchema = baseFormFieldSchema.extend({ blockType: z.literal('text') });
export const emailFieldSchema = baseFormFieldSchema.extend({ blockType: z.literal('email') });
export const numberFieldSchema = baseFormFieldSchema.extend({ blockType: z.literal('number') });
export const textareaFieldSchema = baseFormFieldSchema.extend({
  blockType: z.literal('textarea'),
});

// Union (not discriminated) with a loose fallback branch: the 4 field types
// above are confirmed from the live Contact form, but Payload's form
// builder plugin supports more (checkbox, select, ...) that this CMS
// instance simply hasn't used yet. The fallback keeps the schema honest
// about what's confirmed vs. merely unlikely to appear.
export const formFieldSchema = z.union([
  textFieldSchema,
  emailFieldSchema,
  numberFieldSchema,
  textareaFieldSchema,
  baseFormFieldSchema,
]);

export const formDefinitionSchema = z
  .object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    title: z.string(),
    fields: z.array(formFieldSchema),
    submitButtonLabel: z.string().optional(),
    confirmationType: z.string().optional(),
    confirmationMessage: z.unknown().optional(),
  })
  .passthrough();

export type FormDefinition = z.infer<typeof formDefinitionSchema>;
export type FormField = z.infer<typeof baseFormFieldSchema>;
