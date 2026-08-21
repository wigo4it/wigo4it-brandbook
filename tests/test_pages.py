"""Browser-smoke tests: doet elke pagina het nog?

Voor elke .html-pagina in de repo controleren we het soort breuk dat bij een
brandbook echt voorkomt:

* pagina geeft HTTP 200;
* geen JavaScript-crash (`pageerror`) en geen `console.error`;
* geen kapotte eigen assets (404 op een shape, icon of foto);
* de pagina rendert daadwerkelijk tekst.

Externe CDN's (Tailwind, GSAP) vallen buiten de gate: die horen niet bij onze
code en degraden gracieus. `fonts/` valt er wel binnen. Die stond ooit niet in
git en werd daarom overgeslagen; nu hij er wel in staat is een verkeerd
fontpad precies het soort fout dat je lokaal op Windows niet ziet en op
GitHub Pages wel.
"""

import os
import posixpath
import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent

# Requests naar deze pad-prefixes mogen falen zonder de test te breken.
# Op dit moment is dat niets: alles wat een pagina van onze eigen origin
# ophaalt, hoort er ook te zijn.
ALLOWED_FAILING_PREFIXES = ()


def discover_pages():
    """Alle .html-pagina's onder de repo-root, relatief en met / als scheider."""
    return sorted(
        p.relative_to(REPO_ROOT).as_posix()
        for p in REPO_ROOT.glob("**/*.html")
        if "node_modules" not in p.parts
    )


PAGES = discover_pages()


@pytest.mark.parametrize("page_path", PAGES)
def test_page_loads_cleanly(page, server_url, page_path):
    console_errors = []
    page_errors = []
    failed_requests = []

    def _relative(url):
        return url[len(server_url):].lstrip("/").split("?")[0]

    def on_console(msg):
        if msg.type != "error":
            return
        # "Failed to load resource" wordt al gedekt door de response-check
        # hieronder (en negeren we bewust voor externe hosts).
        if "Failed to load resource" in msg.text:
            return
        console_errors.append(msg.text)

    def on_response(response):
        if not response.url.startswith(server_url):
            return  # externe CDN, niet onze verantwoordelijkheid
        if response.status < 400:
            return
        rel = _relative(response.url)
        if rel.startswith(ALLOWED_FAILING_PREFIXES):
            return
        failed_requests.append(f"{response.status} /{rel}")

    def on_request_failed(request):
        if not request.url.startswith(server_url):
            return
        rel = _relative(request.url)
        if rel.startswith(ALLOWED_FAILING_PREFIXES):
            return
        failed_requests.append(f"FAILED /{rel}")

    page.on("console", on_console)
    page.on("pageerror", lambda exc: page_errors.append(str(exc)))
    page.on("response", on_response)
    page.on("requestfailed", on_request_failed)

    response = page.goto(f"{server_url}/{page_path}", wait_until="networkidle")

    assert response is not None, f"{page_path}: geen response"
    assert response.ok, f"{page_path}: HTTP {response.status}"

    # laat late animaties / lazy assets nog even settelen
    page.wait_for_timeout(500)

    assert not page_errors, f"{page_path}: JavaScript-fouten: {page_errors}"
    assert not console_errors, f"{page_path}: console-errors: {console_errors}"
    assert not failed_requests, f"{page_path}: kapotte eigen assets: {failed_requests}"

    body_text = page.locator("body").inner_text()
    assert len(body_text.strip()) > 100, f"{page_path}: pagina rendert nauwelijks tekst"


# design-system.html laadt als enige pagina styles/w4.css niet. De topnav moet
# er toch hetzelfde uitzien, dus die staat hier expliciet in de lijst.
NAV_PAGES = ["index.html", "design-system.html", "logos.html", "deck.html"]


