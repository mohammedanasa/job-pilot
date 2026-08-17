/**
 * Fetches a page and reduces it to plain, capped text — no HTML parser
 * dependency, just tag-stripping. Real pages run tens of thousands of
 * characters; feeding that straight into a prompt repeats Feature 10's
 * truncation bug, so every page is hard-capped before it ever reaches AI.
 */

const FETCH_TIMEOUT_MS = 5000;
/**
 * Verified live against Groq (openai/gpt-oss-20b, 8000 TPM limit): 4 real
 * pages at 2000 chars each plus the dossier schema and profile pushed the
 * request to 8152 tokens and Groq rejected it outright (HTTP 413). Capping
 * each page at 900 chars brought a real 4-page Stripe research prompt down
 * to a size Groq accepts with headroom — the same class of bug as Feature
 * 10's uncapped job descriptions.
 */
export const MAX_PAGE_CHARS = 900;
const MAX_SUB_PAGES = 3;

const SUB_PAGE_KEYWORDS = ["about", "careers", "blog", "engineering", "product", "team"];

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type FetchedPage = { url: string; text: string };

/** Returns null on any failure — timeout, network error, or empty rendered content. */
export async function fetchPageText(url: string): Promise<FetchedPage | null> {
  const page = await fetchPageHtml(url);
  if (!page) return null;

  const text = stripHtml(page.html).slice(0, MAX_PAGE_CHARS);
  return text.length > 0 ? { url, text } : null;
}

/** Like fetchPageText, but also returns the raw HTML for link extraction. */
export async function fetchPageHtml(url: string): Promise<{ url: string; html: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;

    const html = await res.text();
    return { url, html };
  } catch {
    return null;
  }
}

/**
 * Picks up to MAX_SUB_PAGES internal links worth visiting, scored by keyword
 * match against the URL path. Pure string matching — no LLM call needed to
 * decide which links are worth following.
 */
export function selectSubPageLinks(homepageHtml: string, homepageUrl: string): string[] {
  const base = new URL(homepageUrl);
  const seen = new Set<string>();
  const candidates: string[] = [];

  const hrefPattern = /<a\s[^>]*href=["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = hrefPattern.exec(homepageHtml)) !== null) {
    let href: URL;
    try {
      href = new URL(match[1], base);
    } catch {
      continue;
    }

    if (href.hostname !== base.hostname) continue;

    const path = href.pathname.toLowerCase();
    const keyword = SUB_PAGE_KEYWORDS.find((k) => path.includes(k));
    if (!keyword) continue;

    const normalized = href.origin + href.pathname;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    candidates.push(normalized);
  }

  // Prefer about/blog/engineering/product over careers — careers pages skew
  // toward generic hiring copy rather than substance about the company.
  candidates.sort((a, b) => {
    const aIsCareers = a.toLowerCase().includes("careers");
    const bIsCareers = b.toLowerCase().includes("careers");
    if (aIsCareers === bIsCareers) return 0;
    return aIsCareers ? 1 : -1;
  });

  return candidates.slice(0, MAX_SUB_PAGES);
}
