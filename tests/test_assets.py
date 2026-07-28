"""Tests rond het asset-manifest (assets.json + scripts/assets.js).

assets.json is sinds deze stap niet alleen een download-manifest voor externe
gebruikers, maar ook de bron voor de site zelf: de drie catalogus-pagina's
vullen er hun galerij mee. Deze tests bewaken die twee kanten:

* het manifest zelf  - categorieen aanwezig, paden bestaan echt;
* scripts/assets.js  - files/names/suggest, in de browser;
* de galerijen       - tonen evenveel kaarten als het manifest telt.

De drift-check (manifest versus img/) zit in de CI-workflow, die
generate-assets.py opnieuw draait.
"""

import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFEST = json.loads((REPO_ROOT / "assets.json").read_text(encoding="utf-8"))
CATEGORIES = {c["id"]: c for c in MANIFEST["categories"]}


@pytest.fixture
def assets(page, server_url):
    """Laadt scripts/assets.js op de server-origin en geeft een call-helper."""
    page.goto(f"{server_url}/", wait_until="domcontentloaded")

    def call(fn_body):
        return page.evaluate(
            "async ({fnBody}) => {"
            "  const m = await import('/scripts/assets.js');"
            "  const fn = new Function('m', 'return (' + fnBody + ')(m);');"
            "  return await fn(m);"
            "}",
            {"fnBody": fn_body},
        )

    return call


# ── het manifest ─────────────────────────────────────────────────────────────


@pytest.mark.parametrize("category_id", ["icons", "shapes", "photos", "logos"])
def test_manifest_has_category_with_assets(category_id):
    assert category_id in CATEGORIES, f"categorie {category_id} ontbreekt in assets.json"
    assert CATEGORIES[category_id]["assets"], f"categorie {category_id} is leeg"


@pytest.mark.parametrize("category_id", ["icons", "shapes", "photos", "logos"])
def test_manifest_count_matches_asset_list(category_id):
    category = CATEGORIES[category_id]
    assert category["count"] == len(category["assets"])


def test_manifest_paths_exist_on_disk():
    missing = [
        asset["path"]
        for category in MANIFEST["categories"]
        for asset in category["assets"]
        if not (REPO_ROOT / asset["path"]).is_file()
    ]
    assert not missing, f"manifest wijst naar bestanden die er niet zijn: {missing}"


def test_manifest_skips_source_files_in_logo_dir():
    """De .ai in img/logo is een bronbestand, geen downloadbare asset."""
    formats = {asset["format"] for asset in CATEGORIES["logos"]["assets"]}
    assert formats <= {"svg", "png"}


# ── scripts/assets.js ────────────────────────────────────────────────────────


def test_files_returns_the_file_names_of_a_category(assets):
    result = assets("async (m) => m.files(await m.loadAssets('/assets.json'), 'icons')")
    assert result == [asset["file"] for asset in CATEGORIES["icons"]["assets"]]


def test_files_of_unknown_category_is_empty(assets):
    result = assets("async (m) => m.files(await m.loadAssets('/assets.json'), 'stickers')")
    assert result == []


def test_names_drops_extension_and_deduplicates(assets):
    """Shapes bestaan vaak als SVG en PNG; dat is één naam voor een token."""
    result = assets("async (m) => m.names(await m.loadAssets('/assets.json'), 'shapes', 'svg')")
    assert "ring" in result
    assert len(result) == len(set(result))
    assert not any("." in name for name in result)


def test_suggest_finds_the_near_miss(assets):
    result = assets("(m) => m.suggest('rng', ['ring', 'circle', 'square'])")
    assert result == "ring"


def test_suggest_is_case_insensitive(assets):
    result = assets("(m) => m.suggest('game bo', ['Game Boy', 'Game Over'])")
    assert result == "Game Boy"


def test_suggest_stays_silent_when_nothing_is_close(assets):
    result = assets("(m) => m.suggest('vierkantje', ['ring', 'circle'])")
    assert result == ""


# ── de galerijen ─────────────────────────────────────────────────────────────


@pytest.mark.parametrize(
    "page_path, card_class, total_id, category_id",
    [
        ("icons.html", ".icon-card", "#icon-total", "icons"),
        ("shapes.html", ".shape-card", "#shape-total", "shapes"),
        ("photos.html", ".photo-card", "#photo-total", "photos"),
    ],
)
def test_gallery_renders_every_asset_from_the_manifest(
    page, server_url, page_path, card_class, total_id, category_id
):
    expected = CATEGORIES[category_id]["count"]
    page.goto(f"{server_url}/{page_path}", wait_until="networkidle")
    page.wait_for_selector(card_class)
    assert page.locator(card_class).count() == expected
    assert page.locator(total_id).inner_text() == str(expected)
