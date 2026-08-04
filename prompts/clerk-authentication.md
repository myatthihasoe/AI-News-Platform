# Biasly Clerk Authentication Implementation Prompt

## Goal

Add production-style Clerk authentication to the existing Biasly Next.js 16 App Router application.

The implementation must install the current `@clerk/nextjs` SDK, initialize Clerk globally, add the required Next.js 16 `proxy.ts`, provide dedicated `/sign-in` and `/sign-up` routes using Clerk's prebuilt components, and connect the existing header Login control to Clerk. Signed-in users should see Clerk's account/user control in place of Login. Existing news, article-details, and design-system routes must remain public.

This task is authentication-only. Do not add Supabase user synchronization, organizations, billing, subscriptions, custom auth flows, roles, permissions, webhooks, or private application data.

## Skills read

- `.agents/skills/clerk/SKILL.md` - Clerk task router and SDK version detection.
- `.agents/skills/clerk-setup/SKILL.md` - current Clerk setup, environment, provider placement, and Next.js requirements.
- `.agents/skills/clerk-nextjs-patterns/SKILL.md` - current server/client authentication boundaries.
- `.agents/skills/clerk-nextjs-patterns/references/server-vs-client.md` - `await auth()` for server resources versus Clerk client components/hooks.
- `.agents/skills/clerk-nextjs-patterns/references/middleware-strategies.md` - proxy matchers and public-first application structure.

Because `@clerk/nextjs` is not installed yet, use the current SDK installed by the package manager rather than Core 2 compatibility patterns. Use `Show`, not legacy `SignedIn`/`SignedOut`, unless the installed current SDK's actual exports require an adjustment.

## Official Clerk documentation reviewed

- `https://clerk.com/docs/nextjs/getting-started/quickstart`
- `https://clerk.com/docs/reference/nextjs/clerk-middleware`
- `https://clerk.com/docs/nextjs/guides/secure/protect-content`
- `https://clerk.com/docs/nextjs/reference/components/authentication/sign-in`
- `https://clerk.com/docs/nextjs/guides/development/custom-sign-in-or-up-page`
- `https://clerk.com/docs/nextjs/guides/development/custom-sign-up-page`
- `https://clerk.com/docs/guides/development/clerk-environment-variables`

Use the current official guidance:

- Next.js 16 uses a root-level `proxy.ts`, not `middleware.ts`.
- `clerkMiddleware()` provides auth state but does not protect routes by default.
- The matcher must exclude Next.js internals/static assets and include API, tRPC, and `/__clerk` traffic.
- Protect sensitive resources close to where data is read or mutated rather than relying on broad middleware-only checks.
- `ClerkProvider` belongs inside `<body>`.
- Dedicated auth pages use optional catch-all routes.

## Next.js 16 documentation read

- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- Relevant authentication and authorization guidance in `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
- Matcher, execution-order, and runtime guidance in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`

Use Proxy only for Clerk request/session integration. Do not treat Proxy as the sole security boundary for future protected data, Route Handlers, or Server Actions.

## Existing code inspected

- `package.json` and `package-lock.json` - Next.js 16.2.12, React 19.2.4, no existing auth SDK, and no `typecheck` script.
- `.env.local` - already contains the variable names `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`; values were not exposed or logged.
- `.gitignore` - ignores all `.env*` files and currently has no exception for `.env.example`.
- `app/layout.tsx` - root Poppins layout without `ClerkProvider`.
- `app/page.tsx` - public homepage.
- `app/news/[slug]/page.tsx` - public article-details route.
- `app/design-system/page.tsx` - public design-system route.
- `components/home/home-header.tsx` - shared server-rendered header with visual Subscribe and Login buttons.
- `components/home/home.module.css` - header action sizing and responsive states.
- `components/home/home-footer.tsx` - shared footer reusable on auth pages.
- `app/globals.css` - Biasly typography, color tokens, focus states, and responsive foundation.
- Current uncommitted news-details implementation - preserve all existing user/worktree changes and avoid unrelated refactors.

There is currently no Clerk package, provider, proxy/middleware, sign-in route, sign-up route, auth page shell, or protected business resource.

## Decisions and assumptions

1. The existing Clerk key variables in `.env.local` refer to the intended Clerk development application. Do not generate, rotate, replace, display, or commit their values.
2. Use the latest current `@clerk/nextjs` version resolved by `npm install @clerk/nextjs` and write the resolved version to `package.json`/`package-lock.json`.
3. Keep `/`, `/news/*`, `/design-system`, `/sign-in/*`, and `/sign-up/*` public. Biasly is a public news-reading product, and no private data resource currently exists.
4. Add `clerkMiddleware()` without deprecated `createRouteMatcher()` protection. When private pages, Route Handlers, Server Actions, or database reads are introduced later, protect each resource directly with awaited server-side Clerk auth.
5. Preserve the header's Subscribe button as a non-auth visual control. Replace only Login behavior:
   - signed out: show the existing styled Login button wrapped by Clerk's `SignInButton` in redirect mode;
   - signed in: show `UserButton` with an accessible appearance that fits the header.
