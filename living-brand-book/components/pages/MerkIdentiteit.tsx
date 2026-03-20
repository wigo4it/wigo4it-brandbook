"use client";

import { motion } from "framer-motion";
import { GalleryPlaceholder } from "../brand/GalleryPlaceholder";
import { ToneExamples } from "../brand/ToneExamples";
import { ValueCards } from "../brand/ValueCards";

const reveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export function MerkIdentiteit() {
  return (
    <div className="w4-page-stack w4-blueprint-overlay w4-merk-page">
      <motion.section
        {...reveal}
        id="missie-visie"
        className="w4-section-card w4-merk-hero"
        aria-labelledby="missie-visie-title"
      >
        <div className="w4-merk-hero__content">
          <p className="w4-merk-kicker">Het Merk</p>
          <h1 id="missie-visie-title">IT die mensen vooruit helpt, niet andersom.</h1>
          <p className="w4-hero-statement">IT dient mens en maatschappij.</p>
          <p>
            Je bouwt hier aan digitale dienstverlening die helder, veilig en menselijk voelt. Met
            slimme techniek, duidelijke taal en een glimlach op het juiste moment maken we
            publieke IT niet alleen beter, maar ook fijner om te gebruiken.
          </p>
        </div>
        <div className="w4-merk-decor" aria-hidden="true">
          <span className="w4-merk-shape w4-merk-shape--circle" />
          <span className="w4-merk-shape w4-merk-shape--diamond" />
          <span className="w4-merk-shape w4-merk-shape--bar" />
        </div>
      </motion.section>

      <motion.section
        {...reveal}
        id="merkwaarden"
        className="w4-section-card"
        aria-labelledby="merkwaarden-title"
      >
        <h2 id="merkwaarden-title">Merkwaarden in actie</h2>
        <p>
          Klik op een waarde en ontdek hoe je die vertaalt naar gedrag in ontwerp, code en
          samenwerking.
        </p>
        <ValueCards />
      </motion.section>

      <motion.section
        {...reveal}
        id="tone-of-voice"
        className="w4-section-card"
        aria-labelledby="tone-title"
      >
        <ToneExamples />
      </motion.section>

      <motion.section
        {...reveal}
        id="design-gallery"
        className="w4-section-card"
        aria-labelledby="gallery-title"
      >
        <GalleryPlaceholder />
      </motion.section>
    </div>
  );
}
