import { createHash } from "node:crypto";
import { load, type CheerioAPI } from "cheerio";
import type { ParsedArticle, ParserStrategy } from "./types";
import { evaluateArticleUrl, isValidHttpUrl } from "./urls";

const DEFAULT_BODY_SELECTORS = [
  "[itemprop='articleBody']",
  "article",
  "main [class*='article-body' i]",
  "main [class*='story-body' i]",
  "main [class*='content-body' i]",
  "main",
];

const REMOVAL_SELECTOR = [
  "script",
  "style",
  "template",
  "svg",
  "noscript",
  "nav",
  "footer",
  "aside",
  "form",
  "[hidden]",
  "[aria-hidden='true']",
  "[role='navigation']",
  "[class*='advert' i]",
  "[class*='ad-' i]",
  "[class*='banner' i]",
  "[class*='caption' i]",
  "[class*='cookie' i]",
  "[class*='footer' i]",
  "[class*='most-viewed' i]",
  "[class*='newsletter' i]",
  "[class*='paywall' i]",
  "[class*='promo' i]",
  "[class*='related' i]",
  "[class*='share' i]",
  "[class*='social' i]",
  "[class*='subscribe' i]",
  "[data-testid*='advert' i]",
  "[data-testid*='related' i]",
  "[data-testid*='share' i]",
].join(",");

