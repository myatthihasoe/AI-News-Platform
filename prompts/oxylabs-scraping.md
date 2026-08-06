# Oxylabs Manual Scraping Pipeline

## Goal

Implement the production-style manual Oxylabs scrape-to-insert pipeline for biasly. A protected `POST /api/scrape` route must load active homepage sources from Supabase, fetch homepage HTML through Oxylabs Web Scraper API, extract and strictly filter homepage story-card URLs, deduplicate them, fetch article detail pages through Oxylabs, validate and clean article content, append valid articles to Supabase, and return/log a typed run summary.

This prompt covers manual scraping only. Oxylabs Scheduler synchronization, scheduled-result processing, Vercel Cron, and AI analysis are separate features and are out of scope.

## Skills and documentation read

- `.agents/skills/web-scraper-api/SKILL.md`
- `.agents/skills/supabase/SKILL.md`
- `AGENTS.md`
- Current Next.js 16.2.12 route-handler guide: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- Current Next.js environment-variable guide: `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
- Current Oxylabs Realtime and Universal Source documentation:
  - `https://developers.oxylabs.io/scraping-solutions/web-scraper-api/integration-methods/realtime`
  - `https://developers.oxylabs.io/scraping-solutions/web-scraper-api/targets/generic-target`
- Current Supabase changelog, JavaScript select/filter/insert references, and Data API guidance. No reviewed breaking change alters this server-side service-role query/insert design. The project must continue to use Node.js 22+ as required by current Supabase client support.

## Existing code inspected

- `package.json` and `package-lock.json`
- `.env.example` and configured environment-variable names in `.env.local` (values were not exposed)
- `tsconfig.json`
- `lib/supabase/client.ts`
- `lib/supabase/types.ts`
- `lib/supabase/dto.ts`
- `lib/supabase/errors.ts`
- `lib/supabase/queries/sources.ts`
- `lib/supabase/queries/articles.ts`
- `lib/supabase/queries/logs.ts`
- `supabase/schema.sql`
- `supabase/migrations/20260804074558_initial_biasly_schema.sql`
- `supabase/seed.sql`
- existing prompt conventions in `prompts/`

The existing database layer already provides `getActiveSources`, append-only `insertArticle`, `writeLog`, and `findExistingArticleUrls`. The URL-existence helper already chunks `.in()` filters at 15 values and checks both original and canonical URLs.

## Active sources inspected

The configured Supabase project currently has these active homepage sources:

- `3` — BBC
- `5` — CNN
- `2` — Fox News
- `1` — Reuters
- `4` — The New York Times

Only active source rows selected from Supabase may be scraped. Source homepage URLs must never be duplicated or hardcoded in scraping modules.

## Decisions and assumptions

- Default to all active sources and up to five valid newly inserted articles per source when the request does not specify a selection or limit.
- Permit an optional JSON body with `sourceIds` and `limitPerSource`, validated with Zod. Reject unknown, inactive, duplicate-invalid, or malformed selections with `400`. Bound the per-source limit to a small centralized maximum.
- Use the synchronous Oxylabs Realtime endpoint with `source: "universal"`; request raw HTML, not parsed e-commerce/search output.
- Use a bounded request timeout consistent with Oxylabs' documented connection TTL. Retry only narrowly when justified (for example, one rendered-HTML fallback when a successful response contains unusably empty HTML); do not create an unbounded retry loop.
- Process candidates in homepage order until the requested number of valid new articles is inserted, subject to a centralized maximum number of detail attempts per source. It is acceptable to insert fewer articles when quality gates fail.
- Keep the initial implementation generic and data-driven. `sources.parser_strategy` may supply optional selector/path hints when valid, but empty `{}` strategies must work through strict generic heuristics. Do not hardcode source homepage URLs.
- No database schema change is expected. Do not modify or reset existing article rows.
- Add Cheerio for HTML parsing and Zod for boundary/response validation, with lockfile updates.

## Files likely to change

- `app/api/scrape/route.ts` — thin protected POST route, request parsing, response/status mapping
- `lib/security/admin-secret.ts` (or an equivalently small server-only helper) — validate `x-biasly-admin-secret`
- `lib/scraping/oxylabs.ts` — server-only authenticated Realtime client, response validation, timeout/error handling
- `lib/scraping/urls.ts` — normalization, same-source checks, tracking removal, non-article filtering, article-likelihood checks
- `lib/scraping/homepage.ts` — visible story-card candidate extraction and parser-strategy handling
- `lib/scraping/article.ts` — detail metadata/body extraction, cleanup, content gate, slug/read-time derivation
- `lib/scraping/pipeline.ts` — orchestration, limits, dedupe, insert behavior, logging, typed summary
- `lib/scraping/types.ts` and/or `lib/scraping/constants.ts` — small shared types and centralized limits if useful
- `lib/supabase/queries/articles.ts` — only targeted additions needed for safe canonical/race dedupe; preserve the 15-value maximum
- `.env.example` — add the existing server-only Oxylabs and admin-secret variable names
- `package.json` and `package-lock.json` — Cheerio and Zod

