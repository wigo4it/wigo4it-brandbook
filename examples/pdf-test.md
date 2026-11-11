| Versie | Datum | Wijziging |
| --- | --- | --- |
| 0.1 | 12 augustus 2026 | Eerste opzet |
| 0.2 | 12 augustus 2026 | Diagrammen toegevoegd |

# Testdocument PDF-tool

Dit bestand hoort bij de PDF-tool zoals `examples/deck-test.md` bij de deck-tool hoort: elk
diagramtype dat we ondersteunen staat erin, plus de randgevallen. Laad het na een wijziging in
`scripts/mermaid-render.js`, `scripts/pdf-builder.js` of `styles/pdf.css` en kijk of alles er nog
staat, in de preview én in een echte print naar PDF.

Zet bij het exporteren **Achtergrondafbeeldingen** aan, anders mis je het voorblad.

<!-- pagebreak -->

## De zeven types die we nalopen

### Flowchart

```mermaid Figuur: hoe een aanvraag door de keten loopt
flowchart LR
  A[Aanvraag binnen] --> B{Compleet?}
  B -- ja --> C[Toets rechtmatigheid]
  B -- nee --> D[Aanvulling opvragen]
  D --> B
  C --> E[Besluit]
  E --> F[Uitkering]
```

### Sequence

```mermaid Figuur: burger, portaal en Socrates
sequenceDiagram
  actor B as Burger
  participant P as Portaal
  participant S as Socrates
  B->>P: Dient aanvraag in
  P->>S: Registreert aanvraag
  S-->>P: Aanvraagnummer
  P-->>B: Ontvangstbevestiging
  Note over S: Toets binnen acht weken
  S->>P: Besluit
  P-->>B: Beschikking
```

### State

```mermaid
stateDiagram-v2
  [*] --> Ingediend
  Ingediend --> InBehandeling: ontvankelijk
  Ingediend --> Afgewezen: onvolledig
  InBehandeling --> Toegekend
  InBehandeling --> Afgewezen
  Toegekend --> [*]
  Afgewezen --> [*]
```

<!-- pagebreak -->

### ER

```mermaid Figuur: burger, aanvraag en besluit
erDiagram
  BURGER ||--o{ AANVRAAG : dient_in
  AANVRAAG ||--|| BESLUIT : leidt_tot
  BURGER {
    string bsn
    string achternaam
  }
  AANVRAAG {
    string nummer
    date ontvangen_op
  }
  BESLUIT {
    string soort
    date genomen_op
  }
```

### Class

```mermaid
classDiagram
  class Aanvraag {
    +String nummer
    +Date ontvangenOp
    +toets()
  }
  class Besluit {
    +String soort
    +motiveer()
  }
  class Burger {
    +String bsn
  }
  Burger --> Aanvraag
  Aanvraag --> Besluit
```

### Gantt

```mermaid Figuur: planning koppelvlak
gantt
  title Oplevering koppelvlak
  dateFormat YYYY-MM-DD
  axisFormat %b
  section Ontwerp
    Analyse            :done, a1, 2026-01-05, 30d
    Ontwerp koppelvlak :active, a2, after a1, 25d
  section Bouw
    Realisatie         :a3, after a2, 40d
    Ketentest          :crit, a4, after a3, 20d
```

### Pie

```mermaid
pie showData
  title Aanvragen per gemeente
  "Amsterdam" : 42
  "Rotterdam" : 28
  "Den Haag" : 19
  "Utrecht" : 11
```

<!-- pagebreak -->

## Randgevallen

### Onderschrift met tekens die geëscaped moeten worden

Hieronder hoort het onderschrift letterlijk te staan, inclusief de aanhalingstekens en de ampersand.

```mermaid Figuur: "aanvraag" & besluit <in behandeling>
flowchart LR
  A[Aanvraag] --> B[Besluit]
```

### Diagram dat hoger is dan een pagina

Dit moet automatisch meeschalen en heel blijven. Wordt het afgesneden, dan klopt de breedteberekening
in `normalizeDiagramSvg` niet meer.

```mermaid
flowchart TD
  S1[Melding] --> S2[Intake]
  S2 --> S3[Identificatie]
  S3 --> S4[Aanvraag]
  S4 --> S5[Compleetheid]
  S5 --> S6[Inkomenstoets]
  S6 --> S7[Vermogenstoets]
  S7 --> S8[Woonsituatie]
  S8 --> S9[Verblijfsrecht]
  S9 --> S10[Arbeidsverleden]
  S10 --> S11[Advies]
  S11 --> S12[Toetsing vier ogen]
  S12 --> S13[Besluit]
  S13 --> S14[Beschikking]
  S14 --> S15[Betaling]
  S15 --> S16[Maandelijkse controle]
  S16 --> S17[Heronderzoek]
  S17 --> S18[Beëindiging]
```

### Lang label

Met `htmlLabels: false` breekt mermaid de regel zelf af. Hier zie je of dat nog binnen het vakje
past.

```mermaid
flowchart TD
  A[Een uitzonderlijk lang label dat laat zien hoe mermaid een regel afbreekt nu er geen HTML in de labels zit] --> B[Kort]
```

### Kapotte syntax

Hieronder hoort een nette melding te staan met de broncode eronder, en de rest van het document moet
gewoon doorlopen.

```mermaid
flowchart LR
  A[Onafgesloten haak --> B
```

### Onbekend diagramtype

```mermaid
stroomschema LR
  A --> B
```

### Leeg blok

```mermaid
```

### Gewoon codeblok, moet onaangeraakt blijven

```js
const md = window.markdownit({ highlight: mermaidFence });
```

```
Een blok zonder taal. Hier hoort niets aan te veranderen.
```

## Afsluiting

Staat alles hierboven goed in de PDF, inclusief de pijlpunten in de flowchart en de sequence, dan
doet de change wat hij moet doen. De pijlpunten zijn de belangrijkste: die hangen aan `url(#...)` en
zijn het eerste wat sneuvelt als de id's tussen preview en export door elkaar lopen.
