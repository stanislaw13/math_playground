"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Line, Text, Theme, vec } from "mafs";

export default function NumberLineExplorer() {
  const t = useTranslations("decimals");
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(10);
  const [zoomLevel, setZoomLevel] = useState<"whole" | "tenths" | "hundredths">("whole");
  const [highlight, setHighlight] = useState(3.4);

  const zoomTo = (center: number, level: "whole" | "tenths" | "hundredths") => {
    if (level === "whole") {
      setRangeStart(0);
      setRangeEnd(10);
    } else if (level === "tenths") {
      const base = Math.floor(center);
      setRangeStart(base);
      setRangeEnd(base + 1);
    } else {
      const base = Math.floor(center * 10) / 10;
      setRangeStart(base);
      setRangeEnd(parseFloat((base + 0.1).toFixed(1)));
    }
    setZoomLevel(level);
  };

  // Generate tick marks based on zoom
  const ticks: { pos: number; label: string; major: boolean }[] = [];
  if (zoomLevel === "whole") {
    for (let i = rangeStart; i <= rangeEnd; i++) {
      ticks.push({ pos: i, label: String(i), major: true });
    }
  } else if (zoomLevel === "tenths") {
    for (let i = 0; i <= 10; i++) {
      const val = rangeStart + i * 0.1;
      ticks.push({
        pos: val,
        label: val.toFixed(1),
        major: i === 0 || i === 10,
      });
    }
  } else {
    for (let i = 0; i <= 10; i++) {
      const val = rangeStart + i * 0.01;
      ticks.push({
        pos: val,
        label: val.toFixed(2),
        major: i === 0 || i === 10,
      });
    }
  }

  // Check if highlight is in range
  const inRange = highlight >= rangeStart && highlight <= rangeEnd;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-lg font-semibold">{t("numberLineTitle")}</h3>

      {/* Number line visualisation */}
      <div className="mb-4 overflow-hidden rounded-lg bg-[var(--color-bg-primary)]">
        <Mafs
          viewBox={{
            x: [rangeStart - (rangeEnd - rangeStart) * 0.08, rangeEnd + (rangeEnd - rangeStart) * 0.08],
            y: [-1.5, 1.5],
          }}
          height={180}
          pan={false}
        >
          {/* Main line */}
          <Line.Segment
            point1={[rangeStart, 0]}
            point2={[rangeEnd, 0]}
            color={Theme.foreground}
          />

          {/* Tick marks */}
          {ticks.map((tick) => (
            <g key={tick.pos}>
              <Line.Segment
                point1={[tick.pos, tick.major ? -0.3 : -0.15]}
                point2={[tick.pos, tick.major ? 0.3 : 0.15]}
                color={Theme.foreground}
              />
              <Text
                x={tick.pos}
                y={-0.65}
                size={tick.major ? 14 : 11}
                color={Theme.foreground}
              >
                {tick.label}
              </Text>
            </g>
          ))}

          {/* Highlighted point */}
          {inRange && (
            <>
              <circle
                cx={0}
                cy={0}
                r={0.12}
                fill={Theme.indigo}
                transform={`translate(${highlight}, 0)`}
              />
              <Text x={highlight} y={0.7} size={16} color={Theme.indigo}>
                {highlight.toFixed(zoomLevel === "hundredths" ? 2 : zoomLevel === "tenths" ? 1 : 1)}
              </Text>
            </>
          )}
        </Mafs>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Decimal input */}
        <div>
          <label className="mb-1 block text-sm font-medium">{t("pickDecimal")}</label>
          <input
            type="range"
            min={0}
            max={15}
            step={0.01}
            value={highlight}
            onChange={(e) => setHighlight(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 text-center font-mono text-lg text-[var(--color-accent)]">
            {highlight.toFixed(2)}
          </div>
        </div>

        {/* Zoom buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => zoomTo(highlight, "whole")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              zoomLevel === "whole"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
            }`}
          >
            {t("zoomWhole")}
          </button>
          <button
            onClick={() => zoomTo(highlight, "tenths")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              zoomLevel === "tenths"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
            }`}
          >
            {t("zoomTenths")}
          </button>
          <button
            onClick={() => zoomTo(highlight, "hundredths")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              zoomLevel === "hundredths"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
            }`}
          >
            {t("zoomHundredths")}
          </button>
        </div>

        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          {t("zoomHint")}
        </p>
      </div>
    </div>
  );
}
