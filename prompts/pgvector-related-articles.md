# pgvector Analysis Embeddings and Related Articles

## Goal

Implement sections 19 and 20 of `AGENTS.md` together for biasly: build the currently missing protected AI article-analysis pipeline, enable Supabase pgvector, add a nullable `embedding vector(1536)` column to `article_analyses`, generate and persist `text-embedding-3-small` embeddings alongside new analyses, backfill embeddings without regenerating existing analyses, query the five nearest analyzed articles by cosine distance, and render a responsive Related Articles section on the news details page.

This prompt supersedes `prompts/ai-analysis.md` because that prerequisite analysis pipeline has not been implemented. Scraping, Oxylabs Scheduler, Vercel Cron, Clerk behavior, unrelated home-page work, and speculative recommendation features remain out of scope.

## Skills and documentation read

- `AGENTS.md`
- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/ai-sdk/SKILL.md`
- Next.js 16.2.12 bundled guides:
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- Current Supabase changelog and official documentation:
  - `https://supabase.com/changelog?types=breaking-change`
  - `https://supabase.com/changelog/extension-version-pinning-ignored`
  - `https://supabase.com/docs/guides/database/extensions`
  - `https://supabase.com/docs/guides/ai/vector-columns`
  - `https://supabase.com/docs/guides/ai/vector-indexes`
  - `https://supabase.com/docs/guides/ai/semantic-search`
  - `https://supabase.com/docs/reference/javascript/rpc`
  - `https://supabase.com/docs/guides/api/rest/generating-types`
- Current AI SDK and OpenAI documentation:
  - `https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data`
  - `https://ai-sdk.dev/docs/ai-sdk-core/embeddings`
  - `https://ai-sdk.dev/docs/reference/ai-sdk-core/embed`
  - `https://ai-sdk.dev/providers/ai-sdk-providers/openai`
  - `https://developers.openai.com/api/docs/models/text-embedding-3-small`
  - `https://developers.openai.com/api/docs/models/text`

Relevant current findings:

- Supabase installs the extension named `vector` in the `extensions` schema and recommends wrapping cosine similarity in a Postgres function because PostgREST does not expose pgvector distance operators directly.
- `<=>` is cosine distance and must be paired with `vector_cosine_ops`; the SQL query must order by the distance expression itself so the vector index can be used.
- Current Supabase guidance generally prefers HNSW, but this repository explicitly requires an IVFFlat cosine index in `AGENTS.md`; follow the repository requirement and use IVFFlat with a conservative `lists = 100` setting.
- Since August 5, 2026, Supabase ignores explicit extension versions. Use `create extension if not exists vector with schema extensions` without a version clause.
- AI SDK `embed` returns `number[]`; `text-embedding-3-small` produces 1,536 dimensions by default.
- Registry versions checked on August 7, 2026 are `ai@7.0.56` and `@ai-sdk/openai@4.0.34`.

After package installation, re-read the installed version-matched documentation and source under `node_modules/ai/docs/`, `node_modules/ai/src/`, and `node_modules/@ai-sdk/openai/docs/` before writing the model calls. Installed docs take precedence over online examples.

## Existing code inspected

- `package.json` and `package-lock.json`
- `.env.example`
- `supabase/config.toml`
- `supabase/schema.sql`
- `supabase/migrations/20260804074558_initial_biasly_schema.sql`
- `lib/supabase/client.ts`
- `lib/supabase/types.ts`
- `lib/supabase/dto.ts`
- `lib/supabase/errors.ts`
- `lib/supabase/queries/articles.ts`
- `lib/supabase/queries/analyses.ts`
- `lib/supabase/queries/logs.ts`
- `lib/security/admin-secret.ts`
- `lib/scraping/logger.ts`
- `lib/scraping/pipeline.ts`
- `app/api/scrape/route.ts`
- `app/news/[slug]/page.tsx`
- `components/news/news-details.tsx`
- `components/news/news-details.module.css`
- `components/news/analysis-panel.tsx`
- `next.config.ts`
- `prompts/ai-analysis.md`

