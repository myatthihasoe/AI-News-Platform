import "server-only";

import { getSupabaseServiceClient } from "../client";
import type {
  ArticleAnalysisDto,
  ArticleDetail,
  ArticleFeedItem,
  ArticleSourceDto,
  RelatedArticleDto,
} from "../dto";
import { throwSupabaseError } from "../errors";
import type { Database, Tables, TablesInsert, Vector } from "../types";

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
  analysis: { id: number; embedding: Vector | null } | null;
};

type RelatedArticleRow = Database["public"]["Functions"]["match_related_articles"]["Returns"][number];

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

export type AnalysisWorkItem = PendingAnalysisArticle & {
  kind: "full_analysis" | "embedding_backfill" | "complete";
};

export type AnalysisWorkOptions = {
  limit?: number;
  articleIds?: readonly number[];
  excludeArticleIds?: ReadonlySet<number>;
  includeCompleted?: boolean;
};

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

export async function getAnalysisWorkItems(
  options: AnalysisWorkOptions = {},
): Promise<AnalysisWorkItem[]> {
  const boundedLimit = clampInteger(options.limit ?? 100, 1, 500);
  const workItems: AnalysisWorkItem[] = [];
  const selectedIds = options.articleIds
    ? [...new Set(options.articleIds)].slice(0, 100)
    : null;
  let offset = 0;

  while (workItems.length < boundedLimit) {
    let query = getSupabaseServiceClient()
      .from("articles")
      .select(`
        id,
        source_id,
        title,
        raw_text,
        published_at,
        analysis:article_analyses (id, embedding)
      `)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PENDING_PAGE_SIZE - 1);

    if (selectedIds) {
      query = query.in("id", selectedIds);
    }

    const { data, error } = await query;

    if (error) {
      throwSupabaseError("Unable to load article analysis work", error);
    }

    const rows = (data ?? []) as unknown as PendingArticleRow[];

    for (const row of rows) {
      if (options.excludeArticleIds?.has(row.id)) {
        continue;
      }

      const kind = row.analysis === null
        ? "full_analysis"
        : row.analysis.embedding === null
          ? "embedding_backfill"
          : "complete";

      if (kind === "complete" && !options.includeCompleted) {
        continue;
      }

      workItems.push({
        id: row.id,
        source_id: row.source_id,
        title: row.title,
        raw_text: row.raw_text,
        published_at: row.published_at,
        kind,
      });

      if (workItems.length === boundedLimit) {
        break;
      }
    }

    if (rows.length < PENDING_PAGE_SIZE) {
      break;
    }

    offset += PENDING_PAGE_SIZE;
  }

  return workItems;
}

export async function getPendingAnalysisArticles(limit = 100): Promise<PendingAnalysisArticle[]> {
  const items = await getAnalysisWorkItems({ limit });
  return items.map((item) => ({
    id: item.id,
    source_id: item.source_id,
    title: item.title,
    raw_text: item.raw_text,
    published_at: item.published_at,
  }));
}

export async function getArticleEmbedding(articleId: number): Promise<number[] | null> {
  if (!Number.isSafeInteger(articleId) || articleId <= 0) {
    throw new Error("Article ID must be a positive safe integer.");
  }

  const { data, error } = await getSupabaseServiceClient()
    .from("article_analyses")
    .select("embedding")
    .eq("article_id", articleId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throwSupabaseError(`Unable to load embedding for article ${articleId}`, error);
  }

  if (!data?.embedding) {
    return null;
  }

  return parseDatabaseEmbedding(data.embedding, articleId);
}

export async function getRelatedArticles(
  articleId: number,
  embedding: readonly number[],
): Promise<RelatedArticleDto[]> {
  if (!Number.isSafeInteger(articleId) || articleId <= 0) {
    throw new Error("Article ID must be a positive safe integer.");
  }
  validateEmbedding(embedding);

  const { data, error } = await getSupabaseServiceClient().rpc("match_related_articles", {
    p_article_id: articleId,
    p_query_embedding: [...embedding],
    p_match_count: 5,
  });

  if (error) {
    throwSupabaseError(`Unable to load related articles for ${articleId}`, error);
  }

  return (data ?? [])
    .filter(isValidRelatedArticleRow)
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      imageUrl: row.image_url,
      imageAlt: row.image_alt?.trim() || row.title,
      category: row.category,
      region: row.region,
      publishedAt: row.published_at,
      readTimeMinutes: row.read_time_minutes,
      source: {
        id: row.source_id,
        name: row.source_name,
        logoUrl: row.source_logo_url,
      },
      similarity: row.similarity,
    }));
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

function parseDatabaseEmbedding(value: Vector, articleId: number): number[] {
  let parsed: unknown = value;

  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new Error(`Stored embedding for article ${articleId} is malformed.`);
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Stored embedding for article ${articleId} is malformed.`);
  }

  validateEmbedding(parsed);
  return parsed;
}

function validateEmbedding(value: readonly unknown[]): asserts value is number[] {
  if (value.length !== 1536 || value.some((item) => typeof item !== "number" || !Number.isFinite(item))) {
    throw new Error("Article embedding must contain 1536 finite numbers.");
  }
}

function isValidRelatedArticleRow(row: unknown): row is RelatedArticleRow {
  if (!row || typeof row !== "object") return false;
  const candidate = row as Record<string, unknown>;

  return Number.isSafeInteger(candidate.id)
    && Number(candidate.id) > 0
    && Number.isSafeInteger(candidate.source_id)
    && Number(candidate.source_id) > 0
    && isNonemptyString(candidate.slug)
    && isNonemptyString(candidate.title)
    && isNonemptyString(candidate.image_url)
    && isNonemptyString(candidate.source_name)
    && typeof candidate.published_at === "string"
    && !Number.isNaN(new Date(candidate.published_at).getTime())
    && typeof candidate.similarity === "number"
    && Number.isFinite(candidate.similarity)
    && isNullableString(candidate.image_alt)
    && isNullableString(candidate.category)
    && isNullableString(candidate.region)
    && isNullableString(candidate.source_logo_url)
    && (candidate.read_time_minutes === null || Number.isSafeInteger(candidate.read_time_minutes));
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}
