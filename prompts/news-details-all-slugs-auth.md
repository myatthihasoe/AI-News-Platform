# Biasly all news details slugs and Clerk protection

## Goal

Make every article shown on the Biasly homepage open a matching full news-details page through the existing dynamic `/news/[slug]` route, while requiring Clerk sign-in before a visitor can view any full article analysis.

The homepage feed, design-system showcase, and authentication pages must remain publicly accessible. Signed-out requests to `/news/*` must be redirected to the existing local `/sign-in` flow.

## Skills read

- `.agents/skills/clerk/SKILL.md` - detected the installed current Clerk SDK and routed the authentication work to the Next.js guidance.
- `.agents/skills/clerk-nextjs-patterns/SKILL.md` - current Clerk server/client boundaries and middleware/proxy behavior.
- `.agents/skills/clerk-nextjs-patterns/references/middleware-strategies.md` - public-first route protection with `createRouteMatcher()` and `auth.protect()`.

No Supabase, scraping, or AI SDK skill is needed because this request extends the existing typed preview UI data and does not add persistence, scraping, or model calls.

## Next.js and installed SDK documentation inspected

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
- Installed Clerk v7 route-matcher and `auth.protect()` types under `node_modules/@clerk/nextjs/dist/types/`

Relevant current behavior:

- Next.js 16 uses root-level `proxy.ts`; the older `middleware.ts` filename is deprecated.
- Dynamic route `params` are promises and must be awaited.
- `generateStaticParams()` can enumerate all known preview slugs.
- Clerk middleware does not protect routes by default.
- In Clerk v7 middleware, `auth.protect()` redirects signed-out document requests to the configured sign-in URL.
- The project already configures `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`.

## Existing code inspected

- `package.json` and `package-lock.json` - Next.js 16.2.12, React 19.2.4, and `@clerk/nextjs` 7.6.x are already installed; required scripts exist.
- `proxy.ts` - currently initializes Clerk for matched requests but protects no route.
- `.env.example` - already contains local Clerk sign-in/sign-up URLs and fallback redirects.
- `app/layout.tsx` - already wraps the application in `ClerkProvider`.
- `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` - existing local Clerk flows.
- `app/news/[slug]/page.tsx` - existing typed dynamic route, metadata, static-params generation, and `notFound()` behavior.
- `lib/news/preview-articles.ts` - 12 homepage cards but only the Iran card has an `href`, and only `iran-peace-proposal` has a full `NewsArticleDetail` entry.
- `app/page.tsx` and `components/home/home-news-card.tsx` - homepage renders the shared article array and links only cards with an `href`.
- `components/news/news-details.tsx` - reusable article-details layout.
- `components/news/analysis-panel.tsx` - reusable framing, summary, sentiment, confidence, notes, loaded terms, disclaimer, and source panels.
- `components/news/related-story-card.tsx`, `components/news/newsletter-banner.tsx`, and `components/news/news-details.module.css` - existing related-story, newsletter, and responsive presentation.
- `components/home/home-header.tsx` and the existing auth prompt/implementation - current Login/UserButton behavior and public auth routes.
- `03-news-details-page.png` and the implemented `/news/iran-peace-proposal` page - visual reference and canonical layout.

## Current homepage slugs to support

1. `/news/iran-peace-proposal`
2. `/news/grapes-superfood`
3. `/news/cern-physics-hint`
4. `/news/brooklyn-rivera`
5. `/news/un-emergency-meeting`
6. `/news/oil-prices`
7. `/news/starship-test-flight`
8. `/news/apple-ai-features`
9. `/news/hottest-years`
10. `/news/fed-rates`
11. `/news/real-madrid-final`
12. `/news/western-canada-wildfires`

## Decisions and assumptions

1. Keep one dynamic `app/news/[slug]/page.tsx`; do not create 12 duplicated page files.
2. Preserve the existing Iran article content and UI as the canonical implementation.
3. Add `href: /news/<id>` to every homepage article so each full card is keyboard- and pointer-navigable through the existing `Link` rendering.
4. Extend the typed preview article registry so every homepage ID has a corresponding `NewsArticleDetail` entry.
5. Keep the new article data in the current preview fixture module. This task does not introduce a partial Supabase layer before the repository has its database implementation.
6. Use small typed helpers for repeated preview-detail defaults where they reduce duplication, while keeping titles, bodies, summaries, analysis notes, loaded terms, captions, dates, authors, and source framing coherent for each article.
7. Reuse the current article image and framing percentages from its homepage card so the feed and detail page remain consistent.
8. Use the existing news-details components and CSS unchanged unless a real data-driven layout defect is discovered during validation.
9. Keep `generateStaticParams()` and expand its output through the completed detail registry so all 12 known slugs are generated and unknown slugs still call `notFound()`.
10. Protect `/news(.*)` using Clerk's public-first `createRouteMatcher()` pattern in root `proxy.ts` and call `await auth.protect()` only for matching requests.
11. Rely on the existing `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` configuration so Clerk redirects signed-out document requests to the local sign-in page and preserves the requested article as the return destination.
12. Do not protect `/`, `/design-system`, `/sign-in(.*)`, `/sign-up(.*)`, static assets, or unrelated routes.
13. The reference and current fixture content are preview content. Do not add scraping, model calls, database writes, or claims that these fixtures were fetched live.

