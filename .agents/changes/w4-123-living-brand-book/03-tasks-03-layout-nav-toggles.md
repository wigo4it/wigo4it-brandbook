## INSPECTOR FEEDBACK (Latest)

Verdict: 🔴 Incomplete

Primary blocker:
- Subnavigatie bevat meerdere anchorlinks naar sectie-ID's die op de actieve routes niet bestaan. Hierdoor is route-specifieke sectienavigatie functioneel onvolledig en faalt het criterium dat navigatie op mobiel/desktop werkt in praktisch gebruik.
  - `/het-merk`: links voor `#merkwaarden`, `#tone-of-voice`, `#gallery` bestaan niet in de pagina.
  - `/design-system`: links voor `#typografie`, `#componenten`, `#snippets` bestaan niet in de pagina.

What passed:
- Preflight gate geslaagd (`lint`, `typecheck`, `test`, `build`).
- App-shell met semantische landmarks (`header`, `nav`, `main`) is aanwezig.
- Hoofdnavigatie bevat beide routes en toggle-state werkt onafhankelijk (dark/pixel) inclusief testdekking.
- README documenteert toggles en subnavigatie-opzet.

Required fix before re-inspection:
1. Zorg dat elke subnavigatielink verwijst naar een bestaande sectie-ID op de bijbehorende route.
2. Voeg ontbrekende sectie-ankers toe aan de pagina's of beperk `SubNav` tijdelijk tot daadwerkelijk beschikbare secties.
3. Breid tests uit zodat ze ook valideren dat route-specifieke subnav anchors naar bestaande secties verwijzen (of dat ontbrekende anchors niet gerenderd worden).

# Task 3: Layout, navigatie, subnavigatie en toggles

**Depends on**: Task 1, Task 2  
**Estimated complexity**: High  
**Type**: Feature

## Objective
Bouw de globale app-shell met moderne navigatie, route- en sectiesubnavigatie, en onafhankelijke toggles voor dark mode en pixel-modus.

## ⚠️ Important information
Before coding, Read FIRST -> Load [03-tasks-00-READBEFORE.md](03-tasks-00-READBEFORE.md)

## Files to Modify/Create
- `living-brand-book/app/layout.tsx`
- `living-brand-book/components/navigation/MainNav.tsx`
- `living-brand-book/components/navigation/SubNav.tsx`
- `living-brand-book/components/ui/ThemeToggle.tsx`
- `living-brand-book/components/ui/PixelModeToggle.tsx`
- `living-brand-book/components/providers/UiModeProvider.tsx`
- `living-brand-book/README.md`

## Detailed Steps
1. Update `PROGRESS.md` en markeer Task 3 als 🔄 In Progress.
2. Implementeer `UiModeProvider` voor statebeheer van dark mode en pixel-modus (los van elkaar).
3. Bouw `layout.tsx` met moderne topnavigatie en plek voor route-specifieke subnavigatie.
4. Implementeer `MainNav` links naar `/het-merk` en `/design-system`.
5. Implementeer `SubNav` met anchorlinks per actieve pagina.
6. Voeg `ThemeToggle` en `PixelModeToggle` toe in de globale layout.
7. Borg responsive gedrag voor mobiel en desktop.
8. Documenteer togglegedrag en subnavigatie in README.
9. Run `just preflight` of equivalent checks en fix issues.
10. Update `PROGRESS.md` naar ✅ Completed voor Task 3.
11. Commit met conventionele boodschap: `feat: implement task 03 - app shell navigation and ui toggles`.

## Acceptance Criteria
- [ ] Layout bevat moderne hoofdnav en subnav
- [ ] Dark mode toggle werkt handmatig
- [ ] Pixel-modus toggle werkt handmatig
- [ ] Dark mode en pixel-modus zijn onafhankelijk
- [ ] Navigatie werkt op mobiel en desktop

## Testing
- **Test file**: `tests/components/LayoutNavigation.test.tsx` (of equivalent)
- **Test cases**:
  - Hoofdroute-links aanwezig en klikbaar
  - Toggle states veranderen onafhankelijk van elkaar
  - Subnavigatielinks renderen voor actieve route

## Notes
Gebruik semantische landmarks (`header`, `nav`, `main`) en duidelijke aria-labels.