const BOILERPLATE_PATTERN = /^(?:advertisement|continue reading|load more|most read|most viewed|read more|related (?:article|content|stories)|sign (?:in|up)|skip to content|subscribe|subscription|share this|follow us|all rights reserved)\b/i;
const GENERIC_TITLE_PATTERN = /^(?:home|homepage|latest|live|news|podcasts?|products?|reviews?|search|shopping|shows?|support|videos?|world news)$/i;
const CODE_DUMP_PATTERN = /(?:function\s*\(|=>\s*\{|\.css\(|document\.(?:querySelector|getElementById)|window\.__|@[a-z-]+\s*\{|\{\s*[a-z-]+\s*:\s*[^}]+\})/i;

export type ArticleExtractionResult =
  | { accepted: true; article: ParsedArticle }
  | { accepted: false; reason: string };

export function extractArticle(
  html: string,
  originalUrl: string,
  sourceHomepageUrl: string,
  strategy: ParserStrategy,
): ArticleExtractionResult {
  const $ = load(html);
  const jsonLdEntries = collectJsonLd($);
  const articleJsonLd = jsonLdEntries.find(isArticleJsonLd);

  const title = firstNonEmpty([
    getMetaContent($, "meta[property='og:title']"),
    getMetaContent($, "meta[name='twitter:title']"),
    getString(articleJsonLd?.headline),
    getString(articleJsonLd?.name),
    normalizeWhitespace($("h1").first().text()),
  ]);

  if (!title || title.length < 12 || title.length > 350 || GENERIC_TITLE_PATTERN.test(title)) {
    return { accepted: false, reason: "invalid_title" };
  }

  const canonicalCandidate = firstNonEmpty([
    $("link[rel='canonical']").first().attr("href"),
    getMetaContent($, "meta[property='og:url']"),
    getString(articleJsonLd?.url),
    originalUrl,
  ]);
  const canonicalUrl = canonicalCandidate
    ? isValidHttpUrl(canonicalCandidate, originalUrl)
    : null;

  if (!canonicalUrl) {
    return { accepted: false, reason: "missing_canonical_url" };
  }

  const canonicalDecision = evaluateArticleUrl(canonicalUrl, sourceHomepageUrl, strategy);
  if (!canonicalDecision.accepted) {
    return { accepted: false, reason: `canonical_${canonicalDecision.reason}` };
  }

  const imageCandidate = firstNonEmpty([
    getMetaContent($, "meta[property='og:image']"),
    getMetaContent($, "meta[name='twitter:image']"),
    extractJsonLdImage(articleJsonLd?.image),
  ]);
  const imageUrl = imageCandidate ? isValidHttpUrl(imageCandidate, canonicalUrl) : null;

  if (!imageUrl) {
    return { accepted: false, reason: "missing_image" };
  }

  const publishedCandidate = firstNonEmpty([
    getMetaContent($, "meta[property='article:published_time']"),
    getMetaContent($, "meta[name='article:published_time']"),
    getMetaContent($, "meta[name='parsely-pub-date']"),
    getMetaContent($, "meta[name='date']"),
    getMetaContent($, "meta[itemprop='datePublished']"),
    getString(articleJsonLd?.datePublished),
    $("time[datetime]").first().attr("datetime"),
  ]);
  const publishedAt = publishedCandidate ? normalizePublishedDate(publishedCandidate) : null;

  if (!publishedAt) {
    return { accepted: false, reason: "missing_published_date" };
  }

  $(REMOVAL_SELECTOR).remove();

  const bodyParagraphs = chooseBestBody(
    $,
    strategy.articleBodySelectors?.length
      ? [...strategy.articleBodySelectors, ...DEFAULT_BODY_SELECTORS]
      : DEFAULT_BODY_SELECTORS,
    getString(articleJsonLd?.articleBody),
  );
  const rawText = bodyParagraphs.join("\n\n");
  const meaningfulCharacterCount = rawText.replace(/\s/g, "").length;

  if (
    rawText.length === 0 ||
    CODE_DUMP_PATTERN.test(rawText.slice(0, 2_000)) ||
    (bodyParagraphs.length < 3 && meaningfulCharacterCount < 900)
  ) {
    return { accepted: false, reason: "insufficient_article_body" };
  }

  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  const author = firstNonEmpty([
    getMetaContent($, "meta[name='author']"),
    extractJsonLdAuthor(articleJsonLd?.author),
    normalizeWhitespace($("[rel='author'], [class*='byline' i]").first().text()),
  ]);
  const category = firstNonEmpty([
    getMetaContent($, "meta[property='article:section']"),
    getStringOrFirstString(articleJsonLd?.articleSection),
  ]);

  return {
    accepted: true,
    article: {
      originalUrl,
      canonicalUrl: canonicalDecision.url,
      slug: createStableSlug(title, canonicalDecision.url),
      title,
      imageUrl,
      imageAlt:
        firstNonEmpty([
          getMetaContent($, "meta[property='og:image:alt']"),
          getMetaContent($, "meta[name='twitter:image:alt']"),
        ]) ?? null,
      author: author ?? null,
      category: category ?? null,
      publishedAt,
      rawText,
      readTimeMinutes: Math.max(1, Math.ceil(wordCount / 225)),
    },
  };
}

function collectJsonLd($: CheerioAPI): Array<Record<string, unknown>> {
  const entries: Array<Record<string, unknown>> = [];

  $("script[type='application/ld+json']").each((_, element) => {
    const content = $(element).text().trim();
    if (!content || content.length > 2_000_000) {
      return;
    }

    try {
      flattenJsonLd(JSON.parse(content), entries);
    } catch {
      // Malformed metadata must not reject otherwise valid article HTML.
    }
  });

  return entries;
}

function flattenJsonLd(value: unknown, entries: Array<Record<string, unknown>>) {
  if (Array.isArray(value)) {
    value.forEach((item) => flattenJsonLd(item, entries));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  entries.push(value);
  if (Array.isArray(value["@graph"])) {
    value["@graph"].forEach((item) => flattenJsonLd(item, entries));
  }
}

function isArticleJsonLd(entry: Record<string, unknown>) {
  const type = entry["@type"];
  const types = Array.isArray(type) ? type : [type];
  return types.some(
    (value) =>
      typeof value === "string" &&
      /^(?:Article|NewsArticle|ReportageNewsArticle|AnalysisNewsArticle|OpinionNewsArticle)$/i.test(
        value,
      ),
  );
}

function chooseBestBody($: CheerioAPI, selectors: string[], jsonLdBody?: string) {
  const candidates: string[][] = [];

  if (jsonLdBody) {
    const paragraphs = paragraphsFromText(jsonLdBody);
    if (paragraphs.length > 0) {
      candidates.push(paragraphs);
    }
  }

  for (const selector of selectors) {
    try {
      $(selector)
        .slice(0, 4)
        .each((_, element) => {
          const container = $(element);
          const containerText = normalizeWhitespace(container.text());
          const linkTextLength = normalizeWhitespace(container.find("a").text()).length;

          if (containerText.length > 0 && linkTextLength / containerText.length > 0.45) {
            return;
          }

          const paragraphs = dedupeParagraphs(
            container
              .find("p")
              .toArray()
              .map((paragraph) => normalizeWhitespace($(paragraph).text()))
              .filter(isMeaningfulParagraph),
          );

          if (paragraphs.length > 0) {
            candidates.push(paragraphs);
          } else if (containerText.length >= 900) {
            candidates.push(paragraphsFromText(containerText));
          }
        });
    } catch {
      // Ignore malformed optional selectors from parser_strategy.
    }
  }

  return candidates.sort((left, right) => bodyScore(right) - bodyScore(left))[0] ?? [];
}

function paragraphsFromText(value: string) {
  const normalized = value.replace(/\r/g, "").trim();
  const initial = normalized
    .split(/\n\s*\n+/)
    .map(normalizeWhitespace)
    .filter(isMeaningfulParagraph);

  if (initial.length >= 2 || normalized.length < 900) {
    return dedupeParagraphs(initial);
  }

  const sentences = normalizeWhitespace(normalized).split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
  const paragraphs: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    current = current ? `${current} ${sentence}` : sentence;
    if (current.length >= 350) {
      paragraphs.push(current);
      current = "";
    }
  }

  if (current.length >= 40) {
    paragraphs.push(current);
  }

  return dedupeParagraphs(paragraphs.filter(isMeaningfulParagraph));
}

function isMeaningfulParagraph(value: string) {
  if (value.length < 40 || value.length > 20_000 || BOILERPLATE_PATTERN.test(value)) {
    return false;
  }

  const letters = value.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  return letters / value.length >= 0.45 && !CODE_DUMP_PATTERN.test(value);
}

function dedupeParagraphs(paragraphs: string[]) {
  const seen = new Set<string>();
  return paragraphs.filter((paragraph) => {
    const key = paragraph.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function bodyScore(paragraphs: string[]) {
  const characters = paragraphs.reduce((total, paragraph) => total + paragraph.length, 0);
  return characters + Math.min(paragraphs.length, 20) * 100;
}

function getMetaContent($: CheerioAPI, selector: string) {
  return normalizeWhitespace($(selector).first().attr("content") ?? "");
}

function extractJsonLdImage(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractJsonLdImage).find(Boolean);
  }

  if (isRecord(value)) {
    return getString(value.url) ?? getString(value.contentUrl);
  }

  return undefined;
}

function extractJsonLdAuthor(value: unknown): string | undefined {
  if (typeof value === "string") {
    return normalizeWhitespace(value);
  }

  if (Array.isArray(value)) {
    const authors = value.map(extractJsonLdAuthor).filter((item): item is string => Boolean(item));
    return authors.length > 0 ? authors.join(", ") : undefined;
  }

  if (isRecord(value)) {
    return getString(value.name);
  }

  return undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? normalizeWhitespace(value) : undefined;
}

function getStringOrFirstString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return value.map(getString).find(Boolean);
  }
  return getString(value);
}

function firstNonEmpty(values: Array<string | null | undefined>) {
  return values.find((value): value is string => Boolean(value?.trim()))?.trim();
}

function normalizePublishedDate(value: string): string | null {
  const date = new Date(value);
  const now = Date.now();

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() < 1990 ||
    date.getTime() > now + 2 * 24 * 60 * 60 * 1_000
  ) {
    return null;
  }

  return date.toISOString();
}

function createStableSlug(title: string, canonicalUrl: string) {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72)
    .replace(/-$/g, "") || "article";
  const suffix = createHash("sha256").update(canonicalUrl).digest("hex").slice(0, 10);
  return `${base}-${suffix}`;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

