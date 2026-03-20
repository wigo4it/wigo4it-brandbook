const UPCOMING_ITEMS = [
  "Geometrische posterreeks",
  "Pitchdeck visual language",
  "Iconografie-richtlijnen",
  "Social templates",
];

export function GalleryPlaceholder() {
  return (
    <>
      <h2 id="gallery-title">Design gallery in opbouw</h2>
      <p>
        Deze plek wordt de visuele speeltuin van het merk. Hier bundel je binnenkort assets voor
        decks, illustraties en campagne-uitingen in dezelfde herkenbare stijl.
      </p>

      <div className="w4-gallery-grid" role="list" aria-label="Aankomende gallery onderdelen">
        {UPCOMING_ITEMS.map((item) => (
          <div key={item} className="w4-gallery-item" role="listitem">
            <span className="w4-gallery-chip">Binnenkort</span>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </>
  );
}
