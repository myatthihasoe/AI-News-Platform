import "server-only";

import {
  ArticleAlreadyAnalyzedError,
  saveArticleAnalysis,
  type SaveArticleAnalysisInput,
} from "@/lib/supabase/queries/analyses";
import {
  getPendingAnalysisArticles,
  type PendingAnalysisArticle,
} from "@/lib/supabase/queries/articles";
import {
  ANALYSIS_DISCLAIMER,
  ANALYSIS_MODEL,
  getAnalysisBatchSize,
} from "./constants";
import { AnalysisLogger } from "./logger";
import { AnalysisGenerationError, generateArticleAnalysis } from "./model";
import type { ArticleAnalysisOutput } from "./schema";
import type {
  AnalysisArticleResult,
  AnalysisBatchSummary,
  AnalysisReasonCounts,
  AnalysisRequest,
  AnalysisStatus,
  AnalysisSummary,
} from "./types";

export async function runAnalysisPipeline(request: AnalysisRequest): Promise<AnalysisSummary> {
  const startedAt = Date.now();
  const batchSize = getAnalysisBatchSize();
  const logger = new AnalysisLogger();
  const attemptedArticleIds = new Set<number>();
  const results: AnalysisArticleResult[] = [];
  const batches: AnalysisBatchSummary[] = [];
  let fatalPipelineFailure = false;

  logger.log("info", "analysis_started", "AI article analysis started.", {
    metadata: {
      model: ANALYSIS_MODEL,
      batchSize,
      requestLimit: request.limit ?? null,
      selectedArticleIds: request.articleIds ?? null,
    },
  });

  try {
    while (!request.limit || attemptedArticleIds.size < request.limit) {
      const remaining = request.limit ? request.limit - attemptedArticleIds.size : batchSize;
      const currentBatchSize = Math.min(batchSize, remaining);
      const articles = await getPendingAnalysisArticles({
        limit: currentBatchSize,
        articleIds: request.articleIds,
        excludeArticleIds: attemptedArticleIds,
      });

      if (articles.length === 0) {
        addUnavailableSelectedArticles(request, attemptedArticleIds, results, logger);
        break;
      }

      const batchStartedAt = Date.now();
      const batchNumber = batches.length + 1;
      const batchResults: AnalysisArticleResult[] = [];

      logger.log("info", "batch_started", `Analysis batch ${batchNumber} started.`, {
        metadata: { batchNumber, articleCount: articles.length },
      });

      for (const article of articles) {
        attemptedArticleIds.add(article.id);
        const result = await analyzeArticle(article, logger);
        results.push(result);
        batchResults.push(result);
      }

      const batch = summarizeBatch(batchNumber, batchResults, batchStartedAt);
      batches.push(batch);
      logger.log(
        batch.failed > 0 ? "warn" : "info",
        "batch_completed",
        `Analysis batch ${batchNumber} completed.`,
        { metadata: { ...batch } },
      );
    }
  } catch {
    fatalPipelineFailure = true;
    logger.log("error", "analysis_pipeline_failed", "The analysis pipeline stopped unexpectedly.", {
      metadata: { reason: "downstream_pipeline_failure" },
    });
  }

  const summary = buildSummary(
    request,
    batchSize,
    batches,
    results,
    startedAt,
    fatalPipelineFailure,
  );
  logger.log(
    summary.status === "failed" ? "error" : summary.status === "partial" ? "warn" : "info",
    summary.status === "failed" ? "analysis_failed" : "analysis_completed",
    `AI article analysis ${summary.status}.`,
    {
      metadata: {
        status: summary.status,
        model: summary.model,
        batchesProcessed: summary.batchesProcessed,
        articlesConsidered: summary.articlesConsidered,
        analyzed: summary.analyzed,
        skipped: summary.skipped,
        failed: summary.failed,
        totalDurationMs: summary.totalDurationMs,
        reasonCounts: summary.reasonCounts,
      },
    },
  );
  await logger.flush();

  return summary;
}

async function analyzeArticle(
  article: PendingAnalysisArticle,
  logger: AnalysisLogger,
): Promise<AnalysisArticleResult> {
  const invalidReason = validateArticleInput(article);
  if (invalidReason) {
    logger.log("warn", "article_skipped", "Skipped an unusable article before model analysis.", {
      sourceId: article.source_id,
      articleId: article.id,
      metadata: { reason: invalidReason },
    });
    return resultFor(article, "skipped", invalidReason);
  }

  try {
    const analysis = await generateArticleAnalysis(article, (reason, failedAttempt) => {
      logger.log("warn", "article_retry", "Retrying article analysis after a safe failure.", {
        sourceId: article.source_id,
        articleId: article.id,
        metadata: { reason, failedAttempt },
      });
    });
    await saveArticleAnalysis(article.id, mapAnalysisForPersistence(analysis));

    logger.log("info", "article_analyzed", "Article analysis saved.", {
      sourceId: article.source_id,
      articleId: article.id,
      metadata: { model: ANALYSIS_MODEL },
    });
    return resultFor(article, "analyzed");
  } catch (error) {
    if (error instanceof ArticleAlreadyAnalyzedError) {
      logger.log("info", "article_skipped", "Article was analyzed by another request.", {
        sourceId: article.source_id,
        articleId: article.id,
        metadata: { reason: "analysis_already_exists" },
      });
      return resultFor(article, "skipped", "analysis_already_exists");
    }

    const reason =
      error instanceof AnalysisGenerationError ? error.reason : "analysis_persistence_failed";
    logger.log("error", "article_failed", "Article analysis failed safely.", {
      sourceId: article.source_id,
      articleId: article.id,
      metadata: { reason },
    });
    return resultFor(article, "failed", reason);
  }
}

