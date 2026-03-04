# W4-BrandBook Repository Overview

## Purpose
This repository is a brand asset and guidance workspace for **Wigo4it / W4**, containing:
- Prompting material for generating a complete brand book
- Color references
- Typography files
- Visual assets (logos, icons, and shape elements)
- Source/reference PDF brand presentations and guides

## Top-Level Structure

### Documentation & Inputs
- `prompt.md`  
  Master prompt for generating a full brand guidelines document (brand strategy, visual identity, voice, governance, templates, and accessibility requirements).
- `brandColors.md`  
  Color swatch list with 8 named HEX values:
  - light-grey `#cfd6cc`
  - dark-green `#005351`
  - dark-blue `#434d8e`
  - soft-yellow `#e9eb86`
  - light-green `#63cf92`
  - aubergine `#362c46`
  - bright-red `#f56e6d`
  - bright-pink `#bb55a9`
- `init.md`  
  This repository overview file.

### Reference PDFs
- `Wigo4it Corporate presentatie.pdf`
- `Wigo4it_Merkgids_2024.pdf`
- `Wigo_Brand-update_presentatie1 (2).pdf`
- `Wigo_Support_Visueel-ontwerp2.pdf`

These files appear to be source/reference brand materials and presentation decks.

## Fonts

### `Fonts/PP Neue Machina/`
Contains multiple `PPNeueMachina` `.ttf` files (weights/variants such as Light, Regular, Medium, Semibold, Bold, including some italic variants).

Subfolders:
- `PP Neue Machina/`  
  Expanded set of variants (including Thin and additional Italic weights).
- `__MACOSX/PP Neue Machina/`  
  macOS metadata artifacts (`._*` files) from archive extraction.

### `Fonts/Raleway/`
Contains Raleway `.ttf` variants:
- `Raleway-Light.ttf`
- `Raleway-LightItalic.ttf`
- `Raleway-Regular.ttf`
- `Raleway-Italic.ttf`
- `Raleway-Bold.ttf`

## Image Assets (`img/`)

### `img/logo/`
Logo and related deliverables in SVG/PNG/AI, including:
- Core logos (`Logo.svg`, `Logo Diap.svg`, `4.svg`, `4 Diap.svg`)
- Office/template source (`Logo's_office-templates.ai`)
- Microsoft 365 versions (`W4_logo_M365.png`, `W4_logo_M365_Darkmode.png`)
- Dark mode pill variant (`logo darkmode pill.png`)

### `img/icons/`
Large collection of icon-style SVG assets (e.g., `Alarm.svg`, `Auto.svg`, `Laptop.svg`, `Pacman.svg`, `Zon.svg`, `Zwaard.svg`, etc.).

### `img/shapes/`
Shape library labeled `Vorm 1` through `Vorm 20`, with assets in SVG and partial PNG variants.

## Notable Observations
- The repository is asset-heavy and suitable as a source-of-truth pack for brand design work.
- `PP Neue Machina` appears in both root and nested font folders; there may be intentional redundancy or historical extraction leftovers.
- `__MACOSX` contains metadata files that are typically non-essential for production usage.

## Suggested Usage
- Use `prompt.md` + `brandColors.md` as the primary AI input set for generating/updating brand guidelines.
- Treat `img/logo/` as the canonical logo source folder for exports and implementation.
- Keep font licensing and preferred production variants documented if this repo is shared externally.