## Files likely to change

- `lib/news/preview-articles.ts`
- `proxy.ts`

Change these only if a verified implementation need arises:

- `app/news/[slug]/page.tsx`
- `components/news/related-story-card.tsx`
- `components/news/news-details.module.css`

Do not change Clerk keys, environment values, Supabase files, scraping, AI analysis, scheduler code, the design-system implementation, or unrelated homepage styling.

## Implementation requirements

### Article routing and data

1. Give every item in `homeArticles` an exact `/news/<slug>` destination.
2. Ensure the homepage and detail registry use the same slug/ID rather than maintaining a second conflicting slug list.
3. Provide a valid `NewsArticleDetail` for all 12 homepage articles.
4. Preserve every card's title, category, region, image, image alternative text, left/center/right percentages, and source count on its details page.
5. Each new detail must include:
   - author;
   - machine-readable and visible publication date;
   - read time;
   - relevant image caption and credit label;
   - multiple coherent article-body paragraphs;
   - concise neutral summary;
   - 4-5 article-specific summary points;
   - sentiment score and allowed sentiment label;
   - framing label consistent with the existing percentages;
   - confidence;
   - framing notes;
   - loaded terms;
   - the existing AI-estimate disclaimer and preview model label;
   - source counts that add up to the article's total source count;
   - typed top-source entries;
   - related stories sufficient to preserve the current reference layout.
6. Keep every left/center/right total equal to 100.
7. Keep every source-breakdown count total equal to the article's `sourceCount`.
8. Keep `getPreviewArticle(slug)` and `getPreviewArticleSlugs()` deterministic and typed.
9. Preserve current metadata generation so every valid slug receives its own title and summary description.
10. Preserve `notFound()` for slugs absent from the registry.

### Clerk route protection

1. Import `createRouteMatcher` alongside `clerkMiddleware` from `@clerk/nextjs/server`.
2. Define a protected matcher for `/news(.*)` outside the middleware callback.
3. Use public-first protection:

   ```ts
   export default clerkMiddleware(async (auth, request) => {
     if (isProtectedNewsRoute(request)) {
       await auth.protect();
     }
   });
   ```

4. Preserve the existing static-file, Next.js internals, API/tRPC, and `/__clerk` proxy matcher coverage.
5. Do not create a deprecated `middleware.ts` file; Next.js 16 uses the existing `proxy.ts`.
6. A signed-out document request to any valid or invalid `/news/*` URL must be intercepted before article content renders and redirected to `/sign-in`.
7. A signed-in request must continue to the requested slug and render the matching details page or the normal not-found state.

## Security requirements

- Full article body and analysis UI must not render to a signed-out browser request.
- Do not implement protection by hiding links or components in client code.
- Do not expose `CLERK_SECRET_KEY` or inspect/log real key values.
- Do not manually read, write, or validate Clerk cookies or tokens.
- Do not add a custom redirect query sourced from untrusted input; use Clerk's verified request/redirect behavior.
- Keep `/sign-in` and `/sign-up` public to prevent redirect loops.
- Preserve the existing proxy matcher so Clerk session state remains available where required.
- Do not add roles, permissions, organizations, billing, user database rows, or Supabase Auth.

## Visual interpretation and pixel expectations

- Every slug must reuse the current `/news/iran-peace-proposal` design and the supplied reference:
  - two-column desktop article/sidebar composition;
  - category/region eyebrow, large wrapped headline, metadata/actions row;
  - wide hero image with caption and credit;
  - bordered bias-distribution module;
  - readable long-form article rhythm;
  - Bias Analysis, AI Summary, and Source Breakdown sidebar cards;
  - related-stories grid, newsletter banner, and shared dark footer.