Exact module boundaries may be consolidated if that keeps files small without mixing route, parsing, pipeline, and persistence responsibilities.

## Implementation requirements

### API route and selection

- Add only `POST /api/scrape`; do not add a GET action route or polling/run-ID protocol.
- Require a valid `x-biasly-admin-secret` header before starting work. Missing or invalid credentials return `401` with a safe error.
- Accept an omitted/empty body for defaults, or a JSON object shaped like:

  ```json
  {
    "sourceIds": [3],
    "limitPerSource": 1
  }
  ```

- Load active sources through the existing Supabase query. If IDs are supplied, select only matching active rows; never accept a caller-provided URL.
- Keep the route handler thin and run the scraper in the Node.js runtime.

### Oxylabs client

- Read `OXY_WSA_USERNAME` and `OXY_WSA_PASSWORD` only in a module marked `server-only`.
- Call `POST https://realtime.oxylabs.io/v1/queries` with HTTP Basic authentication, `Content-Type: application/json`, `source: "universal"`, and the selected Supabase URL.
- Validate both the HTTP response and the Oxylabs JSON/result shape. Require a usable string `results[0].content` and a successful target status.
- Use an abort timeout near the documented 150-second connection TTL (allowing a small client margin) and clear, sanitized errors. Never log credentials or the Authorization header.
- Keep retries bounded and explicit. Do not retry authentication/authorization failures or loop on 4xx responses.

### Homepage candidate extraction

- Parse homepage HTML with Cheerio.
- Consider links in visible story-card contexts such as `article`, headline elements, and meaningful anchors inside `main`; exclude hidden, navigation, menu, footer, aside, subscription, and unrelated link regions.
- Resolve relative links against the stored homepage URL, allow only HTTP(S), require a same-source host or a legitimate subdomain relationship, strip fragments and known tracking parameters, normalize trailing/default-port behavior, and deduplicate normalized candidates while retaining homepage order.
- Apply the canonical non-article reject list before any detail request: category/section, topic/tag, author, search, navigation, show/program/podcast, live, game, product/review/shopping, corporate/support, newsletter/subscription, and video-only pages without article evidence.
- Require positive article-detail evidence such as a date-based path, article/story identifier, or sufficiently deep long story slug. When uncertain, reject before detail scraping.
- Support safe optional values from `parser_strategy` for selectors or path hints, validated before use. Empty strategies must not weaken the strict generic checks.
- Bound the number of retained/detail-attempted candidates per source.

### Dedupe and append-only persistence

- Before detail scraping, use the existing chunked URL-existence check and skip stored original/canonical URLs.
- After extracting a detail-page canonical URL, check both original and canonical URLs again before inserting.
- Preserve the database's unique constraints as the final race-condition guard. Treat a duplicate-key insert race as a skipped duplicate, not as a destructive retry or failed run.
- Insert only; never delete, truncate, replace, reset, or update existing article rows during scraping.
- Generate a stable URL-safe slug with a deterministic short URL-derived suffix so title collisions do not cause unrelated articles to overwrite or fail ambiguously.

### Detail extraction, cleanup, and validation

- Extract an article-specific title, canonical URL, image URL, published timestamp, meaningful body text, and source reference. Optionally extract image alt text, author, category/section, and derive read time.
- Prefer semantic metadata (`link[rel=canonical]`, Open Graph/article meta, JSON-LD NewsArticle/Article data, and `time[datetime]`) with sensible DOM fallbacks.
- Handle JSON-LD objects, arrays, and `@graph` safely; ignore malformed blocks rather than failing the whole source.
- Remove scripts, styles, templates, SVG, ads, paywall/subscription prompts, newsletter blocks, related/most-viewed blocks, social sharing, navigation labels, inline error text, and obvious CSS/JavaScript dumps before body collection.
- Prefer article/body containers and meaningful paragraphs. If extraction yields one large block, split it with DOM blocks or sentence-aware boundaries before validation/storage.
- Reject missing/invalid dates, images, titles, canonical/article-specific URLs, or meaningful article bodies.
- Enforce the content gate: either at least three meaningful paragraphs or at least 900 meaningful cleaned characters with all other strong article signals.
- Reject generic/listing/program/product/live titles, bodies dominated by unrelated headlines/links/captions/boilerplate, and canonical URLs that fail the candidate article check.
- Store cleaned paragraphs separated by blank lines in `raw_text`.

