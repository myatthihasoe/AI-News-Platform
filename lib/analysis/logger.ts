import "server-only";

import { writeLogs, type LogLevel, type NewLogEntry } from "@/lib/supabase/queries/logs";
import type { Json } from "@/lib/supabase/types";

const MAX_BUFFERED_LOGS = 300;

export class AnalysisLogger {
  private readonly entries: NewLogEntry[] = [];

  log(
    level: LogLevel,
    eventType: string,
    message: string,
    options: { sourceId?: number; articleId?: number; metadata?: Record<string, Json> } = {},
  ) {
    const prefix = `[analysis:${eventType}]`;
    const metadata = options.metadata ?? {};
    if (level === "error") console.error(prefix, message, metadata);
    else if (level === "warn") console.warn(prefix, message, metadata);
    else console.info(prefix, message, metadata);

    if (this.entries.length < MAX_BUFFERED_LOGS) {
      this.entries.push({
        level,
        event_type: eventType,
        message,
        source_id: options.sourceId ?? null,
        article_id: options.articleId ?? null,
        metadata,
      });
    }
  }

  async flush() {
    try {
      await writeLogs(this.entries);
    } catch (error) {
      console.error(
        "[analysis:log_flush_failed] Unable to persist analysis logs.",
        error instanceof Error ? error.message : "Unknown logging error",
      );
    }
  }
}
