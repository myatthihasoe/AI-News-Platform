# Move Biasly Design System to `/design-system`

## Goal

Move the existing Biasly design-system and responsive showcase from the root route (`/`) to `/design-system`, preserving its implementation and appearance while leaving the root route available for the future home page.

## Skills read

- No specialty skill is required. This is a Next.js App Router file-routing change and does not involve Clerk, Supabase, Oxylabs, or the AI SDK.

## Next.js documentation read

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`

The guide confirms that `app/design-system/page.tsx` maps to `/design-system` and that removing `app/page.tsx` removes the root page route.

## Existing code inspected

- `app/page.tsx` — the complete Biasly design-system showcase currently served at `/`.
- `app/page.module.css` — scoped responsive styles imported by the showcase.
- `app/layout.tsx` — global Poppins setup and metadata currently titled specifically for the design system.
- `app/globals.css` — global Biasly design tokens and baseline styles; these must remain global and unchanged.
- `components/design-system/icons.tsx`
- `components/design-system/primitives.tsx`
- `components/design-system/design-system.module.css`
- Current Next.js file-routing guidance in the installed Next.js 16.2.12 documentation.

## Decisions and assumptions

1. Relocate the existing page and its CSS Module into a new `app/design-system/` route segment.
2. Do not duplicate the showcase code and do not redirect `/` to `/design-system`, because `/` is reserved for the upcoming home page.
3. Do not add a temporary home-page placeholder. Until the home page is implemented, `/` may resolve through Next.js's normal not-found behavior.
4. Preserve global design tokens, Poppins loading, reusable components, responsive breakpoints, and visual output exactly.
5. Move design-system-specific metadata to the `/design-system` page and make root-layout metadata product-generic so it will not incorrectly label tomorrow's home page as “Biasly Design System.”

## Files likely to change

- Move `app/page.tsx` to `app/design-system/page.tsx`.
- Move `app/page.module.css` to `app/design-system/page.module.css`.
- Update `app/design-system/page.tsx` to export route-specific metadata.
- Update `app/layout.tsx` with generic Biasly metadata.

The following remain unchanged:

- `app/globals.css`
- `components/design-system/*`
- API, database, authentication, scraping, scheduling, and AI files.

## Implementation requirements

1. Create the `app/design-system/` route segment.
2. Relocate the current page implementation and its colocated CSS Module without changing the markup, component data, styling, or responsive behavior.
3. Keep all existing `@/components/design-system/*` imports working.
4. Export `Metadata` from `app/design-system/page.tsx` with the design-system title and description.
5. Change root layout metadata to generic Biasly product metadata suitable for future routes.
6. Remove the current root `app/page.tsx` and `app/page.module.css` after the route move so the design-system page is not duplicated at `/`.
7. Do not add a redirect, rewrite, navigation item, or placeholder home page.

## Visual requirements

- `/design-system` must render pixel-for-pixel equivalently to the current `/` showcase.
- Typography, colors, spacing, grid, panels, buttons, chips, bias meters, icons, card example, footer, and CSS-rendered editorial illustration must remain unchanged.
- Desktop, tablet, and mobile reflow must remain unchanged.

## Security requirements

- No environment variables, credentials, remote requests, API calls, database access, scraping, or AI calls.
- Preserve server rendering and avoid new client-side JavaScript.

## Acceptance criteria

1. `http://localhost:3000/design-system` renders the full existing Biasly design-system showcase.
2. `http://localhost:3000/` no longer renders the design-system showcase and has no redirect to `/design-system`.
3. There is only one source copy of the showcase page and its route-scoped stylesheet.
4. Design-system-specific metadata is served on `/design-system`; root metadata is generic Biasly metadata.
5. The `/design-system` page remains responsive and visually unchanged.
6. TypeScript, ESLint, production build, and route checks pass.

## Checks to run

Run from the project root and report the exact status:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`
4. Confirm the production build route table includes static `/design-system` and does not include a static `/` page.
5. Run `git diff --check`.

## Exact manual test steps expected after implementation

1. Run `npm run dev` from `C:/Users/myatthihasoe/Desktop/AI News Platform/dev`.
2. Open `http://localhost:3000/design-system` and confirm the complete Biasly design-system board renders.
3. Check the design-system page at desktop and mobile widths and confirm its layout matches the previous implementation.
4. Open `http://localhost:3000/` and confirm the design-system board is no longer rendered and the browser is not redirected to `/design-system`.
5. Confirm the `/design-system` document title identifies the Biasly design system.
6. Confirm the browser console has no errors or hydration warnings.

