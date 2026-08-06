import { z } from "zod";
import type { Json } from "@/lib/supabase/types";
import {
  DEFAULT_ARTICLES_PER_SOURCE,
  MAX_ARTICLES_PER_SOURCE,
  MAX_SOURCE_SELECTION,
} from "./constants";

export const scrapeRequestSchema = z
  .object({
    sourceIds: z
      .array(z.number().int().positive())
      .min(1)
      .max(MAX_SOURCE_SELECTION)
      .refine((values) => new Set(values).size === values.length, {
        message: "sourceIds must not contain duplicates.",
      })
      .optional(),
    limitPerSource: z
      .number()
      .int()
      .min(1)
      .max(MAX_ARTICLES_PER_SOURCE)
      .default(DEFAULT_ARTICLES_PER_SOURCE),
  })
  .strict();

export type ScrapeRequest = z.infer<typeof scrapeRequestSchema>;

const parserStrategySchema = z
  .object({
    homepageLinkSelectors: z.array(z.string().trim().min(1).max(200)).max(12).optional(),
    articleBodySelectors: z.array(z.string().trim().min(1).max(200)).max(12).optional(),
    articlePathPrefixes: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
    excludedPathPrefixes: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
    render: z.boolean().optional(),
  })
  .strict();

export type ParserStrategy = z.infer<typeof parserStrategySchema>;

export function parseParserStrategy(value: Json): ParserStrategy {
  const result = parserStrategySchema.safeParse(value);
  return result.success ? result.data : {};
}

export type RejectionCounts = Record<string, number>;

export type ScrapeStatus = "completed" | "partial" | "failed";

export type SourceScrapeSummary = {
  sourceId: number;
  sourceName: string;
  status: ScrapeStatus;
  candidatesFound: number;
  candidatesRejected: number;
  duplicatesSkipped: number;
  detailPagesScraped: number;
  articlesInserted: number;
  articlesRejected: number;
  articlesFailed: number;
  rejectionReasons: RejectionCounts;
  error?: string;
};

export type ScrapeSummary = {
  status: ScrapeStatus;
  selectedSources: Array<{ id: number; name: string }>;
  sourcesChecked: number;
  candidatesFound: number;
  candidatesRejected: number;
  duplicatesSkipped: number;
  detailPagesScraped: number;
  articlesInserted: number;
  articlesRejected: number;
  articlesFailed: number;
  totalDurationMs: number;
  rejectionReasons: RejectionCounts;
  sources: SourceScrapeSummary[];
};

export type ParsedArticle = {
  originalUrl: string;
  canonicalUrl: string;
  slug: string;
  title: string;
  imageUrl: string;
  imageAlt: string | null;
  author: string | null;
  category: string | null;
  publishedAt: string;
  rawText: string;
  readTimeMinutes: number;
};