@pytest.mark.parametrize("page_path", NAV_PAGES)
@pytest.mark.parametrize("width", [1280, 1024])
def test_navbar_fits_on_a_normal_screen(page, server_url, page_path, width):
    """De topnav mag op een gewoon scherm niet hoeven schuiven.

    Er komt af en toe een item bij (Logo's was de achtste). Deze test valt om
    zodra de rij breder wordt dan de balk, in plaats van dat het laatste item
    stilletjes onder de rand verdwijnt. En als de rij wél schuift, mag daar
    geen scrollbar in de balk van verschijnen.
    """
    page.set_viewport_size({"width": width, "height": 800})
    page.goto(f"{server_url}/{page_path}", wait_until="domcontentloaded")
    page.wait_for_selector("#w4-nav nav ul li a")

    fit = page.evaluate(
        "() => {"
        "  const nav = document.querySelector('#w4-nav nav');"
        "  return {over: nav.scrollWidth - nav.clientWidth,"
        "          items: nav.querySelectorAll('li').length,"
        "          scrollbar: getComputedStyle(nav).scrollbarWidth};"
        "}"
    )
    assert fit["items"] >= 8
    assert fit["over"] <= 0, f"{page_path}: topnav schuift op {width}px: {fit['over']}px te breed"
    assert fit["scrollbar"] == "none", f"{page_path}: zichtbare scrollbar in de topnav"


def test_deck_pdf_button_opens_reveal_print_view(page, server_url):
    """De PDF-knop bewaart het deck en opent Reveal in 16:9-printmodus."""
    page.goto(f"{server_url}/deck.html", wait_until="networkidle")
    page.evaluate(
        """() => {
          window.__openedDeck = null;
          window.open = (url) => { window.__openedDeck = url; };
        }"""
    )

    page.locator("#deck-pdf").click()

    assert page.evaluate("window.__openedDeck") == "deck-view.html?print-pdf=1&auto-print=1"
    assert page.evaluate("localStorage.getItem('w4-deck-source')").strip()
    assert page.evaluate("JSON.parse(localStorage.getItem('w4-deck-options')).transition") == "slide"


# ── url()-verwijzingen, letter voor letter ──────────────────────────────────

URL_REF = re.compile(r"""url\(\s*['"]?([^'")]+)['"]?\s*\)""")

# Bestanden waar een url() naar iets van onszelf kan wijzen.
REF_SOURCES = sorted(
    p.relative_to(REPO_ROOT).as_posix()
    for p in [*REPO_ROOT.glob("*.html"), *REPO_ROOT.glob("**/*.css")]
    if "node_modules" not in p.parts
)


def exists_with_exact_case(relative_path):
    """Bestaat dit pad precies zo, hoofdletters en al?

    `Path.exists()` is hier niet genoeg: Windows en macOS zijn
    hoofdletterongevoelig, dus daar bestaat fonts/Raleway ook als de map
    Raleway heet en de CSS raleway vraagt. Linux, waar GitHub Pages op draait,
    is dat niet. Daarom lopen we de mapnamen zelf na.
    """
    current = REPO_ROOT
    for part in relative_path.split("/"):
        if part in ("", "."):
            continue
        try:
            entries = os.listdir(current)
        except (NotADirectoryError, FileNotFoundError):
            return False
        if part not in entries:
            return False
        current = current / part
    return True


@pytest.mark.parametrize("source", REF_SOURCES)
def test_url_references_match_the_filesystem_exactly(source):
    """Elke url() naar een eigen bestand moet exact kloppen, hoofdletters incluis.

    Dit staat los van de browser-smoke test hierboven: die serveert via
    http.server op het lokale bestandssysteem, en dat is op Windows
    hoofdletterongevoelig. Een pad met de verkeerde hoofdletter geeft daar dus
    gewoon 200 en valt pas op GitHub Pages om. Zo is het een keer gebeurd met
    de fonts, die als Fonts/ in git stonden terwijl de CSS fonts/ vroeg.
    """
    text = (REPO_ROOT / source).read_text(encoding="utf-8")
    base = Path(source).parent.as_posix()

    missing = []
    for ref in URL_REF.findall(text):
        if ref.startswith(("http://", "https://", "data:", "#", "//")):
            continue
        candidate = posixpath.normpath(posixpath.join(base, ref) if base != "." else ref)
        if not exists_with_exact_case(candidate):
            missing.append(f"{ref} -> {candidate}")

    assert not missing, f"{source}: url() wijst naar iets dat er zo niet is: {missing}"
