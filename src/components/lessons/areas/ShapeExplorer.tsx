"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Polygon, Coordinates, Text, Line, Theme, vec } from "mafs";
import katex from "katex";

function Latex({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.5,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-[var(--color-text-secondary)]">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1"
      />
      <span className="w-12 text-right text-sm font-mono">{value}</span>
    </div>
  );
}

function ShapeCard({
  title,
  children,
  area,
  perimeter,
}: {
  title: string;
  children: React.ReactNode;
  area: number;
  perimeter: number;
}) {
  const t = useTranslations("areas");
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      {children}
      <div className="mt-4 flex gap-6 text-sm">
        <div>
          <span className="text-[var(--color-text-secondary)]">
            {t("area")} ({t("areaSymbol")}):{" "}
          </span>
          <span className="font-mono font-semibold text-[var(--color-accent)]">
            {area.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-[var(--color-text-secondary)]">
            {t("perimeter")} ({t("perimeterSymbol")}):{" "}
          </span>
          <span className="font-mono font-semibold">{perimeter.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function SquareExplorer() {
  const t = useTranslations("areas");
  const [side, setSide] = useState(3);
  const area = side * side;
  const perimeter = 4 * side;
  const pad = Math.max(side * 0.2, 1.5);
  const aS = t("areaSymbol");
  const pS = t("perimeterSymbol");

  return (
    <ShapeCard title={t("square")} area={area} perimeter={perimeter}>
      <div className="mb-4 flex justify-center overflow-hidden rounded-lg bg-[var(--color-bg-primary)]">
        <Mafs viewBox={{ x: [-pad, side + pad], y: [-pad, side + pad] }} height={280}>
          <Coordinates.Cartesian />
          <Polygon
            points={[
              [0, 0],
              [side, 0],
              [side, side],
              [0, side],
            ]}
            color={Theme.indigo}
          />
          <Text x={side / 2} y={-pad * 0.5} size={14}>
            {`a = ${side}`}
          </Text>
          <Text x={side + pad * 0.5} y={side / 2} size={14}>
            {`a = ${side}`}
          </Text>
        </Mafs>
      </div>
      <Slider
        label={t("side") + " (a)"}
        value={side}
        onChange={setSide}
        min={1}
        max={15}
      />
      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        {t("formula")}: <Latex tex={`${aS} = a^2`} /> | <Latex tex={`${pS} = 4a`} />
      </p>
    </ShapeCard>
  );
}

function RectangleExplorer() {
  const t = useTranslations("areas");
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(2.5);
  const area = width * height;
  const perimeter = 2 * (width + height);
  const maxDim = Math.max(width, height);
  const pad = Math.max(maxDim * 0.2, 1.5);
  const aS = t("areaSymbol");
  const pS = t("perimeterSymbol");

  return (
    <ShapeCard title={t("rectangle")} area={area} perimeter={perimeter}>
      <div className="mb-4 flex justify-center overflow-hidden rounded-lg bg-[var(--color-bg-primary)]">
        <Mafs viewBox={{ x: [-pad, width + pad], y: [-pad, height + pad] }} height={280}>
          <Coordinates.Cartesian />
          <Polygon
            points={[
              [0, 0],
              [width, 0],
              [width, height],
              [0, height],
            ]}
            color={Theme.indigo}
          />
          <Text x={width / 2} y={-pad * 0.5} size={14}>
            {`a = ${width}`}
          </Text>
          <Text x={width + pad * 0.5} y={height / 2} size={14}>
            {`b = ${height}`}
          </Text>
        </Mafs>
      </div>
      <div className="space-y-2">
        <Slider
          label={t("width") + " (a)"}
          value={width}
          onChange={setWidth}
          min={1}
          max={15}
        />
        <Slider
          label={t("height") + " (b)"}
          value={height}
          onChange={setHeight}
          min={1}
          max={15}
        />
      </div>
      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        {t("formula")}: <Latex tex={`${aS} = a \\cdot b`} /> |{" "}
        <Latex tex={`${pS} = 2(a + b)`} />
      </p>
    </ShapeCard>
  );
}

function TriangleExplorer() {
  const t = useTranslations("areas");
  const [base, setBase] = useState(4);
  const [height, setHeight] = useState(3);
  const [topShift, setTopShift] = useState(0);
  const area = (base * height) / 2;
  const topX = base / 2 + topShift;
  const leftSide = Math.sqrt(topX ** 2 + height ** 2);
  const rightSide = Math.sqrt((base - topX) ** 2 + height ** 2);
  const perimeter = base + leftSide + rightSide;
  const maxDim = Math.max(base, height);
  const pad = Math.max(maxDim * 0.2, 1.5);
  const viewLeft = Math.min(0, topX) - pad;
  const viewRight = Math.max(base, topX) + pad;
  const aS = t("areaSymbol");
  const pS = t("perimeterSymbol");

  return (
    <ShapeCard title={t("triangle")} area={area} perimeter={perimeter}>
      <div className="mb-4 flex justify-center overflow-hidden rounded-lg bg-[var(--color-bg-primary)]">
        <Mafs viewBox={{ x: [viewLeft, viewRight], y: [-pad, height + pad] }} height={280}>
          <Coordinates.Cartesian />
          <Polygon
            points={[
              [0, 0],
              [base, 0],
              [topX, height],
            ]}
            color={Theme.green}
          />
          {/* Dashed height line */}
          <Line.Segment
            point1={[topX, 0]}
            point2={[topX, height]}
            color="#a1a1aa"
            style="dashed"
          />
          <Text x={base / 2} y={-pad * 0.5} size={14}>
            {`a = ${base}`}
          </Text>
          <Text x={topX + pad * 0.6} y={height / 2} size={14}>
            {`h = ${height}`}
          </Text>
        </Mafs>
      </div>
      <div className="space-y-2">
        <Slider
          label={t("base") + " (a)"}
          value={base}
          onChange={setBase}
          min={1}
          max={15}
        />
        <Slider
          label={t("height") + " (h)"}
          value={height}
          onChange={setHeight}
          min={1}
          max={15}
        />
        <Slider
          label={t("topShift")}
          value={topShift}
          onChange={setTopShift}
          min={-7}
          max={7}
        />
      </div>
      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        {t("formula")}: <Latex tex={`${aS} = \\frac{a \\cdot h}{2}`} /> |{" "}
        <Latex tex={`${pS} = a + b + c`} />
      </p>
    </ShapeCard>
  );
}

function DiamondExplorer() {
  const t = useTranslations("areas");
  const [d1, setD1] = useState(4);
  const [d2, setD2] = useState(3);
  const area = (d1 * d2) / 2;
  const side = Math.sqrt((d1 / 2) ** 2 + (d2 / 2) ** 2);
  const perimeter = 4 * side;
  const cx = d1 / 2;
  const cy = d2 / 2;
  const maxDim = Math.max(d1, d2);
  const pad = Math.max(maxDim * 0.2, 1.5);
  const aS = t("areaSymbol");
  const pS = t("perimeterSymbol");

  return (
    <ShapeCard title={t("diamond")} area={area} perimeter={perimeter}>
      <div className="mb-4 flex justify-center overflow-hidden rounded-lg bg-[var(--color-bg-primary)]">
        <Mafs viewBox={{ x: [-pad, d1 + pad], y: [-pad, d2 + pad] }} height={280}>
          <Coordinates.Cartesian />
          <Polygon
            points={[
              [cx, 0],
              [d1, cy],
              [cx, d2],
              [0, cy],
            ]}
            color={Theme.orange}
          />
          {/* Dashed diagonal d1 (horizontal) */}
          <Line.Segment
            point1={[0, cy]}
            point2={[d1, cy]}
            color="#a1a1aa"
            style="dashed"
          />
          {/* Dashed diagonal d2 (vertical) */}
          <Line.Segment
            point1={[cx, 0]}
            point2={[cx, d2]}
            color="#a1a1aa"
            style="dashed"
          />
          <Text x={cx} y={cy + pad * 0.5} size={14}>
            {`d₁ = ${d1}`}
          </Text>
          <Text x={d1 + pad * 0.4} y={cy} size={14}>
            {`d₂ = ${d2}`}
          </Text>
        </Mafs>
      </div>
      <div className="space-y-2">
        <Slider
          label={t("diagonal1") + " (d₁)"}
          value={d1}
          onChange={setD1}
          min={1}
          max={15}
        />
        <Slider
          label={t("diagonal2") + " (d₂)"}
          value={d2}
          onChange={setD2}
          min={1}
          max={15}
        />
      </div>
      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        {t("formula")}: <Latex tex={`${aS} = \\frac{d_1 \\cdot d_2}{2}`} /> |{" "}
        <Latex tex={`${pS} = 4 \\cdot \\sqrt{(\\frac{d_1}{2})^2 + (\\frac{d_2}{2})^2}`} />
      </p>
    </ShapeCard>
  );
}

function TrapezoidExplorer() {
  const t = useTranslations("areas");
  const [a, setA] = useState(4);
  const [b, setB] = useState(2.5);
  const [h, setH] = useState(3);
  const [topShift, setTopShift] = useState(0);
  const area = ((a + b) * h) / 2;
  const defaultOffset = (a - b) / 2;
  const leftX = defaultOffset + topShift;
  const rightX = leftX + b;
  const leftLeg = Math.sqrt(leftX ** 2 + h ** 2);
  const rightLeg = Math.sqrt((a - rightX) ** 2 + h ** 2);
  const perimeter = a + b + leftLeg + rightLeg;
  const maxDim = Math.max(a, h);
  const pad = Math.max(maxDim * 0.2, 1.5);
  const viewLeft = Math.min(0, leftX) - pad;
  const viewRight = Math.max(a, rightX) + pad;
  const aS = t("areaSymbol");

  return (
    <ShapeCard title={t("trapezoid")} area={area} perimeter={perimeter}>
      <div className="mb-4 flex justify-center overflow-hidden rounded-lg bg-[var(--color-bg-primary)]">
        <Mafs viewBox={{ x: [viewLeft, viewRight], y: [-pad, h + pad] }} height={280}>
          <Coordinates.Cartesian />
          <Polygon
            points={[
              [0, 0],
              [a, 0],
              [rightX, h],
              [leftX, h],
            ]}
            color={Theme.violet}
          />
          {/* Dashed height line */}
          <Line.Segment
            point1={[leftX, 0]}
            point2={[leftX, h]}
            color="#a1a1aa"
            style="dashed"
          />
          <Text x={a / 2} y={-pad * 0.5} size={14}>
            {`a = ${a}`}
          </Text>
          <Text x={(leftX + rightX) / 2} y={h + pad * 0.45} size={14}>
            {`b = ${b}`}
          </Text>
          <Text x={leftX + pad * 0.5} y={h / 2} size={14}>
            {`h = ${h}`}
          </Text>
        </Mafs>
      </div>
      <div className="space-y-2">
        <Slider
          label={t("baseA") + " (a)"}
          value={a}
          onChange={setA}
          min={2}
          max={15}
        />
        <Slider
          label={t("baseB") + " (b)"}
          value={b}
          onChange={setB}
          min={0.5}
          max={14}
          step={0.5}
        />
        <Slider
          label={t("height") + " (h)"}
          value={h}
          onChange={setH}
          min={1}
          max={15}
        />
        <Slider
          label={t("topShift")}
          value={topShift}
          onChange={setTopShift}
          min={-7}
          max={7}
        />
      </div>
      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        {t("formula")}: <Latex tex={`${aS} = \\frac{(a + b) \\cdot h}{2}`} />
      </p>
    </ShapeCard>
  );
}

export default function ShapeExplorer() {
  const t = useTranslations("areas");

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">{t("interactive")}</h2>
      <p className="mb-8 text-[var(--color-text-secondary)]">{t("intro")}</p>
      <div className="grid gap-6 md:grid-cols-2">
        <SquareExplorer />
        <RectangleExplorer />
        <TriangleExplorer />
        <DiamondExplorer />
        <div className="md:col-span-2">
          <TrapezoidExplorer />
        </div>
      </div>
    </div>
  );
}
