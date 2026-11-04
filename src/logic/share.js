import { formatUsd, formatVes, formatPct } from "./format.js";

const SOURCE_LABEL = {
  binance: "Binance",
  fisico: "dólar físico",
};

/** Texto listo para compartir por WhatsApp. */
export function buildShareText({
  result,
  mode,
  priceVes,
  priceUsd,
  rate,
  source,
  listUsd,
  storeRate,
  storeRateLabel = "de la tienda",
}) {
  if (!result) return "";
  const money = result.unit === "USD" ? formatUsd : formatVes;
  const rateLabel = mode === "have" ? "Tasa de venta" : "Tasa de compra";

  let verdict;
  if (result.winner === "tie") {
    verdict = "⚖️ Da igual: el costo es prácticamente el mismo.";
  } else {
    const how = result.winner === "usd" ? "dólares" : "bolívares";
    verdict = `✅ Me conviene pagar en ${how}: ahorro ${money(result.savings)} (${formatPct(result.savingsPct)}).`;
  }

  const eq =
    mode === "have"
      ? `Si vendo dólares por encima de ${formatVes(result.breakEven)}, conviene pagar en bolívares.`
      : `Si compro dólares por debajo de ${formatVes(result.breakEven)}, conviene pagar en dólares.`;

  return [
    "💸 ¿Dólares o bolívares? Hice la cuenta:",
    ...(listUsd > 0 && storeRate > 0
      ? [`• Precio de lista: ${formatUsd(listUsd)} a tasa ${storeRateLabel} ${formatVes(storeRate)}`]
      : []),
    `• Precio en Bs: ${formatVes(priceVes)}`,
    `• Precio en USD (con descuento): ${formatUsd(priceUsd)}`,
    `• ${rateLabel} (${SOURCE_LABEL[source] ?? source}): ${formatVes(rate)}`,
    "",
    verdict,
    eq,
    "",
    "Calculado con la app Me conviene",
  ].join("\n");
}
