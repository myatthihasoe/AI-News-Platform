import "server-only";

import { writeLogs, type LogLevel, type NewLogEntry } from "@/lib/supabase/queries/logs";
import type { Json } from "@/lib/supabase/types";

const MAX_BUFFERED_LOGS = 300;

export class ScrapeLogger {
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
  ) {
    const prefix = `[scrape:${eventType}]`;
    if (level === "error") {
      console.error(prefix, message, options.metadata ?? {});
    } else if (level === "warn") {
      console.warn(prefix, message, options.metadata ?? {});
    } else {
      console.info(prefix, message, options.metadata ?? {});
    }

    if (this.entries.length >= MAX_BUFFERED_LOGS) {
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

  async flush() {
    try {
      await writeLogs(this.entries);
    } catch (error) {
      console.error(
        "[scrape:log_flush_failed] Unable to persist scrape logs.",
        error instanceof Error ? error.message : "Unknown logging error",
      );
    }
  }
}

