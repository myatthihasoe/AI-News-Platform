# Real News Scrape and AI Analysis Flow

## Goal

Complete and verify biasly's end-to-end manual ingestion flow using real public news pages from the active Supabase sources. The system must keep two thin, server-only action routes:

1. `POST /api/scrape` loads active homepage sources from Supabase, fetches homepage and article-detail HTML through Oxylabs, strictly filters and validates real article pages, and append-only inserts valid articles into Supabase.
2. `POST /api/analyze` finds valid articles without an `article_analyses` row, analyzes their stored text with OpenAI through the installed Vercel AI SDK, validates and saves the structured analysis, and only then marks each article analyzed.

Both routes must require the same `x-biasly-admin-secret` header backed by the server-only `BIASLY_ADMIN_SECRET`. Do not add a browser-triggered combined pipeline route, bypass the two-layer architecture, or move scraping/model work into client code.

This phase should preserve the already implemented AI-analysis work, audit the existing scraping implementation against live source behavior, make only the fixes needed for reliable real-news ingestion, and perform a bounded live smoke run after static checks. Scheduler, Vercel Cron, pgvector, embeddings, related articles, and UI redesign are out of scope.

## Skills and documentation read

- `AGENTS.md`
- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/ai-sdk/SKILL.md`
- `.agents/skills/web-scraper-api/SKILL.md` (the available local Oxylabs Web Scraper API skill)
- Existing version-matched AI SDK/OpenAI provider documentation under `node_modules/ai/docs/`, `node_modules/ai/src/`, and `node_modules/@ai-sdk/openai/docs/`
- Current Oxylabs documentation:
  - `https://developers.oxylabs.io/scraping-solutions/web-scraper-api/integration-methods/realtime`
  - `https://developers.oxylabs.io/scraping-solutions/web-scraper-api/targets/generic-target`
- Current Supabase breaking-change changelog and Data API exposure guidance. The existing schema already grants the required table/sequence permissions explicitly to `service_role`, so the 2026 Data API default change does not require a migration for this task.
- Next.js 16.2.12 route-handler and environment-variable guidance under `node_modules/next/dist/docs/` must be re-read before any route edit.

The current Oxylabs docs still specify synchronous `POST https://realtime.oxylabs.io/v1/queries`, Basic authentication, `source: "universal"`, optional `render: "html"`, and a 150-second connection TTL. The existing 170-second client timeout remains a reasonable outer limit.

## Existing code inspected

- `prompts/oxylabs-scraping.md`
- `prompts/ai-analysis.md`
- `app/api/scrape/route.ts`
- `app/api/analyze/route.ts`
- `lib/security/admin-secret.ts`
- `lib/scraping/oxylabs.ts`
- `lib/scraping/pipeline.ts`
- `lib/scraping/homepage.ts`
- `lib/scraping/article.ts`
- `lib/scraping/urls.ts`
- `lib/scraping/constants.ts`
- `lib/scraping/types.ts`
- `lib/scraping/logger.ts`
- `lib/analysis/constants.ts`
- `lib/analysis/schema.ts`
- `lib/analysis/prompt.ts`
- `lib/analysis/model.ts`
- `lib/analysis/logger.ts`
- `lib/analysis/pipeline.ts`
- `lib/analysis/types.ts`
- `lib/supabase/client.ts`
- `lib/supabase/queries/sources.ts`
- `lib/supabase/queries/articles.ts`
- `lib/supabase/queries/analyses.ts`
- `lib/supabase/queries/logs.ts`
- `lib/supabase/types.ts`
- `supabase/schema.sql`
- `supabase/seed.sql`
- `.env.example`
- `package.json` and `package-lock.json`

The manual scraping and AI-analysis modules already exist. The AI SDK dependencies are pinned at `ai@7.0.55` and `@ai-sdk/openai@4.0.33`. The AI route already uses `generateText` with `Output.object`, strict Zod validation, `gpt-5.6-terra`, `store: false`, retry-once behavior, relation-based pending detection, insert-only analysis persistence, and the shared admin-secret helper. Preserve these behaviors.

## Active Supabase sources inspected

The configured Supabase project currently has these active homepage sources:

- `1` — Reuters — `https://www.reuters.com/`
- `2` — Fox News — `https://www.foxnews.com/`
- `3` — BBC — `https://www.bbc.com/news`
- `4` — The New York Times — `https://www.nytimes.com/`
- `5` — CNN — `https://www.cnn.com/`

All five currently have an empty `{}` parser strategy. Application scraping code must continue to load these URLs from Supabase and must not duplicate or hardcode them. If live verification proves a source needs selector/path hints, store the hints in `sources.parser_strategy` and keep `supabase/seed.sql` synchronized; do not add source-name or source-URL conditionals to generic scraping modules.

