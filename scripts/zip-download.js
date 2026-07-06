/* ============================================================
   Shared "download all as ZIP" helper for the asset catalogues.
   Fetches each file (same-origin), bundles them client-side with
   JSZip, and triggers a single download. No build step.

   Requires JSZip to be loaded first (via CDN).

   Usage:
     w4DownloadZip({
       files: ['Aarde.svg', ...],   // file names within `dir`
       dir: 'img/icons',            // path relative to the page
       zipName: 'wigo4it-iconen.zip',
       button: buttonElement        // optional, for progress + disabling
     });
   ============================================================ */
window.w4DownloadZip = async function (options) {
  var files = options.files || [];
  var dir = options.dir;
  var zipName = options.zipName || 'download.zip';
  var button = options.button || null;
  var label = button ? button.textContent : null;

  function setLabel(text) {
    if (button) button.textContent = text;
  }

  if (typeof JSZip === 'undefined') {
    setLabel('ZIP niet beschikbaar');
    window.setTimeout(function () { setLabel(label); }, 2000);
    return;
  }
  if (!files.length) return;

  if (button) button.disabled = true;

  var zip = new JSZip();
  var done = 0;

  try {
    await Promise.all(files.map(async function (file) {
      var response = await fetch(dir + '/' + encodeURIComponent(file));
      if (!response.ok) throw new Error('Kon ' + file + ' niet ophalen');
      zip.file(file, await response.blob());
      done += 1;
      setLabel('Inpakken ' + done + '/' + files.length);
    }));

    var content = await zip.generateAsync({ type: 'blob' });
    var url = URL.createObjectURL(content);
    var link = document.createElement('a');
    link.href = url;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    setLabel('Download mislukt');
    window.setTimeout(function () { setLabel(label); }, 2000);
    return;
  } finally {
    if (button) button.disabled = false;
  }

  setLabel(label);
};
