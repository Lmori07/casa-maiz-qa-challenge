import { z } from 'zod';

/**
 * `/api/access` exposes Payload's full field-level access-control matrix.
 * Its shape is deeply recursive and collection-specific (every field of
 * every collection, nested arbitrarily for blocks/groups), so this only
 * asserts the top-level container exists. The actual read/write
 * expectations per collection are asserted directly in
 * access.contract.spec.ts against the live values, not re-derived here.
 */
export const accessMatrixSchema = z
  .object({
    collections: z.record(z.string(), z.unknown()),
  })
  .passthrough();

export type AccessMatrix = z.infer<typeof accessMatrixSchema>;
