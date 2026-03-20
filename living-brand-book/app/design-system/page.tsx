export default function DesignSystemPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:py-12">
      <section className="rounded-3xl border border-black/10 bg-white px-8 py-12 shadow-sm" id="kleuren">
        <span className="mb-4 inline-flex rounded-full border border-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-black/60">
          Baseline
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Design System
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-black/70 sm:text-lg">
          Deze tijdelijke route houdt de hoofdstructuur van de applicatie stabiel
          tot de documentatiepagina en componentbibliotheek in latere taken worden
          opgebouwd.
        </p>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white px-8 py-8 shadow-sm" id="typografie">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Typografie</h2>
        <p className="mt-3 text-base leading-7 text-black/70">
          Placeholder voor hiërarchie en contrast tussen kop- en bodyfonts.
        </p>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white px-8 py-8 shadow-sm" id="componenten">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Componenten</h2>
        <p className="mt-3 text-base leading-7 text-black/70">
          Placeholder voor herbruikbare UI-patronen met geometrische vormtaal.
        </p>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white px-8 py-8 shadow-sm" id="snippets">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Snippets</h2>
        <p className="mt-3 text-base leading-7 text-black/70">
          Placeholder voor HTML en Tailwind codevoorbeelden met kopieeractie.
        </p>
      </section>
    </div>
  );
}