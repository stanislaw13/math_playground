"use client";

import katex from "katex";

interface LatexSectionProps {
  title?: string;
  content: string;
  displayMode?: boolean;
}

export default function LatexSection({
  title,
  content,
  displayMode = true,
}: LatexSectionProps) {
  const html = katex.renderToString(content, {
    throwOnError: false,
    displayMode,
  });

  return (
    <div className="flex h-full flex-col">
      {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
      <div
        className="text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
