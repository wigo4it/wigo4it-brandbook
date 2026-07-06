/* ============================================================
   Shared top navbar for all brand pages.
   Renders the fixed navbar into <div id="w4-nav"></div> and marks
   the active item. One source of truth instead of a copy per page.

   The base URL is derived from this script's own src, so a page in
   /examples that loads it via ../scripts/nav.js resolves to the same
   absolute root as a top-level page. No per-page path juggling.
   ============================================================ */
(function () {
  var script = document.currentScript;
  var base = script ? script.src.replace(/scripts\/nav\.js(?:\?.*)?$/, '') : '';

  var linkClass =
    'font-body text-sm text-aubergine/70 hover:text-dark-green px-3 py-1.5 ' +
    'rounded-md hover:bg-light-grey/60 transition-colors';

  var items = [
    { key: 'merkboek',      label: 'Merkboek',      href: 'index.html#merkboek' },
    { key: 'design-system', label: 'Design system', href: 'design-system.html' },
    { key: 'icons',         label: 'Iconen',        href: 'icons.html' },
    { key: 'shapes',        label: 'Vormen',        href: 'shapes.html' },
    { key: 'fotos',         label: "Foto's",        href: 'photos.html' },
    { key: 'voorbeelden',   label: 'Voorbeelden',   href: 'examples.html' },
  ];

  function activeKey() {
    var p = window.location.pathname.toLowerCase();
    if (p.endsWith('/design-system.html')) return 'design-system';
    if (p.endsWith('/icons.html')) return 'icons';
    if (p.endsWith('/shapes.html')) return 'shapes';
    if (p.endsWith('/photos.html')) return 'fotos';
    if (p.endsWith('/examples.html') || p.indexOf('/examples/') !== -1) return 'voorbeelden';
    return 'merkboek';
  }

  function render() {
    var mount = document.getElementById('w4-nav');
    if (!mount) return;

    var active = activeKey();
    var onHome = active === 'merkboek';

    var lis = items.map(function (item) {
      var isActive = item.key === active;
      // Keep in-page scroll for Merkboek when we are already on the home page.
      var href = item.key === 'merkboek' && onHome ? '#merkboek' : base + item.href;
      var cls = linkClass + (isActive ? ' bg-light-grey/60 text-dark-green font-semibold' : '');
      var current = isActive ? ' aria-current="page"' : '';
      return (
        '<li><a data-nav="' + item.key + '" href="' + href + '" class="' + cls + '"' +
        current + '>' + item.label + '</a></li>'
      );
    }).join('');

    var logoHref = onHome ? '#merkboek' : base + 'index.html#merkboek';

    mount.innerHTML =
      '<header class="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none">' +
        '<div class="pointer-events-auto bg-white/80 backdrop-blur-md border border-gray-100 ' +
          'shadow-sm rounded-2xl px-6 h-14 flex items-center justify-between gap-12 w-full max-w-3xl mx-4">' +
          '<a href="' + logoHref + '" class="flex items-center gap-2 shrink-0">' +
            '<img src="' + base + 'img/logo/Logo.svg" alt="Wigo4it" class="h-7" />' +
          '</a>' +
          '<nav aria-label="Hoofdnavigatie">' +
            '<ul class="flex items-center gap-1">' + lis + '</ul>' +
          '</nav>' +
        '</div>' +
      '</header>';
  }

  render();
  window.addEventListener('hashchange', render);
})();
