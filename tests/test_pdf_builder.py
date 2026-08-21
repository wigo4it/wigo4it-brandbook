"""Unit-tests voor de PDF-builder logica (scripts/pdf-builder.js).

De builder is een losse ES-module zonder DOM-globals-afhankelijkheid bij het
laden, zodat we 'm in de browser kunnen importeren en de pure functies direct
kunnen aanroepen. Dat sluit aan op de bestaande browser-harness: we serveren de
repo-root (zie conftest) en draaien de asserties via Playwright's evaluate.

We testen alleen onze eigen logica op de afgesproken seams:
* slugify        - koptekst -> veilig anker-id
* collectHeadings - h1/h2 uit gerenderde markdown halen + ids injecteren
* extractFrontMatter - voorwerk (alles voor de eerste h1) uit de content halen
* isPageBreakMarker / applyPageBreaks - handmatige pagina-einden uit de markdown
* renderToc      - inhoudsopgave-element met nesting en links
* assembleDocument - voorblad, optionele TOC, footer en content samenstellen

markdown-it, de print-CSS en de daadwerkelijke PDF-render vallen hier bewust
buiten; die horen bij de browser-smoke test (elke .html) resp. de browser zelf.
"""

import pytest


@pytest.fixture
def builder(page, server_url):
    """Laadt de module op de server-origin en geeft een call-helper terug.

    De helper roept een geexporteerde functie aan via een dynamische import en
    geeft het resultaat als JSON-serialiseerbare waarde terug.
    """
    page.goto(f"{server_url}/", wait_until="domcontentloaded")

    def call(fn_body):
        return page.evaluate(
            "async ({fnBody}) => {"
            "  const m = await import('/scripts/pdf-builder.js');"
            "  const fn = new Function('m', 'return (' + fnBody + ')(m);');"
            "  return await fn(m);"
            "}",
            {"fnBody": fn_body},
        )

    return call


@pytest.mark.parametrize(
    "text, expected",
    [
        ("Hoofdstuk 1: Intro", "hoofdstuk-1-intro"),
        ("  Spaties  rondom  ", "spaties-rondom"),
        ("Café & Résumé", "cafe-resume"),
        ("Meerdere   spaties", "meerdere-spaties"),
        ("!!!", "section"),  # niets bruikbaars -> stabiele fallback
    ],
)
def test_slugify(builder, text, expected):
    result = builder(f"(m) => m.slugify({text!r})")
    assert result == expected


def test_collect_headings_returns_h1_and_h2_with_levels(builder):
    result = builder(
        """(m) => {
            const c = document.createElement('div');
            c.innerHTML = '<h1>Titel</h1><p>x</p><h2>Sectie A</h2>' +
                          '<h3>Genegeerd</h3><h2>Sectie B</h2>';
            return m.collectHeadings(c).map(h => [h.level, h.text, h.id]);
        }"""
    )
    assert result == [
        [1, "Titel", "titel"],
        [2, "Sectie A", "sectie-a"],
        [2, "Sectie B", "sectie-b"],
    ]


def test_collect_headings_injects_ids_into_dom(builder):
    ids = builder(
        """(m) => {
            const c = document.createElement('div');
            c.innerHTML = '<h1>Titel</h1><h2>Sectie</h2>';
            m.collectHeadings(c);
            return Array.from(c.querySelectorAll('h1,h2')).map(h => h.id);
        }"""
    )
    assert ids == ["titel", "sectie"]


def test_collect_headings_dedupes_colliding_ids(builder):
    result = builder(
        """(m) => {
            const c = document.createElement('div');
            c.innerHTML = '<h2>Intro</h2><h2>Intro</h2><h2>Intro</h2>';
            return m.collectHeadings(c).map(h => h.id);
        }"""
    )
    assert result == ["intro", "intro-2", "intro-3"]


def test_collect_headings_preserves_existing_id(builder):
    result = builder(
        """(m) => {
            const c = document.createElement('div');
            c.innerHTML = '<h1 id="eigen-id">Titel</h1>';
            return m.collectHeadings(c).map(h => h.id);
        }"""
    )
    assert result == ["eigen-id"]


# ── extractFrontMatter: alles voor de documenttitel ──

FRONT_HTML = (
    "'<h2>Versiebeheer</h2><table><tr><td>1.1</td></tr></table>'"
    " + '<h3>Changelog</h3><p>Wijziging.</p>'"
    " + '<h1>Documenttitel</h1><h2>Inleiding</h2><p>Body.</p>'"
)


