"""Bestandsinvoer, live previews en echte Chromium-toegang tot disk."""

import pytest
from playwright.sync_api import expect


MOCK_PICKER = """
window.testFile = {source: '# Eerste', name: 'test.md', reads: 0};
window.testHandle = {
  kind: 'file',
  async getFile() {
    window.testFile.reads++;
    if (window.testFile.error) throw new DOMException('Geen toegang', window.testFile.error);
    if (window.testFile.delay) await new Promise(resolve => window.releaseRead = resolve);
    return new File([window.testFile.source], window.testFile.name);
  }
};
window.showOpenFilePicker = async () => {
  if (window.cancelPicker) throw new DOMException('Geannuleerd', 'AbortError');
  return [window.testHandle];
};
"""


def open_tool(page, server_url, tool, mock=True):
    if mock:
        page.add_init_script(MOCK_PICKER)
    page.goto(f"{server_url}/{tool}.html", wait_until="networkidle")


def choose(page, tool):
    page.locator(f"#{tool}-dropzone").click()
    expect(page.locator(f"#{tool}-file-status")).to_contain_text("Live-update actief")


def preview(page, tool):
    if tool == "pdf":
        return page.locator("#pdf-preview")
    return page.frame_locator("#deck-frame").locator("#deck-slides")


def test_deck_update_preserves_slide_position_and_clamps_removed_slides(page, server_url):
    open_tool(page, server_url, "deck")
    page.evaluate("testFile.source = '# Een\\n---\\n# Twee\\n--\\n# Verdieping\\n---\\n# Drie'")
    choose(page, "deck")
    frame = page.frame(url=f"{server_url}/deck-view.html?preview=1")
    frame.wait_for_function("window.Reveal && Reveal.isReady()")
    frame.evaluate("Reveal.slide(1, 1)")
    page.evaluate("testFile.source += '\\n\\nGewijzigd'")
    expect(preview(page, "deck")).to_contain_text("Gewijzigd", timeout=4000)
    assert frame.evaluate("({h: Reveal.getIndices().h, v: Reveal.getIndices().v})") == {"h": 1, "v": 1}

    page.locator("#deck-footer").fill("Nieuwe footer")
    expect(frame.locator("section.present .w4-slide-footer").last).to_contain_text("Nieuwe footer")
    assert frame.evaluate("({h: Reveal.getIndices().h, v: Reveal.getIndices().v})") == {"h": 1, "v": 1}

    page.evaluate("testFile.source = '# Een\\n---\\n# Twee zonder verdieping'")
    expect(preview(page, "deck")).to_contain_text("Twee zonder verdieping", timeout=4000)
    assert frame.evaluate("({h: Reveal.getIndices().h, v: Reveal.getIndices().v})") == {"h": 1, "v": 0}

    page.evaluate("testFile.source = '# Alleen eerste'")
    expect(preview(page, "deck")).to_contain_text("Alleen eerste", timeout=4000)
    assert frame.evaluate("({h: Reveal.getIndices().h, v: Reveal.getIndices().v})") == {"h": 0, "v": 0}


@pytest.mark.parametrize("tool", ["pdf", "deck"])
def test_disk_updates_reach_preview_and_preserve_settings(page, server_url, tool):
    open_tool(page, server_url, tool)
    choose(page, tool)
    expect(preview(page, tool)).to_contain_text("Eerste")
    page.locator(f"#{tool}-footer").fill("Eigen footer")
    if tool == "pdf":
        page.locator("#pdf-title").fill("Eigen titel")
        page.locator("#pdf-subtitle").fill("Eigen ondertitel")
        page.locator("#pdf-toc").check()
    else:
        page.locator("#deck-transition").select_option("fade")

    page.evaluate("testFile.source = '# Tweede'")
    expect(preview(page, tool)).to_contain_text("Tweede", timeout=4000)
    expect(page.locator(f"#{tool}-footer")).to_have_value("Eigen footer")
    if tool == "pdf":
        expect(page.locator("#pdf-title")).to_have_value("Eigen titel")
        expect(page.locator("#pdf-subtitle")).to_have_value("Eigen ondertitel")
        expect(page.locator("#pdf-toc")).to_be_checked()
    else:
        expect(page.locator("#deck-transition")).to_have_value("fade")
        page.evaluate("window.open = url => window.openedUrl = url")
        page.locator("#deck-present").click()
        assert page.evaluate("localStorage.getItem('w4-deck-source')") == "# Tweede"

    page.evaluate("testFile.source = ''")
    expect(preview(page, tool)).not_to_contain_text("Tweede", timeout=4000)
    if tool == "deck":
        expect(page.frame_locator("#deck-frame").locator("#deck-empty")).to_be_visible()


