## INSPECTOR FEEDBACK (Latest)

Verdict: 🔴 Incomplete

Primary blocker:
- Acceptance criterium "Fonts fysiek aanwezig in app en bruikbaar" is niet gehaald. De fontbestanden zijn wel gekopieerd naar `public/fonts`, maar er is geen runtime font loading geconfigureerd (geen `next/font/local` in layout en geen `@font-face` in CSS). Daardoor vallen `--font-heading` en `--font-body` nu terug op systeemfonts op machines zonder lokale installatie.

What passed:
- Preflight gate geslaagd (`lint`, `typecheck`, `test`, `build`).
- Kleurtokens staan in `@theme`.
- Utility classes voor blueprint/heavy borders/bento-grid aanwezig.
- Logo/icon/shape assets zijn aanwezig onder `public/img`.
- README bevat bronvermelding voor fonts en assets.

Required fix before re-inspection:
1. Configureer lokale font-loading via `next/font/local` (voorkeur, conform specificatie) of via expliciete `@font-face` definities in `globals.css`.
2. Koppel de geladen fonts aan de gebruikte token/utility flow (`--font-heading`, `--font-body` of equivalent classes).
3. Voeg een minimale verificatie toe dat fonts effectief gebruikt worden in runtime (bijv. inspecteer className vars in layout of gerichte componenttest op toegepaste font classes).

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