The read-only database snapshot taken while preparing this prompt contained seven articles: five from Reuters and two from BBC. One article had an analysis row and six were pending by missing `article_analyses` relation. Treat this as mutable live state, not a fixture or hardcoded assumption.

## Decisions and assumptions

- The API default remains all active sources with up to five valid new articles per source because the user did not request a narrower production default.
- Live verification after approval must be cost-bounded: first scrape all five active source IDs with `limitPerSource: 1`. This may insert zero to five articles and is sufficient to verify real-data persistence without automatically launching the full 25-article default run.
- After the live scrape, identify newly inserted article IDs with a read-only Supabase comparison. Analyze only those new IDs. If strict validation inserts none, analyze up to five existing pending real articles instead. Never exceed five live OpenAI analyses during automatic verification.
- The bounded live Oxylabs/OpenAI verification is authorized only after the user approves this prompt. Do not run either paid external action while preparing the prompt.
- Keep `/api/scrape` and `/api/analyze` as separate protected POST routes. The intended manual sequence is scrape first, analyze second. Do not add `/api/pipeline`, expose the secret in browser code, or make one public action call the other through HTTP.
- Use only stored source homepage entry pages. Never crawl category/listing sub-endpoints to discover more listing pages.
- It is better to insert fewer valid articles than to relax the content gate or store listing, category, live, show, podcast, product, shopping, video-only, or boilerplate-heavy pages.
- No schema migration is expected. Existing rows are append-only; do not delete, reset, rewrite, or replace them.
- Existing uncommitted AI-analysis changes belong to this implementation and must be preserved. Avoid unrelated formatting or refactors.

## Files likely to change

Only change files proven necessary by inspection or bounded live verification:

- `app/api/scrape/route.ts`
- `lib/scraping/oxylabs.ts`
- `lib/scraping/pipeline.ts`
- `lib/scraping/homepage.ts`
- `lib/scraping/article.ts`
- `lib/scraping/urls.ts`
- `lib/scraping/constants.ts`
- `lib/scraping/types.ts`
- `lib/scraping/logger.ts`
- `lib/supabase/queries/articles.ts`
- `lib/supabase/queries/sources.ts`
- `supabase/seed.sql` only if source parser strategies need synchronization
- `app/api/analyze/route.ts` or `lib/analysis/*` only if a concrete integration defect is found
- `.env.example` only if an existing required server-only variable is missing

Do not modify `supabase/schema.sql`, migrations, Clerk behavior, scheduler/cron code, pgvector, embeddings, or UI unless a compile error proves a minimal compatibility fix is required. Do not reinstall or upgrade the already pinned AI SDK, OpenAI, Supabase, Cheerio, Zod, or Next.js packages for this task.

## Implementation requirements

### Protected route behavior

- Keep only `POST /api/scrape` and `POST /api/analyze` for manual actions.
- Authenticate with `x-biasly-admin-secret` through the existing timing-safe helper before parsing bodies, querying Supabase, calling Oxylabs/OpenAI, or doing expensive work.
- Missing or incorrect secrets return `401`. Missing server configuration returns a safe `500` without credential names or values in the response.
- Enforce bounded request bodies, strict Zod schemas, safe JSON parsing, and narrow validation issues.
- Preserve the established request shapes:

  ```json
  { "sourceIds": [1, 2, 3, 4, 5], "limitPerSource": 1 }
  ```

  ```json
  { "articleIds": [101, 102] }
  ```

- Empty bodies keep the production defaults: all active sources/up to five valid insertions per source for scraping, and all pending valid articles in batches for analysis.

### Source selection and Oxylabs retrieval

- Load only active source rows from Supabase. Reject unknown/inactive requested IDs and never accept a caller-supplied URL.
- Fetch the stored homepage through Oxylabs Realtime using `source: "universal"`, raw HTML, server-only Basic credentials, `cache: "no-store"`, bounded response size, and bounded timeout.
- Use one rendered-HTML fallback only when an unrendered successful response is unusable. Do not retry authentication failures, rate limits, or arbitrary 4xx responses in a loop.
- Validate the Oxylabs HTTP response, JSON shape, target `status_code`, and non-empty HTML. Do not log credentials, Authorization headers, or raw page content.

### Homepage candidate extraction

- Parse only visible homepage story-card contexts with Cheerio. Exclude navigation, footer, aside, hidden, subscription/newsletter, and other non-story regions before URL evaluation.
- Normalize relative HTTP(S) links against the stored homepage, strip fragments/tracking parameters, retain homepage order, require the same legitimate source host/subdomain, and deduplicate candidates.
- Apply strict non-article URL rejection before detail scraping: category/section, topic/tag, author, search, show/program/podcast, live, game, product/review/shopping, corporate/support, newsletter/subscription, and video-only paths.
- Require strong article URL evidence such as date paths, article/story identifiers, long ID segments, or a deep long story slug. If uncertain, reject.
- Support validated optional selector/path/render hints from `sources.parser_strategy`. Empty strategies must remain safe and strict.
- Never crawl from the homepage into other listing pages.

