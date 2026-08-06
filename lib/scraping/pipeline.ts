import "server-only";

import {
  DuplicateArticleError,
  findExistingArticleUrls,
  insertArticle,
} from "@/lib/supabase/queries/articles";
import { getActiveSources, type ActiveSource } from "@/lib/supabase/queries/sources";
import { extractArticle } from "./article";
import {
  DEFAULT_ARTICLES_PER_SOURCE,
  MAX_ARTICLES_PER_SOURCE,
  MAX_DETAIL_ATTEMPTS_PER_SOURCE,
} from "./constants";
import { extractHomepageCandidates } from "./homepage";
import { ScrapeLogger } from "./logger";
import { fetchHtmlThroughOxylabs } from "./oxylabs";
import {
  parseParserStrategy,
  type RejectionCounts,
  type ScrapeRequest,
  type ScrapeStatus,
  type ScrapeSummary,
  type SourceScrapeSummary,
} from "./types";

export class SourceSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceSelectionError";
  }
}

export async function runScrapingPipeline(request: ScrapeRequest): Promise<ScrapeSummary> {
  const startedAt = Date.now();
  const logger = new ScrapeLogger();
  const activeSources = await getActiveSources();
  const selectedSources = selectSources(activeSources, request.sourceIds);
  const limitPerSource = clamp(
    request.limitPerSource ?? DEFAULT_ARTICLES_PER_SOURCE,
    1,
    MAX_ARTICLES_PER_SOURCE,
  );
  const sourceSummaries: SourceScrapeSummary[] = [];
  const seenRunUrls = new Set<string>();

  logger.log("info", "scrape_started", "Manual scrape started.", {
    metadata: {
      sourceIds: selectedSources.map((source) => source.id),
      sourceNames: selectedSources.map((source) => source.name),
      limitPerSource,
    },
  });

  for (const source of selectedSources) {
    sourceSummaries.push(
      await scrapeSource(source, limitPerSource, seenRunUrls, logger),
    );
  }

  const summary = buildSummary(selectedSources, sourceSummaries, startedAt);
  logger.log(
    summary.status === "failed" ? "error" : summary.status === "partial" ? "warn" : "info",
    summary.status === "failed" ? "scrape_failed" : "scrape_completed",
    `Manual scrape ${summary.status}.`,
    {
      metadata: {
        status: summary.status,
        sourcesChecked: summary.sourcesChecked,
        candidatesFound: summary.candidatesFound,
        candidatesRejected: summary.candidatesRejected,
        duplicatesSkipped: summary.duplicatesSkipped,
        detailPagesScraped: summary.detailPagesScraped,
        articlesInserted: summary.articlesInserted,
        articlesRejected: summary.articlesRejected,
        articlesFailed: summary.articlesFailed,
        totalDurationMs: summary.totalDurationMs,
        rejectionReasons: summary.rejectionReasons,
      },
    },
  );
  await logger.flush();

  return summary;
}

