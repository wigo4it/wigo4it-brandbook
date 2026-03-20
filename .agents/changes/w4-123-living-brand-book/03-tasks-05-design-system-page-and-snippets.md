# Task 5: Bouw pagina Design System + CodeSnippet component

**Depends on**: Task 2, Task 3  
**Estimated complexity**: High  
**Type**: Feature

## Objective
Implementeer de documentatiepagina met interactieve kleurenpalet-copyflow, typografie playground, componentenbieb met HTML/Tailwind snippets en een herbruikbaar `CodeSnippet` component.

## ⚠️ Important information
Before coding, Read FIRST -> Load [03-tasks-00-READBEFORE.md](03-tasks-00-READBEFORE.md)

## Files to Modify/Create
- `living-brand-book/app/design-system/page.tsx`
- `living-brand-book/components/pages/Documentatie.tsx`
- `living-brand-book/components/docs/ColorPalette.tsx`
- `living-brand-book/components/docs/TypographyPlayground.tsx`
- `living-brand-book/components/docs/ComponentLibrary.tsx`
- `living-brand-book/components/common/CodeSnippet.tsx`

## Detailed Steps
1. Update `PROGRESS.md` en markeer Task 5 als 🔄 In Progress.
2. Maak route-entry `app/design-system/page.tsx` die `Documentatie` rendert.
3. Bouw `ColorPalette` met alle 8 merkkleuren en click-to-copy voor HEX + Tailwind class.
4. Toon duidelijke gebruikersfeedback na kopieeractie (succes/fallback).
5. Bouw `TypographyPlayground` met hiërarchische voorbeelden Neue Machina vs Raleway.
6. Bouw `ComponentLibrary` met uitsluitend HTML/Tailwind snippetvoorbeelden.
7. Implementeer herbruikbare `CodeSnippet` component voor nette codeweergave en kopieeractie.
8. Zorg dat alles visueel en functioneel werkt in light, dark en pixel-modus combinaties.
9. Run `just preflight` of equivalent checks en fix issues.
10. Update `PROGRESS.md` naar ✅ Completed voor Task 5.
11. Commit met conventionele boodschap: `feat: implement task 05 - add design system docs and code snippets`.

## Acceptance Criteria
- [x] Route `/design-system` werkt
- [x] Alle 8 kleuren aanwezig met correcte waardes
- [x] Copyflow ondersteunt HEX + Tailwind class
- [x] Typografie playground toont duidelijk contrast in rollen/hiërarchie
- [x] Componentenbieb bevat HTML/Tailwind snippets via `CodeSnippet`

## Testing
- **Test file**: `tests/components/CodeSnippet.test.tsx`
- **Test file**: `tests/components/ColorPalette.test.tsx`
- **Test cases**:
  - Copyknoppen werken voor HEX en class
  - Feedback verschijnt bij succesvolle kopie
  - Snippetcomponent rendert content correct

## Notes
Vermijd onveilige HTML-injectie; werk met veilige string rendering voor snippets.

---

## INSPECTOR FEEDBACK (2026-03-20)

**Verdict**: 🔴 Incomplete

### What is good
- Implementatie dekt functionele scope: `/design-system` route, `Documentatie`, `ColorPalette`, `TypographyPlayground`, `ComponentLibrary` en herbruikbare `CodeSnippet`.
- Preflight is groen (lint, typecheck, tests).

### Blocking gaps
- Testkwaliteit voldoet nog niet volledig aan de taakdefinitie: de verplichte testcase _"Feedback verschijnt bij succesvolle kopie"_ is niet geassert.
  - `tests/components/ColorPalette.test.tsx` controleert copy-calls, maar niet zichtbare succesfeedback (`Gekopieerd` of button-label update).
  - `tests/components/CodeSnippet.test.tsx` controleert copy-call, maar niet zichtbare succesfeedback (`Gekopieerd`).

### Required fixes to pass inspection
1. Voeg in `ColorPalette.test.tsx` een assert toe op succesfeedback na click op copy-button.
2. Voeg in `CodeSnippet.test.tsx` een assert toe op succesfeedback na copy-actie.
3. Houd tests robuust met user-visible assertions (role/text) i.p.v. alleen mock-call verificatie.

## Rework Completion (2026-03-20)

- Toegevoegd: user-visible succesfeedback-asserts na kopieeracties in `tests/components/ColorPalette.test.tsx`.
- Toegevoegd: user-visible succesfeedback-asserts na kopieeracties in `tests/components/CodeSnippet.test.tsx`.
- Validatie: `npm run preflight` opnieuw uitgevoerd en geslaagd (lint, typecheck, tests).
- Status: ✅ Task completed na inspector rework.
