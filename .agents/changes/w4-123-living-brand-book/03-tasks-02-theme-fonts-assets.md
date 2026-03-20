# Task 2: Theme, tokens, fonts en assets migratie

**Depends on**: Task 1  
**Estimated complexity**: Medium  
**Type**: Feature

## Objective
Implementeer Tailwind v4 CSS-first thema in `globals.css`, kopieer de merkfonts fysiek naar de app en zet de benodigde brand-assets klaar in `public/`.

## ⚠️ Important information
Before coding, Read FIRST -> Load [03-tasks-00-READBEFORE.md](03-tasks-00-READBEFORE.md)

## Files to Modify/Create
- `living-brand-book/app/globals.css`
- `living-brand-book/public/fonts/neue-machina/*`
- `living-brand-book/public/fonts/raleway/*`
- `living-brand-book/public/img/logo/*`
- `living-brand-book/public/img/icons/*`
- `living-brand-book/public/img/shapes/*`
- `living-brand-book/README.md`

## Detailed Steps
1. Update `PROGRESS.md` en markeer Task 2 als 🔄 In Progress.
2. Definieer in `globals.css` alle Wigo4it kleur- en typografietokens via Tailwind v4 `@theme`.
3. Voeg utility classes toe voor:
   - blueprint grid overlay
   - zware borders (2px+)
   - bento box grid patrons
4. Kopieer Neue Machina en Raleway fontbestanden naar `public/fonts/...`.
5. Kopieer logo-, icon- en shape-assets naar `public/img/...`.
6. Documenteer in README welke assets/fontbestanden als bron zijn gebruikt.
7. Run `just preflight` of equivalent checks en fix issues.
8. Update `PROGRESS.md` naar ✅ Completed voor Task 2.
9. Commit met conventionele boodschap: `feat: implement task 02 - add theme tokens fonts and assets`.

## Acceptance Criteria
- [ ] Volledige kleurset aanwezig in `@theme`
- [ ] Fonts fysiek aanwezig in app en bruikbaar
- [ ] Assets aanwezig in `public/`
- [ ] Utilities voor blueprint/bento/heavy borders bestaan
- [ ] README aangevuld met assets/fonts sectie

## Testing
- **Test file**: n.v.t. voor deze taak
- **Test cases**:
  - Styles compilen zonder errors
  - Fontbestanden en afbeeldingen zijn bereikbaar via `public` paden

## Notes
Houd de assetset pragmatisch: alleen wat nodig is voor routes en toggles in scope.

## INSPECTOR FEEDBACK (2026-03-20)

**Verdict**: 🔴 Incomplete

### Wat is geverifieerd als in orde
- `npm run preflight` slaagt in `living-brand-book/`.
- Kleurtokens en utility classes bestaan in `living-brand-book/app/globals.css`:
  - blueprint overlay (`.w4-blueprint-overlay`)
  - heavy borders (`.w4-heavy-border`, `.w4-heavy-border-strong`)
  - bento grid (`.w4-bento-grid` + span helpers)
- Fontbestanden en merk-assets staan fysiek in `public/fonts` en `public/img`.
- Runtime URL-checks geven HTTP 200 terug voor representatieve bestanden.

### Blocking issue
- Niet voldaan aan project guardrail uit `03-tasks-00-READBEFORE.md`: fonts moeten geladen worden via `next/font/local`.
- `living-brand-book/app/layout.tsx` gebruikt nog `next/font/google` (`Geist`, `Geist_Mono`) i.p.v. lokale merkfonts.

### Benodigde fix
1. Vervang Google fonts in `living-brand-book/app/layout.tsx` door `next/font/local` met de gekopieerde bestanden uit `public/fonts`.
2. Koppel deze lokale fonts aan de globale font-variabelen/klassen zodat heading/body fonts daadwerkelijk via Next font pipeline worden toegepast.
3. Draai opnieuw `npm run preflight` en bevestig runtime rendering met de lokale fonts.
