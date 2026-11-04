import React from "react";
import Svg, { Path } from "react-native-svg";

// Trazos de 24×24, strokeWidth 1.8 (mismo estilo que Mi Biyuyo).
const PATHS = {
  refresh: ["M21 12a9 9 0 1 1-3-6.7L21 8", "M21 3v5h-5"],
  check: ["M20 6 9 17l-5-5"],
  swap: ["M8 3 4 7l4 4", "M4 7h16", "M16 21l4-4-4-4", "M20 17H4"],
  info: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 16v-4", "M12 8h.01"],
  chevronDown: ["m6 9 6 6 6-6"],
  sliders: ["M4 21v-7", "M4 10V3", "M12 21v-9", "M12 8V3", "M20 21v-5", "M20 12V3", "M1 14h6", "M9 8h6", "M17 16h6"],
  share: ["M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7", "M16 6l-4-4-4 4", "M12 2v13"],
  alert: ["M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z", "M12 9v4", "M12 17h.01"],
  scale: ["M12 3v18", "M5 21h14", "M5 7h14", "M5 7l-3 8a4 4 0 0 0 6 0L5 7Z", "M19 7l-3 8a4 4 0 0 0 6 0l-3-8Z"],
  wallet: ["M20 7H5a2 2 0 0 1 0-4h13v4", "M3 5v14a2 2 0 0 0 2 2h15V7", "M16 14h.01"],
  home: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h14V9.5", "M10 21v-6h4v6"],
  more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  moon: ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z", "M9 12l2 2 4-4"],
  trash: ["M3 6h18", "M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M10 11v6", "M14 11v6"],
  trend: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
};

export default function Icon({ name, size = 20, color = "#000", strokeWidth = 1.8 }) {
  const d = PATHS[name] || [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {d.map((p, i) => (
        <Path
          key={i}
          d={p}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
