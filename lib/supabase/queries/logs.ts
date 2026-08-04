import "server-only";

import { getSupabaseServiceClient } from "../client";
import { throwSupabaseError } from "../errors";
import type { Tables, TablesInsert } from "../types";

const DEFAULT_LOG_LIMIT = 100;
const MAX_LOG_LIMIT = 500;

export type LogLevel = Tables<"logs">["level"];
export type NewLogEntry = Omit<TablesInsert<"logs">, "id" | "created_at">;

export type LogFilters = {
  level?: LogLevel;
  sourceId?: number;
  articleId?: number;
  limit?: number;
};

export async function writeLog(entry: NewLogEntry): Promise<Tables<"logs">> {
  const { data, error } = await getSupabaseServiceClient()
    .from("logs")
    .insert(entry)
    .select("*")
    .single();

  if (error) {
    throwSupabaseError(`Unable to write ${entry.event_type} log`, error);
  }

  return data;
}

export async function getRecentLogs(filters: LogFilters = {}): Promise<Tables<"logs">[]> {
  const limit = clampInteger(filters.limit ?? DEFAULT_LOG_LIMIT, 1, MAX_LOG_LIMIT);
  let query = getSupabaseServiceClient()
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (filters.level) {
    query = query.eq("level", filters.level);
  }

  if (filters.sourceId !== undefined) {
    query = query.eq("source_id", filters.sourceId);
  }

  if (filters.articleId !== undefined) {
    query = query.eq("article_id", filters.articleId);
  }

  const { data, error } = await query;

  if (error) {
    throwSupabaseError("Unable to load recent logs", error);
  }

  return data ?? [];
}

function clampInteger(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(Math.trunc(value), minimum), maximum);
}
