import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { embed, generateText, Output } from "ai";
import type { PendingAnalysisArticle } from "@/lib/supabase/queries/articles";
import {
  ANALYSIS_MODEL,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
} from "./constants";
import { buildAnalysisPrompt, buildEmbeddingInput, ANALYSIS_SYSTEM_PROMPT } from "./prompt";
import {
  generatedArticleAnalysisSchema,
  type GeneratedArticleAnalysis,
} from "./schema";

export class AnalysisConfigurationError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not configured.");
    this.name = "AnalysisConfigurationError";
  }
}

export function assertAnalysisConfiguration(): void {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new AnalysisConfigurationError();
  }
}

export async function generateArticleAnalysis(
  article: PendingAnalysisArticle,
): Promise<GeneratedArticleAnalysis> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const { output } = await generateText({
        model: getOpenAI()(ANALYSIS_MODEL),
        output: Output.object({ schema: generatedArticleAnalysisSchema }),
        system: ANALYSIS_SYSTEM_PROMPT,
        prompt: buildAnalysisPrompt(article),
        providerOptions: { openai: { store: false } },
      });

      return generatedArticleAnalysisSchema.parse(output);
    } catch (error) {
      lastError = error;
      console.warn(
        `[analysis:model_retry] Article ${article.id}, attempt ${attempt} failed.`,
        attempt < 2 ? "Retrying structured generation once." : "No valid structured output was returned.",
      );
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI analysis failed validation.");
}

export async function generateArticleEmbedding(
  article: PendingAnalysisArticle,
): Promise<number[]> {
  const { embedding } = await embed({
    model: getOpenAI().embedding(EMBEDDING_MODEL),
    value: buildEmbeddingInput(article),
  });

  if (embedding.length !== EMBEDDING_DIMENSIONS || embedding.some((value) => !Number.isFinite(value))) {
    throw new Error(`Embedding model returned an invalid ${embedding.length}-dimension vector.`);
  }

  return embedding;
}

function getOpenAI() {
  assertAnalysisConfiguration();
  return createOpenAI({ apiKey: process.env.OPENAI_API_KEY!.trim() });
}
