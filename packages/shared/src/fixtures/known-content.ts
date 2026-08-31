/**
 * Single source of truth for the "magic strings" both suites would
 * otherwise duplicate. These are facts about the live environment observed
 * during reconnaissance, not assumptions — see docs/DATA-STRATEGY.md for
 * why they're centralized here instead of hardcoded per-test.
 */

/** Slugs confirmed to exist in the `pages` collection at the time of writing. */
export const KNOWN_PAGE_SLUGS = ['home', 'menu', 'contact'] as const;

/** CDN host that serves all Payload media assets for this CMS instance. */
export const MEDIA_CDN_HOST = 'd2y8b8r86vndtb.cloudfront.net';

/**
 * Nav link paths intentionally excluded from "must resolve on the consumer
 * site" checks: `/admin` is a well-known Payload convention pointing at the
 * CMS's own admin panel (a separate origin), not a page the public consumer
 * app is expected to render. See docs/FINDINGS.md for the reasoning.
 */
export const ADMIN_LINK_PATHS = ['/admin'];