async function scrapeSource(
  source: ActiveSource,
  limitPerSource: number,
  seenRunUrls: Set<string>,
  logger: ScrapeLogger,
): Promise<SourceScrapeSummary> {
  const strategy = parseParserStrategy(source.parserStrategy);
  const summary = createSourceSummary(source);

  logger.log("info", "source_started", `Scraping ${source.name}.`, {
    sourceId: source.id,
    metadata: { sourceName: source.name },
  });

  try {
    const homepageHtml = await fetchHtmlThroughOxylabs(source.listingUrl, {
      render: strategy.render,
    });
    logger.log("info", "homepage_fetched", `Fetched ${source.name} homepage.`, {
      sourceId: source.id,
      metadata: { htmlLength: homepageHtml.length },
    });

    const extraction = extractHomepageCandidates(homepageHtml, source.listingUrl, strategy);
    summary.candidatesFound = extraction.candidatesFound;
    summary.candidatesRejected = extraction.candidatesRejected;
    mergeReasons(summary.rejectionReasons, extraction.rejectionReasons);

    logger.log("info", "candidates_extracted", `Found ${extraction.candidates.length} eligible candidates for ${source.name}.`, {
      sourceId: source.id,
      metadata: {
        candidatesFound: extraction.candidatesFound,
        candidatesEligible: extraction.candidates.length,
        candidatesRejected: extraction.candidatesRejected,
        rejectionReasons: extraction.rejectionReasons,
      },
    });

    const existingUrls = await findExistingArticleUrls(extraction.candidates);
    const candidates = extraction.candidates.filter((candidate) => {
      if (existingUrls.has(candidate) || seenRunUrls.has(candidate)) {
        summary.duplicatesSkipped += 1;
        return false;
      }
      return true;
    });

    if (summary.duplicatesSkipped > 0) {
      logger.log("info", "duplicates_skipped", `Skipped ${summary.duplicatesSkipped} stored candidates for ${source.name}.`, {
        sourceId: source.id,
        metadata: { duplicatesSkipped: summary.duplicatesSkipped },
      });
    }

    const detailAttemptLimit = Math.min(
      MAX_DETAIL_ATTEMPTS_PER_SOURCE,
      Math.max(limitPerSource * 4, limitPerSource),
    );
    let detailAttempts = 0;

    for (const candidateUrl of candidates) {
      if (summary.articlesInserted >= limitPerSource || detailAttempts >= detailAttemptLimit) {
        break;
      }

      detailAttempts += 1;

      try {
        const detailHtml = await fetchHtmlThroughOxylabs(candidateUrl, {
          render: strategy.render,
        });
        summary.detailPagesScraped += 1;

        const extractionResult = extractArticle(
          detailHtml,
          candidateUrl,
          source.listingUrl,
          strategy,
        );

        if (!extractionResult.accepted) {
          summary.articlesRejected += 1;
          incrementReason(summary.rejectionReasons, extractionResult.reason);
          logger.log("warn", "article_rejected", `Rejected an invalid ${source.name} article.`, {
            sourceId: source.id,
            metadata: { reason: extractionResult.reason, url: candidateUrl },
          });
          continue;
        }

        const article = extractionResult.article;
        const detailExistingUrls = await findExistingArticleUrls([
          article.originalUrl,
          article.canonicalUrl,
        ]);

        if (
          detailExistingUrls.size > 0 ||
          seenRunUrls.has(article.originalUrl) ||
          seenRunUrls.has(article.canonicalUrl)
        ) {
          summary.duplicatesSkipped += 1;
          continue;
        }

        try {
          const inserted = await insertArticle({
            source_id: source.id,
            original_url: article.originalUrl,
            canonical_url: article.canonicalUrl,
            slug: article.slug,
            title: article.title,
            image_url: article.imageUrl,
            image_alt: article.imageAlt,
            author: article.author,
            category: article.category,
            region: null,
            published_at: article.publishedAt,
            raw_text: article.rawText,
            read_time_minutes: article.readTimeMinutes,
          });

          seenRunUrls.add(article.originalUrl);
          seenRunUrls.add(article.canonicalUrl);
          summary.articlesInserted += 1;
          logger.log("info", "article_inserted", `Inserted ${source.name} article.`, {
            sourceId: source.id,
            articleId: inserted.id,
            metadata: { canonicalUrl: article.canonicalUrl, title: article.title },
          });
        } catch (error) {
          if (error instanceof DuplicateArticleError) {
            summary.duplicatesSkipped += 1;
            continue;
          }

          throw error;
        }
      } catch (error) {
        summary.articlesFailed += 1;
        incrementReason(summary.rejectionReasons, "detail_processing_failed");
        logger.log("error", "article_failed", `Failed to process a ${source.name} candidate.`, {
          sourceId: source.id,
          metadata: { error: safeErrorMessage(error), url: candidateUrl },
        });
      }
    }

    summary.status = summary.articlesFailed > 0 ? "partial" : "completed";
    logger.log(
      summary.status === "partial" ? "warn" : "info",
      "source_completed",
      `Completed ${source.name} scrape.`,
      {
        sourceId: source.id,
        metadata: {
          status: summary.status,
          detailPagesScraped: summary.detailPagesScraped,
          articlesInserted: summary.articlesInserted,
          articlesRejected: summary.articlesRejected,
          articlesFailed: summary.articlesFailed,
        },
      },
    );
  } catch (error) {
    summary.status = "failed";
    summary.articlesFailed += 1;
    summary.error = safeErrorMessage(error);
    incrementReason(summary.rejectionReasons, "source_failed");
    logger.log("error", "source_failed", `Failed to scrape ${source.name}.`, {
      sourceId: source.id,
      metadata: { error: summary.error },
    });
  }

  return summary;
}

