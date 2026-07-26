"""Unit-tests voor de deck-builder logica (scripts/deck-builder.js).

Zelfde opzet als test_pdf_builder.py: de module is een losse ES-module zonder
DOM-globals bij het laden, dus we importeren 'm in de browser en roepen de pure
functies aan via Playwright's evaluate.

We testen het auteursformaat en wat de builder daarvan maakt:
* parseFrontMatter  - metadata bovenaan het bestand
* splitSlides       - `---` en `--` naar horizontale/verticale slides
* extractDirectives - de `<!-- w4: ... -->` tokenregel
* extractNotes      - `Note:` naar sprekersnotitie
* slideConfig       - tokens naar kleur, layout en decoratie
* buildSlide/buildDeck - de reveal-structuur die eruit rolt

reveal.js zelf en de opmaak vallen buiten deze test; die horen bij de
browser-smoke test over alle .html-pagina's.
"""

import pytest


@pytest.fixture
def builder(page, server_url):
    """Laadt de module op de server-origin en geeft een call-helper terug."""
    page.goto(f"{server_url}/", wait_until="domcontentloaded")

    def call(fn_body):
        return page.evaluate(
            "async ({fnBody}) => {"
            "  const m = await import('/scripts/deck-builder.js');"
            "  const fn = new Function('m', 'return (' + fnBody + ')(m);');"
            "  return await fn(m);"
            "}",
            {"fnBody": fn_body},
        )

    return call


# ── frontmatter ──────────────────────────────────────────────────────────────


def test_front_matter_reads_key_values(builder):
    source = "---\ntitle: Good code\nfooter: Wigo4it\n---\n\n# Slide"
    result = builder(f"(m) => m.parseFrontMatter({source!r})")
    assert result["meta"] == {"title": "Good code", "footer": "Wigo4it"}
    assert result["body"] == "# Slide"


def test_front_matter_absent_keeps_body_intact(builder):
    source = "# Slide\n\nTekst"
    result = builder(f"(m) => m.parseFrontMatter({source!r})")
    assert result["meta"] == {}
    assert result["body"] == source


def test_front_matter_unterminated_is_not_swallowed(builder):
    """Een losse `---` bovenaan is een slide-scheiding, geen frontmatter."""
    source = "---\n# Slide"
    result = builder(f"(m) => m.parseFrontMatter({source!r})")
    assert result["meta"] == {}
    assert result["body"] == source


# ── slides splitsen ──────────────────────────────────────────────────────────


def test_split_slides_on_horizontal_rule(builder):
    source = "# Een\n\n---\n\n# Twee"
    result = builder(f"(m) => m.splitSlides({source!r})")
    assert result == [["# Een"], ["# Twee"]]


def test_split_slides_nests_vertical_slides(builder):
    source = "# Een\n\n--\n\n## Verdieping\n\n---\n\n# Twee"
    result = builder(f"(m) => m.splitSlides({source!r})")
    assert result == [["# Een", "## Verdieping"], ["# Twee"]]


def test_split_slides_drops_empty_slides(builder):
    source = "# Een\n\n---\n\n---\n\n# Twee"
    result = builder(f"(m) => m.splitSlides({source!r})")
    assert result == [["# Een"], ["# Twee"]]


def test_split_slides_keeps_column_divider_inside_slide(builder):
    """`***` is een kolomscheiding, geen slide-einde."""
    source = "Links\n\n***\n\nRechts"
    result = builder(f"(m) => m.splitSlides({source!r})")
    assert result == [["Links\n\n***\n\nRechts"]]


# ── directives en notities ───────────────────────────────────────────────────


def test_extract_directives_pulls_tokens_and_removes_line(builder):
    source = "<!-- w4: green statement -->\n# Kop"
    result = builder(f"(m) => m.extractDirectives({source!r})")
    assert result["tokens"] == ["green", "statement"]
    assert result["markdown"] == "# Kop"


def test_extract_directives_merges_multiple_lines(builder):
    source = "<!-- w4: green -->\n# Kop\n<!-- w4: steps -->"
    result = builder(f"(m) => m.extractDirectives({source!r})")
    assert result["tokens"] == ["green", "steps"]
    assert result["markdown"] == "# Kop"


