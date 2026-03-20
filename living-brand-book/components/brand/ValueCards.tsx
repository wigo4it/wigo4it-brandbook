"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type BrandValue = {
  key: string;
  title: string;
  intro: string;
  details: string;
};

const BRAND_VALUES: BrandValue[] = [
  {
    key: "kwaliteit",
    title: "Kwaliteit",
    intro: "Je levert werk waar je morgen nog steeds trots op bent.",
    details:
      "Je kiest voor robuuste oplossingen, testbaar gedrag en heldere documentatie. Dat betekent minder ruis, minder herstelwerk en meer vertrouwen voor collega’s en eindgebruikers.",
  },
  {
    key: "innovatie",
    title: "Innovatie",
    intro: "Je experimenteert slim en altijd met impact als kompas.",
    details:
      "Je gebruikt nieuwe technieken wanneer ze echte waarde toevoegen. Van snellere workflows tot betere toegankelijkheid: vernieuwing is pas geslaagd als mensen het verschil voelen.",
  },
  {
    key: "fun",
    title: "Fun",
    intro: "Je maakt ruimte voor energie, humor en samen groeien.",
    details:
      "Je werkt serieus aan maatschappelijke doelen, zonder jezelf te serieus te nemen. Positieve teamdynamiek versnelt samenwerking en zorgt dat kwaliteit langer vol te houden is.",
  },
];

export function ValueCards() {
  const [openKey, setOpenKey] = useState<string | null>(BRAND_VALUES[0].key);

  const handleToggle = (key: string) => {
    setOpenKey((current) => (current === key ? null : key));
  };

  return (
    <div className="w4-values-grid" role="list" aria-label="Uitklapbare merkwaarden">
      {BRAND_VALUES.map((value) => {
        const isOpen = openKey === value.key;
        const panelId = `value-panel-${value.key}`;

        return (
          <article key={value.key} role="listitem" className="w4-value-card">
            <button
              type="button"
              className="w4-value-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => handleToggle(value.key)}
            >
              <span className="w4-value-title">{value.title}</span>
              <span className="w4-value-intro">{value.intro}</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  className="w4-value-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  <p>{value.details}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
