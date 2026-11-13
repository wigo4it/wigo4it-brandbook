"""End-to-end: publiceren in de deck-tool en de permalink openen.

De API zelf is gedekt in server/test/api.test.js; hier gaat het om de
browserkant: knoppen, /present/<id> in de viewer en wat een buitenstaander ziet.
"""

import re

from conftest import TEST_PASSWORD

DECK = "---\ntitle: E2E-test\n---\n\n# Eerste slide\n\n---\n\n# Tweede slide\n"


def _publish(page, server_url, visibility):
    response = page.request.post(
        f"{server_url}/api/presentations",
        data={"markdown": DECK, "visibility": visibility, "title": "E2E-test"},
    )
    assert response.status == 201
    return response.json()


def test_publish_button_creates_a_permalink_and_replace_keeps_it(logged_in, server_url, tmp_path):
    page = logged_in
    deck = tmp_path / "deck.md"
    deck.write_text(DECK, encoding="utf-8")

    page.goto(f"{server_url}/deck.html", wait_until="networkidle")
    page.set_input_files("#deck-file", str(deck))
    page.click("#deck-publish-btn")
    link = page.locator("#deck-publish-status a")
    link.wait_for()
    url = link.inner_text()
    assert re.search(r"/present/[2-9a-hjkmnp-z]{5}$", url)

    assert page.inner_text("#deck-publish-btn") == "Vervang"
    page.click("#deck-publish-btn")
    page.wait_for_function("document.querySelector('#deck-publish-status').textContent.startsWith('Vervangen')")
    assert page.locator("#deck-publish-status a").inner_text() == url


def test_public_permalink_renders_for_a_stranger(logged_in, server_url, browser):
    presentation = _publish(logged_in, server_url, "public")
    stranger = browser.new_context().new_page()
    stranger.goto(presentation["url"], wait_until="networkidle")
    stranger.wait_for_selector(".reveal .slides section")
    assert "Eerste slide" in stranger.inner_text(".reveal .slides")
    assert stranger.title().startswith("E2E-test")


def test_private_permalink_asks_a_stranger_to_log_in(logged_in, server_url, browser):
    presentation = _publish(logged_in, server_url, "private")
    stranger = browser.new_context().new_page()
    stranger.goto(presentation["url"], wait_until="networkidle")
    stranger.wait_for_selector("#deck-empty:not([hidden]) a[href*='login.html']")
    assert "niet gevonden" in stranger.inner_text("#deck-empty").lower()

    # Na inloggen is dezelfde link wel zichtbaar.
    stranger.request.post(f"{server_url}/login", data={"password": TEST_PASSWORD})
    stranger.goto(presentation["url"], wait_until="networkidle")
    stranger.wait_for_selector(".reveal .slides section")


def test_presentation_list_shows_published_decks(logged_in, server_url):
    presentation = _publish(logged_in, server_url, "private")
    logged_in.goto(f"{server_url}/presentaties.html", wait_until="networkidle")
    logged_in.wait_for_selector(f"a[href='deck.html?id={presentation['id']}']")


def test_edit_link_loads_the_presentation_into_the_tool(logged_in, server_url):
    presentation = _publish(logged_in, server_url, "public")
    logged_in.goto(f"{server_url}/deck.html?id={presentation['id']}", wait_until="networkidle")
    logged_in.wait_for_selector("#deck-publish-status a")
    assert logged_in.inner_text("#deck-publish-btn") == "Vervang"
    assert logged_in.is_checked("input[name='deck-visibility'][value='public']")
