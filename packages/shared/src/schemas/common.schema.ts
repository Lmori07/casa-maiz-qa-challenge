import { z } from 'zod';

/**
 * Payload's standard REST list envelope. Every collection endpoint
 * (`/api/pages`, `/api/posts`, ...) returns this exact shape, so it's
 * expressed once as a generic factory rather than duplicated per collection.
 */
export const paginatedEnvelope = <T extends z.ZodTypeAny>(docSchema: T) =>
  z.object({
    docs: z.array(docSchema),
    totalDocs: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    page: z.number(),
    pagingCounter: z.number(),
    hasPrevPage: z.boolean(),
    hasNextPage: z.boolean(),
    prevPage: z.number().nullable(),
    nextPage: z.number().nullable(),
  });

export type PaginatedEnvelope<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

/**
 * Payload relationship fields shift shape based on the `depth` query
 * param: at `depth=0` they're a bare id string; at `depth>=1` the server
 * populates them into the full related document. Confirmed live: the same
 * `formBlock.form` field on `/api/pages` (default depth) comes back as a
 * populated object, while explicit low-depth requests return a string id.
 * Schemas for relationship fields should accept both.
 */
export const relationshipSchema = <T extends z.ZodTypeAny>(populatedSchema: T) =>
  z.union([z.string(), populatedSchema]);

/** Normalizes a relationship field to its id, regardless of population depth. */
export function resolveRelationId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id;
}

/** Payload's structured error response, e.g. `{"errors":[{"message":"Not Found"}]}`. */
export const payloadErrorResponseSchema = z.object({
  errors: z.array(z.object({ message: z.string() }).passthrough()),
});
export type PayloadErrorResponse = z.infer<typeof payloadErrorResponseSchema>;