def test_extract_front_matter_moves_everything_before_first_h1(builder):
    result = builder(
        f"""(m) => {{
            const c = document.createElement('div');
            c.innerHTML = {FRONT_HTML};
            const front = m.extractFrontMatter(c);
            return {{
                front: Array.from(front.children).map(el => el.tagName),
                rest: Array.from(c.children).map(el => el.tagName),
            }};
        }}"""
    )
    assert result == {
        "front": ["H2", "TABLE", "H3", "P"],
        "rest": ["H1", "H2", "P"],
    }


def test_extract_front_matter_none_when_document_starts_with_h1(builder):
    result = builder(
        """(m) => {
            const c = document.createElement('div');
            c.innerHTML = '<h1>Titel</h1><p>Body.</p>';
            return m.extractFrontMatter(c);
        }"""
    )
    assert result is None


def test_extract_front_matter_none_without_h1(builder):
    # Geen documenttitel: dan is er geen grens en blijft alles gewoon content.
    result = builder(
        """(m) => {
            const c = document.createElement('div');
            c.innerHTML = '<h2>Sectie</h2><p>Body.</p>';
            return m.extractFrontMatter(c);
        }"""
    )
    assert result is None


# ── pagina-einden: markers uit de markdown ──


@pytest.mark.parametrize(
    "text",
    [
        "<!-- pagebreak -->",
        "<!– pagebreak –>",  # zoals typographer 'm oplevert
        "<pagebreak>",
        "<pagebreak/>",
        "<page-break>",
        "\\pagebreak",
        "  <!-- PAGEBREAK -->  ",
    ],
)
def test_is_page_break_marker_accepts_markers(builder, text):
    assert builder(f"(m) => m.isPageBreakMarker({text!r})") is True


@pytest.mark.parametrize(
    "text",
    [
        "pagebreak",  # zonder markertekens is het gewoon een woord
        "Hier komt een <!-- pagebreak --> midden in een zin",
        "<!-- toc -->",
        "",
    ],
)
def test_is_page_break_marker_rejects_other_text(builder, text):
    assert builder(f"(m) => m.isPageBreakMarker({text!r})") is False


def test_apply_page_breaks_replaces_marker_paragraph(builder):
    result = builder(
        """(m) => {
            const c = document.createElement('div');
            c.innerHTML = '<p>Voor</p><p>&lt;!-- pagebreak --&gt;</p><p>Na</p>';
            const count = m.applyPageBreaks(c);
            return { count, tags: Array.from(c.children).map(el => el.tagName + ':' + el.className) };
        }"""
    )
    assert result == {
        "count": 1,
        "tags": ["P:", "DIV:w4-pagebreak", "P:"],
    }


def test_apply_page_breaks_leaves_inline_mentions_alone(builder):
    result = builder(
        """(m) => {
            const c = document.createElement('div');
            c.innerHTML = '<p>Gebruik &lt;!-- pagebreak --&gt; op een eigen regel.</p>';
            return { count: m.applyPageBreaks(c), breaks: c.querySelectorAll('.w4-pagebreak').length };
        }"""
    )
    assert result == {"count": 0, "breaks": 0}


def test_assemble_turns_markers_into_page_breaks(builder):
    result = builder(
        """(m) => {
            const doc = m.assembleDocument({
                contentHtml: '<h1>Titel</h1><p>Een</p><p>&lt;pagebreak&gt;</p><h2>Twee</h2>',
                includeToc: true,
            });
            return {
                breaks: doc.querySelectorAll('.w4-doc-content .w4-pagebreak').length,
                text: doc.querySelector('.w4-doc-content').textContent.includes('pagebreak'),
                headings: Array.from(doc.querySelectorAll('.w4-toc-label')).map(e => e.textContent),
            };
        }"""
    )
    assert result == {"breaks": 1, "text": False, "headings": ["Titel", "Twee"]}


def test_render_toc_builds_nav_with_links_per_heading(builder):
    result = builder(
        """(m) => {
            const nav = m.renderToc([
                { level: 1, text: 'Titel', id: 'titel' },
                { level: 2, text: 'Sectie A', id: 'sectie-a' },
            ]);
            const links = Array.from(nav.querySelectorAll('a'));
            return {
                tag: nav.tagName.toLowerCase(),
                links: links.map(a => [a.getAttribute('href'), a.textContent]),
            };
        }"""
    )
    assert result["tag"] == "nav"
    assert result["links"] == [["#titel", "Titel"], ["#sectie-a", "Sectie A"]]


