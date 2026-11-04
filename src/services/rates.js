import AsyncStorage from "@react-native-async-storage/async-storage";

// Fuentes (las mismas que Mi Biyuyo):
//  · BCV (tasa oficial, la que usan las tiendas): ve.dolarapi.com
//  · Binance P2P (USDT/VES): criptoya.com  (ask = lo que pagas al comprar, bid = lo que recibes al vender)
// El dólar paralelo ya no se usa.
const DOLARAPI = "https://ve.dolarapi.com/v1/dolares";
const CRIPTOYA = "https://criptoya.com/api/binancep2p/USDT/VES/1";
const CACHE_KEY = "@mc_rates_v2";

/** Pasadas estas horas las tasas se consideran viejas. */
export const STALE_MS = 6 * 60 * 60 * 1000;

async function getJson(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

const pos = (v) => {
  const n = parseFloat(v);
  return n > 0 ? n : null;
};

function fromDolarApi(list, fuente) {
  const item = (Array.isArray(list) ? list : []).find((d) => d.fuente === fuente);
  if (!item) return null;
  const avg = pos(item.promedio);
  const buy = pos(item.venta) ?? avg;
  const sell = pos(item.compra) ?? avg;
  if (!buy && !sell) return null;
  return { buy: buy ?? sell, sell: sell ?? buy };
}

function fromCriptoya(data) {
  const buy = pos(data?.ask);
  const sell = pos(data?.bid);
  if (!buy && !sell) return null;
  return { buy: buy ?? sell, sell: sell ?? buy };
}

/** Lee las últimas tasas guardadas (o null). */
export async function loadCachedRates() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Consulta las fuentes en paralelo. Si una falla conserva su valor anterior.
 * Devuelve { rates: {bcv, binance, fetchedAt}, failed: string[] }.
 * Lanza error solo si no hay ningún dato nuevo.
 */
export async function fetchRates(previous = null) {
  const [dolar, bin] = await Promise.allSettled([getJson(DOLARAPI), getJson(CRIPTOYA)]);

  const next = {
    bcv: dolar.status === "fulfilled" ? fromDolarApi(dolar.value, "oficial") : null,
    binance: bin.status === "fulfilled" ? fromCriptoya(bin.value) : null,
  };
  if (!next.bcv && !next.binance) throw new Error("No se pudieron obtener las tasas");

  const failed = [];
  const rates = { fetchedAt: Date.now() };
  for (const k of ["bcv", "binance"]) {
    if (next[k]) rates[k] = next[k];
    else {
      failed.push(k);
      rates[k] = previous?.[k] ?? null;
    }
  }
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch {}
  return { rates, failed };
}
