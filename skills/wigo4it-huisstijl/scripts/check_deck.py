#!/usr/bin/env python3
"""Controleer een deck-markdown voordat je 'm oplevert.

Kijkt na wat de tool pas laat merken: onbekende tokens, kleuren en layouts die niet
bestaan, verwijzingen naar een vorm of icoon dat er niet is, en layouts die zonder de
bijbehorende structuur worden gebruikt. Daarnaast een paar leesbaarheidsregels: te veel
tekst op een slide, te veel items in een grid, geen sprekersnotities.

Gebruik:
    python check_deck.py mijn-deck.md
    python check_deck.py mijn-deck.md --stil     alleen fouten, geen tips

Exit-code 1 zodra er een fout in zit. Waarschuwingen en tips laten de code op 0.

De namenlijst komt uit references/assets.json naast dit script. Draait het script met
netwerk, dan haalt het eerst de actuele lijst van de brandbook-site.
"""

import argparse
import json
import re
import sys
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

ASSETS_URL = "https://wigo4it.github.io/wigo4it-brandbook/assets.json"
LOCAL_ASSETS = Path(__file__).resolve().parent.parent / "references" / "assets.json"

COLORS = {"green", "aubergine", "blue", "pink", "red", "yellow", "grey", "white"}

LAYOUTS = {
    "cover", "statement", "split", "columns", "quote", "end",
    "list", "agenda", "timeline", "kpi", "contrast",
    "before-after", "stacked", "table", "section", "photo", "canvas",
}

# Layouts die hun inhoud uit ###-koppen halen.
ITEM_LAYOUTS = {"columns", "list", "agenda", "timeline", "kpi", "contrast"}

# Layouts die op *** in twee helften worden geknipt.
HALF_LAYOUTS = {"split", "before-after", "stacked"}

SHAPE_SPOTS = {"topleft", "topright", "bottomleft", "bottomright"}
TRANSITIONS = {"slide", "fade", "convex", "none"}
VALUE_KEYS = {"accent", "shape", "icon", "ghost", "eyebrow", "transition"}

# Slides zonder lopende tekst; daar hoort geen woordenlimiet bij.
BARE_LAYOUTS = {"cover", "end", "section", "quote", "photo", "kpi"}

MAX_WORDS = 60
MAX_ITEMS = 5

TOKEN_RE = re.compile(r'[A-Za-z][\w-]*:"[^"]*"|\S+')
DIRECTIVE_RE = re.compile(r"^\s*<!--\s*w4:\s*(.*?)\s*-->\s*$")
NOTE_RE = re.compile(r"^\s*Note:", re.IGNORECASE)


def load_asset_names():
    """Namen per categorie, zonder extensie. Live indien mogelijk, anders de kopie."""
    try:
        import urllib.request

        with urllib.request.urlopen(ASSETS_URL, timeout=5) as response:
            manifest = json.load(response)
        names = {}
        for category in manifest.get("categories", []):
            stems = []
            for asset in category.get("assets", []):
                stem = asset["file"].rsplit(".", 1)[0]
                if stem not in stems:
                    stems.append(stem)
            names[category["id"]] = stems
        if names:
            return names, "de brandbook-site"
    except Exception:
        pass

    with LOCAL_ASSETS.open(encoding="utf-8") as handle:
        return json.load(handle)["names"], f"{LOCAL_ASSETS.name} (kopie)"


def distance(a, b):
    """Levenshtein, voor een suggestie bij een typefout."""
    if a == b:
        return 0
    previous = list(range(len(b) + 1))
    for i, ca in enumerate(a):
        current = [i + 1]
        for j, cb in enumerate(b):
            current.append(min(current[j] + 1, previous[j + 1] + 1, previous[j] + (ca != cb)))
        previous = current
    return previous[len(b)]


