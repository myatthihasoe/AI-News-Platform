# Homepage review fixes

## Goal

Resolve the two verified homepage review findings with the smallest possible change:

1. Make the news grid use two columns at widths around 1024px while preserving the current single-column mobile behavior and grid sizing.
2. Remove misleading `#top-news` footer links, using real destinations only when they exist and otherwise rendering labels/icons as non-interactive content.

## Skills read

- No project skill is needed for these narrowly scoped CSS and React corrections.
- The installed Next.js layouts and pages guide was reviewed because this project uses a version of Next.js with local documentation that must be consulted before code changes.

## Existing code inspected

- `AGENTS.md`
- `app/page.module.css`
- `components/home/home-footer.tsx`
- `components/home/home.module.css`
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- Current route and repository searches for `#top-news`, footer labels, social destinations, and `.newsGrid`

## Verified findings

- **Valid:** `app/page.module.css` switches from three columns to two only at `max-width: 900px`, so a viewport around 1024px still uses three columns.
- **Valid:** `components/home/home-footer.tsx` gives company, help, and social items the same `#top-news` target even though that fragment is not their destination.
- The current app contains no implemented About, Careers, Press, Contact, Help Center, Guides, Privacy Policy, or Terms of Service routes, and it contains no configured Biasly social account URLs. These destinations must not be invented.

## Decisions and assumptions

- Change the two-column media query to `max-width: 1024px`.
- Keep the existing `repeat(2, minmax(0, 1fr))` grid definition unchanged.
- Keep the existing `max-width: 620px` single-column rule unchanged so narrower-screen behavior still overrides the tablet rule.
- Represent footer items with optional destinations. Render an anchor only when a real destination is present; otherwise render visually consistent non-interactive text.
- Because no real footer or social destinations currently exist in the repository, render those current labels/icons non-interactively instead of creating broken or misleading links.
- Preserve the footer's current appearance and accessible labels for icon-only social items.

## Files likely to change

- `app/page.module.css`
- `components/home/home-footer.tsx`
- `components/home/home.module.css` only if selectors need a minimal adjustment so non-anchor footer content retains the existing styling

## Implementation requirements

- Use a two-column news grid at viewport widths of 1024px and below.
- Preserve the existing one-column layout at 620px and below.
- Preserve the current gaps, `minmax(0, 1fr)` sizing, and all unrelated homepage styling.
- Remove every footer `href="#top-news"` placeholder.
- Render footer anchors only for destinations that are actually configured.
- Render items without destinations, including Privacy Policy, Terms of Service, and social labels/icons, as non-interactive elements.
- Keep the JSX typed without `any` and avoid unrelated component refactors.
- Preserve keyboard and screen-reader semantics: non-links must not appear in the tab order or announce themselves as links, and social icons must retain meaningful accessible labels.

## Security requirements

- Do not introduce external URLs or account handles that are not already configured by the project.
- Do not expose credentials, environment variables, or server-only data.

## Acceptance criteria

- At 1024px viewport width, the homepage news grid has two columns.
- Above 1024px, the grid has three columns.
- At 620px and below, the grid has one column.
- Footer content no longer contains any `#top-news` placeholder links.
- Items without a verified destination are non-interactive and visually consistent with the current footer.
- No unrelated files or behavior change.
- TypeScript, ESLint, and the production build pass.

## Checks to run

- `git diff --check`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Search the rendered footer and source for remaining `#top-news` placeholders.
- Visually inspect the homepage at desktop, 1024px, tablet, and mobile widths.

## Exact manual test steps

1. Run `npm run dev` from the project root.
2. Open `http://localhost:3000/`.
3. Set the viewport to 1024px wide and confirm the news cards render in two columns.
4. Set the viewport above 1024px and confirm the news cards render in three columns.
5. Set the viewport to 620px or narrower and confirm the news cards render in one column.
6. Scroll to the footer and use Tab navigation. Confirm unavailable footer and social items do not receive focus and do not behave as links.
7. Inspect the footer DOM and confirm no anchor points to `#top-news`.
8. Confirm `/design-system` still loads and is unaffected.