def test_extract_directives_ignores_other_comments(builder):
    source = "<!-- gewoon een comment -->\n# Kop"
    result = builder(f"(m) => m.extractDirectives({source!r})")
    assert result["tokens"] == []
    assert "gewoon een comment" in result["markdown"]


def test_extract_notes_splits_on_note_prefix(builder):
    source = "# Kop\n\nNote: zeg dit erbij\nen dit ook"
    result = builder(f"(m) => m.extractNotes({source!r})")
    assert result["markdown"] == "# Kop"
    assert result["notes"] == "zeg dit erbij\nen dit ook"


def test_extract_notes_absent_keeps_markdown(builder):
    result = builder("(m) => m.extractNotes('# Kop')")
    assert result["markdown"] == "# Kop"
    assert result["notes"] == ""


# ── tokens naar configuratie ─────────────────────────────────────────────────


def test_slide_config_defaults_to_white_without_layout(builder):
    result = builder("(m) => m.slideConfig([])")
    assert result["color"] == "white"
    assert result["dark"] is False
    assert result["layout"] == ""


def test_slide_config_reads_color_and_layout(builder):
    result = builder("(m) => m.slideConfig(['green', 'statement'])")
    assert result["color"] == "green"
    assert result["dark"] is True
    assert result["layout"] == "statement"


def test_slide_config_cover_defaults_to_green(builder):
    result = builder("(m) => m.slideConfig(['cover'])")
    assert result["color"] == "green"


def test_slide_config_cover_respects_explicit_color(builder):
    result = builder("(m) => m.slideConfig(['cover', 'yellow'])")
    assert result["color"] == "yellow"
    assert result["dark"] is False


def test_slide_config_reads_shape_with_position(builder):
    result = builder("(m) => m.slideConfig(['shape:ring@bottomleft'])")
    assert result["shape"] == "ring"
    assert result["shapeSpot"] == "bottomleft"


def test_slide_config_shape_without_position_falls_back(builder):
    result = builder("(m) => m.slideConfig(['shape:ring'])")
    assert result["shapeSpot"] == "topright"


def test_slide_config_collects_unknown_tokens(builder):
    result = builder("(m) => m.slideConfig(['groen', 'statement'])")
    assert result["unknown"] == ["groen"]
    assert result["layout"] == "statement"


# ── slides bouwen ────────────────────────────────────────────────────────────

RENDER = "(md) => '<p>' + md + '</p>'"


def _slide(builder, markdown, extra=""):
    """Bouw een slide met een nep-renderer en geef de HTML terug."""
    return builder(
        f"(m) => m.buildSlide({{markdown: {markdown!r}, "
        f"renderMarkdown: {RENDER}, number: 3{extra}}}).outerHTML"
    )


def test_build_slide_sets_color_class_and_background(builder):
    html = _slide(builder, "<!-- w4: green -->\nTekst")
    assert "w4-slide--green" in html
    assert "var(--dark-green)" in html
    assert "is-dark" in html


def test_build_slide_renders_content_in_body(builder):
    html = _slide(builder, "Hallo")
    assert "<p>Hallo</p>" in html
    assert "w4-slide-body" in html


def test_build_slide_adds_footer_with_number(builder):
    html = _slide(builder, "Tekst", extra=", footerText: 'Wigo4it'")
    assert "w4-slide-footer" in html
    assert "Wigo4it" in html
    assert ">3<" in html


def test_build_slide_cover_has_no_footer(builder):
    html = _slide(builder, "<!-- w4: cover -->\n# Titel", extra=", footerText: 'Wigo4it'")
    assert "w4-slide-footer" not in html
    assert "w4-slide-logo" in html


def test_build_slide_uses_diapositive_logo_on_dark(builder):
    html = _slide(builder, "<!-- w4: aubergine -->\nTekst")
    assert "Logo%20Diap.svg" in html


def test_build_slide_uses_normal_logo_on_light(builder):
    html = _slide(builder, "<!-- w4: yellow -->\nTekst")
    assert "img/logo/Logo.svg" in html


def test_build_slide_adds_shape_and_icon(builder):
    html = _slide(builder, "<!-- w4: shape:ring@topleft icon:Rocket -->\nTekst")
    assert "img/shapes/ring.svg" in html
    assert "img/icons/Rocket.svg" in html
    assert "is-topleft" in html


