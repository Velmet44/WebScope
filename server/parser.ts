import * as cheerio from 'cheerio';

export interface ExtractedLink {
  url: string;
  relationship: 'navigation' | 'content' | 'resource';
}

export function extractLinks(html: string, baseUrl: string): ExtractedLink[] {
  const $ = cheerio.load(html);
  const links: ExtractedLink[] = [];
  const seen = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    const resolved = resolveUrl(href, baseUrl);
    if (!resolved) return;

    if (seen.has(resolved)) return;
    seen.add(resolved);

    links.push({ url: resolved, relationship: 'navigation' });
  });

  $('link[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    const resolved = resolveUrl(href, baseUrl);
    if (!resolved) return;

    if (seen.has(resolved)) return;
    seen.add(resolved);

    links.push({ url: resolved, relationship: 'resource' });
  });

  return links;
}

export function extractMetadata(html: string): {
  title: string;
  description: string;
  contentType: string;
} {
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() || '';

  const description = $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() || '';

  const contentType = $('meta[http-equiv="Content-Type"]').attr('content') || 'text/html';

  return { title, description, contentType };
}

function resolveUrl(href: string, baseUrl: string): string | null {
  try {
    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
      return null;
    }

    const base = new URL(baseUrl);
    const resolved = new URL(href, base);

    if (!['http:', 'https:'].includes(resolved.protocol)) {
      return null;
    }

    resolved.hash = '';

    return resolved.href;
  } catch {
    return null;
  }
}
