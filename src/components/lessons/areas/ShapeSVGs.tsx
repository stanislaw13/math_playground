"use client";

export function SquareSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <rect
        x="10"
        y="10"
        width="60"
        height="60"
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
      />
      <text x="40" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="12">
        a
      </text>
      <text x="5" y="44" textAnchor="middle" fill="#a1a1aa" fontSize="12">
        a
      </text>
    </svg>
  );
}

export function RectangleSVG() {
  return (
    <svg width="100" height="70" viewBox="0 0 100 70">
      <rect
        x="10"
        y="10"
        width="80"
        height="50"
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
      />
      <text x="50" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="12">
        a
      </text>
      <text x="5" y="38" textAnchor="middle" fill="#a1a1aa" fontSize="12">
        b
      </text>
    </svg>
  );
}

export function TriangleSVG() {
  return (
    <svg width="90" height="80" viewBox="0 0 90 80">
      <polygon
        points="45,10 10,70 80,70"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
      />
      <line
        x1="45"
        y1="10"
        x2="45"
        y2="70"
        stroke="#a1a1aa"
        strokeWidth="1"
        strokeDasharray="4"
      />
      <text x="45" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="12">
        a
      </text>
      <text x="52" y="44" textAnchor="start" fill="#a1a1aa" fontSize="12">
        h
      </text>
    </svg>
  );
}

export function DiamondSVG() {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90">
      <polygon
        points="40,5 75,45 40,85 5,45"
        fill="none"
        stroke="#f97316"
        strokeWidth="2"
      />
      <line
        x1="5"
        y1="45"
        x2="75"
        y2="45"
        stroke="#a1a1aa"
        strokeWidth="1"
        strokeDasharray="4"
      />
      <line
        x1="40"
        y1="5"
        x2="40"
        y2="85"
        stroke="#a1a1aa"
        strokeWidth="1"
        strokeDasharray="4"
      />
      <text x="40" y="56" textAnchor="middle" fill="#a1a1aa" fontSize="11">
        d₁
      </text>
      <text x="54" y="30" textAnchor="start" fill="#a1a1aa" fontSize="11">
        d₂
      </text>
    </svg>
  );
}

export function TrapezoidSVG() {
  return (
    <svg width="100" height="80" viewBox="0 0 100 80">
      <polygon
        points="10,65 90,65 70,15 30,15"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      <line
        x1="50"
        y1="15"
        x2="50"
        y2="65"
        stroke="#a1a1aa"
        strokeWidth="1"
        strokeDasharray="4"
      />
      <text x="50" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="12">
        a
      </text>
      <text x="50" y="12" textAnchor="middle" fill="#a1a1aa" fontSize="12">
        b
      </text>
      <text x="56" y="44" textAnchor="start" fill="#a1a1aa" fontSize="12">
        h
      </text>
    </svg>
  );
}