def test_render_toc_marks_heading_level(builder):
    result = builder(
        """(m) => {
            const nav = m.renderToc([
                { level: 1, text: 'Titel', id: 'titel' },
                { level: 2, text: 'Sub', id: 'sub' },
            ]);
            return Array.from(nav.querySelectorAll('li'))
                .map(li => li.getAttribute('data-level'));
        }"""
    )
    assert result == ["1", "2"]


def test_render_toc_empty_has_no_links(builder):
    count = builder(
        "(m) => m.renderToc([]).querySelectorAll('a').length"
    )
    assert count == 0


# ── assembleDocument: de integratie-seam ──

DOC_ARGS = (
    "contentHtml: '<h1>Titel</h1><h2>Sectie</h2><p>Body-tekst hier.</p>', "
    "coverTitle: 'Mijn document'"
)


def test_assemble_includes_content(builder):
    text = builder(
        f"(m) => m.assembleDocument({{ {DOC_ARGS} }}).textContent"
    )
    assert "Body-tekst hier." in text


def test_assemble_cover_variant_before_content(builder):
    result = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{ {DOC_ARGS}, cover: 'aubergine' }});
            const cover = doc.querySelector('.w4-cover-page');
            const kids = Array.from(doc.children);
            return {{
                hasVariant: cover.classList.contains('w4-cover--aubergine'),
                title: cover.textContent.includes('Mijn document'),
                coverFirst: kids.indexOf(cover) === 0,
            }};
        }}"""
    )
    assert result == {"hasVariant": True, "title": True, "coverFirst": True}


def test_assemble_without_cover_has_no_cover_page(builder):
    count = builder(
        f"(m) => m.assembleDocument({{ {DOC_ARGS}, cover: 'none' }})"
        ".querySelectorAll('.w4-cover-page').length"
    )
    assert count == 0


def test_assemble_unknown_cover_falls_back_to_none(builder):
    count = builder(
        f"(m) => m.assembleDocument({{ {DOC_ARGS}, cover: 'chartreuse' }})"
        ".querySelectorAll('.w4-cover-page').length"
    )
    assert count == 0


def test_assemble_white_cover_variant(builder):
    result = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{ {DOC_ARGS}, cover: 'white' }});
            const cover = doc.querySelector('.w4-cover-page');
            return cover ? cover.classList.contains('w4-cover--white') : null;
        }}"""
    )
    assert result is True


def test_assemble_pink_cover_is_gone(builder):
    # Roze is vervangen door wit; 'pink' is geen geldige variant meer.
    count = builder(
        f"(m) => m.assembleDocument({{ {DOC_ARGS}, cover: 'pink' }})"
        ".querySelectorAll('.w4-cover-page').length"
    )
    assert count == 0


def test_assemble_cover_date_when_provided(builder):
    result = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{
                {DOC_ARGS}, cover: 'green', coverDate: '14 juli 2026'
            }});
            const d = doc.querySelector('.w4-cover-page-date');
            return d && d.textContent;
        }}"""
    )
    assert result == "14 juli 2026"


def test_assemble_no_cover_date_when_empty(builder):
    count = builder(
        f"(m) => m.assembleDocument({{ {DOC_ARGS}, cover: 'green' }})"
        ".querySelectorAll('.w4-cover-page-date').length"
    )
    assert count == 0


def test_assemble_toc_when_requested_links_to_headings(builder):
    hrefs = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{ {DOC_ARGS}, includeToc: true }});
            return Array.from(doc.querySelectorAll('.w4-toc a'))
                .map(a => a.getAttribute('href'));
        }}"""
    )
    assert hrefs == ["#titel", "#sectie"]


def test_assemble_toc_targets_exist_in_content(builder):
    # De TOC-links moeten naar echt bestaande ids in de content wijzen.
    result = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{ {DOC_ARGS}, includeToc: true }});
            return Array.from(doc.querySelectorAll('.w4-toc a')).every(a => {{
                const id = a.getAttribute('href').slice(1);
                return !!doc.querySelector('.w4-doc-content #' + id);
            }});
        }}"""
    )
    assert result is True


def test_assemble_no_toc_by_default(builder):
    count = builder(
        f"(m) => m.assembleDocument({{ {DOC_ARGS} }}).querySelectorAll('.w4-toc').length"
    )
    assert count == 0


def test_assemble_footer_text_rendered(builder):
    result = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{ {DOC_ARGS}, footerText: 'Wigo4it 2026' }});
            const f = doc.querySelector('.w4-page-footer');
            return {{ text: f && f.textContent, attr: doc.getAttribute('data-footer') }};
        }}"""
    )
    assert result == {"text": "Wigo4it 2026", "attr": "Wigo4it 2026"}


