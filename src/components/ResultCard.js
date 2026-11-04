import React from "react";
import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RADIUS, useTheme } from "../theme";
import { formatDecimalVe, formatPct, formatUsd, formatVes } from "../logic/format";
import Icon from "./Icon";
import { Txt } from "./ui";

const INK = "#1e2329";

/** Colores de la tarjeta según el veredicto. */
function schemeFor(winner, colors) {
  if (winner === "usd") {
    // Amarillo Binance: texto oscuro para que se lea.
    return {
      gradient: ["#fcd535", "#f0b90b"],
      fg: INK,
      soft: "rgba(30,35,41,0.74)",
      panel: "rgba(30,35,41,0.08)",
      panelWin: "rgba(255,255,255,0.5)",
      edge: "rgba(30,35,41,0.35)",
      pill: "rgba(30,35,41,0.12)",
      btnBg: INK,
      btnFg: "#fcd535",
    };
  }
  if (winner === "ves") {
    return {
      gradient: [colors.blueDark, colors.blue],
      fg: "#ffffff",
      soft: "rgba(255,255,255,0.82)",
      panel: "rgba(255,255,255,0.14)",
      panelWin: "rgba(255,255,255,0.24)",
      edge: "rgba(255,255,255,0.45)",
      pill: "rgba(255,255,255,0.22)",
      btnBg: "#ffffff",
      btnFg: colors.blueDark,
    };
  }
  // Empate: tarjeta neutra
  return {
    gradient: null,
    fg: colors.text,
    soft: colors.textSecondary,
    panel: colors.surfaceAlt,
    panelWin: colors.chip,
    edge: colors.muted,
    pill: colors.chip,
    btnBg: colors.accent,
    btnFg: INK,
  };
}

function Row({ label, value, sub, win, s }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: win ? s.panelWin : s.panel,
        borderRadius: RADIUS.md,
        padding: 12,
        borderWidth: win ? 1 : 0,
        borderColor: s.edge,
      }}
    >
      <View style={{ width: 20 }}>{win ? <Icon name="check" size={18} color={s.fg} /> : null}</View>
      <View style={{ flex: 1 }}>
        <Txt size={12} weight={700} color={s.soft}>
          {label}
        </Txt>
        {sub ? (
          <Txt size={11} weight={500} color={s.soft} style={{ marginTop: 1 }}>
            {sub}
          </Txt>
        ) : null}
      </View>
      <Txt size={16} weight={800} num color={s.fg}>
        {value}
      </Txt>
    </View>
  );
}

/**
 * Tarjeta con el veredicto (se muestra dentro de un modal).
 * @param {object} p
 * @param {object} p.result  Salida de compare()
 * @param {number} p.priceUsd
 * @param {number} p.rate
 * @param {() => void} p.onShare
 */
export default function ResultCard({ result, priceUsd, rate, onShare }) {
  const { colors } = useTheme();
  if (!result) return null;

  const { winner, mode, unit } = result;
  const money = unit === "USD" ? formatUsd : formatVes;
  const isTie = winner === "tie";
  const s = schemeFor(winner, colors);

  const title = isTie ? "Da igual" : winner === "usd" ? "Paga en dólares" : "Paga en bolívares";
  const eyebrow = isTie ? "RESULTADO" : "TE CONVIENE";

  // ¿Cuánto debe moverse la tasa para que cambie la recomendación?
  const delta = result.breakEven - rate;
  const deltaPct = (Math.abs(delta) / rate) * 100;
  const direction = delta > 0 ? "sube" : "baja";

  const usdSub =
    mode === "have"
      ? "Directo, sin vender nada"
      : `${formatUsd(priceUsd)} a Bs ${formatDecimalVe(rate)}`;
  const vesSub =
    mode === "have" ? `Vendiendo dólares a Bs ${formatDecimalVe(rate)}` : "Directo, sin cambiar nada";

  const body = (
    <View style={{ gap: 14 }}>
      <View>
        <Txt size={11} weight={800} color={s.soft} style={{ letterSpacing: 1.2 }}>
          {eyebrow}
        </Txt>
        <Txt
          size={30}
          weight={800}
          color={s.fg}
          style={{ letterSpacing: -0.6, marginTop: 2 }}
          accessibilityRole="header"
        >
          {title}
        </Txt>
        {isTie ? (
          <Txt size={14} weight={600} color={s.soft} style={{ marginTop: 4 }}>
            La diferencia es menor al 0,5 %. Elige la opción más cómoda.
          </Txt>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
            <Txt size={15} weight={600} color={s.soft}>
              Ahorras
            </Txt>
            <Txt size={20} weight={800} num color={s.fg} adjustsFontSizeToFit numberOfLines={1}>
              {money(result.savings)}
            </Txt>
            <View
              style={{
                backgroundColor: s.pill,
                borderRadius: RADIUS.pill,
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <Txt size={12} weight={800} color={s.fg}>
                {formatPct(result.savingsPct)}
              </Txt>
            </View>
          </View>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Row label="Pagando en dólares" sub={usdSub} value={money(result.costUsd)} win={winner === "usd"} s={s} />
        <Row label="Pagando en bolívares" sub={vesSub} value={money(result.costVes)} win={winner === "ves"} s={s} />
      </View>

      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <Txt size={12} weight={700} color={s.soft}>
            {mode === "have" ? "Tasa de venta de equilibrio" : "Tasa de equilibrio"}
          </Txt>
          <Txt size={18} weight={800} num color={s.fg}>
            {formatVes(result.breakEven)}
          </Txt>
        </View>
        <Txt size={12} weight={500} color={s.soft}>
          {mode === "have"
            ? "Si logras vender dólares por encima de esa tasa, conviene pagar en bolívares."
            : "Si consigues el dólar por debajo de esa tasa, conviene pagar en dólares."}
        </Txt>
        {!isTie ? (
          <Txt size={12} weight={700} color={s.fg} style={{ marginTop: 2 }}>
            La recomendación cambia si la tasa {direction} a {formatVes(result.breakEven)} (
            {direction === "sube" ? "+" : "−"}
            {formatPct(deltaPct)}).
          </Txt>
        ) : null}
      </View>

      <Pressable
        onPress={onShare}
        accessibilityRole="button"
        accessibilityLabel="Compartir resultado por WhatsApp"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 48,
          borderRadius: RADIUS.md,
          backgroundColor: s.btnBg,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="share" size={18} color={s.btnFg} />
        <Txt size={14} weight={800} color={s.btnFg}>
          Compartir por WhatsApp
        </Txt>
      </Pressable>
    </View>
  );

  if (isTie) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: RADIUS.xl,
          padding: 18,
        }}
      >
        {body}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={s.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: RADIUS.xl, padding: 18 }}
    >
      {body}
    </LinearGradient>
  );
}
