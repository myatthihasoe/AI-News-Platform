import type { ParserStrategy } from "./types";

const TRACKING_PARAMETERS = new Set([
  "cmpid",
  "fbclid",
  "gclid",
  "guccounter",
  "mc_cid",
  "mc_eid",
  "ocid",
  "ref",
  "ref_src",
]);

const REJECTED_PATH_SEGMENTS = new Set([
  "about",
  "account",
  "advertise",
  "author",
  "authors",
  "careers",
  "category",
  "contact",
  "corporate",
  "customer-service",
  "games",
  "help",
  "live",
  "login",
  "menu",
  "newsletter",
  "newsletters",
  "podcast",
  "podcasts",
  "privacy",
  "product",
  "products",
  "profile",
  "reviews",
  "search",
  "section",
  "sections",
  "shop",
  "shopping",
  "shows",
  "signin",
  "signup",
  "subscribe",
  "subscription",
  "support",
  "tag",
  "tags",
  "terms",
  "topic",
  "topics",
  "video",
  "videos",
]);

const REJECTED_EXTENSIONS = /\.(?:7z|css|csv|docx?|gif|ico|jpe?g|js|json|mp3|mp4|pdf|png|svg|webm|webp|xml|zip)$/i;
const DATE_PATH = /\/(?:19|20)\d{2}\/(?:0?[1-9]|1[0-2])\/(?:0?[1-9]|[12]\d|3[01])(?:\/|$)/;
const ARTICLE_ID_PATH = /\/(?:article|articles|news|story|stories)\/[a-z0-9][a-z0-9_-]{5,}(?:\/|$)/i;
const LONG_ID_SEGMENT = /(?:^|[-_/])[a-z]*\d{6,}[a-z0-9]*(?:$|[-_/])/i;

export type UrlDecision =
  | { accepted: true; url: string }
  | { accepted: false; reason: string };

export function normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
  try {
    const url = baseUrl ? new URL(rawUrl, baseUrl) : new URL(rawUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.hash = "";
    url.hostname = url.hostname.toLowerCase();

    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith("utm_") || TRACKING_PARAMETERS.has(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }

    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
    }

    url.searchParams.sort();
    return url.toString();
  } catch {
    return null;
  }
}

export function evaluateArticleUrl(
  rawUrl: string,
  sourceHomepageUrl: string,
  strategy: ParserStrategy,
): UrlDecision {
  const normalized = normalizeUrl(rawUrl, sourceHomepageUrl);

  if (!normalized) {
    return { accepted: false, reason: "invalid_url" };
  }

  const candidate = new URL(normalized);
  const source = new URL(sourceHomepageUrl);

  if (!isSameSourceHost(candidate.hostname, source.hostname)) {
    return { accepted: false, reason: "external_host" };
  }

  const path = decodeURIComponentSafely(candidate.pathname).toLowerCase();
  const sourcePath = normalizePath(source.pathname);

  if (normalizePath(path) === sourcePath || normalizePath(path) === "/") {
    return { accepted: false, reason: "homepage_url" };
  }

  if (REJECTED_EXTENSIONS.test(path)) {
    return { accepted: false, reason: "non_html_resource" };
  }

  if (matchesPrefix(path, strategy.excludedPathPrefixes)) {
    return { accepted: false, reason: "strategy_excluded_path" };
  }

  const segments = path.split("/").filter(Boolean);
  const hasRejectedSegment = segments.some((segment) => REJECTED_PATH_SEGMENTS.has(segment));

  if (hasRejectedSegment) {
    return { accepted: false, reason: "non_article_path" };
  }

  if (matchesPrefix(path, strategy.articlePathPrefixes)) {
    return { accepted: true, url: normalized };
  }

  const finalSegment = segments.at(-1) ?? "";
  const slugWords = finalSegment.split(/[-_]/).filter((part) => part.length >= 2);
  const hasStrongArticleSignal =
    DATE_PATH.test(path) ||
    ARTICLE_ID_PATH.test(path) ||
    LONG_ID_SEGMENT.test(path) ||
    (segments.length >= 2 && finalSegment.length >= 28 && slugWords.length >= 4);

  if (!hasStrongArticleSignal) {
    return { accepted: false, reason: "weak_article_url" };
  }

  return { accepted: true, url: normalized };
}

export function isValidHttpUrl(rawUrl: string, baseUrl?: string): string | null {
  return normalizeUrl(rawUrl, baseUrl);
}

function isSameSourceHost(candidateHost: string, sourceHost: string): boolean {
  const candidate = stripWww(candidateHost);
  const source = stripWww(sourceHost);
  return candidate === source || candidate.endsWith(`.${source}`) || source.endsWith(`.${candidate}`);
}

function stripWww(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized || "/";
}

function matchesPrefix(path: string, prefixes: string[] | undefined) {
  return (prefixes ?? []).some((prefix) => {
    const normalizedPrefix = normalizePath(prefix.toLowerCase());
    return path === normalizedPrefix || path.startsWith(`${normalizedPrefix}/`);
  });
}

function decodeURIComponentSafely(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

