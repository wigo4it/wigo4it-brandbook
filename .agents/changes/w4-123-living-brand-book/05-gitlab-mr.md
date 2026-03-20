# Merge Request Description

## Context
W4-123 levert een interactieve Living Brand Book app als bron voor designers en developers.
De implementatie is afgerond; deze MR-tekst bundelt de impact voor review en overdracht.

## Changes
- Nieuwe Next.js App Router ervaring met redirect van / naar /het-merk.
- Twee kernroutes: /het-merk en /design-system, volledig in Nederlandse tone-of-voice.
- Moderne hoofd- en subnavigatie met handmatige dark mode en aparte pixel-modus.
- Merkinhoud met missie/visie, uitklapbare waarden en tone-of-voice voorbeelden.
- Design System met kleurtokens, copy-acties (HEX + Tailwind class), typografie en snippets.
- QA-hardening via lint, typecheck en componenttests plus bijgewerkte README.

## Usage
- Start de app en open direct /het-merk via de root-redirect.
- Wissel tussen dark mode en pixel-modus om combinaties onafhankelijk te testen.
- Gebruik /design-system om kleurwaarden en Tailwind classes te kopieren.
- Gebruik snippets als startpunt voor consistente UI-opbouw in vervolgwerk.

## Impact
- Verhoogt consistentie tussen merkverhaal en technische implementatie.
- Verlaagt onboarding-tijd voor teams door duidelijke, levende documentatie.
- Verbetert betrouwbaarheid van dagelijkse wijzigingen door preflight-gedekte basis.

## Examples
- Merksectie met waarden Kwaliteit, Innovatie en Fun als interactieve kaarten.
- Kleurkaarten met directe copy-actie voor HEX en Tailwind class.
- Herbruikbare component-snippets voor snelle, consistente UI-ontwikkeling.

Closes W4-123