Current state:

- The database already contains all non-vector analysis columns and constraints, including database-generated `bias_score`.
- `article_analyses` has no embedding column, vector index, or related-article function.
- `lib/supabase/types.ts` has no vector field or RPC type.
- `getPendingAnalysisArticles` only returns articles with no analysis row; it does not yet classify existing rows whose embedding is null.
- `saveArticleAnalysis` inserts analysis data and then marks `articles.analyzed_at`.
- No `app/api/analyze/route.ts`, `lib/analysis/` implementation, `ai` package, or `@ai-sdk/openai` package exists.
- The news page is already a Server Component and fetches Supabase data directly. The details component has no Related Articles prop/section, although its CSS module contains dormant related-card class names that can be refined and reused.
- The working tree was clean before creating this prompt.

## Decisions and assumptions

- Implement the approved analysis-only behavior from `prompts/ai-analysis.md` as a prerequisite within this change, then extend it with embeddings. Do not leave pgvector wired to a nonexistent route.
- Pin `ai@7.0.56` and `@ai-sdk/openai@4.0.34` exactly and update `package-lock.json`. Recheck registry versions immediately before installation; change these versions only for a documented compatibility or security reason.
- Use the direct OpenAI provider and existing server-only `OPENAI_API_KEY`.
- Use `gpt-5.6-terra` for structured article analysis and save that exact analysis model ID in `article_analyses.model`.
- Use `text-embedding-3-small` with its default 1,536 dimensions. Do not request reduced dimensions and do not add an embedding-model column not required by the schema.
- Build embedding input deterministically from the stored article title and cleaned `raw_text`, never the source name. Normalize whitespace and cap input at a centralized safe character limit so unusually long articles do not exceed the embedding model's input limit.
- Validate every returned embedding before persistence: exactly 1,536 finite numeric values.
- For a new article with no analysis row, generate structured analysis and embedding together, then insert one row containing both. Do not set `analyzed_at` unless both outputs are valid and the combined row insert succeeds.
- For an existing analysis row with `embedding IS NULL`, generate only the embedding and update only that column. Never rerun or overwrite its summary, sentiment, framing, disclaimer, model, or timestamps unnecessarily.
- A work item with an analysis and non-null embedding is complete and must not be processed again.
- Keep `embedding` nullable so the migration is safe for existing analyses and failed embedding calls remain retryable.
- Continue using the required LEFT JOIN/nested-relation state check. Classify rows in JavaScript as `full_analysis`, `embedding_backfill`, or complete; do not filter joined-table columns with `.eq('foreignTable.column', ...)`.
- Default `POST /api/analyze` to all unfinished work. Optional request `limit` and `articleIds` retain the semantics defined in `prompts/ai-analysis.md`. Use `ANALYSIS_BATCH_SIZE`, default `5`, with a small maximum of `20`.
- Track attempted IDs so failures remain eligible for a later request without looping in the current request.
- Do not automatically invoke the route during implementation checks because it spends OpenAI credits and mutates Supabase.
- Add a Postgres RPC for cosine ranking because PostgREST cannot directly order with `<=>`.
- Return no similarity threshold: select the closest eligible results and cap the function and application result to five, matching `AGENTS.md`.
- Keep the 1,536-value current embedding server-only. Do not add it to browser-facing DTOs or serialize it into `NewsDetails` props.
- Hide Related Articles completely when the current article has no embedding or the similarity function returns no rows.

## Files likely to change

- `package.json`
- `package-lock.json`
- `.env.example`
- `supabase/schema.sql`
- `supabase/migrations/<CLI-generated-timestamp>_pgvector_related_articles.sql`
- `lib/supabase/types.ts`
- `lib/supabase/dto.ts`
- `lib/supabase/queries/articles.ts`
- `lib/supabase/queries/analyses.ts`
- `lib/supabase/queries/logs.ts` only for shared logger wording if needed
- `app/api/analyze/route.ts`
- `lib/analysis/constants.ts`
- `lib/analysis/types.ts`
- `lib/analysis/schema.ts`
- `lib/analysis/prompt.ts`
- `lib/analysis/model.ts`
- `lib/analysis/logger.ts`
- `lib/analysis/pipeline.ts`
- `app/news/[slug]/page.tsx`
- `components/news/news-details.tsx`
- `components/news/related-articles.tsx` or one equivalently focused component
- `components/news/news-details.module.css`