function selectSources(activeSources: ActiveSource[], requestedIds?: number[]) {
  if (activeSources.length === 0) {
    throw new SourceSelectionError("No active sources are configured.");
  }

  if (!requestedIds) {
    return activeSources;
  }

  const requestedSet = new Set(requestedIds);
  const selected = activeSources.filter((source) => requestedSet.has(source.id));
  const foundIds = new Set(selected.map((source) => source.id));
  const unavailableIds = requestedIds.filter((id) => !foundIds.has(id));

  if (unavailableIds.length > 0) {
    throw new SourceSelectionError(
      `Unknown or inactive source IDs: ${unavailableIds.join(", ")}.`,
    );
  }

  return selected;
}

function createSourceSummary(source: ActiveSource): SourceScrapeSummary {
  return {
    sourceId: source.id,
    sourceName: source.name,
    status: "completed",
    candidatesFound: 0,
    candidatesRejected: 0,
    duplicatesSkipped: 0,
    detailPagesScraped: 0,
    articlesInserted: 0,
    articlesRejected: 0,
    articlesFailed: 0,
    rejectionReasons: {},
  };
}

function buildSummary(
  sources: ActiveSource[],
  sourceSummaries: SourceScrapeSummary[],
  startedAt: number,
): ScrapeSummary {
  const failedSources = sourceSummaries.filter((source) => source.status === "failed").length;
  const hasPartialSource = sourceSummaries.some((source) => source.status === "partial");
  const status: ScrapeStatus =
    failedSources === sourceSummaries.length
      ? "failed"
      : failedSources > 0 || hasPartialSource
        ? "partial"
        : "completed";
  const rejectionReasons: RejectionCounts = {};

  for (const source of sourceSummaries) {
    mergeReasons(rejectionReasons, source.rejectionReasons);
  }

  return {
    status,
    selectedSources: sources.map((source) => ({ id: source.id, name: source.name })),
    sourcesChecked: sourceSummaries.length,
    candidatesFound: sum(sourceSummaries, "candidatesFound"),
    candidatesRejected: sum(sourceSummaries, "candidatesRejected"),
    duplicatesSkipped: sum(sourceSummaries, "duplicatesSkipped"),
    detailPagesScraped: sum(sourceSummaries, "detailPagesScraped"),
    articlesInserted: sum(sourceSummaries, "articlesInserted"),
    articlesRejected: sum(sourceSummaries, "articlesRejected"),
    articlesFailed: sum(sourceSummaries, "articlesFailed"),
    totalDurationMs: Date.now() - startedAt,
    rejectionReasons,
    sources: sourceSummaries,
  };
}

function sum(
  summaries: SourceScrapeSummary[],
  key:
    | "candidatesFound"
    | "candidatesRejected"
    | "duplicatesSkipped"
    | "detailPagesScraped"
    | "articlesInserted"
    | "articlesRejected"
    | "articlesFailed",
) {
  return summaries.reduce((total, summary) => total + summary[key], 0);
}

function mergeReasons(target: RejectionCounts, source: RejectionCounts) {
  for (const [reason, count] of Object.entries(source)) {
    target[reason] = (target[reason] ?? 0) + count;
  }
}

function incrementReason(counts: RejectionCounts, reason: string) {
  counts[reason] = (counts[reason] ?? 0) + 1;
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown scrape error";
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(Math.trunc(value), minimum), maximum);
}