- Keep Poppins typography, warm off-white canvas, near-black text, subtle neutral borders, 6-8px radii, red/gray/blue framing colors, and existing spacing tokens.
- Images must keep their existing aspect ratio and `next/image` behavior.
- Article-specific title length must wrap naturally without clipping or sidebar overlap.
- Do not redesign the existing canonical details page.

## Responsive and accessibility requirements

- Preserve the existing responsive behavior at desktop, tablet, and approximately 390px mobile widths.
- On narrow screens, the article and analysis sidebar must stack without horizontal overflow.
- Homepage cards remain semantic articles with one clear accessible link each.
- Card links must retain descriptive `aria-label` text and visible keyboard focus.
- Each details page keeps one `h1`, correctly nested panel headings, semantic dates, figure/caption markup, and accessible analysis labels.
- The Clerk redirect must occur before protected content is exposed; users must not see a flash of the full analysis while signed out.

## Acceptance criteria

1. All 12 homepage cards are clickable and link to the exact slug list above.
2. Each listed slug resolves to article-specific content using the current reference details layout.
3. Feed and detail values match for title, category, region, image, framing percentages, and source count.
4. `getPreviewArticleSlugs()` returns exactly the 12 homepage slugs with no missing or orphaned preview detail.
5. Every framing total is 100 and every source-count breakdown matches the displayed total.
6. Unknown slugs retain the current not-found behavior after authentication.
7. `proxy.ts` uses `createRouteMatcher(['/news(.*)'])` and awaited `auth.protect()`.
8. Signed-out `/news/*` requests redirect to the existing `/sign-in` route and do not render full article analysis.
9. After authentication, the requested valid slug renders normally.
10. `/`, `/design-system`, `/sign-in`, and `/sign-up` remain public.
11. The existing Iran page remains visually and functionally unchanged except that it is now protected.
12. No TypeScript, ESLint, build, hydration, proxy, Clerk, console, or horizontal-overflow errors are introduced.

## Checks to run

Run from the project root and report the exact outcome:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. `git diff --check`
5. Verify the build route table still includes `/`, `/design-system`, `/news/[slug]`, `/sign-in/[[...sign-in]]`, and `/sign-up/[[...sign-up]]`, with Proxy enabled.
6. Programmatically compare homepage IDs/hrefs with `getPreviewArticleSlugs()` and verify one-to-one coverage.
7. Programmatically verify framing totals and source-breakdown totals for all preview articles.
8. Browser QA signed out:
   - `/` renders without redirect;
   - all homepage cards expose links;
   - opening a news card redirects to `/sign-in` before protected content appears;
   - `/design-system`, `/sign-in`, and `/sign-up` remain public.
9. Browser QA signed in when an authenticated development session is available:
   - open every listed slug and verify the correct headline and core analysis sections;
   - verify an unknown slug renders not found;
   - verify desktop, tablet, and 390px layouts and horizontal overflow.
10. Inspect browser console logs for Clerk, hydration, image, and runtime errors.

If no authenticated development session is available, do not create or guess user credentials. Report signed-in browser verification as a manual step while still completing type, lint, build, data-integrity, and signed-out redirect checks.

## Exact manual test steps expected after implementation

1. Ensure `.env.local` contains valid `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` values. Do not paste them into chat or commit them.
2. Run `npm run dev` from `C:/Users/myatthihasoe/Desktop/AI News Platform/dev`.
3. Open `http://localhost:3000/` in a signed-out/private window and confirm the homepage feed loads without redirection.
4. Activate each homepage card and confirm the browser is sent to `/sign-in` with the requested news URL preserved as the return destination.
5. Sign in with a Clerk development account and confirm the browser returns to the selected `/news/<slug>` page.
6. Open each of the 12 listed news URLs and confirm the headline, image, category, region, bias percentages, source count, body, AI summary, and source panel match that article.
7. Open `http://localhost:3000/news/not-a-real-article` while signed in and confirm the not-found state renders.
8. Sign out, directly open one valid `/news/<slug>` URL again, and confirm it redirects to `/sign-in` without flashing article content.
9. While signed out, open `/`, `/design-system`, `/sign-in`, and `/sign-up`; confirm all remain public.
10. Test one short-title and one long-title article at approximately 1440px, 768px, and 390px. Confirm the sidebar stacks on narrow screens, titles wrap, images retain their ratio, and there is no horizontal scrolling.
11. Navigate the homepage cards and sign-in flow with the keyboard and confirm focus remains visible and logical.
12. Open browser developer tools and confirm there are no console errors, hydration warnings, Clerk redirect loops, failed image requests, or unexpected protected-content responses.