Avoid edits to the initial migration, scraping code, scheduler code, Clerk/proxy configuration, homepage behavior, and unrelated components.

## Database and migration requirements

This project uses imperative migrations because `supabase/migrations/` exists and `schema_paths` is empty.

1. Discover the installed CLI syntax with `supabase --help`, `supabase migration --help`, and `supabase migration new --help`.
2. Create the new migration through the CLI with a descriptive name such as `pgvector_related_articles`; do not invent the timestamp filename.
3. Update `supabase/schema.sql` to represent the same final desired state as the migration.
4. Do not modify the initial migration.

The migration and canonical schema must:

- Enable pgvector without pinning a version:

  ```sql
  create extension if not exists vector with schema extensions;
  ```

- Add `embedding extensions.vector(1536)` as a nullable column on `public.article_analyses`.
- Create a named IVFFlat cosine index on `article_analyses.embedding`, using `vector_cosine_ops`, `lists = 100`, and a non-null predicate when supported by the verified pgvector version.
- Create or replace a stable, read-only `public.match_related_articles` SQL function that accepts:
  - current article ID as `bigint`
  - current embedding as `extensions.vector(1536)`
  - requested result count as `integer`
- Clamp the SQL result count to `0..5` even if a caller passes a larger value.
- Join `article_analyses` to `articles` and `sources` inside the function.
- Require candidate embedding non-null, candidate article `analyzed_at` non-null, and candidate article ID different from the current ID.
- Order directly by `candidate_analysis.embedding <=> query_embedding` ascending, then use a deterministic article-ID tie breaker.
- Return only card data plus numeric similarity (`1 - cosine distance`): article ID, slug, title, image URL/alt, category, region, publication date, read time, source ID/name/logo, and similarity. Never return candidate embeddings or raw article text.
- Declare the function `SECURITY INVOKER`, use a controlled search path or fully schema-qualified objects, and never use `SECURITY DEFINER`.
- Revoke function execution from `PUBLIC`, `anon`, and `authenticated`; grant execution only to `service_role`.
- Preserve existing RLS and table grants. The current service role already has the table select/update permissions required for embedding writes.

Update `lib/supabase/types.ts` to match the migrated database:

- `article_analyses.Row.embedding` is nullable.
- Insert/update forms accept a validated vector representation compatible with current `supabase-js` behavior.
- Add the typed `match_related_articles` function args and result row under `Database.public.Functions`.
- Use a narrow vector input type that safely accepts the AI SDK's numeric array while still matching generated Supabase types. Regenerate types from the migrated local or linked database when available and reconcile rather than guessing.

## AI analysis and embedding requirements

Implement the protected analysis pipeline described in `prompts/ai-analysis.md`, with these vector-specific rules taking precedence.

### Protected route

- Add only `POST /api/analyze` with Node.js runtime.
- Authenticate `x-biasly-admin-secret` before body parsing or expensive work using the existing timing-safe helper.
- Accept an empty object by default, optional bounded `limit`, and optional unique positive `articleIds`.
- Validate body size, JSON, and the strict Zod request schema; return `401`, `400`, `500`, and downstream-failure responses consistently without leaking secrets.
- Keep the route thin and delegate to a server-only pipeline.

### Structured analysis

- Use the installed AI SDK's current `generateText` plus `Output.object({ schema })` pattern and Zod 4.
- Produce and validate neutral summary, sentiment score/label, political framing label, integer left/center/right percentages totaling exactly 100, confidence, framing notes, and bounded loaded terms.
- Infer political framing only from article title/body, never source identity. Treat it as an AI estimate and use `unclear` with low confidence when evidence is weak.
- Treat stored article content as untrusted prompt data and instruct the model not to follow embedded instructions.
- Retry invalid structured output once, then mark only that work item failed and continue.
- Attach the canonical AI-estimate disclaimer in application code and let Postgres derive `bias_score`.
- Set OpenAI response storage to false where supported by the installed provider version.

