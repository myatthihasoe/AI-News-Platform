import "server-only";

import { getSupabaseServiceClient } from "../client";
import type { ArticleAnalysisDto, ArticleDetail, ArticleFeedItem, ArticleSourceDto } from "../dto";
import { throwSupabaseError } from "../errors";
import type { Tables, TablesInsert } from "../types";

const DEFAULT_FEED_LIMIT = 30;
const MAX_FEED_LIMIT = 100;
const URL_FILTER_CHUNK_SIZE = 15;
const PENDING_PAGE_SIZE = 100;

const articleJoinSelection = `
  id,
  slug,
  title,
  image_url,
  image_alt,
  author,
  category,
  region,
  published_at,
  read_time_minutes,
  original_url,
  canonical_url,
  raw_text,
  source:sources!articles_source_id_fkey (
    id,
    name,
    listing_url,
    logo_url
  ),
  analysis:article_analyses!inner (
    summary,
    sentiment_score,
    sentiment_label,
    left_percentage,
    center_percentage,
    right_percentage,
    bias_score,
    bias_label,
    confidence,
    framing_notes,
    loaded_terms,
    disclaimer,
    model,
    created_at
  )
`;

type SourceRow = Pick<Tables<"sources">, "id" | "name" | "listing_url" | "logo_url">;
type AnalysisRow = Pick<
  Tables<"article_analyses">,
  | "summary"
  | "sentiment_score"
  | "sentiment_label"
  | "left_percentage"
  | "center_percentage"
  | "right_percentage"
  | "bias_score"
  | "bias_label"
  | "confidence"
  | "framing_notes"
  | "loaded_terms"
  | "disclaimer"
  | "model"
  | "created_at"
>;

type JoinedArticleRow = Pick<
  Tables<"articles">,
  | "id"
  | "slug"
  | "title"
  | "image_url"
  | "image_alt"
  | "author"
  | "category"
  | "region"
  | "published_at"
  | "read_time_minutes"
  | "original_url"
  | "canonical_url"
  | "raw_text"
> & {
  source: SourceRow | null;
  analysis: AnalysisRow | null;
};

type PendingArticleRow = Pick<
  Tables<"articles">,
  "id" | "source_id" | "title" | "raw_text" | "published_at"
> & {
  analysis: { id: number } | null;
};

export type NewArticleInput = Pick<
  TablesInsert<"articles">,
  | "source_id"
  | "original_url"
  | "canonical_url"
  | "slug"
  | "title"
  | "image_url"
  | "published_at"
  | "raw_text"
> &
  Pick<
    TablesInsert<"articles">,
    "image_alt" | "author" | "category" | "region" | "read_time_minutes"
  >;

export type PendingAnalysisArticle = Omit<PendingArticleRow, "analysis">;

export class DuplicateArticleError extends Error {
  constructor(url: string) {
    super(`Article already exists: ${url}`);
    this.name = "DuplicateArticleError";
  }
}

export async function insertArticle(input: NewArticleInput): Promise<Tables<"articles">> {
  const { data, error } = await getSupabaseServiceClient()
    .from("articles")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new DuplicateArticleError(input.original_url);
    }

    throwSupabaseError(`Unable to insert article ${input.original_url}`, error);
  }

  return data;
}

export async function findExistingArticleUrls(urls: readonly string[]): Promise<Set<string>> {
  const normalizedUrls = [...new Set(urls.map(normalizeUrl).filter(isString))];
  const existingUrls = new Set<string>();

  for (const chunk of chunkValues(normalizedUrls, URL_FILTER_CHUNK_SIZE)) {
    const [originalResult, canonicalResult] = await Promise.all([
      getSupabaseServiceClient()
        .from("articles")
        .select("original_url, canonical_url")
        .in("original_url", chunk),
      getSupabaseServiceClient()
        .from("articles")
        .select("original_url, canonical_url")
        .in("canonical_url", chunk),
    ]);

    if (originalResult.error) {
      throwSupabaseError("Unable to check original article URLs", originalResult.error);
    }

    if (canonicalResult.error) {
      throwSupabaseError("Unable to check canonical article URLs", canonicalResult.error);
    }

    for (const row of [...(originalResult.data ?? []), ...(canonicalResult.data ?? [])]) {
      existingUrls.add(row.original_url);
      existingUrls.add(row.canonical_url);
    }
  }

  return existingUrls;
}

