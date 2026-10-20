/** Gedeelde bestandsinvoer; alleen een file handle geeft blijvende leestoegang. */
export function bindMarkdownFile({ input, dropzone, label, status, onChange }) {
  const liveSupported = window.isSecureContext && typeof window.showOpenFilePicker === 'function';
  const events = new AbortController();
  let active = null;
  let selection = 0;
  let timer = null;
  let disposed = false;
  let paused = false;
  let picking = false;

  function listen(target, type, handler) {
    target.addEventListener(type, handler, { signal: events.signal });
  }

  function stopTimer() {
    clearTimeout(timer);
    timer = null;
  }

  function showStatus(text, error = false) {
    status.textContent = text;
    status.classList.toggle('w4-tool-warning', error);
  }

  function failure(error, live = false) {
    showStatus(
      `${live ? 'Live-update onderbroken' : 'Bestand laden mislukt'}: ${error.message || error.name}. Kies het bestand opnieuw.`,
      true
    );
  }

  function schedule() {
    stopTimer();
    if (!disposed && !paused && active?.handle && !active.reading) {
      timer = setTimeout(poll, 1000);
    }
  }

  async function poll() {
    const current = active;
    if (disposed || paused || !current?.handle || current.reading) return;
    stopTimer();
    current.reading = true;
    let source;
    try {
      source = await (await current.handle.getFile()).text();
    } catch (error) {
      if (!disposed && active === current) {
        current.handle = null;
        failure(error, true);
      }
      return;
    } finally {
      current.reading = false;
    }
    if (disposed || active !== current) return;
    if (source !== current.source) {
      current.source = source;
      onChange(source, { name: current.name, initial: false });
    }
    schedule();
  }

  async function load(filePromise, handlePromise = null) {
    const request = ++selection;
    let file;
    let handle;
    let source;
    try {
      handle = handlePromise ? await handlePromise : null;
      if (handle && handle.kind !== 'file') throw new Error('Kies een bestand, geen map');
      file = handle ? await handle.getFile() : await filePromise;
      if (!file) return;
      source = await file.text();
    } catch (error) {
      if (!disposed && request === selection) failure(error);
      return;
    }
    if (disposed || request !== selection) return;
    stopTimer();
    active = { handle, source, name: file.name, reading: false };
    label.textContent = file.name;
    dropzone.classList.add('has-file');
    showStatus(handle
      ? 'Live-update actief. Wijzigingen worden ongeveer elke seconde ingelezen.'
      : liveSupported
        ? 'Eenmalig geladen. Klik om het bestand met live-update te openen.'
        : 'Eenmalig geladen. Live-update is hier niet beschikbaar; kies het bestand opnieuw na wijzigingen. Gebruik Chrome of Edge op localhost voor live-update.');
    onChange(source, { name: file.name, initial: true });
    schedule();
  }

  if (liveSupported) {
    listen(input, 'click', async (event) => {
      event.preventDefault();
      if (picking) return;
      picking = true;
      try {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [{
            description: 'Markdown',
            accept: { 'text/plain': ['.md', '.markdown', '.txt'] },
          }],
        });
        await load(null, Promise.resolve(handle));
      } catch (error) {
        if (error.name !== 'AbortError' && !disposed) failure(error);
      } finally {
        picking = false;
      }
    });
  }

  listen(input, 'change', () => {
    const file = input.files[0];
    if (file) load(file);
    input.value = '';
  });
  listen(dropzone, 'dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('is-dragover');
  });
  for (const type of ['dragleave', 'dragend', 'drop']) {
    listen(dropzone, type, () => dropzone.classList.remove('is-dragover'));
  }
  listen(dropzone, 'drop', (event) => {
    event.preventDefault();
    const item = [...(event.dataTransfer?.items || [])].find((entry) => entry.kind === 'file');
    const file = event.dataTransfer?.files[0];
    if (window.isSecureContext && item?.getAsFileSystemHandle) {
      load(file, item.getAsFileSystemHandle());
    } else {
      if (file) load(file);
    }
  });
  listen(document, 'visibilitychange', () => {
    if (!document.hidden) poll();
  });
  listen(window, 'pagehide', (event) => {
    paused = true;
    stopTimer();
    if (!event.persisted) dispose();
  });
  listen(window, 'pageshow', () => {
    paused = false;
    poll();
  });

  function dispose() {
    disposed = true;
    selection += 1;
    stopTimer();
    events.abort();
    active = null;
  }

  showStatus(liveSupported
    ? 'Kies een bestand om live-update automatisch te starten.'
    : 'Live-update is hier niet beschikbaar. Kies het bestand opnieuw na wijzigingen, of gebruik Chrome of Edge op localhost.');
  return dispose;
}