function validateArticleInput(article: PendingAnalysisArticle): string | null {
  if (article.title.trim().length < 4) {
    return "invalid_article_title";
  }

  if (article.raw_text.trim().length < 200) {
    return "insufficient_article_text";
  }

  if (Number.isNaN(Date.parse(article.published_at))) {
    return "invalid_published_at";
  }

  return null;
}

function mapAnalysisForPersistence(analysis: ArticleAnalysisOutput): SaveArticleAnalysisInput {
  return {
    summary: analysis.summary,
    sentiment_score: analysis.sentimentScore,
    sentiment_label: analysis.sentimentLabel,
    left_percentage: analysis.leftPercentage,
    center_percentage: analysis.centerPercentage,
    right_percentage: analysis.rightPercentage,
    bias_label: analysis.politicalFramingLabel,
    confidence: analysis.confidence,
    framing_notes: analysis.framingNotes,
    loaded_terms: analysis.loadedTerms,
    disclaimer: ANALYSIS_DISCLAIMER,
    model: ANALYSIS_MODEL,
  };
}

function addUnavailableSelectedArticles(
  request: AnalysisRequest,
  attemptedArticleIds: Set<number>,
  results: AnalysisArticleResult[],
  logger: AnalysisLogger,
): void {
  if (!request.articleIds) {
    return;
  }

  for (const articleId of request.articleIds) {
    if (attemptedArticleIds.has(articleId)) {
      continue;
    }

    attemptedArticleIds.add(articleId);
    results.push({
      articleId,
      sourceId: null,
      status: "skipped",
      reason: "not_pending_or_unavailable",
    });
    logger.log("info", "article_skipped", "Selected article is not pending or unavailable.", {
      articleId,
      metadata: { reason: "not_pending_or_unavailable" },
    });
  }
}

function summarizeBatch(
  batchNumber: number,
  results: AnalysisArticleResult[],
  startedAt: number,
): AnalysisBatchSummary {
  return {
    batchNumber,
    articlesConsidered: results.length,
    analyzed: countStatus(results, "analyzed"),
    skipped: countStatus(results, "skipped"),
    failed: countStatus(results, "failed"),
    durationMs: Date.now() - startedAt,
  };
}

function buildSummary(
  request: AnalysisRequest,
  batchSize: number,
  batches: AnalysisBatchSummary[],
  results: AnalysisArticleResult[],
  startedAt: number,
  fatalPipelineFailure: boolean,
): AnalysisSummary {
  const analyzed = countStatus(results, "analyzed");
  const skipped = countStatus(results, "skipped");
  const failed = countStatus(results, "failed");
  const status: AnalysisStatus =
    (fatalPipelineFailure || failed > 0) && analyzed === 0
      ? "failed"
      : fatalPipelineFailure || failed > 0
        ? "partial"
        : "completed";

  return {
    status,
    model: ANALYSIS_MODEL,
    batchSize,
    batchesProcessed: batches.length,
    articlesConsidered: results.length,
    analyzed,
    skipped,
    failed,
    totalDurationMs: Date.now() - startedAt,
    request: {
      limit: request.limit ?? null,
      articleIds: request.articleIds ?? null,
    },
    skippedArticleIds: results
      .filter((result) => result.status === "skipped")
      .map((result) => result.articleId),
    failedArticleIds: results
      .filter((result) => result.status === "failed")
      .map((result) => result.articleId),
    reasonCounts: {
      skipped: collectReasonCounts(results, "skipped"),
      failed: collectReasonCounts(results, "failed"),
    },
    batches,
  };
}

function resultFor(
  article: PendingAnalysisArticle,
  status: AnalysisArticleResult["status"],
  reason?: string,
): AnalysisArticleResult {
  return {
    articleId: article.id,
    sourceId: article.source_id,
    status,
    ...(reason ? { reason } : {}),
  };
}

function countStatus(
  results: AnalysisArticleResult[],
  status: AnalysisArticleResult["status"],
): number {
  return results.filter((result) => result.status === status).length;
}

function collectReasonCounts(
  results: AnalysisArticleResult[],
  status: AnalysisArticleResult["status"],
): AnalysisReasonCounts {
  const counts: AnalysisReasonCounts = {};

  for (const result of results) {
    if (result.status !== status || !result.reason) {
      continue;
    }

    counts[result.reason] = (counts[result.reason] ?? 0) + 1;
  }

  return counts;
}