def test_assemble_no_footer_when_empty(builder):
    count = builder(
        f"(m) => m.assembleDocument({{ {DOC_ARGS}, footerText: '' }})"
        ".querySelectorAll('.w4-page-footer').length"
    )
    assert count == 0


@pytest.mark.parametrize(
    "filename, expected",
    [
        ("jaarplan-2026.md", "Jaarplan 2026"),
        ("mijn_document.markdown", "Mijn document"),
        ("notes.txt", "Notes"),
        ("README", "README"),  # geen extensie -> naam blijft heel
        ("architectuur.ontwerp.md", "Architectuur.ontwerp"),  # alleen laatste .md eraf
        ("   ", "Document"),  # niets bruikbaars -> stabiele fallback
    ],
)
def test_filename_to_title(builder, filename, expected):
    result = builder(f"(m) => m.filenameToTitle({filename!r})")
    assert result == expected


@pytest.mark.parametrize(
    "source, expected",
    [
        ("---\ntitle: Jaarplan\nauthor: W4\n---\n# Kop\n\ntekst", "# Kop\n\ntekst"),
        ("---\r\ntitle: Jaarplan\r\n---\r\n# Kop", "# Kop"),  # CRLF-regeleindes
        ("# Kop\n\ntekst", "# Kop\n\ntekst"),  # geen frontmatter -> ongemoeid
        ("---\ntitle: Jaarplan\n# Kop", "---\ntitle: Jaarplan\n# Kop"),  # niet afgesloten
        ("tekst\n---\nmeer", "tekst\n---\nmeer"),  # --- niet bovenaan
    ],
)
def test_strip_front_matter(builder, source, expected):
    result = builder(f"(m) => m.stripFrontMatter({source!r})")
    assert result == expected


@pytest.mark.parametrize(
    "iso, expected",
    [
        ("2026-07-14", "14 juli 2026"),
        ("2026-01-01", "1 januari 2026"),
        ("2025-12-31", "31 december 2025"),
        ("", ""),  # niets ingevuld
        ("14-07-2026", ""),  # verkeerd formaat -> leeg
        ("2026-13-01", ""),  # ongeldige maand -> leeg
    ],
)
def test_format_date_nl(builder, iso, expected):
    result = builder(f"(m) => m.formatDateNL({iso!r})")
    assert result == expected


def test_assemble_full_order_cover_toc_content(builder):
    order = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{
                {DOC_ARGS}, cover: 'green', includeToc: true, footerText: 'F'
            }});
            return Array.from(doc.children)
                .map(el => el.className.split(' ')[0])
                .filter(c => ['w4-cover-page','w4-toc','w4-doc-content'].includes(c));
        }}"""
    )
    assert order == ["w4-cover-page", "w4-toc", "w4-doc-content"]


FRONT_DOC_ARGS = f"contentHtml: {FRONT_HTML}, coverTitle: 'Mijn document'"


def test_assemble_front_matter_sits_between_cover_and_toc(builder):
    order = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{
                {FRONT_DOC_ARGS}, cover: 'green', includeToc: true
            }});
            return Array.from(doc.children).map(el => el.className.split(' ')[0]);
        }}"""
    )
    assert order == ["w4-cover-page", "w4-doc-front", "w4-toc", "w4-doc-content"]


def test_assemble_front_matter_headings_stay_out_of_toc(builder):
    labels = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{ {FRONT_DOC_ARGS}, includeToc: true }});
            return Array.from(doc.querySelectorAll('.w4-toc-label'))
                .map(el => el.textContent);
        }}"""
    )
    assert labels == ["Documenttitel", "Inleiding"]


def test_assemble_front_matter_content_is_not_duplicated(builder):
    counts = builder(
        f"""(m) => {{
            const doc = m.assembleDocument({{ {FRONT_DOC_ARGS}, includeToc: true }});
            const text = doc.textContent;
            return {{
                versiebeheer: text.split('Versiebeheer').length - 1,
                inFront: !!doc.querySelector('.w4-doc-front table'),
                inBody: !!doc.querySelector('.w4-doc-content:not(.w4-doc-front) table'),
            }};
        }}"""
    )
    assert counts == {"versiebeheer": 1, "inFront": True, "inBody": False}


def test_assemble_without_front_matter_has_no_front_block(builder):
    count = builder(
        f"(m) => m.assembleDocument({{ {DOC_ARGS}, includeToc: true }})"
        ".querySelectorAll('.w4-doc-front').length"
    )
    assert count == 0
