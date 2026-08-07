import "server-only";

import { openai, type OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import type { PendingAnalysisArticle } from "@/lib/supabase/queries/articles";
import { ANALYSIS_MODEL, MAX_LOADED_TERMS } from "./constants";
import { ANALYSIS_INSTRUCTIONS, buildAnalysisPrompt } from "./prompt";
import { articleAnalysisSchema, type ArticleAnalysisOutput } from "./schema";

const MAX_GENERATION_ATTEMPTS = 2;

export class AnalysisGenerationError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super("Article analysis generation failed.");
    this.name = "AnalysisGenerationError";
    this.reason = reason;
  }
}

export async function generateArticleAnalysis(
  article: PendingAnalysisArticle,
  onRetry?: (reason: string, failedAttempt: number) => void,
): Promise<ArticleAnalysisOutput> {
  let lastReason = "generation_failed";

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      const result = await generateText({
        model: openai(ANALYSIS_MODEL),
        instructions: ANALYSIS_INSTRUCTIONS,
        prompt: buildAnalysisPrompt(article),
        output: Output.object({
          name: "ArticleAnalysis",
          description: "A neutral sentiment and AI-estimated political-framing analysis.",
          schema: articleAnalysisSchema,
        }),
        providerOptions: {
          openai: {
            store: false,
          } satisfies OpenAILanguageModelResponsesOptions,
        },
      });

      const validation = articleAnalysisSchema.safeParse(result.output);
      if (!validation.success) {
        lastReason = "invalid_structured_output";
        if (attempt < MAX_GENERATION_ATTEMPTS) {
          onRetry?.(lastReason, attempt);
        }
        continue;
      }

      return {
        ...validation.data,
        loadedTerms: normalizeLoadedTerms(validation.data.loadedTerms),
      };
    } catch {
      lastReason = "model_request_or_output_failed";
      if (attempt < MAX_GENERATION_ATTEMPTS) {
        onRetry?.(lastReason, attempt);
      }
    }
  }

  throw new AnalysisGenerationError(lastReason);
}

function normalizeLoadedTerms(terms: string[]): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    const value = term.replace(/\s+/g, " ").trim();
    const key = value.toLocaleLowerCase("en-US");

    if (!value || seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(value);

    if (normalized.length === MAX_LOADED_TERMS) {
      break;
    }
  }

  return normalized;
}
