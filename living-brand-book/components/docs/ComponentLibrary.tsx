import { CodeSnippet } from "../common/CodeSnippet";

const SNIPPETS = [
  {
    title: "Basis card met zware border",
    code: `<article class="rounded-2xl border-2 border-dark-blue bg-white p-6 shadow-sm">
  <p class="font-heading text-xs uppercase tracking-[0.16em] text-dark-green">Component</p>
  <h3 class="mt-2 font-heading text-2xl text-aubergine">Feature card</h3>
  <p class="mt-3 text-sm leading-relaxed text-night/80">
    Gebruik deze kaart voor compacte highlights met een duidelijke call-to-action.
  </p>
</article>`,
  },
  {
    title: "Bento layout sectie",
    code: `<section class="grid gap-4 md:grid-cols-12">
  <article class="rounded-2xl border-2 border-dark-blue bg-soft-yellow p-5 md:col-span-8">
    <h3 class="font-heading text-xl text-dark-blue">Primair verhaal</h3>
    <p class="mt-2 text-sm text-night/80">Gebruik voor de kernboodschap van je pagina.</p>
  </article>
  <aside class="rounded-2xl border-2 border-dark-green bg-light-green p-5 md:col-span-4">
    <h4 class="font-heading text-lg text-dark-green">Snelle context</h4>
    <p class="mt-2 text-sm text-dark-green/85">Perfect voor KPI's en side notes.</p>
  </aside>
</section>`,
  },
  {
    title: "Badge groep",
    code: `<div class="flex flex-wrap gap-2">
  <span class="rounded-full border-2 border-dark-blue bg-dark-blue px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Live</span>
  <span class="rounded-full border-2 border-bright-pink bg-bright-pink px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Experiment</span>
  <span class="rounded-full border-2 border-light-green bg-light-green px-3 py-1 text-xs font-bold uppercase tracking-wide text-dark-green">Intern</span>
</div>`,
  },
];

export function ComponentLibrary() {
  return (
    <div className="w4-library-stack">
      <p className="w4-library-intro">
        Deze snippets zijn bewust puur HTML met Tailwind classes. Kopieer, plak en tweak ze naar
        je eigen use case.
      </p>
      <div className="w4-library-grid">
        {SNIPPETS.map((snippet) => (
          <CodeSnippet key={snippet.title} title={snippet.title} code={snippet.code} language="html" />
        ))}
      </div>
    </div>
  );
}
