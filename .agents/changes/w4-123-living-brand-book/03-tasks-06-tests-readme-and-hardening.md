# Task 6: Testen, README, hardening en acceptatiecheck

**Depends on**: Task 4, Task 5  
**Estimated complexity**: Medium  
**Type**: Testing

## Objective
Rond de oplevering technisch af met afgesproken testniveau, documentatie-updates en een finale functionele kwaliteitscheck over routes, toggles en belangrijkste interacties.

## ⚠️ Important information
Before coding, Read FIRST -> Load [03-tasks-00-READBEFORE.md](03-tasks-00-READBEFORE.md)

## Files to Modify/Create
- `living-brand-book/README.md`
- `living-brand-book/tests/components/CodeSnippet.test.tsx`
- `living-brand-book/tests/components/ColorPalette.test.tsx`
- `living-brand-book/tests/components/NavigationAndModes.test.tsx` (of equivalent)
- `living-brand-book/PROGRESS.md`

## Detailed Steps
1. Update `PROGRESS.md` en markeer Task 6 als 🔄 In Progress.
2. Borg testniveau optie 1:
   - lint
   - typecheck
   - beperkte componenttests
3. Voeg/actualiseer tests voor:
   - `/` redirect gedrag (via route/componenttest waar haalbaar)
   - dark mode en pixel-modus onafhankelijkheid
   - copy-to-clipboard flows
4. Werk README af met:
   - installatie
   - scripts
   - route-overzicht
   - uitleg dark mode/pixel-modus
   - designrichting samenvatting
5. Noteer open TODO rond exacte logo veiligheidsmarge ratio.
6. Run `just preflight` of equivalent checks en fix issues.
7. Update `PROGRESS.md` naar ✅ Completed voor Task 6.
8. Commit met conventionele boodschap: `test: implement task 06 - finalize qa checks and readme`.

## Acceptance Criteria
- [x] Lint/typecheck slagen
- [x] Kerncomponenttests slagen
- [x] README is actueel en bruikbaar
- [x] Open logo-ratio punt is expliciet gedocumenteerd

## Testing
- **Test file**: `tests/components/CodeSnippet.test.tsx`
- **Test file**: `tests/components/ColorPalette.test.tsx`
- **Test file**: `tests/components/NavigationAndModes.test.tsx`
- **Test cases**:
  - Togglecombinaties blijven onafhankelijk
  - Copyflows blijven stabiel
  - Basisnavigatie en routegedrag kloppen

## Notes
Geen scope-uitbreiding naar volledige E2E suite in deze taak.
