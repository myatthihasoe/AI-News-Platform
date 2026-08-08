import { z } from "zod";
import { MAX_ANALYSIS_LIMIT } from "./constants";

export const analysisRequestSchema = z.object({
  limit: z.number().int().min(1).max(MAX_ANALYSIS_LIMIT).optional(),
  articleIds: z.array(z.number().int().positive()).min(1).max(100).optional(),
}).strict().superRefine((request, context) => {
  if (request.articleIds && new Set(request.articleIds).size !== request.articleIds.length) {
    context.addIssue({
      code: "custom",
      message: "Article IDs must be unique.",
      path: ["articleIds"],
    });
  }
});

export const generatedArticleAnalysisSchema = z.object({
  summary: z.string().trim().min(1).max(3_000),
  sentimentScore: z.number().min(-1).max(1),
  sentimentLabel: z.enum(["positive", "neutral", "negative"]),
  politicalFramingLabel: z.enum(["left", "center", "right", "mixed", "unclear"]),
  leftPercentage: z.number().int().min(0).max(100),
  centerPercentage: z.number().int().min(0).max(100),
  rightPercentage: z.number().int().min(0).max(100),
  confidence: z.number().min(0).max(1),
  framingNotes: z.string().trim().min(1).max(3_000),
  loadedTerms: z.array(z.string().trim().min(1).max(100)).max(20),
}).superRefine((analysis, context) => {
  const total = analysis.leftPercentage + analysis.centerPercentage + analysis.rightPercentage;
  if (total !== 100) {
    context.addIssue({
      code: "custom",
      message: "Framing percentages must sum to 100.",
      path: ["leftPercentage"],
    });
  }
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type GeneratedArticleAnalysis = z.infer<typeof generatedArticleAnalysisSchema>;
