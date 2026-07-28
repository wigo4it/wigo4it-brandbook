/* ============================================================
   Tabrij voor de tool-pagina's.

   Rendert de navigatie in <div id="w4-tool-nav"></div> en markeert het
   actieve item. Eén bron van waarheid, net als scripts/nav.js, zodat een
   nieuwe tool een regel in ITEMS is en verder niets.

   Het is bewust een horizontale tabrij en geen zijbalk. Die zijbalk heeft
   er gestaan en is eruit gehaald: naast het instellingenpaneel stonden er
   twee verticale lijsten met hetzelfde gewicht naast elkaar.

   De basis-URL komt uit de src van dit script zelf, zodat een pagina in een
   submap dezelfde absolute root krijgt als een pagina in de root.
   ============================================================ */
(function () {
  var script = document.currentScript;
  var base = script ? script.src.replace(/scripts\/tool-nav\.js(?:\?.*)?$/, '') : '';

  // Eén groep per tool: eerst waar je 'm mee maakt, daarna zijn eigen naslag.
  // Zo is meteen duidelijk welke naslag bij welke tool hoort; de twee tools
  // delen namelijk niets behalve dat ze allebei markdown lezen.
  var GROUPS = [
    {
      title: 'PDF-document',
      items: [
        { key: 'pdf', label: 'Maken', href: 'pdf.html' },
        { key: 'pdf-syntax', label: 'Naslag', href: 'pdf-syntax.html' },
      ],
    },
    {
      title: 'Slide-deck',
      items: [
        { key: 'deck', label: 'Maken', href: 'deck.html' },
        { key: 'templates', label: 'Templates', href: 'deck-templates.html' },
        { key: 'deck-syntax', label: 'Syntax', href: 'deck-syntax.html' },
      ],
    },
  ];

  function activeKey() {
    var path = window.location.pathname.toLowerCase();
    var all = GROUPS.reduce(function (acc, group) {
      return acc.concat(group.items);
    }, []);
    for (var i = 0; i < all.length; i += 1) {
      if (path.endsWith('/' + all[i].href)) return all[i].key;
    }
    // deck-view.html hoort bij de deck-tool maar staat niet in het menu.
    if (path.endsWith('/deck-view.html')) return 'deck';
    return '';
  }

  function render() {
    var mount = document.getElementById('w4-tool-nav');
    if (!mount) return;

    var active = activeKey();
    var html = GROUPS.map(function (group) {
      var links = group.items
        .map(function (item) {
          var current = item.key === active ? ' aria-current="page"' : '';
          return (
            '<li><a href="' + base + item.href + '"' + current + '>' + item.label + '</a></li>'
          );
        })
        .join('');
      return (
        '<div class="w4-tool-tabs-group">' +
        '<p class="w4-tool-tabs-title">' + group.title + '</p>' +
        '<ul>' + links + '</ul>' +
        '</div>'
      );
    }).join('');

    mount.innerHTML = '<nav class="w4-tool-tabs" aria-label="Tools">' + html + '</nav>';
  }

  render();
})();
