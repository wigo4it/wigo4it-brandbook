"""Browser-smoke tests: doet elke pagina het nog?

Voor elke .html-pagina in de repo controleren we het soort breuk dat bij een
brandbook echt voorkomt:

* pagina geeft HTTP 200;
* geen JavaScript-crash (`pageerror`) en geen `console.error`;
* geen kapotte eigen assets (404 op een shape, icon of foto);
* de pagina rendert daadwerkelijk tekst.

Externe CDN's (Tailwind, GSAP) en de bewust niet-gecommitte `fonts/` vallen
buiten de gate: die horen niet bij onze code en degraden gracieus.
"""

from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent

# Requests naar deze pad-prefixes mogen falen zonder de test te breken.
# fonts/ staat bewust in .gitignore (PP Neue Machina is commercieel); de
# @font-face-regels vallen netjes terug op een systeem-stack.
ALLOWED_FAILING_PREFIXES = ("fonts/",)


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


@pytest.mark.parametrize("width", [1280, 1024])
def test_navbar_fits_on_a_normal_screen(page, server_url, width):
    """De topnav mag op een gewoon scherm niet hoeven schuiven.

    Er komt af en toe een item bij (Logo's was de achtste). Deze test valt om
    zodra de rij breder wordt dan de balk, in plaats van dat het laatste item
    stilletjes onder de rand verdwijnt.
    """
    page.set_viewport_size({"width": width, "height": 800})
    page.goto(f"{server_url}/index.html", wait_until="domcontentloaded")
    page.wait_for_selector("#w4-nav nav ul li a")

    fit = page.evaluate(
        "() => {"
        "  const nav = document.querySelector('#w4-nav nav');"
        "  return {over: nav.scrollWidth - nav.clientWidth,"
        "          items: nav.querySelectorAll('li').length};"
        "}"
    )
    assert fit["items"] >= 8
    assert fit["over"] <= 0, f"topnav schuift op {width}px: {fit['over']}px te breed"
