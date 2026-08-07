import { z } from "zod";
import { MAX_LOADED_TERMS } from "./constants";

const boundedText = (field: string, maximum: number) =>
  z.string().trim().min(1, `${field} must not be empty.`).max(maximum);

export const articleAnalysisSchema = z
  .object({
    summary: boundedText("summary", 2_500).describe("A neutral summary of the article."),
    sentimentScore: z
      .number()
      .finite()
      .min(-1)
      .max(1)
      .describe("Overall sentiment from -1 (negative) to 1 (positive)."),
    sentimentLabel: z.enum(["positive", "neutral", "negative"]),
    politicalFramingLabel: z.enum(["left", "center", "right", "mixed", "unclear"]),
    leftPercentage: z.number().int().min(0).max(100),
    centerPercentage: z.number().int().min(0).max(100),
    rightPercentage: z.number().int().min(0).max(100),
    confidence: z.number().finite().min(0).max(1),
    framingNotes: boundedText("framingNotes", 3_000).describe(
      "A concise explanation grounded in wording and framing found in the article.",
    ),
    loadedTerms: z
      .array(boundedText("loaded term", 120))
      .max(MAX_LOADED_TERMS)
      .describe("Emotionally or politically loaded terms and short phrases found in the article."),
  })
  .strict()
  .superRefine((analysis, context) => {
    if (
      analysis.leftPercentage + analysis.centerPercentage + analysis.rightPercentage !==
      100
    ) {
      context.addIssue({
        code: "custom",
        path: ["leftPercentage"],
        message: "Framing percentages must sum to 100.",
      });
    }

    const sentimentIsConsistent =
      (analysis.sentimentLabel === "positive" && analysis.sentimentScore > 0) ||
      (analysis.sentimentLabel === "negative" && analysis.sentimentScore < 0) ||
      (analysis.sentimentLabel === "neutral" && Math.abs(analysis.sentimentScore) <= 0.25);

    if (!sentimentIsConsistent) {
      context.addIssue({
        code: "custom",
        path: ["sentimentLabel"],
        message: "Sentiment label and score must be directionally consistent.",
      });
    }
  });

export type ArticleAnalysisOutput = z.infer<typeof articleAnalysisSchema>;
