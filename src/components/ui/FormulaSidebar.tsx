"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import katex from "katex";

interface FormulaItem {
  label: string;
  latex: string;
  svg?: React.ReactNode;
}

interface FormulaSidebarProps {
  formulas: FormulaItem[];
}

function RenderedLatex({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function FormulaSidebar({ formulas }: FormulaSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("common");

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-20 z-40 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        {t("formulas")} {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-80 overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 shadow-xl"
            >
              <h3 className="mb-6 text-lg font-semibold">{t("formulas")}</h3>
              <div className="space-y-6">
                {formulas.map((formula, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4"
                  >
                    <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                      {formula.label}
                    </p>
                    {formula.svg && (
                      <div className="mb-3 flex justify-center">
                        {formula.svg}
                      </div>
                    )}
                    <RenderedLatex latex={formula.latex} />
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
