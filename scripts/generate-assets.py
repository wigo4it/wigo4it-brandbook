#!/usr/bin/env python3
"""
Generate assets.json: a machine-readable manifest of all downloadable brand
assets (icons, shapes, photos, logos).

Purpose: point a human or an automated agent at the deployed site and let them
discover every asset with a ready-to-use download URL. Append an asset's "path"
(or use its pre-built "url") to grab the file directly.

Het manifest is ook de bron voor de site zelf: icons.html, shapes.html en
photos.html vullen hun galerij ermee. Draai dit dus na elke wijziging in img/.

Run from the repo root:  python scripts/generate-assets.py
The GitHub Pages workflow runs this before deploy, so the live manifest stays
in sync with whatever is in img/.
"""

import datetime
import json
import os
import re
import urllib.parse

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = "https://wigo4it.github.io/wigo4it-brandbook/"
OUTPUT = os.path.join(REPO_ROOT, "assets.json")

# category id -> (label, directory, allowed extensions)
# De extensies filteren meteen de bronbestanden weg die niemand hoort te
# downloaden, zoals de .ai in img/logo.
CATEGORIES = [
    ("icons",  "Iconen", "img/icons",  (".svg",)),
    ("shapes", "Vormen", "img/shapes", (".svg", ".png")),
    ("photos", "Foto's", "img/photos", (".jpg", ".jpeg", ".png")),
    ("logos",  "Logo's", "img/logo",   (".svg", ".png")),
]


def humanize(stem):
    """Turn a file stem into a readable name: hyphens/underscores -> spaces."""
    words = re.split(r"[-_]+", stem)
    return " ".join(w for w in words if w).strip() or stem


def to_url(rel_path):
    """Percent-encode each path segment so spaces etc. resolve as a real URL."""
    encoded = "/".join(urllib.parse.quote(part) for part in rel_path.split("/"))
    return BASE_URL + encoded


def read_version():
    try:
        with open(os.path.join(REPO_ROOT, "index.html"), encoding="utf-8") as fh:
            match = re.search(r"versie\s+([0-9]+\.[0-9]+)", fh.read(), re.IGNORECASE)
            return match.group(1) if match else None
    except OSError:
        return None


def collect(directory, extensions):
    abs_dir = os.path.join(REPO_ROOT, directory)
    if not os.path.isdir(abs_dir):
        return []
    assets = []
    for name in sorted(os.listdir(abs_dir), key=str.lower):
        stem, ext = os.path.splitext(name)
        if ext.lower() not in extensions:
            continue
        rel_path = f"{directory}/{name}"
        assets.append({
            "name": humanize(stem),
            "file": name,
            "path": rel_path,
            "url": to_url(rel_path),
            "format": ext.lower().lstrip("."),
            "bytes": os.path.getsize(os.path.join(abs_dir, name)),
        })
    return assets


def main():
    categories = []
    for cat_id, label, directory, extensions in CATEGORIES:
        assets = collect(directory, extensions)
        categories.append({
            "id": cat_id,
            "label": label,
            "dir": directory,
            "count": len(assets),
            "assets": assets,
        })

    manifest = {
        "brand": "Wigo4it",
        "version": read_version(),
        "baseUrl": BASE_URL,
        "generated": datetime.date.today().isoformat(),
        "usage": (
            "Wigo4it brand assets, free to reuse within brand guidelines. "
            "Each asset has a ready-to-use \"url\"; alternatively append its "
            "\"path\" to \"baseUrl\". Icons are SVG, shapes and logos are SVG "
            "or PNG, photos are JPG."
        ),
        "categories": categories,
    }

    with open(OUTPUT, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    total = sum(c["count"] for c in categories)
    print(f"Wrote {os.path.relpath(OUTPUT, REPO_ROOT)}: "
          f"{total} assets across {len(categories)} categories "
          + ", ".join(f"{c['id']}={c['count']}" for c in categories))


if __name__ == "__main__":
    main()
