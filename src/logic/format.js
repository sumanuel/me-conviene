// Entrada y salida de números con el formato venezolano:
// miles con punto, decimales con coma (Bs 208.170,00).
// Los dólares siguen la convención de Mi Biyuyo (US$ 1,387.80).

/**
 * Convierte texto escrito por el usuario en número.
 * Acepta "1.100,50", "1100,5", "1100.5", "1.100" (miles), "75".
 * Devuelve NaN si no hay un número válido.
 */
export function parseNumber(text) {
  if (typeof text === "number") return text;
  let s = String(text ?? "").trim().replace(/[^\d.,]/g, "");
  if (!s) return NaN;

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    // Los dos separadores: el último es el decimal.
    const decimalIsComma = lastComma > lastDot;
    s = decimalIsComma
      ? s.replace(/\./g, "").replace(",", ".")
      : s.replace(/,/g, "");
  } else if (lastComma !== -1) {
    // Solo comas: una coma = decimal; varias = miles.
    s = s.split(",").length > 2 ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (lastDot !== -1) {
    const parts = s.split(".");
    // "1.100" o "1.100.000" → miles (grupos de 3). "1100.5" → decimal.
    const looksThousands =
      parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3);
    s = looksThousands ? s.replace(/\./g, "") : s;
  }
  const n = parseFloat(s);
  return isFinite(n) ? n : NaN;
}

function group(intPart, sep) {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/** 208170 → "208.170,00" */
export function formatDecimalVe(n, decimals = 2) {
  if (!isFinite(n)) return "—";
  const [i, d] = Math.abs(n).toFixed(decimals).split(".");
  const body = decimals > 0 ? `${group(i, ".")},${d}` : group(i, ".");
  return n < 0 ? `-${body}` : body;
}

/** 1387.8 → "1,387.80" */
export function formatDecimalUs(n, decimals = 2) {
  if (!isFinite(n)) return "—";
  const [i, d] = Math.abs(n).toFixed(decimals).split(".");
  const body = decimals > 0 ? `${group(i, ",")}.${d}` : group(i, ",");
  return n < 0 ? `-${body}` : body;
}

export const formatVes = (n, decimals = 2) => `Bs ${formatDecimalVe(n, decimals)}`;
export const formatUsd = (n, decimals = 2) => `US$ ${formatDecimalUs(n, decimals)}`;

/** 17.456 → "17,5 %" */
export function formatPct(n) {
  if (!isFinite(n)) return "—";
  return `${n.toFixed(1).replace(".", ",")} %`;
}

/**
 * Da formato de miles mientras el usuario escribe: "100000" → "100.000".
 * La app inserta los puntos de miles, así que un "." escrito al final se toma
 * como separador decimal (teclados que solo tienen punto). La coma es decimal.
 * @param {string} text  Texto actual del campo
 * @param {string} [prev] Texto anterior (para saber si se acaba de escribir un ".")
 * @param {number} [maxDecimals]
 */
export function formatAmountInput(text, prev = "", maxDecimals = 2) {
  let s = String(text ?? "");
  if (s.endsWith(".") && s.length > prev.length) s = s.slice(0, -1) + ",";
  s = s.replace(/[^\d,]/g, "");
  const firstComma = s.indexOf(",");
  let intPart = firstComma === -1 ? s : s.slice(0, firstComma);
  let decPart =
    firstComma === -1 ? null : s.slice(firstComma + 1).replace(/,/g, "").slice(0, maxDecimals);
  intPart = intPart.replace(/^0+(?=\d)/, "");
  if (intPart === "" && decPart !== null) intPart = "0";
  const grouped = group(intPart, ".");
  return decPart === null ? grouped : `${grouped},${decPart}`;
}

/** Texto "hace 5 min" a partir de un timestamp en ms. */
export function timeAgo(ts, now = Date.now()) {
  if (!ts) return "";
  const min = Math.max(0, Math.round((now - ts) / 60000));
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}
