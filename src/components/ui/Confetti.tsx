"use client";

import { motion } from "framer-motion";

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
  "#98D8C8", "#F7DC6F", "#DDA0DD", "#90EE90",
  "#FFB347", "#87CEEB",
];

// Generate pieces once at module load (client-only, so no SSR mismatch)
const PIECES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,        // % from left
  delay: Math.random() * 0.7,
  duration: 2.2 + Math.random() * 1.4,
  color: COLORS[i % COLORS.length],
  size: Math.random() * 10 + 6,
  rotStart: Math.random() * 360,
  rotEnd: Math.random() * 720 + 360,
  isCircle: Math.random() > 0.5,
}));

export default function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {PIECES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "-8%", x: `${p.x}vw`, opacity: 1, rotate: p.rotStart }}
          animate={{ y: "108vh", opacity: [1, 1, 1, 0.8, 0], rotate: p.rotEnd }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