@pytest.mark.parametrize("tool", ["pdf", "deck"])
def test_unsupported_browser_can_reload_file(page, server_url, tool):
    page.add_init_script("window.showOpenFilePicker = undefined")
    open_tool(page, server_url, tool, mock=False)
    status = page.locator(f"#{tool}-file-status")
    expect(status).to_contain_text("niet beschikbaar")
    for source in ["# Handmatig een", "# Handmatig twee"]:
        page.locator(f"#{tool}-file").set_input_files({
            "name": "manual.md", "mimeType": "text/plain", "buffer": source.encode(),
        })
        expect(preview(page, tool)).to_contain_text(source[2:])
        expect(status).to_contain_text("Eenmalig geladen")
    expect(page.locator(f"#{tool}-file")).to_have_value("")


def test_unchanged_content_does_not_render_and_cancel_keeps_watching(page, server_url):
    open_tool(page, server_url, "pdf")
    choose(page, "pdf")
    page.evaluate("""() => {
      window.mutations = 0;
      new MutationObserver(() => window.mutations++)
        .observe(document.querySelector('#pdf-preview'), {childList: true});
      window.cancelPicker = true;
    }""")
    page.locator("#pdf-dropzone").click()
    page.wait_for_function("testFile.reads >= 3")
    assert page.evaluate("window.mutations") == 0
    page.evaluate("testFile.source = '# Na annuleren'")
    expect(preview(page, "pdf")).to_contain_text("Na annuleren", timeout=4000)


@pytest.mark.parametrize("error", ["NotAllowedError", "NotFoundError", "NotReadableError"])
def test_read_failure_stops_watching_and_keeps_preview(page, server_url, error):
    open_tool(page, server_url, "pdf")
    choose(page, "pdf")
    page.evaluate("(error) => testFile.error = error", error)
    expect(page.locator("#pdf-file-status")).to_contain_text("Live-update onderbroken", timeout=4000)
    expect(preview(page, "pdf")).to_contain_text("Eerste")
    reads = page.evaluate("testFile.reads")
    page.wait_for_timeout(1200)
    assert page.evaluate("testFile.reads") == reads
    page.evaluate("delete testFile.error; testFile.source = '# Hersteld'")
    choose(page, "pdf")
    expect(preview(page, "pdf")).to_contain_text("Hersteld")


def test_old_read_cannot_overwrite_new_file(page, server_url):
    open_tool(page, server_url, "pdf")
    choose(page, "pdf")
    page.evaluate("testFile.delay = true")
    page.wait_for_function("typeof window.releaseRead === 'function'")
    page.evaluate("""() => {
      window.showOpenFilePicker = async () => [{
        kind: 'file', getFile: async () => new File(['# Nieuw bestand'], 'nieuw.md')
      }];
    }""")
    choose(page, "pdf")
    expect(preview(page, "pdf")).to_contain_text("Nieuw bestand")
    page.evaluate("releaseRead()")
    page.wait_for_timeout(100)
    expect(preview(page, "pdf")).to_contain_text("Nieuw bestand")
    expect(page.locator("#pdf-dropzone-text")).to_have_text("nieuw.md")


