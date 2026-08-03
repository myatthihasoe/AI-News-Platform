# Biasly Homepage UI Implementation Prompt

## Goal

Implement the attached `02-homepage.png` as the Biasly home page at `/`, using the existing design-system tokens and primitives while preserving the completed `/design-system` route.

The result should be a polished, responsive editorial homepage with the reference’s two-level header, category rail, “Top News” card grid, AI-estimated political-framing meters, and dark footer. This task is UI-only: do not add authentication behavior, subscriptions, scraping, AI analysis, API routes, or database mutations.

## Reference reviewed

- `C:/Users/myatthihasoe/Downloads/02-homepage.png`
- The reference is a 1024×1536 desktop homepage showing:
  - a slim black utility bar;
  - a primary navigation bar with Biasly logo, navigation, Subscribe, and Login;
  - a horizontally scrollable category-chip rail;
  - a centered three-column grid of 12 article cards;
  - compact left/center/right framing meters and source counts;
  - a full-width dark footer with company, help, and social sections.

## Skills read

- No specialty skill is required for this UI-only task. Clerk, Supabase, Oxylabs, and AI SDK behavior are explicitly out of scope.

## Next.js documentation read

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`

Use the App Router, Server Components by default, scoped CSS Modules for page/component styling, and `next/image` for editorial images.

## Existing code inspected

- `app/layout.tsx` — global Poppins font and generic Biasly metadata.
- `app/globals.css` — Biasly colors, shadows, radii, font token, focus behavior, and light canvas.
- `app/design-system/page.tsx` and `app/design-system/page.module.css` — completed showcase that must remain unchanged.
- `components/design-system/primitives.tsx` — reusable `BrandMark`, `Button`, `Chip`, `BiasMeter`, and design-system news-card primitives.
- `components/design-system/icons.tsx` — reusable line icons including menu, info, globe-compatible shapes, and social/navigation-adjacent icons.
- `components/design-system/design-system.module.css` — current primitive styling.
- `next.config.ts` — currently has no image-host configuration.
- `package.json` — Next.js 16.2.12, React 19.2.4, Tailwind CSS 4; no Clerk, Supabase, or icon package is currently installed.
- There is currently no `app/page.tsx`, Supabase client, article query layer, auth integration, or article-detail route.

## Decisions and assumptions

1. This request is interpreted as a visual homepage implementation, not a backend-data integration task.
2. Because the repository has no Supabase/query layer yet, use a typed in-module preview fixture containing the 12 reference articles. Keep it isolated from the components so it can be replaced by a Supabase server query without redesigning the UI. It is fixture content, not local JSON application storage.
3. Use the article copy, categories, regions, framing percentages, and source counts visible in the reference.
4. Use 12 distinct, stable editorial stock-photo URLs from `images.unsplash.com` as visual stand-ins because individual source images were not supplied. Configure a narrowly scoped Next.js `remotePatterns` entry. Do not copy or embed the whole reference screenshot into the UI.
5. Render Login, Subscribe, theme choices, location, edition, secondary navigation items, footer links, and social icons as accessible visual controls/links only. Do not invent Clerk, billing, theme persistence, geolocation, or destination routes in this task.
6. Keep the page as a Server Component. Use CSS for hover, focus, scrolling, and responsive behavior; no `use client` is needed.
7. Extend the existing `BiasMeter` with an optional short-label mode (`L`, `Center`, `Right`) if necessary for narrow card segments. Its default output must remain unchanged so `/design-system` is visually unaffected.
8. Use semantic elements and real controls, while avoiding fake navigation to unimplemented routes.

## Files likely to change

- `app/page.tsx`
- `app/page.module.css`
- `components/home/home-header.tsx`
- `components/home/category-rail.tsx`
- `components/home/home-news-card.tsx`
- `components/home/home-footer.tsx`
- `components/home/home.module.css` (or a similarly focused shared CSS Module)
- `components/design-system/primitives.tsx` only if adding an optional short-label meter mode
- `next.config.ts` for a narrow `images.unsplash.com` remote image pattern

Do not modify the `/design-system` page or stylesheet, API routes, database files, environment files, auth files, scraping logic, AI logic, or scheduling logic.

## Visual interpretation

### Overall page

- Warm off-white background using the existing surface token.
- Near-black text, subtle gray borders, restrained shadows, and Poppins throughout.
- Main content container approximately 1280px maximum width with 24px desktop side padding.
- Dense editorial proportions matching the reference; avoid oversized modern-card spacing.

### Utility bar

- Approximately 28–32px tall with a near-black background and white/gray 10–11px text.
- Left group: “Browser Extension”, divider, “Theme: Light Dark Auto”.
- Right group: “Monday, June 1, 2026”, divider, “Set Location”, globe icon, “International Edition”, chevron.
- Desktop groups align to opposite edges of the shared content container.
- On mobile, hide lower-priority items and keep a concise edition/theme presentation without overflow.

### Primary navigation

- Approximately 60px tall, white/off-white background, bottom border.
- Menu icon, compact Biasly News lockup, and nav items: Home, For You with a small red notification dot, Local, Blindspot.
- Home is active with a short dark underline at the bottom.
- Subscribe is a filled black button; Login is an outlined button.
- Collapse nonessential nav labels below tablet width while retaining menu, logo, and actions.
- At narrow mobile widths, reduce action padding or hide Subscribe while keeping Login/menu accessible.

### Category rail

- Separate bordered row approximately 44px tall.
- Horizontal scroll with no wrapped chips.
- Leading add icon followed by: World Cup, IPL, Social Media, Business & Markets, Health & Medicine, Soccer, Artificial Intelligence, Arsenal FC, and Extreme Weather and Disasters.
- Neutral gray pill chips with compact plus marks and subtle hover/focus states.
- Hide the scrollbar visually without preventing keyboard/touch scrolling.

### Main content

- “Top News” H1 near 24–28px, bold, with approximately 28–36px space above the grid.
- Three equal columns on desktop with roughly 20–24px gaps.
- Two columns on tablet and one column on mobile.
- Keep card heights visually consistent within each row while allowing long headlines to wrap naturally.

### Article cards

- Semantic `<article>` with a 16:9 media region and compact content below.
- 1px neutral border, 6–8px radius, white/translucent surface, minimal shadow.
- Optimized image fills the media area using `object-fit: cover`.
- Circular information icon overlays the top-right image corner.
- Eyebrow text: category, centered dot, region.
- Headline approximately 15–17px, 600 weight, tight 1.25–1.35 line-height.
- Compact framing meter near the bottom, always containing text labels as well as red/gray/blue color.
- Source count at the bottom in 10–12px text.
- Meter values must match the reference and sum to 100 for every fixture.
- Add a screen-reader summary identifying the meter as AI-estimated political framing.

### Footer

- Full-width near-black background after the news grid.
- Centered content with compact Biasly white mark and tagline at left.
- Columns for Company and Help, and a Connect area with simple accessible social icon links.
- Bottom rule and copyright: “© 2026 Biasly News. All rights reserved.”
- Stack into two columns on tablet and a single compact layout on mobile.

## Reference fixture content

Use these 12 cards in this order:

1. Politics · United States — “Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report” — 20/31/49 — 12 sources.
2. Health · United States — “Researchers Make Case for Grapes as a ‘Superfood’ After Review of Health Evidence” — 18/42/40 — 7 sources.
3. Science · Switzerland — “CERN Finds High-Significance Hint of Physics Beyond Standard Model” — 16/62/22 — 8 sources.
4. World · Nicaragua — “Indigenous Leader Brooklyn Rivera Dies in Nicaragua After Nearly 3 Years of Detention” — 54/28/18 — 63 sources.
5. World · Middle East — “UN Security Council to Hold Emergency Meeting as Israel Pushes Deeper into Lebanon” — 22/33/45 — 15 sources.
6. Business · Global — “Oil Prices Dip as OPEC+ Considers Output Increase Amid Weak Demand” — 23/50/27 — 11 sources.
7. Technology · United States — “SpaceX Launches Starship Test Flight in Milestone for Mars Program” — 12/45/43 — 9 sources.
8. Business · United States — “Apple Unveils AI-Powered Features Across iPhone, iPad and Mac” — 15/40/45 — 10 sources.
9. Climate · Global — “2025 on Track to Be Among Top 3 Hottest Years, EU Climate Service Says” — 33/34/33 — 14 sources.
10. Economy · United States — “Fed Holds Rates Steady, Signals Caution on Inflation and Growth Outlook” — 30/44/26 — 13 sources.
11. Soccer · Europe — “Real Madrid Win Champions League After Comeback Victory in Final” — 10/20/70 — 26 sources.
12. Environment · Canada — “Wildfires Force Thousands to Evacuate Across Western Canada” — 27/33/40 — 17 sources.

## Implementation requirements

1. Add `app/page.tsx` as the root home page and export appropriate homepage metadata if needed.
2. Define explicit TypeScript types for the homepage article fixture and all component props; do not use `any`.
3. Keep static fixture data outside the component render body.
4. Extract header, category rail, card, and footer into small reusable components.
5. Reuse `BrandMark`, `Chip`, `BiasMeter`, and `Icon` where their existing API and styling fit; extend primitives only backward-compatibly.
6. Use `next/image` with meaningful alt text, `fill`, responsive `sizes`, and a positioned media container to prevent layout shift.
7. Add only the narrow image-host configuration required by the selected stock-image provider.
8. Use semantic `header`, `nav`, `main`, `section`, `article`, `footer`, headings, lists, and buttons/links.
9. Do not add client state, mock API endpoints, local JSON files, data fetching, auth flows, scraping, analysis, or article-detail navigation.
10. Preserve `/design-system` and its visual output.

## Security and privacy requirements

- No environment variables or credentials.
- No Supabase service role, Oxylabs, OpenAI, Clerk, scheduler, or admin-secret usage.
- No browser-side pipeline behavior.
- Remote images are display-only and restricted to the exact configured host.
- No external scripts, analytics, tracking pixels, or embedded third-party widgets.

## Accessibility requirements

- Logical heading order with one H1 for “Top News”.
- Navigation and category rail have accessible labels.
- Icon-only controls have accessible names; decorative icons are hidden.
- Buttons and links have visible `:focus-visible` styles and practical hit targets.
- Information is not encoded by color alone; bias segments retain visible text and a screen-reader summary.
- Image alt text describes the editorial subject rather than repeating the entire headline.
- Maintain WCAG AA contrast for text and control states.
- Respect the existing reduced-motion behavior.

## Acceptance criteria

1. `/` renders a homepage recognizably matching `02-homepage.png` in hierarchy, density, typography, layout, colors, cards, meters, and footer.
2. Desktop shows three card columns, tablet two, and mobile one without horizontal page overflow.
3. The utility bar, main navigation, category rail, 12 cards, and footer are all present.
4. Every meter’s percentages sum to 100 and include visible text labels.
5. Editorial images render without layout shift or broken requests.
6. The page is server-rendered with no unnecessary client bundle.
7. `/design-system` remains available and visually unchanged.
8. There are no TypeScript, ESLint, production-build, console, hydration, or accessibility-label errors.

## Checks to run

Run from the project root and report the exact output/status:

1. `npx tsc --noEmit` because `package.json` currently has no `typecheck` script.
2. `npm run lint`
3. `npm run build`
4. Confirm the production route table includes both static `/` and `/design-system`.
5. `git diff --check`
6. Browser QA at approximately 1440px, 1024px, 768px, and 390px, including console warnings/errors and broken-image checks.

## Exact manual test steps expected after implementation

1. Run `npm run dev` from `C:/Users/myatthihasoe/Desktop/AI News Platform/dev`.
2. Open `http://localhost:3000/`.
3. At desktop width, confirm the two header bars, category rail, three-column 12-card grid, compact meters, and dark footer match the reference.
4. Resize to approximately 1024px and 768px; confirm the navigation compresses, cards use two columns, and content does not overlap.
5. Resize to approximately 390px; confirm the page uses one card column, the category rail scrolls horizontally, key header actions remain usable, and the footer stacks.
6. Tab through the header controls, category chips, and footer links; confirm focus remains visible.
7. Confirm each image loads and each card displays category, region, headline, framing meter, and source count.
8. Open browser developer tools and confirm there are no console errors, hydration warnings, broken-image requests, or direct browser requests to Google Fonts.
9. Open `http://localhost:3000/design-system` and confirm the design-system showcase still renders unchanged.