def test_build_slide_steps_makes_list_items_fragments(builder):
    render = "(md) => '<ul><li>een</li><li>twee</li></ul>'"
    html = builder(
        f"(m) => m.buildSlide({{markdown: '<!-- w4: steps -->\\ntekst', "
        f"renderMarkdown: {render}, number: 1}}).outerHTML"
    )
    assert html.count("fragment") == 2


def test_build_slide_notes_land_in_aside(builder):
    html = _slide(builder, "Tekst\n\nNote: alleen voor de spreker")
    assert 'class="notes"' in html
    assert "alleen voor de spreker" in html
    # de notitie mag niet ook in de slide zelf staan
    assert html.index("Tekst") < html.index("alleen voor de spreker")


def test_build_slide_split_layout_makes_two_panels(builder):
    render = "(md) => '<p>links</p><hr><p>rechts</p>'"
    html = builder(
        f"(m) => m.buildSlide({{markdown: '<!-- w4: split -->\\nx', "
        f"renderMarkdown: {render}, number: 1}}).outerHTML"
    )
    assert html.count("w4-slide-panel") == 2
    assert "<hr>" not in html


def test_build_slide_split_without_divider_stays_flat(builder):
    render = "(md) => '<p>alleen links</p>'"
    html = builder(
        f"(m) => m.buildSlide({{markdown: '<!-- w4: split -->\\nx', "
        f"renderMarkdown: {render}, number: 1}}).outerHTML"
    )
    assert "w4-slide-panel" not in html


def test_build_slide_columns_groups_by_h3(builder):
    render = "(md) => '<h2>Kop</h2><h3>Een</h3><p>a</p><h3>Twee</h3><p>b</p>'"
    html = builder(
        f"(m) => m.buildSlide({{markdown: '<!-- w4: columns -->\\nx', "
        f"renderMarkdown: {render}, number: 1}}).outerHTML"
    )
    assert html.count('class="w4-slide-card"') == 2
    assert 'data-count="2"' in html
    # wat voor de eerste h3 staat blijft buiten de kaarten
    assert html.index("<h2>Kop</h2>") < html.index("w4-slide-cards")


# ── het hele deck ────────────────────────────────────────────────────────────


def _deck(builder, source, extra=""):
    return builder(
        f"(m) => {{ const d = m.buildDeck({{source: {source!r}, "
        f"renderMarkdown: {RENDER}{extra}}}); "
        "return {html: d.slides.outerHTML, count: d.count, meta: d.meta, unknown: d.unknown}; }"
    )


def test_build_deck_numbers_slides_across_the_deck(builder):
    result = _deck(builder, "een\n\n---\n\ntwee\n\n---\n\ndrie")
    assert result["count"] == 3


def test_build_deck_nests_vertical_slides_in_a_stack(builder):
    result = _deck(builder, "een\n\n--\n\nverdieping\n\n---\n\ntwee")
    # de stapel is een <section> zonder w4-slide-class om twee slides heen
    assert '<section><section class="w4-slide' in result["html"]


def test_build_deck_uses_front_matter_title_as_footer(builder):
    result = _deck(builder, "---\ntitle: Good code\n---\n\ntekst")
    assert result["meta"]["title"] == "Good code"
    assert "Good code" in result["html"]


def test_build_deck_front_matter_footer_beats_title(builder):
    result = _deck(builder, "---\ntitle: Good code\nfooter: Intern\n---\n\ntekst")
    assert "Intern" in result["html"]
    assert "Good code" not in result["html"]


def test_build_deck_footer_option_overrides_front_matter(builder):
    result = _deck(builder, "---\nfooter: Intern\n---\n\ntekst", extra=", footerText: 'Anders'")
    assert "Anders" in result["html"]


def test_build_deck_reports_unknown_tokens_once(builder):
    result = _deck(builder, "<!-- w4: paars -->\neen\n\n---\n\n<!-- w4: paars -->\ntwee")
    assert result["unknown"] == ["paars"]


def test_build_deck_empty_source_yields_nothing(builder):
    result = _deck(builder, "   \n\n")
    assert result["count"] == 0
