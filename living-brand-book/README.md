# Living Brand Book (Wigo4it)

Baseline Next.js App Router project for the Living Brand Book implementation.

## Scripts

- `npm run dev`: start local development server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks
- `npm run test`: run Vitest test runner (pass when no tests exist yet)
- `npm run preflight`: lint + typecheck + test

## Baseline Route Behavior

- `/` redirects to `/het-merk`
- `/het-merk` bevat nu route- en sectie-structuur voor de app-shell
- `/design-system` is toegevoegd als placeholder route met sectie-ankers

## App Shell Navigation And Toggles (Task 03)

- Globale layout bevat:
	- sticky hoofdnavigatie met links naar `/het-merk` en `/design-system`
	- route-specifieke subnavigatie met anchorlinks naar secties op de actieve pagina
	- twee aparte toggles:
		- dark mode (`Schakel dark mode`)
		- pixel-modus (`Schakel pixel modus`)
- Dark mode en pixel-modus functioneren onafhankelijk van elkaar.
- Beide toggle-states worden client-side bijgehouden via `UiModeProvider` en bewaard in `localStorage`.
- De provider zet globale HTML-datasets:
	- `data-theme="light|dark"`
	- `data-pixel-mode="off|on"`

## Installed Baseline Dependencies

- Next.js App Router + TypeScript
- Tailwind CSS v4 packages (setup in following task)
- Framer Motion
- Vitest + Testing Library + jsdom

## Theme And Tokens (Task 02)

- Tailwind v4 CSS-first theme tokens are defined in `app/globals.css` using `@theme`.
- Included color tokens:
	- `dark-blue` (`#434d8e`)
	- `aubergine` (`#362c46`)
	- `dark-green` (`#005351`)
	- `light-green` (`#63cf92`)
	- `soft-yellow` (`#e9eb86`)
	- `bright-red` (`#f56e6d`)
	- `bright-pink` (`#bb55a9`)
	- `light-grey` (`#cfd6cc`)
- Utility classes added for:
	- blueprint grid overlay: `.w4-blueprint-overlay`
	- heavy borders: `.w4-heavy-border`, `.w4-heavy-border-strong`
	- bento layout grid: `.w4-bento-grid` (+ span helpers)

## Fonts Source And Placement

Fonts are physically copied into this app under `public/fonts` and loaded via `next/font/local` in `app/layout.tsx`.

- Source folder: `../Fonts/PP Neue Machina`
	- copied to: `public/fonts/neue-machina/`
	- files:
		- `PPNeueMachina-PlainLight.ttf`
		- `PPNeueMachina-PlainRegular.ttf`
		- `PPNeueMachina-PlainMedium.ttf`
		- `PPNeueMachina-PlainSemibold.ttf`
		- `PPNeueMachina-PlainBold.ttf`
- Source folder: `../Fonts/Raleway`
	- copied to: `public/fonts/raleway/`
	- files:
		- `Raleway-Light.ttf`
		- `Raleway-Regular.ttf`
		- `Raleway-Bold.ttf`

## Brand Assets Source And Placement

The required logo, icon and shape assets are copied from the repository root into this app:

- source: `../img/logo` -> target: `public/img/logo`
- source: `../img/icons` -> target: `public/img/icons`
- source: `../img/shapes` -> target: `public/img/shapes`
