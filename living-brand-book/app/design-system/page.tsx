export default function DesignSystemPage() {
  return (
    <div className="w4-page-stack w4-blueprint-overlay">
      <section id="kleuren" className="w4-section-card" aria-labelledby="kleuren-title">
        <h1 id="kleuren-title">Design System</h1>
        <p>
          Deze pagina krijgt in Task 05 de interactieve documentatie. De sectie-ID&apos;s staan nu al
          klaar voor werkende subnavigatie.
        </p>
      </section>

      <section id="typografie" className="w4-section-card" aria-labelledby="typografie-title">
        <h2 id="typografie-title">Typografie</h2>
        <p>Playground en voorbeelden volgen in de Design System-implementatie.</p>
      </section>

      <section id="componenten" className="w4-section-card" aria-labelledby="componenten-title">
        <h2 id="componenten-title">Componenten</h2>
        <p>Hier komen HTML/Tailwind snippets met een herbruikbare codeviewercomponent.</p>
      </section>
    </div>
  );
}
