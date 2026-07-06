/* ============================================================
   Shared Tailwind (Play CDN) config for all brand pages.
   Load this right AFTER the cdn.tailwindcss.com script so the
   `tailwind` global exists. Single source of truth for the
   brand colors and font families used as Tailwind utilities.
   The same tokens live as CSS custom properties in styles/w4.css.

   This is a superset: it carries everything any single page needs,
   so pages can share one config. design-system.html uses the nested
   `brand.*` colors (bg-brand-aubergine, ...), rounded-4xl and the
   shadow-panel / shadow-float utilities defined below.
   ============================================================ */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'light-grey':  '#cfd6cc',
        'dark-green':  '#005351',
        'dark-blue':   '#434d8e',
        'soft-yellow': '#e9eb86',
        'light-green': '#63cf92',
        'aubergine':   '#362c46',
        'bright-red':  '#f56e6d',
        'bright-pink': '#bb55a9',
        brand: {
          lightGrey:  '#cfd6cc',
          darkGreen:  '#005351',
          darkBlue:   '#434d8e',
          softYellow: '#e9eb86',
          lightGreen: '#63cf92',
          aubergine:  '#362c46',
          brightRed:  '#f56e6d',
          brightPink: '#bb55a9',
        },
      },
      fontFamily: {
        heading: ['"PP Neue Machina"', 'sans-serif'],
        body:    ['Raleway', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        panel: '0 10px 30px rgba(54, 44, 70, 0.10)',
        float: '0 14px 42px rgba(0, 83, 81, 0.18)',
      },
    },
  },
};
