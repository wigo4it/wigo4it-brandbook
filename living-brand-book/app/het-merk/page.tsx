export default function HetMerkPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:py-12">
      <section
        className="rounded-3xl border border-black/10 bg-white px-8 py-12 shadow-sm"
        id="missie-visie"
      >
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

      <section className="rounded-3xl border border-black/10 bg-white px-8 py-8 shadow-sm" id="merkwaarden">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Merkwaarden</h2>
        <p className="mt-3 text-base leading-7 text-black/70">
          Placeholder voor de uitwerking van Kwaliteit, Innovatie en Fun met
          interactieve kaarten.
        </p>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white px-8 py-8 shadow-sm" id="tone-of-voice">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Tone of voice</h2>
        <p className="mt-3 text-base leading-7 text-black/70">
          Placeholder voor voorbeelden van heldere, energieke copy met vaste
          slogans.
        </p>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white px-8 py-8 shadow-sm" id="gallery">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Design gallery</h2>
        <p className="mt-3 text-base leading-7 text-black/70">
          Placeholder voor toekomstige visual assets zoals infographics en
          presentaties.
        </p>
      </section>
    </div>
  );
}