def test_polling_does_not_overlap_and_pagehide_disposes(page, server_url):
    open_tool(page, server_url, "pdf")
    choose(page, "pdf")
    page.evaluate("testFile.delay = true")
    page.wait_for_function("typeof releaseRead === 'function'")
    reads = page.evaluate("testFile.reads")
    page.evaluate("document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_timeout(1200)
    assert page.evaluate("testFile.reads") == reads
    page.evaluate("""() => {
      window.dispatchEvent(new PageTransitionEvent('pagehide', {persisted: false}));
      testFile.source = '# Niet meer publiceren';
      releaseRead();
    }""")
    page.wait_for_timeout(1200)
    assert page.evaluate("testFile.reads") == reads
    expect(preview(page, "pdf")).to_contain_text("Eerste")


def test_initial_read_error_is_visible_and_does_not_replace_current_file(page, server_url):
    open_tool(page, server_url, "pdf")
    choose(page, "pdf")
    page.evaluate("""() => {
      window.showOpenFilePicker = async () => [{
        kind: 'file', getFile: async () => { throw new DOMException('Geen toegang', 'NotAllowedError'); }
      }];
    }""")
    page.locator("#pdf-dropzone").click()
    expect(page.locator("#pdf-file-status")).to_contain_text("Bestand laden mislukt")
    expect(preview(page, "pdf")).to_contain_text("Eerste")
    page.evaluate("testFile.source = '# Vorig bestand volgt nog'")
    expect(preview(page, "pdf")).to_contain_text("Vorig bestand volgt nog", timeout=4000)


def test_newest_selection_wins_and_dispose_removes_watchers(page, server_url):
    page.goto(f"{server_url}/", wait_until="domcontentloaded")
    page.evaluate("""async () => {
      const {bindMarkdownFile} = await import('/scripts/markdown-file.js');
      document.body.innerHTML = '<label id="zone"><input type="file" id="file"></label><p id="label"></p><p id="status"></p>';
      window.changes = [];
      window.handles = [
        {kind: 'file', getFile: () => new Promise(resolve => window.releaseOld = resolve)},
        {kind: 'file', getFile: async () => new File(['nieuw'], 'nieuw.md')}
      ];
      window.showOpenFilePicker = async () => [window.handles.shift()];
      window.dispose = bindMarkdownFile({
        input: document.querySelector('#file'), dropzone: document.querySelector('#zone'),
        label: document.querySelector('#label'), status: document.querySelector('#status'),
        onChange: source => window.changes.push(source)
      });
    }""")
    page.locator("#file").click()
    page.wait_for_function("typeof releaseOld === 'function'")
    # Simuleer een drop terwijl de eerste selectie nog wordt ingelezen.
    page.evaluate("""() => {
      const event = new Event('drop', {bubbles: true, cancelable: true});
      Object.defineProperty(event, 'dataTransfer', {value: {
        items: [], files: [new File(['nieuw'], 'nieuw.md')]
      }});
      document.querySelector('#zone').dispatchEvent(event);
      releaseOld(new File(['oud'], 'oud.md'));
    }""")
    expect(page.locator("#label")).to_have_text("nieuw.md")
    assert page.evaluate("window.changes") == ["nieuw"]
    page.evaluate("dispose(); document.querySelector('#file').click()")
    assert page.evaluate("window.changes") == ["nieuw"]


@pytest.mark.parametrize("handle_available", [True, False])
def test_drop_live_or_one_time_status(page, server_url, handle_available):
    open_tool(page, server_url, "pdf")
    page.evaluate("""(available) => {
      const event = new Event('drop', {bubbles: true, cancelable: true});
      const item = {kind: 'file'};
      if (available) item.getAsFileSystemHandle = () => Promise.resolve(testHandle);
      Object.defineProperty(event, 'dataTransfer', {value: {
        items: [item], files: [new File(['# Gesleept'], 'drop.md')]
      }});
      document.querySelector('#pdf-dropzone').dispatchEvent(event);
    }""", handle_available)
    expect(page.locator("#pdf-file-status")).to_contain_text(
        "Live-update actief" if handle_available else "Eenmalig geladen"
    )
    expect(preview(page, "pdf")).to_contain_text("Eerste" if handle_available else "Gesleept")


def test_empty_upload_wins_over_late_example(page, server_url):
    page.route("**/examples/deck-voorbeeld.md", lambda route: route.fulfill(body="# Laat voorbeeld"))
    # Een lege eigen bron moet ook na een nieuwe voorbeeld-response leeg blijven.
    page.add_init_script(MOCK_PICKER + """
      testFile.source = '';
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        if (String(args[0]).includes('deck-voorbeeld.md')) {
          await new Promise(resolve => window.releaseExample = resolve);
        }
        return originalFetch(...args);
      };
    """)
    page.goto(f"{server_url}/deck.html", wait_until="domcontentloaded")
    choose(page, "deck")
    page.evaluate("releaseExample()")
    page.wait_for_timeout(200)
    expect(preview(page, "deck")).to_be_empty()


def test_pdf_pagination_is_a_snapshot_during_live_updates(page, server_url):
    open_tool(page, server_url, "pdf")
    choose(page, "pdf")
    page.evaluate("""() => {
      window.printCalls = 0;
      window.print = () => window.printCalls++;
      window.Paged = {Previewer: class {
        async preview(html, css, target) {
          target.innerHTML = html;
          await new Promise(resolve => window.finishPagination = resolve);
        }
      }};
    }""")
    page.locator("#pdf-print").click()
    page.wait_for_function("typeof finishPagination === 'function'")
    page.evaluate("testFile.source = '# Nieuw tijdens export'")
    expect(preview(page, "pdf")).to_contain_text("Nieuw tijdens export", timeout=4000)
    expect(page.locator("#pdf-paged")).to_contain_text("Eerste")
    expect(page.locator("#pdf-paged")).not_to_contain_text("Nieuw tijdens export")
    page.evaluate("finishPagination()")
    page.wait_for_function("printCalls === 1")
    expect(page.locator("#pdf-print")).to_be_enabled()


def test_deck_exports_use_current_source_but_remain_snapshots(page, server_url):
    open_tool(page, server_url, "deck")
    choose(page, "deck")
    page.evaluate("window.open = url => window.openedUrl = url")
    page.locator("#deck-present").click()
    assert page.evaluate("localStorage.getItem('w4-deck-source')") == "# Eerste"
    page.evaluate("testFile.source = '# Voor export'")
    expect(preview(page, "deck")).to_contain_text("Voor export", timeout=4000)
    assert page.evaluate("localStorage.getItem('w4-deck-source')") == "# Eerste"
    page.locator("#deck-pdf").click()
    assert page.evaluate("localStorage.getItem('w4-deck-source')") == "# Voor export"
    assert page.evaluate("window.openedUrl") == "deck-view.html?print-pdf=1&auto-print=1"

    page.evaluate("""() => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        if (args[0] === 'styles/w4.css') await new Promise(resolve => window.releaseCss = resolve);
        return originalFetch(...args);
      };
    }""")
    with page.expect_download() as download_info:
        page.locator("#deck-download").click()
        page.wait_for_function("typeof releaseCss === 'function'")
        page.evaluate("testFile.source = '# Na exportstart'")
        expect(preview(page, "deck")).to_contain_text("Na exportstart", timeout=4000)
        page.evaluate("releaseCss()")
    html = download_info.value.path().read_text(encoding="utf-8")
    assert "Voor export" in html
    assert "Na exportstart" not in html


@pytest.mark.parametrize("tool", ["pdf", "deck"])
def test_real_disk_handle_tracks_external_file(page, server_url, tmp_path, tool):
    """CDP levert een echte OS-drag/drop, geen JS-mock van een file handle."""
    path = tmp_path / "outside-server.md"
    path.write_text("# Op disk een", encoding="utf-8")
    open_tool(page, server_url, tool, mock=False)
    zone = page.locator(f"#{tool}-dropzone")
    zone.scroll_into_view_if_needed()
    bounds = zone.bounding_box()
    session = page.context.new_cdp_session(page)
    data = {"items": [], "files": [str(path)], "dragOperationsMask": 1}
    for event in ["dragEnter", "dragOver", "drop"]:
        session.send("Input.dispatchDragEvent", {
            "type": event, "x": bounds["x"] + 20, "y": bounds["y"] + 20, "data": data,
        })
    expect(page.locator(f"#{tool}-file-status")).to_contain_text("Live-update actief")
    expect(preview(page, tool)).to_contain_text("Op disk een")
    path.write_text("# Op disk twee", encoding="utf-8")
    expect(preview(page, tool)).to_contain_text("Op disk twee", timeout=4000)
    replacement = tmp_path / "replacement.md"
    replacement.write_text("# Atomair opgeslagen", encoding="utf-8")
    replacement.replace(path)
    # Sommige OS/browsercombinaties verliezen hun handle bij atomair vervangen.
    page.wait_for_function(
        """(tool) => document.querySelector(`#${tool}-file-status`).textContent.includes('onderbroken')
          || (tool === 'pdf' ? document.querySelector('#pdf-preview').textContent
              : document.querySelector('#deck-frame').contentDocument.querySelector('#deck-slides').textContent)
            .includes('Atomair opgeslagen')""",
        arg=tool, timeout=4000,
    )
    session.detach()
