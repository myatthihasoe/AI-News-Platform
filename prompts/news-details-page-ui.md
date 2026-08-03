# Biasly News Details Page UI Implementation Prompt

## Goal

Implement the attached `03-news-details-page.png` as a polished Biasly article-details experience at `/news/[slug]`, with the reference article available at `/news/iran-peace-proposal`.

The page must reuse the existing Biasly header, footer, design tokens, icon system, and framing meter; make the matching homepage card navigate to the detail page; and reproduce the reference's dense editorial two-column layout, article content, analysis sidebar, related stories, and newsletter banner. This is a UI-only implementation using the repository's existing preview-data approach. Do not add Supabase, Clerk, scraping, AI calls, API routes, or persistence in this task.

## Reference reviewed

- `C:/Users/Myat Thiha Soe/Downloads/03-news-details-page.png`
- The supplied reference is an `863x1823` desktop capture.
- Its key hierarchy is:
  - the existing slim utility bar and primary Biasly navigation;
  - a wide article column and a narrow, stacked analysis sidebar;
  - article eyebrow, headline, byline/date/read time, save/share controls, hero image and caption;
  - a full-width bias-distribution meter followed by article body copy;
  - sidebar panels for Bias Analysis, AI Summary, and Source Breakdown;
  - a two-column Related Stories list under the article;
  - a bordered newsletter banner and existing dark footer.

Do not embed the full reference screenshot as the page. Build the interface from semantic HTML, React components, CSS, and individual editorial images.

## Skills read

- No specialty project skill is required for this UI-only task.
- Clerk, Supabase, Oxylabs, and AI SDK skills were not read because their behavior is explicitly outside this implementation.