def suggest(value, candidates):
    """Dichtstbijzijnde kandidaat, of een lege string als niets in de buurt komt."""
    needle = value.lower()
    if not needle:
        return ""
    limit = max(1, len(needle) // 3)
    best, best_score = "", 10**9
    for candidate in candidates:
        score = distance(needle, candidate.lower())
        if score < best_score:
            best, best_score = candidate, score
    return best if best_score <= limit else ""


def strip_front_matter(text):
    """Frontmatter eraf, plus de sleutels die erin stonden."""
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return text, {}
    try:
        end = lines.index("---", 1)
    except ValueError:
        return text, {}
    meta = {}
    for line in lines[1:end]:
        match = re.match(r"^([A-Za-z][\w-]*)\s*:\s*(.*)$", line.strip())
        if match:
            meta[match.group(1).lower()] = match.group(2).strip()
    return "\n".join(lines[end + 1:]), meta


def split_slides(body):
    """Zelfde knipregels als de tool: `---` nieuwe slide, `--` verticale slide."""
    slides, buffer = [], []

    def flush():
        text = "\n".join(buffer).strip()
        if text:
            slides.append(text)
        buffer.clear()

    for line in body.replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if re.fullmatch(r"-{3,}", stripped) or stripped == "--":
            flush()
        else:
            buffer.append(line)
    flush()
    return slides


def parse_slide(markdown):
    """Tokens, zichtbare markdown en notities uit elkaar halen."""
    tokens, kept = [], []
    for line in markdown.split("\n"):
        match = DIRECTIVE_RE.match(line)
        if match:
            tokens.extend(TOKEN_RE.findall(match.group(1)))
        else:
            kept.append(line)

    note_at = next((i for i, line in enumerate(kept) if NOTE_RE.match(line)), None)
    if note_at is None:
        return tokens, "\n".join(kept).strip(), ""
    return tokens, "\n".join(kept[:note_at]).strip(), "\n".join(kept[note_at:]).strip()


def split_token(token):
    at = token.find(":")
    if at == -1:
        return token, ""
    value = token[at + 1:].strip()
    if len(value) > 1 and value.startswith('"') and value.endswith('"'):
        value = value[1:-1]
    return token[:at], value


def visible_words(markdown):
    """Ruwe telling van wat er op de slide komt te staan."""
    text = re.sub(r"<[^>]+>", " ", markdown)
    text = unescape(text)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"^\s*\|.*\|\s*$", " ", text, flags=re.MULTILINE)
    text = re.sub(r"[#>*_`~-]", " ", text)
    return len(text.split())


class Report:
    def __init__(self):
        self.errors, self.warnings, self.tips = [], [], []

    def error(self, slide, message):
        self.errors.append((slide, message))

    def warn(self, slide, message):
        self.warnings.append((slide, message))

    def tip(self, slide, message):
        self.tips.append((slide, message))


def check_tokens(tokens, report, number, assets):
    """Tokens tegen de lijsten van de tool. Geeft de gevonden layout terug."""
    layout, color, seen_layouts, seen_colors = "", "", [], []

    for token in tokens:
        key, value = split_token(token)

        if token in COLORS:
            seen_colors.append(token)
            color = token
            continue
        if token in LAYOUTS:
            seen_layouts.append(token)
            layout = token
            continue
        if token == "steps":
            continue

        if key == "accent":
            if value not in COLORS:
                report.error(number, f"accent:{value} bestaat niet. Kies uit: {', '.join(sorted(COLORS))}.")
        elif key == "shape":
            name, _, spot = value.partition("@")
            if name not in assets["shapes"]:
                hint = suggest(name, assets["shapes"])
                extra = f" Bedoelde je shape:{hint}?" if hint else ""
                report.error(number, f"shape:{name} staat niet in de assets.{extra}")
            if spot and spot not in SHAPE_SPOTS:
                report.error(number, f"@{spot} bestaat niet. Kies uit: {', '.join(sorted(SHAPE_SPOTS))}.")
        elif key == "icon":
            if value not in assets["icons"]:
                hint = suggest(value, assets["icons"])
                extra = f' Bedoelde je icon:"{hint}"?' if hint else ""
                report.error(number, f"icon:{value} staat niet in de assets.{extra}")
        elif key == "transition":
            if value not in TRANSITIONS:
                report.error(number, f"transition:{value} bestaat niet. Kies uit: {', '.join(sorted(TRANSITIONS))}.")
        elif key in VALUE_KEYS:
            if not value:
                report.error(number, f"{key}: staat er zonder waarde.")
        else:
            hint = suggest(token, sorted(COLORS | LAYOUTS))
            extra = f" Bedoelde je {hint}?" if hint else ""
            report.error(number, f"Onbekend token '{token}'.{extra}")

    if len(seen_layouts) > 1:
        report.error(number, f"Twee layouts op een slide: {' en '.join(seen_layouts)}. Er geldt er maar een.")
    if len(seen_colors) > 1:
        report.error(number, f"Twee kleuren op een slide: {' en '.join(seen_colors)}. Er geldt er maar een.")

    return layout, color


def check_structure(layout, content, report, number):
    """Heeft de layout de structuur die hij nodig heeft?"""
    items = len(re.findall(r"^###\s+\S", content, flags=re.MULTILINE))
    has_divider = bool(re.search(r"^\s*\*\*\*\s*$", content, flags=re.MULTILINE))

    if layout in ITEM_LAYOUTS:
        if items == 0:
            report.error(number, f"Layout '{layout}' verwacht items, maar er staat geen enkele ###-kop in.")
        elif items == 1:
            report.warn(number, f"Layout '{layout}' met een item. Twee of meer maakt de layout pas zinnig.")
        elif items > MAX_ITEMS:
            report.warn(number, f"{items} items bij layout '{layout}'. Boven de {MAX_ITEMS} wordt het te klein; splits de slide.")

    if layout in HALF_LAYOUTS and not has_divider:
        report.error(number, f"Layout '{layout}' knipt op `***`, maar die scheiding ontbreekt.")

    if layout == "photo" and not re.search(r"!\[[^\]]*\]\([^)]+\)", content):
        report.error(number, "Layout 'photo' zonder afbeelding. Zet er een ![](img/photos/...) in.")

    if layout == "table" and "|" not in content:
        report.error(number, "Layout 'table' zonder tabel.")

    if layout == "quote" and not re.search(r"^\s*>", content, flags=re.MULTILINE):
        report.warn(number, "Layout 'quote' zonder citaatregel (`> ...`).")

    if layout == "agenda" and re.search(r"^###\s+\d+[.)]\s", content, flags=re.MULTILINE):
        report.tip(number, "De agenda-layout nummert zelf. Haal de nummers uit je ###-koppen.")

    if not content.strip():
        report.error(number, "Lege slide: alleen een tokenregel, geen inhoud.")


