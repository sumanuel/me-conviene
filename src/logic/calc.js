// Lógica pura de comparación. Sin dependencias de React ni de la red,
// para poder probarla con `node --test`.
//
// Modo "buy"  (necesito comprar dólares): se compara en bolívares.
//   · Pagar en Bs:  priceVes
//   · Pagar en USD: priceUsd · (1 + igtf) · tasaCompra · (1 + comisión)
//
// Modo "have" (ya tengo dólares): se compara en dólares.
//   · Pagar en USD: priceUsd · (1 + igtf)
//   · Pagar en Bs:  hay que vender dólares → priceVes / (tasaVenta · (1 − comisión))

/** Diferencia (en %) por debajo de la cual se considera empate. */
export const TIE_THRESHOLD_PCT = 0.5;

const num = (v) => (typeof v === "number" && isFinite(v) ? v : 0);

/**
 * @param {object} i
 * @param {"buy"|"have"} i.mode
 * @param {number} i.priceVes     Precio de la tienda pagando en bolívares
 * @param {number} i.priceUsd     Precio de la tienda pagando en dólares
 * @param {number} i.rate         Bs por USD: tasa de compra (buy) o de venta (have)
 * @param {number} [i.commissionPct] % de costo al comprar/vender dólares (spread, comisión)
 * @param {number} [i.igtfPct]    % de IGTF al pagar en divisas (0 si no aplica)
 * @returns {null | {
 *   mode: string, unit: "VES"|"USD", winner: "usd"|"ves"|"tie",
 *   costVes: number, costUsd: number, savings: number, savingsPct: number,
 *   breakEven: number, impliedRate: number
 * }}
 */
export function compare({
  mode = "buy",
  priceVes,
  priceUsd,
  rate,
  commissionPct = 0,
  igtfPct = 0,
}) {
  priceVes = num(priceVes);
  priceUsd = num(priceUsd);
  rate = num(rate);
  const c = Math.max(0, num(commissionPct)) / 100;
  const igtf = Math.max(0, num(igtfPct)) / 100;

  if (!(priceVes > 0) || !(priceUsd > 0) || !(rate > 0)) return null;
  if (mode === "have" && c >= 1) return null;

  const usdToPay = priceUsd * (1 + igtf); // dólares que salen realmente
  let costVes; // costo de la opción Bs
  let costUsd; // costo de la opción USD
  let breakEven;

  if (mode === "have") {
    // Todo expresado en USD
    costUsd = usdToPay;
    costVes = priceVes / (rate * (1 - c));
    breakEven = priceVes / (usdToPay * (1 - c)); // tasa de venta a partir de la cual conviene vender
  } else {
    // Todo expresado en Bs
    costVes = priceVes;
    costUsd = usdToPay * rate * (1 + c);
    breakEven = priceVes / (usdToPay * (1 + c)); // tasa máxima de compra para que valga la pena
  }

  const cheaper = Math.min(costVes, costUsd);
  const dearer = Math.max(costVes, costUsd);
  const savings = dearer - cheaper;
  const savingsPct = (savings / dearer) * 100;

  let winner = costUsd < costVes ? "usd" : "ves";
  if (savingsPct < TIE_THRESHOLD_PCT) winner = "tie";

  return {
    mode,
    unit: mode === "have" ? "USD" : "VES",
    winner,
    costVes,
    costUsd,
    savings,
    savingsPct,
    breakEven,
    impliedRate: priceVes / priceUsd,
  };
}
