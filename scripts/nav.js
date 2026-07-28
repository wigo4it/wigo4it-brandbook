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
    'font-body text-sm whitespace-nowrap text-aubergine/70 hover:text-dark-green px-2.5 py-1.5 ' +
    'rounded-md hover:bg-light-grey/60 transition-colors';

  // De rij schuift als hij niet past. In een balk van 56px hoog leest een
  // zichtbare scrollbar als een fout, dus die verbergen we. Dit staat hier en
  // niet in w4.css: design-system.html laadt die stylesheet niet, en de navbar
  // hoort overal hetzelfde te doen.
  function injectStyle() {
    if (document.getElementById('w4-nav-style')) return;
    var style = document.createElement('style');
    style.id = 'w4-nav-style';
    style.textContent =
      '.w4-nav-scroll{scrollbar-width:none;-ms-overflow-style:none}' +
      '.w4-nav-scroll::-webkit-scrollbar{display:none}';
    document.head.appendChild(style);
  }

  var items = [
    { key: 'merkboek',      label: 'Merkboek',      href: 'index.html#merkboek' },
    { key: 'design-system', label: 'Design system', href: 'design-system.html' },
    { key: 'logos',         label: "Logo's",        href: 'logos.html' },
    { key: 'icons',         label: 'Iconen',        href: 'icons.html' },
    { key: 'shapes',        label: 'Vormen',        href: 'shapes.html' },
    { key: 'fotos',         label: "Foto's",        href: 'photos.html' },
    { key: 'voorbeelden',   label: 'Voorbeelden',   href: 'examples.html' },
    // PDF en Deck wonen samen onder Tools, met een eigen tabrij (tool-nav.js).
    { key: 'tools',         label: 'Tools',         href: 'deck.html' },
  ];

  function activeKey() {
    var p = window.location.pathname.toLowerCase();
    if (p.endsWith('/design-system.html')) return 'design-system';
    if (p.endsWith('/logos.html')) return 'logos';
    if (p.endsWith('/icons.html')) return 'icons';
    if (p.endsWith('/shapes.html')) return 'shapes';
    if (p.endsWith('/photos.html')) return 'fotos';
    if (p.endsWith('/examples.html') || p.indexOf('/examples/') !== -1) return 'voorbeelden';
    if (/\/(pdf|pdf-syntax|deck|deck-view|deck-syntax|deck-templates)\.html$/.test(p)) return 'tools';
    return 'merkboek';
  }

  function render() {
    var mount = document.getElementById('w4-nav');
    if (!mount) return;

    injectStyle();

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
          'shadow-sm rounded-2xl px-5 h-14 flex items-center justify-between gap-5 w-full max-w-5xl mx-4">' +
          '<a href="' + logoHref + '" class="flex items-center gap-2 shrink-0">' +
            '<img src="' + base + 'img/logo/Logo.svg" alt="Wigo4it" class="h-7" />' +
          '</a>' +
          // min-w-0 + overflow-x-auto: past de rij niet, dan schuift hij mee in
          // plaats van dat het laatste item onder de rand verdwijnt.
          '<nav aria-label="Hoofdnavigatie" class="min-w-0 overflow-x-auto w4-nav-scroll">' +
            '<ul class="flex items-center gap-0.5">' + lis + '</ul>' +
          '</nav>' +
        '</div>' +
      '</header>';
  }

  render();
  window.addEventListener('hashchange', render);
})();
