/**
 * Builds Payload's bracketed query-string operators, e.g.
 * `where[slug][equals]=home` from `{ slug: { equals: 'home' } }`.
 * https://payloadcms.com/docs/queries/overview
 */
export type WhereQuery = Record<string, Record<string, string | number | boolean>>;

export type ListQueryParams = {
  where?: WhereQuery;
  limit?: number;
  depth?: number;
  page?: number;
  sort?: string;
};

export function buildQueryParams(params: ListQueryParams = {}): Record<string, string> {
  const out: Record<string, string> = {};

  if (params.where) {
    for (const [field, operators] of Object.entries(params.where)) {
      for (const [operator, value] of Object.entries(operators)) {
        out[`where[${field}][${operator}]`] = String(value);
      }
    }
  }
  if (params.limit !== undefined) out.limit = String(params.limit);
  if (params.depth !== undefined) out.depth = String(params.depth);
  if (params.page !== undefined) out.page = String(params.page);
  if (params.sort !== undefined) out.sort = params.sort;

  return out;
}
