import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@mc_theme_v1";

// Paleta amarilla estilo Binance con neutros fríos; azul para el veredicto en bolívares.
export const COLORS = {
  light: {
    page: "#f5f6f8",
    surface: "#ffffff",
    surfaceAlt: "#f7f8fa",
    text: "#1e2329",
    textSecondary: "#5e6673",
    muted: "#848e9c",
    border: "#e3e6ea",
    divider: "#eef0f3",
    chip: "#eff1f4",
    segment: "#e8eaed",
    accent: "#f0b90b",
    accentDark: "#c99400",
    accentSoft: "#fef6d8",
    accentFg: "#7a5a00",
    onAccent: "#1e2329",
    blue: "#245fd1",
    blueDark: "#1a3f94",
    blueSoft: "#e8f0fb",
    warn: { bg: "#fff5de", fg: "#8a5a00", border: "#f0d9a3" },
    danger: { bg: "#ffe9e6", fg: "#a8342a", border: "#e9a19a" },
    info: { bg: "#ebf3ff", fg: "#245fd1", border: "#c9dcf7" },
    shadow: "#1e2329",
    statusBar: "dark",
  },
  dark: {
    page: "#0b0e11",
    surface: "#181a20",
    surfaceAlt: "#1e2329",
    text: "#eaecef",
    textSecondary: "#a7b0bd",
    muted: "#707a8a",
    border: "#2b3139",
    divider: "#232830",
    chip: "#252a32",
    segment: "#1e2329",
    accent: "#fcd535",
    accentDark: "#f0b90b",
    accentSoft: "#2b2610",
    accentFg: "#fcd535",
    onAccent: "#1e2329",
    blue: "#5b8def",
    blueDark: "#1a3f94",
    blueSoft: "#1a2842",
    warn: { bg: "#3a2d10", fg: "#f0c56a", border: "#5a4519" },
    danger: { bg: "#3d1e1a", fg: "#f2a19a", border: "#6a2f28" },
    info: { bg: "#1a2842", fg: "#8fb2f7", border: "#2b3f66" },
    shadow: "#000000",
    statusBar: "light",
  },
};

const ThemeContext = createContext(null);

/** Preferencia: "system" (automático), "light" o "dark". Se recuerda entre sesiones. */
export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((v) => {
        if (v === "light" || v === "dark" || v === "system") setPrefState(v);
      })
      .catch(() => {});
  }, []);

  const setPref = useCallback((v) => {
    setPrefState(v);
    AsyncStorage.setItem(THEME_KEY, v).catch(() => {});
  }, []);

  // Que los diálogos del sistema sigan el tema elegido en la app.
  // En React Native 0.88 el valor para volver al tema del sistema es 'auto' (null rompe en Android).
  useEffect(() => {
    try {
      Appearance.setColorScheme(pref === "system" ? "auto" : pref);
    } catch {}
  }, [pref]);

  const isDark = pref === "system" ? system === "dark" : pref === "dark";
  const value = useMemo(
    () => ({ isDark, colors: isDark ? COLORS.dark : COLORS.light, pref, setPref }),
    [isDark, pref, setPref],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return { isDark: false, colors: COLORS.light, pref: "system", setPref: () => {} };
}

export const RADIUS = { sm: 10, md: 14, lg: 16, xl: 22, pill: 999 };
