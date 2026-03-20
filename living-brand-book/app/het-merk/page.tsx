export default function HetMerkPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-16" id="missie-visie">
      <section className="w-full max-w-3xl rounded-3xl border border-black/10 bg-white px-8 py-12 shadow-sm">
        <span className="mb-4 inline-flex rounded-full border border-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-black/60">
          Baseline
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Het Merk
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-black/70 sm:text-lg">
          Deze tijdelijke route bevestigt dat de app start, de redirect vanaf de
          root werkt en de basis klaarstaat voor de merkpagina uit de volgende
          taken.
        </p>
      </section>
    </section>
  );
}