### Article detail validation and cleanup

- Fetch only accepted candidate detail pages through Oxylabs.
- Extract title, canonical URL, image URL, published timestamp, source reference, and meaningful body; optionally extract image alt, author, category, and read time.
- Prefer canonical/Open Graph/article metadata, JSON-LD Article/NewsArticle variants, `time[datetime]`, and semantic DOM containers with safe fallbacks.
- Remove scripts, styles, ads, paywalls/subscription prompts, newsletters, related/most-viewed modules, social controls, navigation labels, inline errors, and CSS/JavaScript dumps.
- Reject missing image/date/title, generic titles, canonical URLs that fail article URL checks, bodies dominated by links/headlines/boilerplate, and pages without one clear article subject.
- Preserve the content gate: at least three meaningful paragraphs, or at least 900 meaningful cleaned characters with all other strong article signals. Split one large text block using DOM or sentence-aware boundaries before validating.
- Store readable paragraphs separated by blank lines in `raw_text`.

### Supabase persistence and dedupe

- Check original/canonical URLs before detail scraping using `.in()` chunks no larger than 15.
- Recheck original and canonical URLs after canonical extraction and before insertion.
- Insert only; never upsert, overwrite, delete, truncate, or reset article data.
- Preserve unique constraints as the final race guard and count `23505` races as duplicates rather than failures.
- Keep `image_url` and `published_at` required before saving. Leave `analyzed_at` null on scrape insertion.
- If parser-strategy changes are needed, update only the corresponding active source rows and `supabase/seed.sql`; do not change source homepage URLs.

### OpenAI analysis

- Preserve missing-relation pending detection: an article is pending when no `article_analyses` row exists, regardless of `articles.analyzed_at`.
- Send only stored title, publication timestamp, and cleaned `raw_text`; never send source name or URL as framing evidence.
- Keep article content delimited and untrusted, and ignore instructions embedded in scraped text.
- Keep `generateText` with `Output.object`, the strict Zod output schema, exact percentage total, score/label bounds, and one retry for missing/invalid structured output.
- Continue saving the neutral summary, sentiment, AI-estimated framing label and percentages, confidence, framing notes, normalized loaded terms, canonical disclaimer, and exact model ID.
- Let Postgres derive `bias_score`. Insert exactly one analysis row and set `analyzed_at` only after valid persistence. Never overwrite an existing analysis.
- Keep OpenAI `store: false`. Do not log prompts, raw responses, article bodies, secrets, or provider request/response bodies.

### Logging and summaries

- Keep concise server logs for scrape start, selected sources, each source stage, candidates/rejections, duplicates, detail attempts, insertions, source errors, analysis batches, retries, successes/failures, and final summaries.
- Persist safe log metadata through the existing `logs` table without letting log-write failure hide the primary result.
- Preserve typed scrape and analysis summaries with counts, duration, source/batch context, rejection or failure reasons, and relevant article IDs. Do not include full text, prompts, responses, credentials, or headers.

## Security requirements

