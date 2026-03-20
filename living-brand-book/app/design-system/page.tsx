export default function DesignSystemPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-16" id="kleuren">
      <section className="w-full max-w-3xl rounded-3xl border border-black/10 bg-white px-8 py-12 shadow-sm">
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
    </section>
  );
}