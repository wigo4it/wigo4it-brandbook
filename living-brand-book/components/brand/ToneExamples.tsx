const TONE_EXAMPLES = [
  {
    title: "Voor developers",
    slogan: "Good code, Good cause",
    copy: "Je schrijft begrijpelijke code met een helder doel: publieke dienstverlening die werkt voor iedereen.",
  },
  {
    title: "Voor teams",
    slogan: "Be your own limit",
    copy: "Je blijft verbeteren, daagt elkaar positief uit en zet elke sprint een stap verder dan gisteren.",
  },
  {
    title: "Voor gebruikers",
    slogan: "Duidelijk, dichtbij, digitaal",
    copy: "Je spreekt mensentaal, maakt keuzes transparant en houdt interacties zo simpel mogelijk.",
  },
];

export function ToneExamples() {
  return (
    <>
      <h2 id="tone-title">Tone of voice die energie geeft</h2>
      <p>
        Je communiceert scherp en deskundig, maar altijd benaderbaar. Hier zie je hoe slogans en
        context samen de juiste toon zetten.
      </p>

      <div className="w4-tone-grid" role="list" aria-label="Tone of voice voorbeelden">
        {TONE_EXAMPLES.map((example) => (
          <article key={example.title} className="w4-tone-card" role="listitem">
            <h3>{example.title}</h3>
            <p className="w4-tone-quote">{example.slogan}</p>
            <p>{example.copy}</p>
          </article>
        ))}
      </div>
    </>
  );
}
