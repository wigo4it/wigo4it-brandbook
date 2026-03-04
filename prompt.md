Act as a world-class branding consultant who creates a comprehensive Brand Guidelines (Brand Book) for a business. This folder contains essential inputs about our company Wigo4it. Also analyze the website: https://wigo4it.nl; your task is to generate a complete, ready-to-use brand guidelines static html page that can be handed to designers, marketers, and developers. The output should be clear, actionable, and adaptable for various channels and formats.

Context to consider
- Company background: name, industry, mission, vision, core values, target audience, unique value proposition, and brand personality.
- Market positioning: differentiators, tone of voice, and key brand promises.
- Practical constraints: required file formats, accessibility considerations, and any existing assets (logo, color swatches, typography) to be preserved or updated.

Deliverables you should include
- A formal Brand Guidelines webpage (structure and content suitable for a brand book).
- Visual identity system assets described in enough detail to be implemented by designers (logo usage, color system, typography, imagery, layout rules, iconography, and accessibility guidelines).
- Voice and messaging framework (brand voice, tone, key messages, audience segmentation, copywriting do’s and don’ts, sample copy for common touchpoints).
- Digital and print application guidelines (website, social media, packaging, email templates, business stationery) with practical usage examples.

Response structure and content expectations
- Be specific and complete: Provide all sections with concrete, actionable rules, not vague guidance.
- Write like a human, with clarity and conciseness: Use straightforward language, avoid jargon, and include plain-language definitions for technical terms.
- Be consistent in formatting and terminology: Use the same names for colors, typefaces, logo variants, and brand elements throughout.
- Avoid hallucinations: Do not invent brand details unless they are clearly derived from user input. If a detail is missing, prompt for it rather than guessing.
- Provide measurable standards: Include exact color hex/RGB/CMYK values, typefaces with weights and sizing rules, and logo clearance measurements.
- Include rationale where helpful: Briefly explain why certain rules exist to aid future decision-making.
- Prioritize accessibility: Ensure color contrast, scalable typography, and alt-text guidance are included.
- Make it easy to customize: Structure the prompt so users can replace placeholders with their own data without breaking the guidelines.

What to include in the response (assets and artifacts)
- Brand Overview
  - Brand purpose, vision, mission, values, and brand promise
  - Brand personality and tone of voice
  - Audience personas and use-case scenarios
- Visual Identity
  - Logo: primary, secondary, and any acceptable variations; clear space, minimum sizes, incorrect usage examples
  - Color system: primary and secondary palettes with precise color values in HEX, RGB, and CMYK; accessibility contrast notes
  - Typography: primary and secondary typefaces; usage rules (headings, body text, captions); web-safe fallbacks; hierarchy examples
  - Imagery: photography style, illustration style, iconography system, and example treatments
  - Layout: grid systems, margin/padding rules, and component guidelines (cards, buttons, forms)
- Digital and Print Guidelines
  - Web and mobile: UI guidelines, button styles, form fields, navigation, and responsive behavior
  - Social media: profile visuals, post templates, and voice-consistency rules
  - Print: stationery, brochures, packaging, signage with production considerations
- Copy and Messaging
  - Brand voice and tone by channel (website, ads, social, customer care)
  - Key messages and proof points by audience segment
  - Sample copy blocks for common pages and touchpoints
- Governance and Assets
  - Brand ownership, approval workflow, and versioning
  - Asset library structure, file naming conventions, and delivery formats
  - Compliance and legal notes (trademark usage, licensing, and co-branding rules)
- Practical Tools
  - Quick-reference one-page cheat sheet
  - Checklists: logo usage, color accessibility, typography pairing
  - Fill-in sections for future updates (change log, upcoming campaigns)

Use the resources available in this repository:
# Repository Overview

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
