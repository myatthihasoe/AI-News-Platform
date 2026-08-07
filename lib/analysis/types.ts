import { z } from "zod";
import {
  MAX_ANALYSIS_ARTICLE_SELECTION,
  MAX_ANALYSIS_REQUEST_LIMIT,
} from "./constants";

export const analysisRequestSchema = z
  .object({
    limit: z.number().int().min(1).max(MAX_ANALYSIS_REQUEST_LIMIT).optional(),
    articleIds: z
      .array(z.number().int().positive())
      .min(1)
      .max(MAX_ANALYSIS_ARTICLE_SELECTION)
      .refine((values) => new Set(values).size === values.length, {
        message: "articleIds must not contain duplicates.",
      })
      .optional(),
  })
  .strict();

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type AnalysisStatus = "completed" | "partial" | "failed";
export type AnalysisArticleStatus = "analyzed" | "skipped" | "failed";
export type AnalysisReasonCounts = Record<string, number>;

export type AnalysisArticleResult = {
  articleId: number;
  sourceId: number | null;
  status: AnalysisArticleStatus;
  reason?: string;
};

export type AnalysisBatchSummary = {
  batchNumber: number;
  articlesConsidered: number;
  analyzed: number;
  skipped: number;
  failed: number;
  durationMs: number;
};

export type AnalysisSummary = {
  status: AnalysisStatus;
  model: string;
  batchSize: number;
  batchesProcessed: number;
  articlesConsidered: number;
  analyzed: number;
  skipped: number;
  failed: number;
  totalDurationMs: number;
  request: {
    limit: number | null;
    articleIds: number[] | null;
  };
  skippedArticleIds: number[];
  failedArticleIds: number[];
  reasonCounts: {
    skipped: AnalysisReasonCounts;
    failed: AnalysisReasonCounts;
  };
  batches: AnalysisBatchSummary[];
};
