# Living Brand Book

Baseline Next.js App Router applicatie voor de Wigo4it Living Brand Book ervaring.

## Stack

- Next.js 16 met App Router
- React 19
- Tailwind CSS v4 via `app/globals.css`
- Framer Motion als voorbereid runtime dependency
- Vitest + React Testing Library voor lichte componenttests

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run preflight
```

## Routes

- `/` redirect naar `/het-merk`
- `/het-merk` tijdelijke baseline pagina
- `/design-system` tijdelijke baseline pagina

## Structuur

```text
app/
	design-system/
	het-merk/
	globals.css
	layout.tsx
	page.tsx
tests/
	app-page.test.tsx
```

## Opmerking

Deze eerste taak levert alleen de stabiele basis op. Uitgebreide styling, fonts, navigatie, toggles en inhoud volgen in de volgende taken.

## Fonts En Assets (Task 02)

De app gebruikt lokale brand-assets die fysiek zijn gekopieerd naar public.

- Fonts bron:
	- ../Fonts/PP Neue Machina/PP Neue Machina/*.ttf naar public/fonts/neue-machina/
	- ../Fonts/Raleway/*.ttf naar public/fonts/raleway/
- Logo assets bron:
	- ../img/logo/* naar public/img/logo/
- Icon assets bron:
	- ../img/icons/* naar public/img/icons/
- Shape assets bron:
	- ../img/shapes/* naar public/img/shapes/

Deze assets worden in volgende taken actief gebruikt in layout, navigatie, pixel-modus en pagina-componenten.
