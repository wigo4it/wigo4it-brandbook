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


def test_build_slide_decoration_sits_in_its_own_layer(builder):
    """De laag mag buiten de slide komen, zodat een afgesneden shape niet los hangt."""
    html = _slide(builder, "<!-- w4: shape:ring ghost:01 -->\nTekst")
    assert "w4-slide-decor" in html
    assert html.index("w4-slide-decor") < html.index("w4-slide-body")


def test_build_slide_without_decoration_has_no_empty_layer(builder):
    html = _slide(builder, "Tekst")
    assert "w4-slide-decor" not in html


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


# ── tokens met spaties ───────────────────────────────────────────────────────


def test_tokenize_splits_on_whitespace(builder):
    result = builder("(m) => m.tokenize('green statement icon:Rocket')")
    assert result == ["green", "statement", "icon:Rocket"]


def test_tokenize_keeps_quoted_value_together(builder):
    """Vijf iconen hebben een spatie in de naam; zonder quotes onbereikbaar."""
    result = builder('(m) => m.tokenize(\'green icon:"Game Boy" steps\')')
    assert result == ["green", 'icon:"Game Boy"', "steps"]


def test_slide_config_strips_quotes_from_value(builder):
    result = builder("(m) => m.slideConfig(['icon:\"Game Boy\"'])")
    assert result["icon"] == "Game Boy"
    assert result["unknown"] == []


def test_build_slide_escapes_spaces_in_icon_path(builder):
    html = _slide(builder, '<!-- w4: icon:"Game Boy" -->\nTekst')
    assert "img/icons/Game%20Boy.svg" in html


# ── accent, eyebrow en ghost ─────────────────────────────────────────────────


def test_slide_config_accent_defaults_per_background(builder):
    """Donkere achtergrond krijgt een licht accent en andersom."""
    dark = builder("(m) => m.slideConfig(['green'])")
    light = builder("(m) => m.slideConfig(['white'])")
    assert dark["accent"] == "yellow"
    assert light["accent"] == "green"


def test_slide_config_explicit_accent_wins(builder):
    result = builder("(m) => m.slideConfig(['green', 'accent:pink'])")
    assert result["accent"] == "pink"


def test_slide_config_rejects_accent_that_is_not_a_brand_color(builder):
    result = builder("(m) => m.slideConfig(['accent:turquoise'])")
    assert result["unknown"] == ["accent:turquoise"]
    assert result["accent"] == "green"


def test_build_slide_sets_accent_variable(builder):
    html = _slide(builder, "<!-- w4: blue accent:red -->\nTekst")
    assert "--slide-accent: var(--bright-red)" in html


def test_build_slide_eyebrow_lands_above_the_content(builder):
    html = _slide(builder, '<!-- w4: eyebrow:"Onze aanpak" -->\nTekst')
    assert "w4-slide-eyebrow" in html
    assert html.index("Onze aanpak") < html.index("Tekst")


def test_build_slide_ghost_is_hidden_from_assistive_tech(builder):
    html = _slide(builder, "<!-- w4: ghost:01 -->\nTekst")
    assert "w4-slide-ghost" in html
    assert ">01<" in html


# ── de nieuwe layouts ────────────────────────────────────────────────────────


def _layout(builder, tokens, render):
    """Bouw een slide met een layout-token en een vaste HTML-uitkomst."""
    return builder(
        f"(m) => m.buildSlide({{markdown: '<!-- w4: {tokens} -->\\nx', "
        f"renderMarkdown: {render}, number: 1}}).outerHTML"
    )


ITEMS = "(md) => '<h2>Kop</h2><h3>Een</h3><p>a</p><h3>Twee</h3><p>b</p>'"


def test_build_slide_list_turns_headings_into_badges(builder):
    html = _layout(builder, "list", ITEMS)
    assert html.count("w4-slide-list-item") == 2
    assert '<span class="w4-slide-badge">Een</span>' in html
    # de kop zelf staat niet nog een keer in de tekstkolom
    assert "<h3>Een</h3>" not in html


def test_build_slide_agenda_numbers_items(builder):
    html = _layout(builder, "agenda", ITEMS)
    assert ">01<" in html and ">02<" in html
    # anders dan bij list blijft de kop staan als titel van het item
    assert "<h3>Een</h3>" in html


def test_build_slide_timeline_gives_each_step_a_dot(builder):
    html = _layout(builder, "timeline", ITEMS)
    assert html.count("w4-slide-timeline-dot") == 2
    assert 'data-count="2"' in html