6. Provide both dedicated `/sign-in` and `/sign-up` pages. The sign-in component must link to the local sign-up route and vice versa through environment configuration.
7. Add the non-secret route variables to `.env.local` without changing existing key lines:
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/`
8. Create a tracked `.env.example` containing empty Clerk key placeholders and the four non-secret route values. Add `!.env.example` to `.gitignore` so the example can be committed while real env files remain ignored.
9. Use Clerk's prebuilt `SignIn`, `SignUp`, and `UserButton` components. Do not implement passwords, OAuth, MFA, session cookies, or token storage manually.
10. Do not add `@clerk/ui` because the repository has no `components.json`/shadcn theme configuration and a full theme dependency is unnecessary. Use Clerk's `appearance` options and the existing CSS tokens for restrained visual alignment.
11. Keep the root layout and shared header as Server Components. Clerk's prebuilt control components may be rendered from them without adding a broad custom client boundary.
12. Add a `typecheck` package script (`tsc --noEmit`) so the repository's required `npm run typecheck` command is available.

## Files likely to change

- `package.json`
- `package-lock.json`
- `.gitignore`
- `.env.local` (non-secret Clerk route configuration only; remains ignored)
- `.env.example`
- `proxy.ts`
- `app/layout.tsx`
- `components/home/home-header.tsx`
- `components/home/home.module.css`
- `components/auth/auth-page-shell.tsx`
- `components/auth/auth-page.module.css`
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`

Do not change Supabase files, scraping, AI analysis, scheduling, article fixtures, news-details content, API routes, or the design-system implementation.

## Implementation requirements

1. Install `@clerk/nextjs` with the project's npm workflow and update both package manifests.
2. Add `"typecheck": "tsc --noEmit"` to `package.json` without changing existing scripts.
3. Wrap the existing root-layout children with `ClerkProvider` inside `<body>`:
   - `<html>` remains the outer root element;
   - preserve Poppins, metadata, and existing global styles;
   - do not enable unnecessary global dynamic rendering unless the installed Clerk SDK demonstrably requires it.
4. Create root-level `proxy.ts` using `clerkMiddleware()` and the latest official matcher:
   - skip Next.js internals and static files;
   - always match API/tRPC routes;
   - include `/__clerk/(.*)` as required by current Clerk guidance;
   - do not use deprecated `createRouteMatcher()` for this public-first app.
5. Update `HomeHeader` to render authenticated state with Clerk:
   - keep Subscribe visible according to the existing breakpoints;
   - use `Show when="signed-out"` for the styled Login button wrapped by `SignInButton`;
   - use `Show when="signed-in"` for `UserButton`;
   - preserve keyboard focus, button semantics, hit targets, layout stability, and mobile behavior;
   - avoid nested buttons or links.
6. Add `/sign-in/[[...sign-in]]` using Clerk's `SignIn` component.
7. Add `/sign-up/[[...sign-up]]` using Clerk's `SignUp` component.
8. Create a small reusable auth-page shell that uses the existing Biasly header/footer and centers the Clerk card on the light application canvas.
9. Add route-specific metadata for sign-in and sign-up pages.
10. Style the auth pages and Clerk components with the existing Poppins font, near-black primary action color, neutral borders, 6-8px radii, and visible focus states. Keep Clerk's accessible behavior intact.
11. Add/update Clerk environment configuration exactly as described in Decisions and assumptions. Never place real key values in `.env.example`.
12. Keep the existing news and design-system routes public and visually unchanged.
13. Do not create an account database table, Clerk webhook, Supabase user row, custom JWT template, organization, role, permission, billing plan, or admin route.

## Server/client and security requirements

- Never import `CLERK_SECRET_KEY` or any server-only environment value into browser code.
- Only `NEXT_PUBLIC_*` Clerk values may be exposed to the browser.
- Never print, inspect in output, commit, or return actual Clerk keys.
- Do not manually read or write Clerk session cookies.
- Do not implement authentication by UI visibility alone. Future protected resources must use `await auth()` or `await auth.protect()` from `@clerk/nextjs/server` at the page, handler, action, or data boundary.
- Do not use client hooks in Server Components or server imports in Client Components.
- Do not rely on `proxy.ts` as the sole authorization boundary.
- Keep `/sign-in` and `/sign-up` public and avoid redirect loops.
- Use fallback redirects to `/`; do not use user-controlled force redirects.
- Do not add analytics, user tracking, or user metadata synchronization.

