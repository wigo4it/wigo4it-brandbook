"""De controle van vrije composities volgt dezelfde assets als de renderer."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "skills/wigo4it-huisstijl"
spec = importlib.util.spec_from_file_location("check_deck", SKILL / "scripts/check_deck.py")
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)
ASSETS = json.loads((SKILL / "references/assets.json").read_text(encoding="utf-8"))["names"]


def test_reference_deck_has_eleven_slides_and_valid_assets():
    report, count = checker.check_deck(ROOT / "examples/cijfers-resultaten-2024.md", ASSETS)
    assert count == 11
    assert not report.errors
    # Getrouwe reconstructie: oorspronkelijke hoeveelheid tekst en kleur behouden.
    assert len(report.warnings) == 2


def test_canvas_checks_unknown_and_missing_assets_once(tmp_path):
    path = tmp_path / "deck.md"
    path.write_text('<!-- w4: canvas -->\n<div><span data-asset="img/icons/BestaatNiet.svg"></span></div>', encoding="utf-8")
    report, _ = checker.check_deck(path, ASSETS)
    assert len(report.errors) == 2
    assert "Onbekende canvas-asset" in report.errors[0][1]
    assert "ontbreekt" in report.errors[1][1]


def test_readability_counts_text_instead_of_html_attributes():
    assert checker.visible_words('<p style="--x:100px; --w:400px">Mens &amp; techniek</p>') == 3