def test_build_slide_kpi_uses_heading_as_figure(builder):
    html = _layout(builder, "kpi", ITEMS)
    assert '<p class="w4-slide-kpi-figure">Een</p>' in html
    assert html.count("w4-slide-kpi-label") == 2


def test_build_slide_contrast_marks_first_item_as_out(builder):
    html = _layout(builder, "contrast", ITEMS)
    assert "w4-slide-card is-out" in html
    assert "w4-slide-card is-in" in html
    assert html.index("is-out") < html.index("is-in")


def test_build_slide_item_layouts_keep_the_title_above(builder):
    """Alles voor de eerste `###` blijft buiten de constructie staan."""
    for layout, marker in [
        ("list", "w4-slide-list"),
        ("agenda", "w4-slide-list"),
        ("timeline", "w4-slide-timeline"),
        ("kpi", "w4-slide-kpis"),
        ("contrast", "w4-slide-cards"),
    ]:
        html = _layout(builder, layout, ITEMS)
        assert html.index("<h2>Kop</h2>") < html.index(marker), layout


def test_build_slide_item_layouts_without_headings_stay_flat(builder):
    """Geen `###` betekent niets om te herschikken; de slide blijft heel."""
    render = "(md) => '<h2>Kop</h2><p>tekst</p>'"
    for layout in ["list", "agenda", "timeline", "kpi", "contrast"]:
        html = _layout(builder, layout, render)
        assert "<p>tekst</p>" in html, layout
        assert "w4-slide-list-item" not in html, layout


HALVES = "(md) => '<h2>Kop</h2><p>oud</p><hr><p>nieuw</p>'"


def test_build_slide_before_after_puts_an_arrow_between_two_cards(builder):
    html = _layout(builder, "before-after", HALVES)
    assert "w4-slide-card is-before" in html
    assert "w4-slide-card is-after" in html
    assert "→" in html
    assert "<hr>" not in html


def test_build_slide_before_after_lifts_the_title_out_of_the_card(builder):
    html = _layout(builder, "before-after", HALVES)
    assert html.index("<h2>Kop</h2>") < html.index("w4-slide-before-after")


def test_build_slide_transformation_lifts_everything_before_the_first_h3(builder):
    """Zelfde regel als bij de item-layouts: voor de eerste `###` is intro."""
    render = "(md) => '<h2>Kop</h2><p>lead</p><h3>Voor</h3><p>oud</p><hr><h3>Na</h3><p>nieuw</p>'"
    html = _layout(builder, "stacked", render)
    assert html.index("<p>lead</p>") < html.index("w4-slide-stacked")
    assert html.index("<h3>Voor</h3>") > html.index("w4-slide-card is-before")


def test_build_slide_stacked_uses_a_downward_arrow(builder):
    html = _layout(builder, "stacked", HALVES)
    assert "w4-slide-stacked" in html
    assert "↓" in html


def test_build_slide_transformation_without_divider_stays_flat(builder):
    render = "(md) => '<p>alleen dit</p>'"
    for layout in ["before-after", "stacked"]:
        html = _layout(builder, layout, render)
        assert "w4-slide-card" not in html, layout


def test_build_slide_table_gets_its_own_wrapper(builder):
    render = "(md) => '<table><tr><td>a</td></tr></table>'"
    html = _layout(builder, "table", render)
    assert "w4-slide-table" in html
    assert html.index("w4-slide-table") < html.index("<table>")


def test_build_slide_photo_moves_the_image_behind_the_text(builder):
    render = "(md) => '<h2>Kop</h2><img src=\"img/photos/x.jpg\" alt=\"x\">'"
    html = _layout(builder, "photo", render)
    assert "w4-slide-photo-layer" in html
    # de foto staat voor de tekstlaag in de DOM, dus eronder in beeld
    assert html.index("w4-slide-photo-layer") < html.index("w4-slide-body")
    # en is decoratief, dus zonder alt-tekst in de leesvolgorde
    assert 'alt="x"' not in html


def test_build_slide_photo_always_uses_the_diapositive_logo(builder):
    """De foto vult de slide, dus de achtergrondkleur zegt niets over contrast."""
    render = "(md) => '<img src=\"img/photos/x.jpg\" alt=\"\">'"
    html = _layout(builder, "photo white", render)
    assert "Logo%20Diap.svg" in html


def test_build_slide_photo_without_image_stays_flat(builder):
    render = "(md) => '<p>geen foto</p>'"
    html = _layout(builder, "photo", render)
    assert "w4-slide-photo-layer" not in html
    assert "<p>geen foto</p>" in html


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