def check_readability(layout, content, notes, report, number):
    words = visible_words(content)
    if layout not in BARE_LAYOUTS and words > MAX_WORDS:
        report.warn(number, f"Ongeveer {words} woorden op de slide. Zet de uitleg achter `Note:` en houd het onder de {MAX_WORDS}.")
    if layout in {"cover", "statement", "end"} and words > 30:
        report.warn(number, f"Ongeveer {words} woorden op een {layout}-slide. Die layout wil juist weinig tekst.")
    if not notes and layout not in {"cover", "end", "section"} and words > 15:
        report.tip(number, "Geen sprekersnotitie. Zet je verhaal achter `Note:`, dan hoeft het niet op de slide.")
    if "—" in content or "–" in content:
        report.warn(number, "Er staat een em- of en-dash in de tekst. Gebruik een komma, punt of dubbele punt.")


def check_deck(path, assets):
    report = Report()
    text = path.read_text(encoding="utf-8").replace("\r\n", "\n")
    body, meta = strip_front_matter(text)

    if not meta:
        report.tip(0, "Geen frontmatter. Met `title:` en `footer:` bovenaan staat er op elke slide iets linksonder.")

    slides = split_slides(body)
    if not slides:
        report.error(0, "Geen enkele slide gevonden. Staat er wel iets in het bestand?")
        return report, 0

    layouts = []
    colors = []
    for number, markdown in enumerate(slides, start=1):
        tokens, content, notes = parse_slide(markdown)
        layout, color = check_tokens(tokens, report, number, assets)
        layouts.append(layout)
        colors.append(color or "white")
        check_structure(layout, content, report, number)
        check_readability(layout, content, notes, report, number)
        if layout == "canvas":
            check_canvas(content, path, assets, report, number)

    if layouts and layouts[0] != "cover":
        report.tip(1, "De eerste slide is geen cover. Een deck begint meestal met `<!-- w4: cover -->`.")
    if layouts and layouts[-1] != "end":
        report.tip(len(slides), "De laatste slide is geen afsluiter. `<!-- w4: green end -->` sluit netjes af.")

    distinct = {c for c in colors if c}
    if len(distinct) > 4:
        report.warn(0, f"{len(distinct)} verschillende kleuren in het deck ({', '.join(sorted(distinct))}). Vier is het maximum dat rustig blijft.")

    return report, len(slides)


def check_canvas(content, path, assets, report, number):
    """Controleer ook de assets van vrije composities, niet alleen tokens."""
    class CanvasAssets(HTMLParser):
        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            src = attrs.get("data-asset") or (attrs.get("src") if tag == "img" else None)
            if not src:
                return
            if src.startswith("img/icons/") or src.startswith("img/shapes/"):
                kind = "icons" if src.startswith("img/icons/") else "shapes"
                name = Path(src).stem
                if name not in assets.get(kind, []):
                    report.error(number, f"Onbekende canvas-asset: {src}")
            if not re.match(r"^[a-z]+:|^//", src, re.I):
                roots = [path.parent, *path.resolve().parents]
                if not any((root / src).is_file() for root in roots):
                    report.error(number, f"Canvas-afbeelding ontbreekt: {src}")
    CanvasAssets().feed(content)


def main():
    parser = argparse.ArgumentParser(description="Controleer een deck-markdown op tokens, layouts en leesbaarheid.")
    parser.add_argument("bestand", help="Pad naar het markdown-bestand")
    parser.add_argument("--stil", action="store_true", help="Alleen fouten tonen")
    args = parser.parse_args()

    path = Path(args.bestand)
    if not path.exists():
        print(f"Bestand niet gevonden: {path}")
        return 2

    assets, source = load_asset_names()
    report, count = check_deck(path, assets)

    print(f"{path.name}: {count} slides, assets gecontroleerd tegen {source}\n")

    def show(label, entries):
        if not entries:
            return
        print(label)
        for number, message in entries:
            where = f"slide {number}" if number else "deck"
            print(f"  [{where}] {message}")
        print()

    show("FOUT (los dit op):", report.errors)
    if not args.stil:
        show("LET OP:", report.warnings)
        show("TIP:", report.tips)

    if report.errors:
        print(f"{len(report.errors)} fout(en). Het deck rendert, maar niet zoals bedoeld.")
        return 1

    if report.warnings and not args.stil:
        print("Geen fouten. Loop de punten onder LET OP even na.")
    else:
        print("Geen fouten gevonden.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
