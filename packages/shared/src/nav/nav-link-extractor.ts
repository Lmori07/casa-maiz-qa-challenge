import type { HeaderGlobal } from '../schemas/header-global.schema';
import type { FooterGlobal } from '../schemas/footer-global.schema';
import type { NavItem } from '../schemas/nav-item.schema';
import { ADMIN_LINK_PATHS } from '../fixtures/known-content';

export type ExtractedNavLink = {
  label: string;
  kind: 'internal' | 'external';
  path: string;
  source: 'header' | 'footer';
};

function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function extractFromItems(items: NavItem[], source: 'header' | 'footer'): ExtractedNavLink[] {
  return items.map((item): ExtractedNavLink => {
    const { link } = item;

    if (link.type === 'custom') {
      return {
        label: link.label,
        kind: isExternal(link.url) ? 'external' : 'internal',
        path: link.url,
        source,
      };
    }

    // Reference link: the actual route is derived from the referenced
    // document's slug (confirmed by recon: a `pages` doc with slug `home`
    // resolves at both `/` and `/home`, and slug `contact` resolves at
    // `/contact` — no special-casing needed for any slug).
    const { value } = link.reference;
    const slug = typeof value === 'string' ? undefined : value.slug;
    return {
      label: link.label,
      kind: 'internal',
      path: slug ? `/${slug}` : '/',
      source,
    };
  });
}

/** Flattens both nav globals into a single list of resolvable links. */
export function extractNavLinks(header: HeaderGlobal, footer: FooterGlobal): ExtractedNavLink[] {
  return [
    ...extractFromItems(header.navItems, 'header'),
    ...extractFromItems(footer.navItems, 'footer'),
  ];
}

/**
 * The subset of extracted links that the consumer site is actually
 * expected to render a page for — external links and known CMS-only
 * paths (e.g. `/admin`) are out of scope for "does this page load" checks.
 */
export function internalLinksToVerify(links: ExtractedNavLink[]): ExtractedNavLink[] {
  return links.filter((link) => link.kind === 'internal' && !ADMIN_LINK_PATHS.includes(link.path));
}