### Embedding generation

- Use the installed AI SDK's current `embed` API with `openai.embeddingModel('text-embedding-3-small')` or the exact equivalent documented by the installed packages.
- Generate one embedding for each full-analysis article alongside the structured analysis call. Bounded parallel execution is allowed, but do not persist the analysis if embedding generation fails.
- For embedding-only backfill, skip structured generation entirely and call only the embedding model.
- Validate vector length and every number before any Supabase write.
- Do not log the embedding, raw model response, full input, article body, or token-level provider payload.

### Persistence and state

- Extend `saveArticleAnalysis` so a new valid analysis and its validated embedding are inserted together in the single `article_analyses` row; never upsert over an existing analysis.
- Add a narrow embedding-backfill helper that updates only `embedding` for the expected article analysis row and fails clearly if no row was updated.
- Mark `articles.analyzed_at` only after the row contains both valid analysis data and a valid embedding.
- For legacy analysis rows whose `analyzed_at` is already set but embedding is null, fill the embedding without changing the analysis. Mark or retain `analyzed_at` only after the embedding update succeeds.
- Detect uniqueness races safely and classify them without overwriting the winning row.
- A failed new analysis remains without a row; a failed backfill remains with `embedding IS NULL`; both are retryable later.

### Pipeline result and logs

Return a typed summary containing at least:

- status, analysis model, embedding model, batch size, and batch count
- work items considered
- full analyses completed
- embeddings generated
- embeddings backfilled
- skipped and failed counts
- total duration
- grouped safe failure/skip reasons and affected IDs

Log start, per-batch counts, per-item completion/failure/backfill, and final summary to the terminal and buffered `logs` table. Logging failures must not replace the pipeline result. Never log secrets, headers, raw prompts, full article text, embeddings, or raw provider bodies.

## Related-article query requirements

- Add a browser-safe `RelatedArticleDto` containing only the fields needed by the cards and the similarity score.
- Add a focused server-only helper to load the current article's embedding by article ID. Parse/validate the database representation safely and return `null` if it is absent; never place the vector in `ArticleDetail`, `ArticleAnalysisDto`, metadata, or component props.
- Add exactly the required `getRelatedArticles(articleId, embedding)` function in `lib/supabase/queries/articles.ts` using the service-role client and typed `rpc('match_related_articles', ...)` call.
- Validate the current article ID and input vector before invoking the RPC.
- Map RPC rows to `RelatedArticleDto`, discard malformed rows defensively, and cap results to five in application code as a second boundary.
- Throw contextual Supabase errors without exposing vector contents or credentials.
- Do not implement client-side cosine calculations, N+1 candidate queries, source-name heuristics, random fallback stories, or relations for articles lacking embeddings.

## News details page requirements

- Keep `app/news/[slug]/page.tsx` as the data-loading Server Component.
- Load the analyzed article as it does now. After it exists, load its embedding server-side and call `getRelatedArticles(article.id, embedding)` only when non-null.
- Pass only `ArticleDetail` and the small related-card DTO array to the render component.
- Do not fetch through the app's own Route Handler and do not expose the service-role client or embedding to browser code.
- Preserve metadata behavior and the existing `notFound()` path.
- Render no heading, empty-state box, or placeholder if the current embedding is missing or no related rows are returned.

## Visual interpretation and UI requirements