- `SUPABASE_SERVICE_ROLE_KEY`, `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, `OPENAI_API_KEY`, and `BIASLY_ADMIN_SECRET` remain server-only and never use a `NEXT_PUBLIC_` prefix.
- No browser component may call Oxylabs/OpenAI directly or receive the admin secret.
- Do not accept arbitrary scrape URLs, source names, model IDs, prompts, or credentials from requests.
- Validate all caller inputs and third-party response shapes; bound source selection, candidate/detail attempts, response sizes, request durations, AI batch size, selected IDs, and output lengths.
- Do not weaken RLS or grant browser roles access. Continue using the service-role client only from `server-only` modules.
- Do not bypass paywalls with supplied cookies, authenticated sessions, or browser credentials. Process only content returned for the public stored URLs through the configured Oxylabs service.
- Live verification must use the configured credentials without printing their values and must not run more than five OpenAI article analyses.

## Acceptance criteria

- The available production defaults are all five active sources and up to five valid articles per source.
- Unauthorized scrape and analysis POSTs return `401` without external work.
- Malformed PowerShell/curl JSON produces `400`; the documented test commands use stdin or `ConvertTo-Json` so valid JSON is transmitted reliably.
- A bounded request for source IDs `1..5` and limit `1` fetches only the stored homepages, filters candidates, and returns a typed completed/partial summary.
- Only valid real article pages with title, image, published date, article-specific URL, and meaningful cleaned text are appended to Supabase.
- Existing and within-run duplicates are skipped; no existing article or analysis is overwritten.
- Newly inserted articles remain pending until the protected analysis route is called.
- The protected analysis route validates and saves structured OpenAI results for selected/new or pending real articles and updates `analyzed_at` afterward.
- Political framing remains explicitly AI-estimated and is not presented as objective truth.
- Terminal and database logs show useful stage/count information without secrets, full article text, prompts, or raw model responses.
- No scheduler, cron, pgvector, embeddings, UI redesign, or unrelated refactor is added.

## Checks to run

1. Re-read this approved prompt immediately before editing or invoking paid actions.
2. Re-read current local Next.js route-handler guidance and installed AI SDK/OpenAI provider docs before touching those modules.
3. Inspect the current git diff and preserve the existing uncommitted AI-analysis changes.
4. Run focused pure-function/static checks for URL rejection, request validation, model schema validation, secret boundaries, and absence of client imports where practical.
5. Run `npm run typecheck`.
6. Run `npm run lint`.
7. Run `npm run build` because route/server modules may change. If the existing Google Fonts download still blocks the build, report it exactly and do not alter the UI/font implementation in this task.
8. After static checks pass, perform the bounded live scrape with all five source IDs and `limitPerSource: 1`.
9. Compare Supabase article IDs before/after, inspect each new row's required fields and cleaned body quality, and inspect safe logs.
10. Analyze only newly inserted IDs, or at most five existing pending real articles if none were inserted. Inspect the saved analysis rows, percentage totals, generated `bias_score`, disclaimer/model, and `analyzed_at` ordering.
11. Re-run the same selected IDs and confirm duplicate/analysis overwrite protection.
12. Report exact command outcomes and the real inserted/analyzed counts. Do not claim a source succeeded unless its live result and stored row were inspected.

## Exact manual test steps expected after implementation

1. Confirm `.env.local` has non-empty values for `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, `OPENAI_API_KEY`, and `BIASLY_ADMIN_SECRET`. Optionally set `ANALYSIS_BATCH_SIZE=5`. Do not print credential values.
2. Start the app and keep the terminal visible:

   ```powershell
   npm run dev
   ```

3. Verify the scrape route rejects an unauthenticated request:

   ```powershell
   '{}' | curl.exe -i -X POST "http://localhost:3000/api/scrape" -H "Content-Type: application/json" --data-binary "@-"
   ```

4. Verify the analysis route rejects an unauthenticated request:

   ```powershell
   '{}' | curl.exe -i -X POST "http://localhost:3000/api/analyze" -H "Content-Type: application/json" --data-binary "@-"
   ```

5. Run the bounded all-source live scrape:

   ```powershell
   '{"sourceIds":[1,2,3,4,5],"limitPerSource":1}' | curl.exe -i -X POST "http://localhost:3000/api/scrape" -H "Content-Type: application/json" -H "x-biasly-admin-secret: $env:BIASLY_ADMIN_SECRET" --data-binary "@-"
   ```

6. Inspect the scrape summary and Next.js terminal. In Supabase, compare article IDs from before the run and verify every new row has the correct source, unique original/canonical URL and slug, non-empty image, valid published date, readable cleaned `raw_text`, `scraped_at`, and null `analyzed_at`.
7. Put only the new IDs into an analysis request. Build JSON with PowerShell to avoid native quoting issues:

   ```powershell
   $articleIds = @(101, 102)
   $analysisBody = @{ articleIds = $articleIds } | ConvertTo-Json -Compress
   curl.exe -i -X POST "http://localhost:3000/api/analyze" -H "Content-Type: application/json" -H "x-biasly-admin-secret: $env:BIASLY_ADMIN_SECRET" --data-raw "$analysisBody"
   ```

8. If no new rows were inserted, run a bounded analysis of existing pending real articles instead:

   ```powershell
   '{"limit":5}' | curl.exe -i -X POST "http://localhost:3000/api/analyze" -H "Content-Type: application/json" -H "x-biasly-admin-secret: $env:BIASLY_ADMIN_SECRET" --data-binary "@-"
   ```

9. In Supabase, verify each successful article has exactly one `article_analyses` row, percentages total `100`, `bias_score` equals `(right_percentage - left_percentage) / 100`, the disclaimer identifies AI estimation, the model is recorded, and `articles.analyzed_at` is set only after analysis persistence.
10. Re-run the same selected analysis request and confirm the articles are skipped rather than overwritten. Re-run the scrape request and confirm stored URLs are counted as duplicates rather than inserted again.
11. Inspect recent `logs` rows and the server terminal for scrape/analysis summaries. Confirm no secrets, Authorization headers, raw article bodies, prompts, or raw OpenAI responses were logged.

