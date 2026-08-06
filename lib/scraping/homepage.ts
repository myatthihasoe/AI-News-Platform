import { load } from "cheerio";
import { MAX_HOMEPAGE_CANDIDATES } from "./constants";
import type { ParserStrategy, RejectionCounts } from "./types";
import { evaluateArticleUrl } from "./urls";

const DEFAULT_LINK_SELECTORS = [
  "article a[href]",
  "main h1 a[href]",
  "main h2 a[href]",
  "main h3 a[href]",
  "main h4 a[href]",
  "main [data-testid*='card' i] a[href]",
  "main [class*='card' i] a[href]",
  "main [class*='story' i] a[href]",
  "main [class*='headline' i] a[href]",
];

const EXCLUDED_CONTEXT_SELECTOR = [
  "nav",
  "footer",
  "aside",
  "[hidden]",
  "[aria-hidden='true']",
  "[role='navigation']",
  "[class*='menu' i]",
  "[class*='footer' i]",
  "[class*='newsletter' i]",
  "[class*='subscribe' i]",
  "[style*='display: none' i]",
  "[style*='visibility: hidden' i]",
].join(",");

export type HomepageExtraction = {
  candidates: string[];
  candidatesFound: number;
  candidatesRejected: number;
  rejectionReasons: RejectionCounts;
};

export function extractHomepageCandidates(
  html: string,
  homepageUrl: string,
  strategy: ParserStrategy,
): HomepageExtraction {
  const $ = load(html);
  const rawCandidates: string[] = [];
  const seenRawUrls = new Set<string>();
  const selectors = strategy.homepageLinkSelectors?.length
    ? strategy.homepageLinkSelectors
    : DEFAULT_LINK_SELECTORS;

  for (const selector of selectors) {
    try {
      $(selector).each((_, element) => {
        const selected = $(element);
        const anchors = selected.is("a") ? selected : selected.find("a[href]");

        anchors.each((__, anchorElement) => {
          const anchor = $(anchorElement);
          const href = anchor.attr("href")?.trim();
          const label = normalizeWhitespace(
            anchor.text() || anchor.attr("aria-label") || anchor.attr("title") || "",
          );

          if (!href || label.length < 12 || anchor.closest(EXCLUDED_CONTEXT_SELECTOR).length > 0) {
            return;
          }

          const key = `${href}\u0000${label}`;
          if (!seenRawUrls.has(key)) {
            seenRawUrls.add(key);
            rawCandidates.push(href);
          }
        });
      });
    } catch {
      // Ignore malformed optional selectors from parser_strategy.
    }
  }

  const candidates: string[] = [];
  const normalizedSeen = new Set<string>();
  const rejectionReasons: RejectionCounts = {};
  let candidatesRejected = 0;

  for (const rawUrl of rawCandidates) {
    const decision = evaluateArticleUrl(rawUrl, homepageUrl, strategy);

    if (!decision.accepted) {
      candidatesRejected += 1;
      incrementReason(rejectionReasons, decision.reason);
      continue;
    }

    if (normalizedSeen.has(decision.url)) {
      candidatesRejected += 1;
      incrementReason(rejectionReasons, "duplicate_homepage_candidate");
      continue;
    }

    normalizedSeen.add(decision.url);
    candidates.push(decision.url);

    if (candidates.length === MAX_HOMEPAGE_CANDIDATES) {
      break;
    }
  }

  return {
    candidates,
    candidatesFound: rawCandidates.length,
    candidatesRejected,
    rejectionReasons,
  };
}

function incrementReason(counts: RejectionCounts, reason: string) {
  counts[reason] = (counts[reason] ?? 0) + 1;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