- Place Related Articles inside the existing centered details-page shell, after the main article/sidebar grid and before the newsletter banner.
- Use a restrained full-width section separated by the existing thin neutral border and headed `Related Articles`.
- Reuse and refine the dormant `relatedSection`, `relatedGrid`, `relatedCard`, `relatedMedia`, `relatedImage`, and `relatedContent` CSS patterns rather than introducing a separate design system.
- Desktop/tablet: a two-column grid of compact cards with a fixed-ratio thumbnail on the left and text on the right. Five results may leave the final grid cell empty naturally.
- Small screens: one column, with thumbnail and text remaining side by side; prevent title or metadata overflow.
- Each card must use `next/link` to `/news/<slug>` and be keyboard accessible with a clear focus-visible state. Make the card's useful content clickable without nesting interactive controls.
- Use `next/image` with stored image URL/alt, existing `unoptimized` behavior for arbitrary source hosts, stable dimensions/fill container, and responsive `sizes`.
- Show source name, publication date, and article title. Similarity may remain semantic/query metadata and should not be presented as a scientific certainty.
- Typography, spacing, border color, radius, and muted metadata should match the current details page. Do not add bright recommendation badges, carousels, horizontal scrolling, ranking numbers, or new client-side JavaScript.
- Preserve the current responsive breakpoints around `820px`, `740px`, `560px`, and `390px`, adjusting only the related-section rules needed for clean layout.
- Pixel expectation: the new section should look native to the current minimal gray/white editorial UI, align exactly with the main content width, and avoid layout shift as thumbnails load.

## Security requirements

- `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `BIASLY_ADMIN_SECRET` remain server-only and never enter component props, client bundles, logs, or responses.
- Analysis, embeddings, vector parsing, RPC calls, and persistence stay in modules marked `import "server-only"`.
- Keep RLS enabled and browser roles revoked from the existing tables.
- The vector-match function must be `SECURITY INVOKER` and executable only by `service_role`.
- Never expose embeddings, raw article text, provider responses, internal prompts, or credentials in the Related Articles DTO or page output.
- Validate request inputs, model output, embedding dimensions, database vector parsing, RPC output, and result limits at their boundaries.
- Do not weaken Clerk protection on `/news/[slug]` or the admin-secret requirement on `/api/analyze`.
- Do not add permissive RLS policies, a public similarity endpoint, browser-side model calls, or `SECURITY DEFINER` as a workaround.

## Acceptance criteria

- A CLI-generated migration and `supabase/schema.sql` both enable `vector`, add nullable `article_analyses.embedding vector(1536)`, create the IVFFlat cosine index, and define the locked-down related-match RPC.
- No extension version is pinned.
- `lib/supabase/types.ts` matches the column and RPC signature.
- `POST /api/analyze` exists, rejects invalid admin secrets, validates input, and defaults to all unfinished analysis/embedding work.
- Articles with no analysis receive valid structured analysis plus a 1,536-value embedding before `analyzed_at` is set.
- Existing analyses with null embeddings are picked up automatically for embedding-only backfill and are not reanalyzed.
- Invalid structured output is retried once; invalid/wrong-sized embeddings are never saved.
- Existing analysis rows are never overwritten by full analysis, and failures do not loop in the same invocation or stop later work.
- Cosine ranking excludes the current article, null embeddings, and articles not marked analyzed; it returns at most five rows ordered by `<=>` distance.
- The page never serializes the current 1,536-value embedding to the UI.
- Related Articles appears only for non-empty matches, links to real persisted article slugs, and shows stored image/title/source/date data.
- The new section is responsive, keyboard accessible, visually consistent, and introduces no client-side data/model work.
- No scraping, scheduler, auth, unrelated homepage, or speculative recommendation change is introduced.

## Checks to run

1. Re-read this approved prompt before editing.
2. Recheck and install the exact approved `ai` and `@ai-sdk/openai` versions using the repository's npm/package-lock workflow.
3. Read installed AI SDK/OpenAI provider docs and source for `generateText`, `Output.object`, `embed`, and embedding model construction.
4. Discover Supabase CLI commands with `--help`; generate the new migration through the CLI.
5. If Docker is available, run the local Supabase migration/reset workflow, generate TypeScript types from the migrated local database, and compare/reconcile `lib/supabase/types.ts`.
6. Query `pg_extension`, `information_schema`, and `pg_indexes` to confirm extension, vector dimensions, and IVFFlat cosine index.
7. Inspect function definition and privileges to confirm `SECURITY INVOKER`, service-role-only execute access, exclusion rules, direct `<=>` ordering, and five-row clamp.
8. Run Supabase database advisors because a function, extension, column, and index are added; fix relevant security/performance findings.
9. If a linked remote project and authorization are available, apply the migration there and run read-only verification. Otherwise report the exact Dashboard SQL Editor step without claiming the remote database changed.
10. Do not invoke the paid/mutating analysis route automatically without explicit direction.
11. Run `npm run typecheck`.
12. Run `npm run lint`.
13. Run `npm run build` because dependencies, schema types, a route, server queries, page data loading, and UI components change.
14. Report exact command outputs and every skipped check with its concrete reason.

## Exact manual test steps expected after implementation

1. In Supabase Dashboard -> Database -> Extensions, confirm `vector` is enabled. Apply the new generated migration through the normal migration workflow or paste that migration's SQL into Dashboard -> SQL Editor. Do not run only the initial schema against an existing database.
2. Confirm the database state:

   ```sql
   select extname, extversion from pg_extension where extname = 'vector';

   select format_type(a.atttypid, a.atttypmod) as embedding_type
   from pg_attribute a
   join pg_class c on c.oid = a.attrelid
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname = 'article_analyses'
     and a.attname = 'embedding';

   select indexname, indexdef
   from pg_indexes
   where schemaname = 'public'
     and tablename = 'article_analyses';
   ```

3. Set `.env.local` values for `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `BIASLY_ADMIN_SECRET`; optionally set `ANALYSIS_BATCH_SIZE=5`. Never add `CRON_SECRET` locally for this test.
4. Start the app with `npm run dev` and keep the terminal visible for analysis progress logs.
5. Confirm unauthorized analysis requests return `401`:

   ```powershell
   curl.exe -i -X POST "http://localhost:3000/api/analyze" -H "Content-Type: application/json" -d "{}"
   ```

