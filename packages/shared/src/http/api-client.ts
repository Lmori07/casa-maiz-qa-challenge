import type { APIRequestContext, APIResponse } from '@playwright/test';
import { paginatedEnvelope, type PaginatedEnvelope } from '../schemas/common.schema';
import { pageSchema, type PageDoc } from '../schemas/page.schema';
import { postSchema, type PostDoc } from '../schemas/post.schema';
import { categorySchema, type CategoryDoc } from '../schemas/category.schema';
import { mediaSchema, type MediaDoc } from '../schemas/media.schema';
import { formDefinitionSchema, type FormDefinition } from '../schemas/form.schema';
import { headerGlobalSchema, type HeaderGlobal } from '../schemas/header-global.schema';
import { footerGlobalSchema, type FooterGlobal } from '../schemas/footer-global.schema';
import { accessMatrixSchema, type AccessMatrix } from '../schemas/access.schema';
import { buildQueryParams, type ListQueryParams } from './query-params';

/**
 * Thin, schema-validating wrapper around the CMS's public REST API.
 *
 * Deliberately takes an *injected* `APIRequestContext` (Playwright's own
 * `request` fixture) instead of constructing its own HTTP stack. That
 * keeps this package free of any runtime HTTP dependency of its own (only
 * a type dependency on @playwright/test), and — more importantly — lets
 * both the api-tests suite and the browser-tests suite build the exact
 * same client the exact same way, which is what makes the browser suite's
 * "does the rendered DOM match the API" cross-consistency checks a one-liner.
 */
export class CmsApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  private async getJson(path: string, params?: Record<string, string>): Promise<unknown> {
    const response = await this.request.get(`${this.baseURL}${path}`, { params });
    return response.json();
  }

  async getPages(query?: ListQueryParams): Promise<PaginatedEnvelope<PageDoc>> {
    const json = await this.getJson('/api/pages', buildQueryParams(query));
    return paginatedEnvelope(pageSchema).parse(json);
  }

  async getPageBySlug(slug: string, depth = 2): Promise<PageDoc | undefined> {
    const result = await this.getPages({ where: { slug: { equals: slug } }, depth });
    return result.docs[0];
  }

  async getPosts(query?: ListQueryParams): Promise<PaginatedEnvelope<PostDoc>> {
    const json = await this.getJson('/api/posts', buildQueryParams(query));
    return paginatedEnvelope(postSchema).parse(json);
  }

  async getCategories(query?: ListQueryParams): Promise<PaginatedEnvelope<CategoryDoc>> {
    const json = await this.getJson('/api/categories', buildQueryParams(query));
    return paginatedEnvelope(categorySchema).parse(json);
  }

  async getMedia(query?: ListQueryParams): Promise<PaginatedEnvelope<MediaDoc>> {
    const json = await this.getJson('/api/media', buildQueryParams(query));
    return paginatedEnvelope(mediaSchema).parse(json);
  }

  async getForms(query?: ListQueryParams): Promise<PaginatedEnvelope<FormDefinition>> {
    const json = await this.getJson('/api/forms', buildQueryParams(query));
    return paginatedEnvelope(formDefinitionSchema).parse(json);
  }

  async getFormById(id: string): Promise<FormDefinition> {
    const json = await this.getJson(`/api/forms/${id}`);
    return formDefinitionSchema.parse(json);
  }

  async getHeader(): Promise<HeaderGlobal> {
    const json = await this.getJson('/api/globals/header');
    return headerGlobalSchema.parse(json);
  }

  async getFooter(): Promise<FooterGlobal> {
    const json = await this.getJson('/api/globals/footer');
    return footerGlobalSchema.parse(json);
  }

  async getAccess(): Promise<AccessMatrix> {
    const json = await this.getJson('/api/access');
    return accessMatrixSchema.parse(json);
  }

  /**
   * Posts to the ONE public write-capable endpoint found on this CMS.
   * Returns the raw response — callers MUST assert it is non-2xx. Only the
   * builders in `fixtures/invalid-payloads.ts` may be passed as `body`;
   * see that file for why a "valid payload" builder must never exist.
   */
  async postInvalidFormSubmission(body: unknown): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}/api/form-submissions`, { data: body });
  }

  /** Escape hatch for ad-hoc requests (error-handling / access-control specs). */
  async raw(path: string, params?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(`${this.baseURL}${path}`, { params });
  }
}
