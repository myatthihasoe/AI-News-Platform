import "server-only";

import {
  getAnalysisWorkItems,
  type AnalysisWorkItem,
} from "@/lib/supabase/queries/articles";
import {
  ArticleAnalysisAlreadyExistsError,
  ArticleEmbeddingAlreadyExistsError,
  saveArticleAnalysis,
  saveArticleEmbedding,
} from "@/lib/supabase/queries/analyses";
import {
  ANALYSIS_DISCLAIMER,
  ANALYSIS_MODEL,
  DEFAULT_ANALYSIS_BATCH_SIZE,
  EMBEDDING_MODEL,
  MAX_ANALYSIS_BATCH_SIZE,
} from "./constants";
import { AnalysisLogger } from "./logger";
import { generateArticleAnalysis, generateArticleEmbedding } from "./model";
import type { AnalysisRequest } from "./schema";

type ReasonGroup = { count: number; articleIds: number[] };

export type AnalysisPipelineSummary = {
  status: "completed" | "partial" | "failed";
  analysisModel: string;
  embeddingModel: string;
  batchSize: number;
  batchesProcessed: number;
  workItemsConsidered: number;
  fullAnalysesCompleted: number;
  embeddingsGenerated: number;
  embeddingsBackfilled: number;
  skipped: number;
  failed: number;
  totalDurationMs: number;
  failureReasons: Record<string, ReasonGroup>;
  skipReasons: Record<string, ReasonGroup>;
};

type WorkResult = {
  status: "analyzed" | "backfilled" | "skipped" | "failed";
  reason?: string;
  embeddingGenerated: boolean;
};

export async function runAnalysisPipeline(request: AnalysisRequest): Promise<AnalysisPipelineSummary> {
  const startedAt = Date.now();
  const logger = new AnalysisLogger();
  const batchSize = getBatchSize();
  const attempted = new Set<number>();
  const counters = {
    batchesProcessed: 0,
    workItemsConsidered: 0,
    fullAnalysesCompleted: 0,
    embeddingsGenerated: 0,
    embeddingsBackfilled: 0,
    skipped: 0,
    failed: 0,
  };
  const failureReasons: Record<string, ReasonGroup> = {};
  const skipReasons: Record<string, ReasonGroup> = {};
  let fatalError: unknown;
  const selectedIds = request.articleIds
    ? [...new Set(request.articleIds)].slice(0, request.limit ?? request.articleIds.length)
    : null;

  logger.log("info", "started", "AI article analysis started.", {
    metadata: {
      analysisModel: ANALYSIS_MODEL,
      embeddingModel: EMBEDDING_MODEL,
      batchSize,
      selectedArticleCount: selectedIds?.length ?? 0,
      limit: request.limit ?? null,
    },
  });

  try {
    if (selectedIds) {
      const selectedWork = await getAnalysisWorkItems({
        articleIds: selectedIds,
        includeCompleted: true,
        limit: selectedIds.length,
      });
      const foundIds = new Set(selectedWork.map((item) => item.id));
      for (const missingId of selectedIds.filter((id) => !foundIds.has(id))) {
        counters.workItemsConsidered += 1;
        counters.skipped += 1;
        recordReason(skipReasons, "article_not_found", missingId);
        logger.log("warn", "skipped", `Selected article ${missingId} was not found.`, {
          articleId: missingId,
          metadata: { reason: "article_not_found" },
        });
      }

      for (let index = 0; index < selectedWork.length; index += batchSize) {
        await processBatch(selectedWork.slice(index, index + batchSize));
      }
    } else {
      const maximum = request.limit ?? Number.POSITIVE_INFINITY;
      while (attempted.size < maximum) {
        const remaining = maximum - attempted.size;
        const work = await getAnalysisWorkItems({
          limit: Math.min(batchSize, remaining),
          excludeArticleIds: attempted,
        });
        if (work.length === 0) break;
        await processBatch(work);
      }
    }
  } catch (error) {
    fatalError = error;
    logger.log("error", "pipeline_failed", "AI article analysis stopped before completion.", {
      metadata: { reason: "pipeline_operation_failed" },
    });
    throw error;
  } finally {
    const summary = createSummary(Boolean(fatalError));
    logger.log(summary.status === "failed" ? "error" : "info", "completed", "AI article analysis completed.", {
      metadata: summary,
    });
    await logger.flush();
  }

  return createSummary(false);

  async function processBatch(work: AnalysisWorkItem[]) {
    counters.batchesProcessed += 1;
    counters.workItemsConsidered += work.length;
    work.forEach((item) => attempted.add(item.id));
    logger.log("info", "batch_started", `Processing analysis batch ${counters.batchesProcessed}.`, {
      metadata: { batch: counters.batchesProcessed, articleCount: work.length },
    });

    const completed = await Promise.all(work.map(async (item) => ({
      item,
      result: await processWorkItem(item, logger),
    })));
    const batchCounts = { analyzed: 0, backfilled: 0, skipped: 0, failed: 0 };

    for (const { item, result } of completed) {
      if (result.embeddingGenerated) counters.embeddingsGenerated += 1;
      if (result.status === "analyzed") {
        counters.fullAnalysesCompleted += 1;
        batchCounts.analyzed += 1;
      } else if (result.status === "backfilled") {
        counters.embeddingsBackfilled += 1;
        batchCounts.backfilled += 1;
      } else if (result.status === "skipped") {
        counters.skipped += 1;
        batchCounts.skipped += 1;
        recordReason(skipReasons, result.reason ?? "unspecified_skip", item.id);
      } else {
        counters.failed += 1;
        batchCounts.failed += 1;
        recordReason(failureReasons, result.reason ?? "unspecified_failure", item.id);
      }
    }

    logger.log("info", "batch_completed", `Analysis batch ${counters.batchesProcessed} completed.`, {
      metadata: { batch: counters.batchesProcessed, ...batchCounts },
    });
  }

  function createSummary(forceFailed: boolean): AnalysisPipelineSummary {
    const successful = counters.fullAnalysesCompleted + counters.embeddingsBackfilled;
    const status = forceFailed || (counters.failed > 0 && successful === 0)
      ? "failed"
      : counters.failed > 0
        ? "partial"
        : "completed";

    return {
      status,
      analysisModel: ANALYSIS_MODEL,
      embeddingModel: EMBEDDING_MODEL,
      batchSize,
      ...counters,
      totalDurationMs: Date.now() - startedAt,
      failureReasons,
      skipReasons,
    };
  }
}