6. Minimize initial API cost by processing one work item:

   ```powershell
   curl.exe -i -X POST "http://localhost:3000/api/analyze" -H "Content-Type: application/json" -H "x-biasly-admin-secret: $env:BIASLY_ADMIN_SECRET" -d '{"limit":1}'
   ```

7. Confirm the successful row has complete analysis data and a 1,536-dimensional vector:

   ```sql
   select
     article_id,
     model,
     embedding is not null as has_embedding,
     extensions.vector_dims(embedding) as embedding_dimensions
   from public.article_analyses
   order by updated_at desc
   limit 5;
   ```

8. To test backfill safely in a development project, choose an existing analysis fixture, set only its embedding to null, call the route for that article ID, then confirm the analysis fields are unchanged while the embedding is restored. Do not do this destructive fixture manipulation in production.
9. Run the default full backfill only when ready for the OpenAI cost:

   ```powershell
   curl.exe -i -X POST "http://localhost:3000/api/analyze" -H "Content-Type: application/json" -H "x-biasly-admin-secret: $env:BIASLY_ADMIN_SECRET" -d "{}"
   ```

10. Watch the Next.js terminal and verify separate counts for full analyses and embedding backfills, plus a final summary. Confirm no article body, embedding array, raw prompt, provider body, or secret is logged.
11. With at least two analyzed embedded articles, call the RPC in SQL Editor using a real current article embedding and verify the current article is excluded, results are ordered by decreasing similarity, and no more than five rows return.
12. Sign in and open `/news/<slug>` for an embedded article. Confirm Related Articles appears below the main details grid and above the newsletter, each card links to a real related article, and no more than five cards render.
13. Open an analyzed article with no embedding and confirm the Related Articles heading/section is entirely absent.
14. Test desktop, tablet, and narrow mobile widths. Confirm two columns collapse to one, thumbnails do not shift layout, titles/metadata do not overflow, and keyboard focus is visible on each card.
15. Re-run analysis for already complete article IDs and confirm they are skipped without overwriting analysis or embedding data.