export async function getAnalyzedArticleFeed(limit = DEFAULT_FEED_LIMIT): Promise<ArticleFeedItem[]> {
  const boundedLimit = clampInteger(limit, 1, MAX_FEED_LIMIT);
  const { data, error } = await getSupabaseServiceClient()
    .from("articles")
    .select(articleJoinSelection)
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(boundedLimit);

  if (error) {
    throwSupabaseError("Unable to load analyzed article feed", error);
  }

  return ((data ?? []) as unknown as JoinedArticleRow[]).flatMap((row) => {
    const article = mapFeedItem(row);
    return article ? [article] : [];
  });
}

export async function getAnalyzedArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  if (!isValidSlug(slug)) {
    return null;
  }

  const { data, error } = await getSupabaseServiceClient()
    .from("articles")
    .select(articleJoinSelection)
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    throwSupabaseError(`Unable to load article ${slug}`, error);
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as JoinedArticleRow;
  const feedItem = mapFeedItem(row);

  if (!feedItem) {
    return null;
  }

  return {
    ...feedItem,
    author: row.author,
    originalUrl: row.original_url,
    canonicalUrl: row.canonical_url,
    body: splitArticleBody(row.raw_text),
  };
}

export async function getPendingAnalysisArticles(limit = 100): Promise<PendingAnalysisArticle[]> {
  const boundedLimit = clampInteger(limit, 1, 500);
  const pending: PendingAnalysisArticle[] = [];
  let offset = 0;

  while (pending.length < boundedLimit) {
    const { data, error } = await getSupabaseServiceClient()
      .from("articles")
      .select(`
        id,
        source_id,
        title,
        raw_text,
        published_at,
        analysis:article_analyses (id)
      `)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PENDING_PAGE_SIZE - 1);

    if (error) {
      throwSupabaseError("Unable to load pending-analysis articles", error);
    }

    const rows = (data ?? []) as unknown as PendingArticleRow[];

    for (const row of rows) {
      if (row.analysis === null) {
        pending.push({
          id: row.id,
          source_id: row.source_id,
          title: row.title,
          raw_text: row.raw_text,
          published_at: row.published_at,
        });

        if (pending.length === boundedLimit) {
          break;
        }
      }
    }

    if (rows.length < PENDING_PAGE_SIZE) {
      break;
    }

    offset += PENDING_PAGE_SIZE;
  }

  return pending;
}

function mapFeedItem(row: JoinedArticleRow): ArticleFeedItem | null {
  if (!row.source || !row.analysis) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    imageUrl: row.image_url,
    imageAlt: row.image_alt?.trim() || row.title,
    category: row.category,
    region: row.region,
    publishedAt: row.published_at,
    readTimeMinutes: row.read_time_minutes,
    source: mapSource(row.source),
    analysis: mapAnalysis(row.analysis),
  };
}

function mapSource(source: SourceRow): ArticleSourceDto {
  return {
    id: source.id,
    name: source.name,
    listingUrl: source.listing_url,
    logoUrl: source.logo_url,
  };
}

function mapAnalysis(analysis: AnalysisRow): ArticleAnalysisDto {
  return {
    summary: analysis.summary,
    sentimentScore: analysis.sentiment_score,
    sentimentLabel: analysis.sentiment_label,
    leftPercentage: analysis.left_percentage,
    centerPercentage: analysis.center_percentage,
    rightPercentage: analysis.right_percentage,
    biasScore: analysis.bias_score,
    biasLabel: analysis.bias_label,
    confidence: analysis.confidence,
    framingNotes: analysis.framing_notes,
    loadedTerms: analysis.loaded_terms,
    disclaimer: analysis.disclaimer,
    model: analysis.model,
    generatedAt: analysis.created_at,
  };
}

function splitArticleBody(rawText: string): string[] {
  const paragraphs = rawText
    .split(/\r?\n\s*\r?\n/g)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return paragraphs.length > 0 ? paragraphs : [rawText.trim()];
}

function normalizeUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function chunkValues<T>(values: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

function clampInteger(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(Math.trunc(value), minimum), maximum);
}

function isString(value: string | null): value is string {
  return value !== null;
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
