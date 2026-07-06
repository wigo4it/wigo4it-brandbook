/* ============================================================
   Shared Tailwind (Play CDN) config for all brand pages.
   Load this right AFTER the cdn.tailwindcss.com script so the
   `tailwind` global exists. Single source of truth for the
   brand colors and font families used as Tailwind utilities.
   The same tokens live as CSS custom properties in styles/w4.css.
   ============================================================ */
tailwind.config = {
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
      },
      fontFamily: {
        heading: ['"PP Neue Machina"', 'sans-serif'],
        body:    ['Raleway', 'sans-serif'],
      },
    },
  },
};
