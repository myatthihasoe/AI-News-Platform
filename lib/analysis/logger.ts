import "server-only";

import { writeLogs, type LogLevel, type NewLogEntry } from "@/lib/supabase/queries/logs";
import type { Json } from "@/lib/supabase/types";

const MAX_BUFFERED_ANALYSIS_LOGS = 600;

export class AnalysisLogger {
  private readonly entries: NewLogEntry[] = [];

  log(
    level: LogLevel,
    eventType: string,
    message: string,
    options: {
      sourceId?: number;
      articleId?: number;
      metadata?: Record<string, Json>;
    } = {},
  ): void {
    const prefix = `[analysis:${eventType}]`;
    if (level === "error") {
      console.error(prefix, message, options.metadata ?? {});
    } else if (level === "warn") {
      console.warn(prefix, message, options.metadata ?? {});
    } else {
      console.info(prefix, message, options.metadata ?? {});
    }

    if (this.entries.length >= MAX_BUFFERED_ANALYSIS_LOGS) {
      return;
    }

    this.entries.push({
      level,
      event_type: eventType,
      message,
      source_id: options.sourceId ?? null,
      article_id: options.articleId ?? null,
      metadata: options.metadata ?? {},
    });
  }

  async flush(): Promise<void> {
    try {
      await writeLogs(this.entries);
    } catch {
      console.error("[analysis:log_flush_failed] Unable to persist analysis logs.");
    }
  }
}