## Next.js documentation read

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`

Use the App Router and Server Components by default. In Next.js 16, dynamic `params` are a promise and must be awaited. Use `generateStaticParams`, `generateMetadata`, `notFound`, `next/link`, scoped CSS Modules, and `next/image` according to the bundled documentation.

## Existing code inspected

- `app/page.tsx` and `app/page.module.css` - current homepage and its typed 12-article preview fixture.
- `app/layout.tsx` - Poppins setup and global Biasly metadata.
- `app/globals.css` - shared color, type, border, radius, shadow, focus, and reduced-motion tokens.
- `components/home/home-header.tsx` - current two-tier utility/primary header.
- `components/home/home-footer.tsx` - current dark footer.
- `components/home/home-news-card.tsx` - current typed homepage card without detail navigation.
- `components/home/home.module.css` - shared homepage header, card, and footer styling and breakpoints.
- `components/design-system/primitives.tsx` - reusable `BrandMark` and `BiasMeter`.
- `components/design-system/icons.tsx` - reusable menu, bookmark, share, more, info, globe, and social icons.
- `next.config.ts` - currently permits only `images.unsplash.com` remote images.
- `package.json` - Next.js 16.2.12 and React 19.2.4; no Supabase, Clerk, or external icon package is installed.
- Existing prompts in `prompts/`, especially `ui-design-system.md` and `homepage-ui.md`, to preserve the approved visual language and UI-only preview-data convention.

There is currently no `app/news/[slug]` route, shared article fixture module, Supabase client, article query layer, or analysis data layer.

## Decisions and assumptions

1. Use `/news/[slug]` as the reusable details route, with `/news/iran-peace-proposal` as the supplied reference implementation.
2. Keep the page a Server Component. The save, share, overflow, feedback, analysis-method, source-list, theme, location, edition, login, and subscribe controls are accessible visual controls only unless a safe native behavior is obvious; do not invent accounts, billing, persistence, dialogs, or client state.
3. Move the matching homepage preview record into a small typed shared module and extend it with detail-only fixture data. This preserves the repository's current UI-preview convention and gives a single source for the homepage card and detail page. Do not create a local JSON datastore.
4. Add `generateStaticParams` for the available preview slug, await dynamic `params`, call `notFound()` for unknown slugs, and generate article-specific title/description metadata.
5. Make the first homepage card's image/headline area a real `next/link` to `/news/iran-peace-proposal`. Other preview cards may remain non-navigating until they have corresponding detail fixtures; do not create broken routes.
6. Reuse the existing header/footer rather than duplicating them. Add only backward-compatible props or variants if the detail page needs a different active-nav treatment.
7. Reuse `BiasMeter` for the large Bias Distribution strip. Create small, page-scoped row meters for the sidebar where the reference calls for label/value/bar rows.
8. The political-framing presentation must explicitly say it is AI-estimated. Never present the bias label as objective fact.
9. Because the project does not yet have Supabase or analyzed article records, populate all visible areas from a typed fixture. Keep component props aligned with eventual article, article-analysis, source, and related-article fields.
10. Use the closest suitable, license-compatible editorial image available for the Trump hero and stable stock/editorial stand-ins for related stories. Prefer an existing allowed host when the composition is adequate; otherwise add only the exact additional remote host needed in `next.config.ts`. Use meaningful alt text and preserve any required image attribution in the caption. Do not extract the hero from the full-page screenshot.
11. The reference omits some fields required by `AGENTS.md` for a complete analysis view. Include sentiment, confidence, framing notes, loaded terms, and the AI disclaimer in a compact treatment within the analysis sidebar, without displacing the major reference sections.
12. Preserve `/design-system` and the homepage's existing appearance except for adding the detail-page link.

## Files likely to change

- `app/news/[slug]/page.tsx`
- `app/news/[slug]/page.module.css`
- `components/news/news-details.tsx`
- `components/news/news-details.module.css` if a component-level stylesheet is cleaner than keeping all route styles together
- `components/news/analysis-panel.tsx`
- `components/news/related-story-card.tsx`
- `components/news/newsletter-banner.tsx`
- `lib/news/preview-articles.ts` for typed shared preview data
- `app/page.tsx` to consume the shared homepage preview data
- `components/home/home-news-card.tsx` to add the supported detail link
- `components/home/home.module.css` only for link/focus styling required by the linked card
- `components/home/home-header.tsx` only if a backward-compatible active-state prop is needed
- `components/design-system/icons.tsx` only if one small reference icon is genuinely missing
- `next.config.ts` only if the selected image requires one narrowly scoped additional remote pattern

Do not modify database schemas/types, environment files, auth, scraping, AI analysis, schedulers, API routes, or the `/design-system` page.

## Preview content contract

Use explicit TypeScript types and a fixture shaped around the eventual stored data:

- article: slug/id, category, region, title, author, published ISO timestamp and display label, read time, image URL/alt/caption/credit, body paragraphs, canonical/original URL placeholder where needed;
- analysis: summary, sentiment score and label, AI-estimated framing label, left/center/right percentages, confidence, framing notes, loaded terms, disclaimer, model label/generated date;
- sources: total count, left/center/right counts and percentages, top-source name and framing label;
- related stories: slug/id, category, region, title, image URL/alt, published date, and read time.

The supplied article should use:

- Category/region: `Politics · United States`
- Headline: `Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report`
- Author: `David Morgan`
- Published display date: `May 31, 2026`
- Read time: `12 min read`
- Framing: left `20`, center `31`, right `49`, label `right`
- Total sources: `12`
- Source counts shown as in the reference: left `2 (20%)`, center `4 (31%)`, right `6 (49%)`
- Top sources in reference order: Fox News (Right), The Wall Street Journal (Center), Reuters (Center), BBC (Center), CNN (Left), The New York Times (Center), The Washington Post (Center), Newsmax (Right).

Use the article body and AI-summary subject matter visible in the supplied reference: the revised Iran nuclear proposal, tougher enrichment and inspection terms, Iran's response, the administration's warning, European diplomacy, Israel's position, and the open outcome. Keep prose neutral and do not introduce unsupported current-events claims outside this clearly labeled preview fixture.

Related story titles should match the six visible reference items:

1. `Iran Says It Will Not Negotiate Under “Maximum Pressure”`
2. `Bipartisan Group Urges Diplomacy With Iran`
3. `US Sanctions More Iranian Entities Over Nuclear Program`
4. `What’s in the 2015 Iran Nuclear Deal?`
5. `Oman Hosts Another Round of US–Iran Nuclear Talks`
6. `Israel Reaffirms Red Line Over Iranian Nuclear Program`

All three framing percentages must sum to exactly 100; validate the fixture invariant in a small typed helper rather than silently normalizing incorrect values.

## Visual interpretation and pixel expectations

### Shared page chrome

- Reuse the existing near-black utility bar and white/translucent primary nav from the homepage.
- Preserve the reference order: menu, compact Biasly News lockup, Home, For You with red dot, Local, Blindspot, then Subscribe and Login.
- Do not add the homepage category rail to the detail page; it is absent in the supplied reference.
- Match existing desktop/mobile header behavior and visible focus states.

### Page canvas and desktop grid

- Warm off-white canvas using existing tokens and subtle central light gradient.
- Center content in a restrained editorial shell that aligns visually with the header and footer.
- At desktop/reference width, use a two-column grid: approximately two-thirds article content and one-third sidebar, with a 28-32px gutter.
- Top-align the sidebar with the article header region, as in the reference.
- Keep the sidebar narrow and dense; avoid oversized dashboard cards.

### Article header

- Eyebrow at roughly 11-12px, medium weight.
- H1 around 28-32px at the `863px` reference capture, bold with tight line height and letter spacing, wrapping to two lines like the screenshot.
- Byline/meta row below the title with author emphasized, thin separators, date, and read time.
- Save, bookmark, share, and overflow controls align on the right of the metadata row where space permits.
- On narrow screens, wrap metadata and action controls into clean rows without overlap.

### Hero and caption

- Large landscape hero with a subtle 4-6px radius, `object-fit: cover`, no layout shift, and composition close to the reference's seated presidential portrait.
- Caption and credit sit directly beneath in muted 8-10px text with compact line height.
- Use `next/image` with responsive `sizes`; prioritize only the hero image.

### Bias Distribution panel

- Bordered white/translucent panel immediately below the caption.
- Compact heading with an information icon.
- One full-width segmented strip: red `Left 20%`, light center `Center 31%`, blue `Right 49%`, with strong text contrast.
- `12 sources` appears below in compact bold text.
- Include a screen-reader summary identifying this as AI-estimated political framing.

### Article body

- Comfortable editorial reading size around 13-15px at reference width, 1.5-1.65 line height, near-black text.
- Use individual semantic paragraphs with approximately 16-20px vertical rhythm.
- Preserve readable line length and do not justify text.
- Keep body content in the main column only.

### Sidebar cards

- Three vertically stacked bordered panels with white/translucent surfaces, 6-8px radius, and subtle/no shadow.
- Panel headings around 17-19px, strong weight, with a small info icon aligned right.
- Internal dividers, row spacing, buttons, and typography should closely match the reference's dense proportions.

`Bias Analysis` panel:

- Display `AI-estimated overall framing`, prominent `Right 49%`, and `Based on 12 balanced sources`.
- Include rows for Left, Center, and Right with values and short horizontal color indicators.
- Show confidence compactly.
- Include the reference explanatory copy and an outlined `How We Analyze Bias` button.

`AI Summary` panel:

- Display generated date and estimated read time.
- Render five concise bullet points mirroring the reference summary.
- Add compact full-analysis details: sentiment label/score, framing notes, loaded terms, and the stored disclaimer.
- End with `AI summaries can make mistakes.` and an outlined `Provide Feedback` button.

`Source Breakdown` panel:

- Show total sources, the three source rows/counts/percentages and color indicators, followed by the eight-source list and aligned framing labels.
- Use red/neutral/blue text for Left/Center/Right while retaining visible words, so meaning is not color-only.
- End with an outlined `View All Sources` button.

### Related Stories

- Place below the body after a thin divider and `Related Stories` heading.
- At desktop/tablet, use a two-column list of six compact horizontal cards with small 4:3 thumbnails, eyebrow, two-line headline, date, and read time.
- At narrow mobile widths, use one column.
- If a related story has no implemented route, render it as a semantic article without a broken link.

### Newsletter banner and footer

- Add the bordered, pale newsletter banner below the article/sidebar grid and above the footer.
- Left: `Stay Informed. Stay Balanced.` and the short inbox description.
- Right: labeled email input and filled black Subscribe button. Treat this as a visual form only and do not submit or collect data.
- Reuse `HomeFooter` unchanged below it.

### Responsive behavior

- Desktop/reference: two-column content with sticky behavior avoided unless it reproduces cleanly at all heights.
- Below roughly 760-820px: collapse to one column, keeping article first and analysis panels after the article content.
- Related stories reduce from two columns to one at small mobile widths.
- Newsletter controls stack cleanly on mobile.
- Preserve at least 16px side padding, practical control hit areas, readable body text, and no horizontal page overflow at `390px`.

## Implementation requirements

1. Create `app/news/[slug]/page.tsx` as an async Server Component with awaited `params`.
2. Export `generateStaticParams` and article-specific `generateMetadata`; return `notFound()` for unknown preview slugs.
3. Define explicit TypeScript types for all page data and component props; do not use `any`.
4. Keep preview data outside render bodies and centralize the shared homepage/detail article record.
5. Extract only useful components: analysis panel(s), related-story item, and newsletter banner. Avoid one component per trivial text row.
6. Reuse `HomeHeader`, `HomeFooter`, `Icon`, `BrandMark`, and `BiasMeter` where appropriate.
7. Use semantic `header`, `main`, `article`, `aside`, `section`, headings, paragraphs, lists, `time`, and form labels.
8. Use `next/image` with stable dimensions or `fill`, meaningful alt text, responsive `sizes`, and no cumulative layout shift.
9. Use `next/link` for the implemented homepage-to-detail route and keep the whole card keyboard-accessible without nesting interactive elements.
10. Use CSS Modules and existing global tokens. Do not add a UI library or icon dependency.
11. Keep action controls non-mutating and server-safe. Do not introduce `use client` unless a tiny interaction is essential to the approved design; static visual controls are preferred.
12. Show the full stored-analysis contract required by `AGENTS.md`: summary, sentiment, AI-estimated framing percentages/label, confidence, framing notes, loaded terms, and disclaimer.
13. Do not add or simulate scraping, AI generation, database writes, auth, subscriptions, feedback submission, or source fetching.
14. Preserve existing homepage and `/design-system` visuals and behavior aside from the intentional first-card link.

## Security and privacy requirements

- Do not add or expose environment variables, credentials, service-role keys, admin secrets, or API tokens.
- Do not run OpenAI, Oxylabs, scraping, analysis, source fetching, or mutations in browser code.
- Do not collect or submit the newsletter email or feedback in this UI-only task.
- Restrict remote image configuration to exact required HTTPS hosts and paths.
- Do not add external scripts, analytics, embeds, or tracking pixels.
- Avoid `dangerouslySetInnerHTML`; render fixture body copy as React text nodes.

## Accessibility requirements

- Use one H1 for the article headline and a logical heading hierarchy beneath it.
- Give the sidebar an accessible label and each panel a real heading.
- Give icon-only buttons clear accessible names; mark decorative SVGs through the existing icon behavior.
- Make the implemented article link discoverable by keyboard with a visible focus state.
- Keep all framing information available as words/numbers, not color alone.
- Associate the newsletter label with its input and make the non-submitting behavior clear to assistive technology if the control remains present.
- Maintain WCAG AA contrast and the existing global `:focus-visible` treatment.
- Respect reduced-motion preferences and avoid unnecessary animation.

## Acceptance criteria

1. `/news/iran-peace-proposal` renders a page recognizably matching `03-news-details-page.png` in hierarchy, proportions, typography, spacing, color, panel density, and responsive behavior.
2. The desktop/reference view has an article column and stacked analysis sidebar; mobile collapses to one readable column with no overflow.
3. The header, article header/actions, hero/caption, bias distribution, body, three analysis panels, related stories, newsletter banner, and footer are all present.
4. The page explicitly labels political framing as AI-estimated and shows summary, sentiment, framing percentages/label, confidence, notes, loaded terms, and disclaimer.
5. Percentages sum to 100; source counts and source rows match the reference fixture.
6. The first homepage card navigates to the detail route with `next/link`; unsupported cards do not lead to broken routes.
7. Unknown `/news/<slug>` values render the Next.js not-found state.
8. Article-specific metadata uses the fixture title and summary.
9. Images are optimized, stable, appropriately described, and load without broken requests or layout shift.
10. The page remains server-rendered without unnecessary client JavaScript or any pipeline/auth/backend behavior.
11. `/`, `/news/iran-peace-proposal`, and `/design-system` render without TypeScript, ESLint, build, hydration, console, accessibility-label, or broken-image errors.

## Checks to run

Run from the project root and report exact results:

1. `npx tsc --noEmit` because `package.json` currently has no `typecheck` script.
2. `npm run lint`
3. `npm run build`
4. Confirm the production route table includes `/`, `/design-system`, and `/news/[slug]`, with the reference slug generated successfully.
5. `git diff --check`
6. Browser QA at approximately `1440px`, `863px`, `768px`, and `390px`, including console/hydration errors, overflow, focus order, and broken-image requests.

## Exact manual test steps expected after implementation

1. From `C:/Users/Myat Thiha Soe/OneDrive/Desktop/Viber Engineering/dev/ai-news-platform`, run `npm run dev`.
2. Open `http://localhost:3000/news/iran-peace-proposal`.
3. At approximately `863px` viewport width, compare against `03-news-details-page.png`: verify the two-tier header, two-column article/sidebar composition, title wrapping, hero/caption, meter, body rhythm, three sidebar panels, related stories, newsletter banner, and footer.
4. Resize to `768px` and `390px`; verify the layout becomes one column, metadata/actions wrap, images retain their aspect ratio, related stories and newsletter stack, body text remains readable, and there is no horizontal scroll.
5. Open `http://localhost:3000/`, activate the Trump/Iran article card with mouse and keyboard, and confirm it navigates to `/news/iran-peace-proposal`.
6. Open `http://localhost:3000/news/not-a-real-article` and confirm the not-found state renders.
7. Tab through the header, article actions, sidebar buttons, newsletter controls, and footer; confirm focus is visible and the order is logical.
8. Confirm framing is described as AI-estimated and that summary, sentiment, percentages, confidence, framing notes, loaded terms, and disclaimer are visible.
9. Open browser developer tools and confirm there are no console errors, hydration warnings, failed image requests, layout overflows, or unexpected network calls to auth, scraping, AI, database, newsletter, or feedback services.
10. Open `http://localhost:3000/design-system` and confirm the design-system showcase still renders unchanged.
