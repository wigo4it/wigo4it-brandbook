# Living Brand Book (Wigo4it)

Interactieve Living Brand Book app gebouwd met Next.js App Router, Tailwind CSS v4 (CSS-first `@theme`) en Framer Motion.

## Installatie

1. Installeer dependencies:

```bash
npm install
```

2. Start de ontwikkelserver:

```bash
npm run dev
```

3. Open de app op de lokale URL die Next.js toont in de terminal.

## Beschikbare scripts

- `npm run dev`: start lokale development server
- `npm run build`: maak production build
- `npm run start`: start production server
- `npm run lint`: draai ESLint
- `npm run typecheck`: draai TypeScript typecheck
- `npm run test`: draai Vitest componenttests
- `npm run preflight`: volledige kwaliteitsgate (`lint + typecheck + test`)

## Route-overzicht

- `/`: redirect naar `/het-merk`
- `/het-merk`: merkidentiteit, missie/visie, merkwaarden, tone-of-voice en gallery placeholder
- `/design-system`: kleurtokens, typografie en component snippets

## Navigatie en modi

- Hoofdnavigatie bevat links naar `/het-merk` en `/design-system`.
- Subnavigatie toont sectie-ankers per actieve route.
- Twee onafhankelijke UI-toggles:
  - dark mode (`Schakel dark mode`)
  - pixel-modus (`Schakel pixel modus`)
- State-opslag gebeurt client-side via `UiModeProvider` in `localStorage`.
- De app zet globale datasets op `html`:
  - `data-theme="light|dark"`
  - `data-pixel-mode="off|on"`

## Designrichting samenvatting

De visuele richting volgt "Modern, Geeky, Bold":

- blueprint grid overlay als subtiele technische laag
- zware borders en duidelijke bento-layouts
- grote typografische hiërarchie met merkfonts
- pixel-art invloeden als aparte interne branding-modus
- professioneel en toegankelijk karakter in copy en interacties

## Fonts en assets

- Fonts zijn lokaal opgenomen in `public/fonts` en geladen via `next/font/local` in `app/layout.tsx`.
- Merkassets zijn beschikbaar in `public/img/logo`, `public/img/icons` en `public/img/shapes`.

## Kwaliteit en testscope

Deze app gebruikt testscope optie 1:

- lint
- typecheck
- beperkte componenttests voor kerninteracties (navigatie/modi/copyflows)

## Open TODO

- TODO: Bevestig exacte ratio voor logo-veiligheidsmarge op basis van de letter "T" uit de merkgids-PDF en vervang daarna de tijdelijke beschrijving in documentatie/componentcopy door de definitieve ratio.