## Visual and responsive requirements

- Preserve the current two-tier Biasly header and its desktop/mobile dimensions.
- Signed-out header should remain visually equivalent to the existing reference: Subscribe plus Login.
- Signed-in header should replace Login with a compact Clerk avatar/account control without shifting navigation or overflowing at 390px.
- Auth pages should use the existing warm off-white background, subtle radial light, Poppins typography, dark primary actions, neutral borders, and dark footer.
- Center the Clerk card in a responsive content area with comfortable vertical space.
- Use a single-column auth layout; do not add marketing panels, illustrations, testimonials, or other unrequested content.
- At mobile widths, retain at least 14px horizontal padding and avoid clipped Clerk dialogs or horizontal page scroll.

## Accessibility requirements

- Keep one logical page heading or Clerk-provided accessible title for each auth route.
- Preserve Clerk's built-in form labels, validation messages, password controls, and focus management.
- Give signed-in user controls an accessible label through Clerk configuration where supported.
- Preserve the global `:focus-visible` treatment for the Login wrapper button.
- Do not hide authentication status using color alone.
- Ensure header controls remain keyboard-accessible and are not nested interactive elements.
- Maintain WCAG AA contrast for the surrounding Biasly shell and custom Clerk appearance values.

## Acceptance criteria

1. `@clerk/nextjs` is installed at a current SDK version and package manifests remain consistent.
2. `ClerkProvider` wraps the application inside `<body>` and the app renders with valid configured keys.
3. Root-level `proxy.ts` uses `clerkMiddleware()` and the current static/API/`__clerk` matcher without deprecated route matchers.
4. Signed-out users see the existing Subscribe and Login header controls; Login navigates to `/sign-in`.
5. `/sign-in` and `/sign-up` render working Clerk prebuilt flows and link to one another.
6. Successful sign-in/sign-up falls back to `/` when no return URL exists.
7. Signed-in users see `UserButton`, can open Clerk account controls, and can sign out.
8. After sign-out, the header returns to the Login state.
9. `/`, `/news/iran-peace-proposal`, and `/design-system` remain public and visually unchanged except for the intentional authenticated header state.
10. Real Clerk keys remain only in ignored local environment files; `.env.example` contains placeholders only.
11. Auth pages are responsive and have no horizontal overflow at desktop, tablet, or 390px mobile widths.
12. There are no TypeScript, ESLint, build, proxy, hydration, console, or Clerk configuration errors.

## Checks to run

Run from the project root and report exact command results:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. Confirm the build route table includes `/`, `/design-system`, `/news/[slug]`, `/sign-in/[[...sign-in]]`, and `/sign-up/[[...sign-up]]`, and recognizes `proxy.ts`.
5. `git diff --check`
6. If the Clerk CLI is installed and the project is linked, run `clerk doctor --json`; otherwise report that it was unavailable rather than installing another tool.
7. Browser QA signed out and signed in at approximately 1440px, 768px, and 390px.
8. Confirm there are no browser console errors, hydration warnings, failed Clerk requests, redirect loops, or horizontal overflow.

## Exact manual test steps expected after implementation

1. Ensure `.env.local` contains valid values for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Do not paste them into chat or commit them.
2. Run `npm run dev` from `C:/Users/Myat Thiha Soe/OneDrive/Desktop/Viber Engineering/dev/ai-news-platform`.
3. Open `http://localhost:3000/` in a private/incognito window.
4. Confirm the homepage loads publicly and the header shows Subscribe and Login.
5. Select Login and confirm navigation to `http://localhost:3000/sign-in`.
6. Confirm the Clerk sign-in flow renders inside the Biasly header/footer shell and provides a link to `/sign-up`.
7. Open `http://localhost:3000/sign-up`, create a development user with an enabled method from the configured Clerk instance, and confirm fallback navigation to `/`.
8. Confirm the signed-in header shows the Clerk user/account button instead of Login.
9. Open the user button, verify account controls render, then sign out and confirm Login returns.
10. While signed out, open `/news/iran-peace-proposal` and `/design-system`; confirm both remain public.
11. Resize `/`, `/sign-in`, and `/sign-up` to approximately 768px and 390px; confirm no clipped auth forms, header overlap, or horizontal page overflow.
12. Open browser developer tools and confirm there are no console errors, hydration warnings, Clerk configuration errors, failed Clerk network requests, or redirect loops.
