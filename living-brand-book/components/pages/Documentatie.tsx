"use client";

import { motion } from "framer-motion";
import { ColorPalette } from "../docs/ColorPalette";
import { ComponentLibrary } from "../docs/ComponentLibrary";
import { TypographyPlayground } from "../docs/TypographyPlayground";

const reveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export function Documentatie() {
  return (
    <div className="w4-page-stack w4-blueprint-overlay w4-docs-page">
      <motion.section {...reveal} id="kleuren" className="w4-section-card" aria-labelledby="kleuren-title">
        <p className="w4-docs-kicker">Design System</p>
        <h1 id="kleuren-title">Tokens die jou sneller van idee naar interface brengen.</h1>
        <p>
          Je werkt met vaste merkkleuren zodat ontwerpen, prototypes en productiecode dezelfde taal
          spreken. Klik op HEX of class en je zit meteen in flow.
        </p>
        <ColorPalette />
      </motion.section>

      <motion.section
        {...reveal}
        id="typografie"
        className="w4-section-card"
        aria-labelledby="typografie-title"
      >
        <h2 id="typografie-title">Typografie die prioriteit en persoonlijkheid laat samenwerken</h2>
        <p>
          Neue Machina zet de toon, Raleway houdt het gesprek leesbaar. Samen geven ze je pagina
          pit zonder de inhoud te overschreeuwen.
        </p>
        <TypographyPlayground />
      </motion.section>

      <motion.section
        {...reveal}
        id="componenten"
        className="w4-section-card"
        aria-labelledby="componenten-title"
      >
        <h2 id="componenten-title">Component library met direct bruikbare snippets</h2>
        <p>
          Geen abstracte design praat: hier pak je concrete bouwblokken die je meteen kunt inzetten
          in je interface.
        </p>
        <ComponentLibrary />
      </motion.section>
    </div>
  );
}