### Logging and result contract

- Emit concise server console progress for scrape start, selected sources, each source start, homepage fetch, candidate counts/rejections, duplicates, detail attempts, inserts, validation rejections, source errors, and final completion/failure.
- Persist useful run events through the existing `logs` query without allowing a secondary log-write failure to hide the primary scrape result. Metadata must be JSON-safe and contain no secrets or full article bodies.
- Return a typed final summary containing at least:
  - `status`
  - `sourcesChecked`
  - `candidatesFound`
  - `candidatesRejected`
  - `duplicatesSkipped`
  - `detailPagesScraped`
  - `articlesInserted`
  - `articlesRejected`
  - `articlesFailed`
  - `totalDurationMs`
  - `rejectionReasons` grouped by count
- Include compact per-source results to make partial failures diagnosable.
- Use a success status for a completed run even when zero articles pass strict validation; use a partial status when some sources fail; reserve an error response for request/auth/configuration failures or a run that cannot meaningfully start.

## Security requirements

- Never expose `SUPABASE_SERVICE_ROLE_KEY`, Oxylabs credentials, or `BIASLY_ADMIN_SECRET` to client components, responses, logs, or error details.
- Keep Oxylabs, parsing orchestration, and service-role Supabase access in server-only modules.
- Compare the admin secret safely, reject missing configuration without revealing values, and never accept the secret in a query string or body.
- Validate all external inputs and Oxylabs response shapes. Limit source count, per-source article count, candidate count, response-body assumptions, request duration, and retry count.
- Do not accept arbitrary scrape URLs from callers; targets come exclusively from active Supabase source rows.
- Do not add public RLS policies or browser access to persistence tables. No schema or grant expansion is required.

## Acceptance criteria

- An unauthorized POST returns `401` and performs no scrape.
- A malformed body returns `400`; unknown/inactive source IDs do not trigger scraping.
- An empty/default request selects all active Supabase sources and targets up to five valid insertions per source.
- A targeted request selects only the requested active sources and respects the bounded per-source limit.
- Every homepage and detail page is fetched through Oxylabs Realtime with server-only credentials.
- Only homepage story-card candidates that pass strict URL checks reach detail scraping.
- Existing original/canonical URLs are skipped using `.in()` chunks no larger than 15.
- Only article pages with a title, image, published date, article-specific URL, and meaningful cleaned body are inserted.
- Insert behavior is append-only and duplicate-safe under concurrent runs.
- Progress appears in the Next.js server terminal and the response contains the required aggregate/rejection summary.
- `.env.example` documents `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, and `BIASLY_ADMIN_SECRET` as server-only variables without values.
- Scheduler, Cron, and AI analysis behavior remain unchanged and are not added in this change.

## Checks to run

From the project root after implementation:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`

Report the exact outcomes. Do not claim a live scrape succeeded unless the endpoint was actually invoked and its result was inspected.

## Exact manual test steps expected after implementation

1. Confirm `.env.local` contains non-empty `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, and `BIASLY_ADMIN_SECRET`.
2. Start the app with `npm run dev` and keep that terminal visible for scrape progress logs.
3. Verify unauthorized access:

   ```powershell
   curl.exe -i -X POST "http://localhost:3000/api/scrape" -H "Content-Type: application/json" -d "{}"
   ```

   Expected: `401` and no Oxylabs work.

4. Run a low-cost targeted smoke test against BBC (source ID `3`) for one valid article:

   ```powershell
   curl.exe -X POST "http://localhost:3000/api/scrape" -H "Content-Type: application/json" -H "x-biasly-admin-secret: $env:BIASLY_ADMIN_SECRET" -d '{"sourceIds":[3],"limitPerSource":1}'
   ```

   Expected: a completed or partial typed summary; strict validation may legitimately insert zero articles. Watch the `npm run dev` terminal for per-stage progress.

5. Run the same command again. Expected: previously stored original/canonical URLs are counted under duplicates and no duplicate article is inserted.
6. Inspect Supabase `articles` rows inserted by the run. Confirm source association, unique original/canonical URL and slug, non-empty image, valid published timestamp, readable cleaned `raw_text`, `scraped_at` set, and `analyzed_at` still null.
7. Inspect recent Supabase `logs` rows and confirm useful scrape events exist without credentials or raw article bodies.
8. After the smoke test, optionally run the default all-active-source request:

   ```powershell
   curl.exe -X POST "http://localhost:3000/api/scrape" -H "Content-Type: application/json" -H "x-biasly-admin-secret: $env:BIASLY_ADMIN_SECRET" -d "{}"
   ```

   Expected: all five currently active sources are checked with a default target of up to five valid new articles per source.
