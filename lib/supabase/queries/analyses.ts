import "server-only";

import { getSupabaseServiceClient } from "../client";
import { throwSupabaseError } from "../errors";
import type { Tables, TablesInsert } from "../types";

export type SaveArticleAnalysisInput = Omit<
  TablesInsert<"article_analyses">,
  "id" | "article_id" | "bias_score" | "created_at" | "updated_at"
>;

export async function saveArticleAnalysis(
  articleId: number,
  input: SaveArticleAnalysisInput,
): Promise<Tables<"article_analyses">> {
  validateAnalysis(input);

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("article_analyses")
    .insert({ article_id: articleId, ...input })
    .select("*")
    .single();

  if (error) {
    throwSupabaseError(`Unable to save analysis for article ${articleId}`, error);
  }

  const analyzedAt = new Date().toISOString();
  const { error: articleError } = await client
    .from("articles")
    .update({ analyzed_at: analyzedAt, updated_at: analyzedAt })
    .eq("id", articleId);

  if (articleError) {
    throwSupabaseError(`Analysis saved but article ${articleId} could not be marked analyzed`, articleError);
  }

  return data;
}

export async function markArticleAnalyzed(articleId: number, analyzedAt = new Date()): Promise<void> {
  const timestamp = analyzedAt.toISOString();
  const { error } = await getSupabaseServiceClient()
    .from("articles")
    .update({ analyzed_at: timestamp, updated_at: timestamp })
    .eq("id", articleId);

  if (error) {
    throwSupabaseError(`Unable to mark article ${articleId} analyzed`, error);
  }
}

function validateAnalysis(input: SaveArticleAnalysisInput) {
  const percentages = [input.left_percentage, input.center_percentage, input.right_percentage];

  if (percentages.some((value) => !Number.isInteger(value) || value < 0 || value > 100)) {
    throw new Error("Analysis framing percentages must be integers from 0 to 100.");
  }

  if (percentages.reduce((total, value) => total + value, 0) !== 100) {
    throw new Error("Analysis framing percentages must sum to 100.");
  }

  if (!Number.isFinite(input.sentiment_score) || input.sentiment_score < -1 || input.sentiment_score > 1) {
    throw new Error("Analysis sentiment score must be between -1 and 1.");
  }

  if (!Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1) {
    throw new Error("Analysis confidence must be between 0 and 1.");
  }
}
