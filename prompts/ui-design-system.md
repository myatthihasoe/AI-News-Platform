# Biasly UI Design System Implementation Prompt

## Goal

Implement the attached `01-ui-design-system.png` reference as Biasly's reusable visual foundation and render a polished, responsive design-system showcase on the current home route (`/`). Replace the starter “Home” output with a faithful interpretation of the reference without adding product features, data access, authentication, scraping, or AI behavior.

The result should feel like a production editorial design system: restrained monochrome surfaces, Poppins typography, precise spacing, fine neutral borders, red/gray/blue political-framing semantics, and reusable UI primitives for future news pages.

## Reference reviewed

- `C:/Users/myatthihasoe/Downloads/01-ui-design-system.png`
- The reference is a desktop design-system board containing brand, colors, typography, buttons, chips, a bias meter, icons, a news-card example, spacing, grid, shadows, border radii, and a dark footer.

## Skills read

- No specialty skill was needed. Per `AGENTS.md`, this UI-only task uses the project’s installed Next.js documentation and existing Tailwind setup rather than Clerk, Supabase, Oxylabs, or AI SDK skills.

## Next.js documentation read

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`

Use the App Router conventions documented there, keep global CSS in the root layout, use Tailwind CSS v4 through the existing PostCSS setup, and load Poppins through `next/font/google` so the browser makes no direct Google Fonts request.

## Existing code inspected

- `app/page.tsx` — currently renders only `Home`.
- `app/layout.tsx` — starter root layout using Geist and starter metadata.
- `app/globals.css` — starter Tailwind import, minimal colors, Arial fallback, and an automatic dark-mode override.
- `package.json` — Next.js 16.2.12, React 19.2.4, Tailwind CSS 4; no component or icon library is installed.
- `postcss.config.mjs` — already configured with `@tailwindcss/postcss`.
- `next.config.ts` — no image or other custom configuration.
- `tsconfig.json` — strict TypeScript and the `@/*` path alias are available.
- `public/` — only starter Next.js SVG assets exist.

## Decisions and assumptions

1. “Implement the app design system” means both codifying reusable tokens/primitives and displaying them as the root-page showcase shown in the reference. It does not mean building the final news feed or details experience yet.
2. Use a responsive, semantic HTML implementation rather than embedding the reference image.
3. Keep the page a Server Component; the showcase has no stateful behavior requiring `use client`.
4. Do not install a dependency solely for icons. Create a small, typed, accessible inline SVG icon set with consistent 2px strokes and rounded line caps/joins.
5. The news-card image is illustrative. Use a local, project-owned editorial placeholder asset or a CSS-rendered editorial image treatment so the page has no remote-image dependency and no `next.config.ts` change is needed. Preserve the image shape, hierarchy, and information icon from the reference.
6. Preserve the reference’s light-only visual direction. Remove the starter automatic dark-mode token override; the dark footer remains intentionally dark.
7. Use reusable components for the primitives demonstrated in the board, but keep the implementation compact. Avoid adding a general-purpose component framework, state library, or unrelated abstraction.
8. Pixel accuracy is evaluated against the visual language and layout proportions of the reference, while allowing the board to reflow cleanly on smaller viewports.

## Files likely to change

- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/page.module.css` (if scoped layout styling is clearer than very long utility strings)
- `components/design-system/brand-mark.tsx`
- `components/design-system/primitives.tsx` (or a similarly small set of focused files for button, chip, bias meter, news card, panel, and icons)
- `public/news-card-placeholder.svg` only if a local illustration is used

Do not change API routes, database files, environment files, or server integrations.

## Visual interpretation

### Overall canvas and layout

- Use a warm/off-white canvas close to `#F6F6F6` with near-black primary text.
- Desktop composition: a centered container with a maximum width around 1280px, 24px outer margins, a 12-column grid, 24px gutters, and a compact bento-board arrangement matching the reference.
- Major desktop regions:
  - left column: Brand, Colors, Spacing System;
  - center: Typography, Icons, Grid System;
  - right: UI Elements, Card Example, Shadows, Border Radius;
  - footer spanning the full width.
- Use thin neutral panel borders and 8–12px panel radii. Panel headings are uppercase, bold, and separated from content with a hairline divider.
- Maintain dense but breathable proportions. Panels should align cleanly across rows and avoid uneven accidental gaps.

### Responsive behavior

- `>= 1100px`: preserve the reference-like multi-column bento layout.
- `768px–1099px`: use a two-column layout, letting wide sections span both columns when helpful.
- `< 768px`: stack panels in a logical reading order with 16px page padding and 16px gaps.
- Tables or type-spec rows must remain readable on mobile using compact grid reflow or controlled horizontal overflow without clipping the page.
- The example news card is horizontal on wider screens and stacks its image above the content on narrow screens.
- The footer stacks into multiple lines on mobile while retaining generous spacing and clear alignment.

### Brand

- Render a reusable text-based Biasly mark: large lowercase `biasly` with `News` tucked below/right, following the reference’s compact lockup.
- Include the tagline: “Balanced news coverage, powered by AI.”
- The lockup must work in both dark-on-light and light-on-dark variants for the board and footer.

### Color tokens

Represent colors as CSS custom properties and expose them through Tailwind v4 `@theme inline` tokens where useful.

- `--color-text-primary: #0D0D0F`
- `--color-text-secondary: #6B7280`
- `--color-surface: #F6F6F6`
- `--color-left-bias: #B42318`
- `--color-center-bias: #E5E7EB`
- `--color-right-bias: #1D4ED8`
- `--color-bg-primary: #FFFFFF`
- `--color-bg-secondary: #F0F0F0`
- `--color-border: #E5E7EB`
- `--color-divider: #E5E7EB`

Show each token as a labeled swatch, including its hex value. Make sure red and blue label text has sufficient contrast when used on filled backgrounds.

### Typography

- Load Poppins using `next/font/google` and expose it as the global sans-serif variable.
- Use these reference scales:
  - H1: 32px, 700, line-height 1.2;
  - H2: 24px, 600, line-height 1.3;
  - H3: 20px, 600, line-height 1.3;
  - H4: 16px, 500, line-height 1.4;
  - Body Large: 16px, 400, line-height 1.6;
  - Body Medium: 14px, 400, line-height 1.6;
  - Body Small: 13px, 400, line-height 1.6;
  - Caption: 11px, 400, line-height 1.4.
- Recreate the typography specimen with family description, style labels, sample purpose, size, weight, and line-height.

### Spacing, grid, shadows, and radii

- Spacing scale: 4, 8, 16, 24, 32, 40, and 64px, visualized with proportional lavender blocks as in the reference.
- Grid specimen: 1280px container, 12 columns, 24px gutters, 24px margins. Visualize it with 12 translucent lavender columns.
- Shadows:
  - small: `0 1px 2px rgba(0, 0, 0, 0.05)`;
  - medium: `0 4px 12px rgba(0, 0, 0, 0.08)`;
  - large: `0 12px 24px rgba(0, 0, 0, 0.12)`.
- Radius tokens: 4px, 8px, 12px, and 9999px.

## Component requirements

### Panel primitive

- Reusable bordered section container with accessible heading markup.
- Supports normal and compact padding and optional custom class names without using `any`.

### Buttons

- Primary: near-black fill and white text.
- Secondary: white/transparent fill with neutral border and dark text.
- Text button: no box; default and blue hover/active treatment.
- Demonstrate default, hover, outline, and disabled states.
- Use actual `<button>` elements, native `disabled`, visible keyboard focus, and a minimum practical hit target.
- Hover demonstrations may be visually represented in the matrix while real buttons also have interactive hover/focus styles.

### Chips/categories

- Pill-shaped neutral chips for “World Cup,” “IPL,” “Business & Markets,” and “More.”
- Include a plus icon or character with decorative parts hidden from assistive technology where appropriate.
- Provide hover/focus-visible styling and button semantics.

### Bias meter

- Reusable typed component accepting left, center, and right percentages.
- Render three proportional segments in red, light gray, and blue.
- Include segment labels, endpoint/center scale labels, and a screen-reader-friendly summary.
- Use the reference demo values of 25/50/25 in the UI Elements panel and 25/50/25 in the news card unless the card copy explicitly calls for another valid total. Values must always sum to 100.
- Avoid encoding meaning by color alone: retain text labels inside segments.

### Icon specimen

- Implement the visible families from the reference: menu, search, bookmark, clock, info, share/upload, external link, calendar, analytics, tag, user, bell, sliders, check-circle, and more.
- Consistent 2px stroke, rounded caps, rounded joins, and a 24px coordinate system.
- Decorative showcase icons should be `aria-hidden`; icon-only interactive elements require accessible names.

### News card

- Recreate the reference hierarchy with media, category/location eyebrow, headline, summary, compact bias meter, timestamp, bookmark, reading time, and an information marker over the image.
- Representative copy may follow the reference, but the component should accept typed props so it is reusable with future Supabase article data.
- Use semantic `<article>`, heading, time, and accessible metadata markup.
- The card must not fetch, scrape, analyze, or mutate any data.

### Footer

- Full-width, near-black rounded footer matching the reference.
- Include the white Biasly mark, tagline, “Design System v1.0,” “June 1, 2026,” and “Stay consistent. Stay unbiased.”
- Align content horizontally on desktop and stack cleanly on mobile.

## Implementation requirements

1. Keep `app/page.tsx` as a Server Component with static specimen data defined outside the render body where appropriate.
2. Update `app/layout.tsx` to use Poppins, set production-appropriate Biasly metadata, and retain required `<html>`/`<body>` structure.
3. Define foundational global tokens, reset behavior, body defaults, focus-visible styling, and text rendering in `app/globals.css`.
4. Prefer Tailwind utilities for ordinary layout and spacing; use a CSS Module for complex bento-area placement, responsive specimen grids, and component-state demonstrations if that is clearer.
5. Extract reusable UI primitives rather than duplicating button, panel, meter, logo, or icon markup throughout the showcase.
6. Use strict TypeScript, explicit prop types, and no `any`.
7. Avoid client JavaScript when CSS can provide the demonstrated interactions.
8. Do not install packages unless implementation reveals a concrete need that cannot be met by the current stack.
9. Do not copy or embed the entire reference image as the rendered UI.
10. Do not change unrelated files or implement final application features outside this design-system task.

## Security and privacy requirements

- No environment variables, credentials, service-role values, scraping calls, AI calls, or external API requests.
- No remote runtime asset dependency is required for the specimen.
- Keep the implementation server-rendered and static except for native browser CSS states.
- If a local SVG illustration is added, it must contain no script, external references, or embedded remote content.

## Accessibility requirements

- Semantic section/article/table-or-list structures and a logical heading order.
- All controls keyboard reachable, with obvious `:focus-visible` treatment.
- Disabled controls use the native disabled attribute.
- Color contrast should meet WCAG AA for ordinary text.
- Bias meaning is conveyed with visible text in addition to color.
- Decorative SVGs are hidden from assistive technology; meaningful icon-only controls have accessible labels.
- Respect `prefers-reduced-motion`; avoid unnecessary animation.

## Acceptance criteria

1. `/` displays a polished design-system board recognizably matching the attached reference’s hierarchy, palette, density, and component styling.
2. Poppins is applied globally through `next/font/google` with no browser-side Google Fonts request.
3. All documented color, type, spacing, grid, shadow, and radius tokens are represented visually and defined for reuse.
4. Reusable brand, panel, button, chip, bias meter, icon, and news-card primitives exist with typed props.
5. The desktop layout uses a reference-like multi-column bento composition and the page has no overflow at common widths.
6. Tablet and mobile layouts reflow without clipped text, controls, tables, meters, or card content.
7. Keyboard focus, disabled states, semantic markup, and non-color bias labels are present.
8. The page contains no pipeline, API, auth, Supabase, Oxylabs, or AI logic.
9. No console errors, hydration warnings, TypeScript errors, ESLint errors, or production build failures.

## Checks to run

Run from the project root and report the exact output/status:

1. `npx tsc --noEmit` because the current `package.json` does not yet define a `typecheck` script.
2. `npm run lint`
3. `npm run build` because the change affects the root layout, font loading, styling, and page output.

Also inspect the page in the browser at representative widths (approximately 1440px, 1024px, 768px, and 390px) and check the browser console for errors or hydration warnings.

## Exact manual test steps expected after implementation

1. From `C:/Users/myatthihasoe/Desktop/AI News Platform/dev`, run `npm run dev`.
2. Open `http://localhost:3000`.
3. At a wide desktop viewport, compare the panel hierarchy, Poppins typography, off-white canvas, thin borders, brand lockup, token swatches, typography table, controls, three-color bias meter, icon grid, horizontal news card, spacing/grid specimens, shadows, radii, and footer against `01-ui-design-system.png`.
4. Resize to approximately 1024px and confirm the layout becomes a clean two-column composition with no overlaps or horizontal page scrolling.
5. Resize to approximately 390px and confirm all panels stack, type specimens remain legible, the news card image moves above its content, meter labels remain readable, and the footer stacks cleanly.
6. Use only the keyboard to tab through buttons, chips, and icon controls; confirm focus is visible and disabled buttons are not actionable.
7. Hover interactive controls and confirm primary, secondary, text, and chip treatments match the system’s subtle state changes.
8. Open browser developer tools, confirm there are no console errors or hydration warnings, and confirm the font is served by the app rather than requested directly from Google.

