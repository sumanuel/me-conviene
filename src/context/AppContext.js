import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatDecimalVe, parseNumber } from "../logic/format";
import { fetchRates, loadCachedRates, STALE_MS } from "../services/rates";
import { loadPrefs, savePrefs } from "../services/prefs";

const AppContext = createContext(null);

/** Nombre corto para mostrar cada fuente. */
export const STORE_SOURCE_NAME = { bcv: "BCV", manual: "manual" };
export const DOLLAR_SOURCE_NAME = { binance: "Binance", fisico: "físico" };

const fmt = (v) => (v > 0 ? formatDecimalVe(v, 2) : "");

/**
 * Estado compartido entre las pestañas.
 *
 * Hay DOS tasas distintas:
 *  · Tasa de la tienda (BCV o manual): convierte el precio de lista en USD a bolívares.
 *  · Tasa del dólar (Binance o físico): a cómo consigue (o vende) el usuario los dólares.
 */
export function AppProvider({ children }) {
  const [tab, setTab] = useState("home");

  const [mode, setMode] = useState("buy"); // buy | have
  const [priceMode, setPriceMode] = useState("list"); // list | ves
  const [commission, setCommission] = useState("");
  const [igtf, setIgtf] = useState(false);

  const [storeSource, setStoreSource] = useState("bcv"); // bcv | manual
  const [storeManual, setStoreManual] = useState("");
  const [dollarSource, setDollarSource] = useState("binance"); // binance | fisico
  const [fisicoText, setFisicoText] = useState("");

  const [rates, setRates] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [ready, setReady] = useState(false);

  const side = mode === "have" ? "sell" : "buy";

  const refresh = useCallback(async (previous) => {
    setRefreshing(true);
    try {
      const { rates: next, failed } = await fetchRates(previous);
      setRates(next);
      setOffline(failed.length === 2);
    } catch {
      setOffline(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Arranque: preferencias + últimas tasas guardadas, y luego se actualiza en red.
  useEffect(() => {
    let alive = true;
    (async () => {
      const [prefs, cached] = await Promise.all([loadPrefs(), loadCachedRates()]);
      if (!alive) return;
      if (prefs.mode) setMode(prefs.mode);
      if (prefs.priceMode) setPriceMode(prefs.priceMode);
      if (prefs.commission) setCommission(prefs.commission);
      if (prefs.igtf) setIgtf(true);
      if (prefs.storeSource) setStoreSource(prefs.storeSource);
      if (prefs.storeManual) setStoreManual(prefs.storeManual);
      if (prefs.dollarSource) setDollarSource(prefs.dollarSource);
      if (prefs.fisicoText) setFisicoText(prefs.fisicoText);
      if (cached) setRates(cached);
      setReady(true);
      refresh(cached);
    })();
    return () => {
      alive = false;
    };
  }, [refresh]);

  // Se recuerdan las preferencias (nunca los precios de la tienda).
  useEffect(() => {
    if (!ready) return;
    savePrefs({
      mode,
      priceMode,
      commission,
      igtf,
      storeSource,
      storeManual,
      dollarSource,
      fisicoText,
    });
  }, [ready, mode, priceMode, commission, igtf, storeSource, storeManual, dollarSource, fisicoText]);

  // Valores derivados: texto mostrado y número de cada tasa.
  const storeRateText = storeSource === "bcv" ? fmt(rates?.bcv?.buy) : storeManual;
  const dollarRateText = dollarSource === "binance" ? fmt(rates?.binance?.[side]) : fisicoText;
  const storeRate = parseNumber(storeRateText);
  const dollarRate = parseNumber(dollarRateText);

  const stale = !!(rates?.fetchedAt && Date.now() - rates.fetchedAt > STALE_MS);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      mode,
      setMode,
      side,
      priceMode,
      setPriceMode,
      commission,
      setCommission,
      igtf,
      setIgtf,
      storeSource,
      setStoreSource,
      storeManual,
      setStoreManual,
      dollarSource,
      setDollarSource,
      fisicoText,
      setFisicoText,
      rates,
      refresh,
      refreshing,
      offline,
      stale,
      storeRateText,
      dollarRateText,
      storeRate,
      dollarRate,
    }),
    [
      tab, mode, side, priceMode, commission, igtf, storeSource, storeManual, dollarSource,
      fisicoText, rates, refresh, refreshing, offline, stale, storeRateText, dollarRateText,
      storeRate, dollarRate,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