async function processWorkItem(item: AnalysisWorkItem, logger: AnalysisLogger): Promise<WorkResult> {
  const logContext = { sourceId: item.source_id, articleId: item.id };
  if (item.kind === "complete") {
    logger.log("info", "skipped", `Article ${item.id} is already complete.`, {
      ...logContext,
      metadata: { reason: "already_complete" },
    });
    return { status: "skipped", reason: "already_complete", embeddingGenerated: false };
  }

  if (!isUsableArticle(item)) {
    logger.log("warn", "skipped", `Article ${item.id} does not have usable stored content.`, {
      ...logContext,
      metadata: { reason: "invalid_article_content" },
    });
    return { status: "skipped", reason: "invalid_article_content", embeddingGenerated: false };
  }

  let embeddingGenerated = false;
  try {
    if (item.kind === "embedding_backfill") {
      const embedding = await generateArticleEmbedding(item);
      embeddingGenerated = true;
      await saveArticleEmbedding(item.id, embedding);
      logger.log("info", "embedding_backfilled", `Embedding backfilled for article ${item.id}.`, logContext);
      return { status: "backfilled", embeddingGenerated };
    }

    const [analysisResult, embeddingResult] = await Promise.allSettled([
      generateArticleAnalysis(item),
      generateArticleEmbedding(item),
    ]);
    embeddingGenerated = embeddingResult.status === "fulfilled";
    if (analysisResult.status === "rejected") throw analysisResult.reason;
    if (embeddingResult.status === "rejected") throw embeddingResult.reason;

    const analysis = analysisResult.value;
    const embedding = embeddingResult.value;
    await saveArticleAnalysis(item.id, {
      summary: analysis.summary,
      sentiment_score: analysis.sentimentScore,
      sentiment_label: analysis.sentimentLabel,
      left_percentage: analysis.leftPercentage,
      center_percentage: analysis.centerPercentage,
      right_percentage: analysis.rightPercentage,
      bias_label: analysis.politicalFramingLabel,
      confidence: analysis.confidence,
      framing_notes: analysis.framingNotes,
      loaded_terms: normalizeLoadedTerms(analysis.loadedTerms),
      disclaimer: ANALYSIS_DISCLAIMER,
      model: ANALYSIS_MODEL,
      embedding,
    });
    logger.log("info", "article_analyzed", `Analysis and embedding saved for article ${item.id}.`, logContext);
    return { status: "analyzed", embeddingGenerated };
  } catch (error) {
    if (error instanceof ArticleAnalysisAlreadyExistsError || error instanceof ArticleEmbeddingAlreadyExistsError) {
      logger.log("warn", "race_skipped", `Article ${item.id} was completed by another run.`, {
        ...logContext,
        metadata: { reason: "completed_by_concurrent_run" },
      });
      return { status: "skipped", reason: "completed_by_concurrent_run", embeddingGenerated };
    }

    const reason = getSafeFailureReason(error, item.kind);
    logger.log("error", "article_failed", `Article ${item.id} failed analysis work.`, {
      ...logContext,
      metadata: { reason },
    });
    return { status: "failed", reason, embeddingGenerated };
  }
}

function isUsableArticle(item: AnalysisWorkItem): boolean {
  return item.title.trim().length > 0 && item.raw_text.trim().length >= 100;
}

function normalizeLoadedTerms(terms: readonly string[]): string[] {
  const normalized = new Map<string, string>();
  for (const term of terms) {
    const value = term.replace(/\s+/g, " ").trim();
    if (value) normalized.set(value.toLocaleLowerCase("en-US"), value);
  }
  return [...normalized.values()];
}

function recordReason(groups: Record<string, ReasonGroup>, reason: string, articleId: number) {
  const group = groups[reason] ?? { count: 0, articleIds: [] };
  group.count += 1;
  group.articleIds.push(articleId);
  groups[reason] = group;
}

function getSafeFailureReason(error: unknown, kind: AnalysisWorkItem["kind"]): string {
  if (error instanceof Error && error.message.startsWith("Embedding model returned an invalid")) {
    return "invalid_embedding";
  }
  if (error instanceof Error && error.message.startsWith("Unable to ")) {
    return "database_operation_failed";
  }
  return kind === "embedding_backfill"
    ? "embedding_provider_request_failed"
    : "analysis_or_embedding_provider_request_failed";
}

function getBatchSize(): number {
  const configured = Number(process.env.ANALYSIS_BATCH_SIZE ?? DEFAULT_ANALYSIS_BATCH_SIZE);
  if (!Number.isFinite(configured)) return DEFAULT_ANALYSIS_BATCH_SIZE;
  return Math.min(Math.max(Math.trunc(configured), 1), MAX_ANALYSIS_BATCH_SIZE);
}
