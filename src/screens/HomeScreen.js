import React, { useCallback, useMemo, useRef, useState } from "react";
import { Keyboard, Linking, Platform, Pressable, ScrollView, Share, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { RADIUS, useTheme } from "../theme";
import { compare } from "../logic/calc";
import { formatAmountInput, formatVes, parseNumber } from "../logic/format";
import { buildShareText } from "../logic/share";
import { DOLLAR_SOURCE_NAME, STORE_SOURCE_NAME, useApp } from "../context/AppContext";
import { useFieldChain, useKeyboardHeight } from "../hooks/useFieldChain";
import Icon from "../components/Icon";
import KeyboardAccessory from "../components/KeyboardAccessory";
import ResultModal from "../components/ResultModal";
import { Card, Field, Segmented, ToggleRow, Txt } from "../components/ui";

const IGTF_PCT = 3;
const ACCESSORY_ID = "mc-kb-home";
const MODES = [
  { value: "buy", label: "Voy a comprar USD" },
  { value: "have", label: "Ya tengo USD" },
];
const PRICE_MODES = [
  { value: "list", label: "Lista en USD" },
  { value: "ves", label: "Precio en Bs" },
];

const orZero = (n) => (Number.isFinite(n) ? n : 0);

/** Resumen tocable de una tasa activa; lleva a la pestaña Tasas. */
function RateTile({ label, source, text, onPress }) {
  const { colors } = useTheme();
  const missing = !text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${source} ${text || "sin valor"}. Cambiar en Tasas`}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 64,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: missing ? colors.warn.border : colors.border,
        backgroundColor: missing ? colors.warn.bg : colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 2,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Txt size={11} weight={700} color={missing ? colors.warn.fg : colors.textSecondary} numberOfLines={1}>
        {label} · {source}
      </Txt>
      <Txt size={16} weight={800} num color={missing ? colors.warn.fg : colors.text} numberOfLines={1}>
        {missing ? "Falta la tasa" : `Bs ${text}`}
      </Txt>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const kbHeight = useKeyboardHeight();
  const scrollRef = useRef(null);

  const {
    setTab,
    mode,
    setMode,
    priceMode,
    setPriceMode,
    commission,
    setCommission,
    igtf,
    setIgtf,
    storeSource,
    dollarSource,
    storeRateText,
    dollarRateText,
    storeRate,
    dollarRate,
  } = useApp();

  const [listUsd, setListUsd] = useState("");
  const [priceVes, setPriceVes] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  const nList = parseNumber(listUsd);
  const nUsd = parseNumber(priceUsd);
  // Precio al que la tienda cobra en bolívares: lista × tasa de la tienda.
  const nVes = priceMode === "list" ? nList * storeRate : parseNumber(priceVes);

  const result = useMemo(
    () =>
      compare({
        mode,
        priceVes: nVes,
        priceUsd: nUsd,
        rate: dollarRate,
        commissionPct: orZero(parseNumber(commission)),
        igtfPct: igtf ? IGTF_PCT : 0,
      }),
    [mode, nVes, nUsd, dollarRate, commission, igtf],
  );

  const onShare = useCallback(async () => {
    const message = buildShareText({
      result,
      mode,
      priceVes: nVes,
      priceUsd: nUsd,
      rate: dollarRate,
      source: dollarSource,
      listUsd: priceMode === "list" ? nList : undefined,
      storeRate: priceMode === "list" ? storeRate : undefined,
      storeRateLabel: STORE_SOURCE_NAME[storeSource],
    });
    if (!message) return;
    try {
      if (Platform.OS === "web") {
        await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
        return;
      }
      try {
        await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
      } catch {
        await Share.share({ message });
      }
    } catch {}
  }, [result, mode, nVes, nUsd, dollarRate, dollarSource, priceMode, nList, storeRate, storeSource]);

  // ---- Teclado ---------------------------------------------------------------
  const order = useMemo(
    () => [
      priceMode === "list" ? "listUsd" : "priceVes",
      "priceUsd",
      ...(extrasOpen ? ["commission"] : []),
    ],
    [priceMode, extrasOpen],
  );

  // Pequeña espera: en web, soltar Enter justo sobre el modal recién abierto lo cerraría.
  const onDone = useCallback(() => {
    if (result) setTimeout(() => setResultOpen(true), 250);
  }, [result]);

  const { fieldProps, focus, goNext, nextStop, focusedKey } = useFieldChain({
    order,
    scrollRef,
    onDone,
    accessoryId: ACCESSORY_ID,
  });

  // ---- Acciones --------------------------------------------------------------
  const hasData = !!(listUsd || priceVes || priceUsd);

  const clearAll = () => {
    setResultOpen(false);
    setListUsd("");
    setPriceVes("");
    setPriceUsd("");
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });
    setTimeout(() => focus(priceMode === "list" ? "listUsd" : "priceVes"), 150);
  };

  const openResult = () => {
    Keyboard.dismiss();
    setResultOpen(true);
  };

  const extrasSummary = [
    igtf ? `IGTF ${IGTF_PCT} %` : null,
    orZero(parseNumber(commission)) > 0 ? `Comisión ${commission} %` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <StatusBar style={colors.statusBar} />
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 110 + kbHeight,
          paddingHorizontal: 16,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 520, gap: 14 }}>
          {/* Cabecera */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 }}>
            <LinearGradient
              colors={[colors.accent, colors.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Txt size={22} weight={800} color={colors.onAccent}>
                $
              </Txt>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Txt size={22} weight={800} style={{ letterSpacing: -0.4 }} accessibilityRole="header">
                Me conviene
              </Txt>
              <Txt size={12.5} color={colors.textSecondary}>
                ¿Dólares o bolívares? Decide en segundos
              </Txt>
            </View>
          </View>

          {/* Modo */}
          <View style={{ gap: 8 }}>
            <Segmented options={MODES} value={mode} onChange={setMode} />
            <Txt size={12} color={colors.textSecondary} style={{ paddingHorizontal: 4 }}>
              {mode === "buy"
                ? "Compara pagar en bolívares contra comprar los dólares al precio de la tasa."
                : "Compara pagar con tus dólares contra venderlos para pagar en bolívares."}
            </Txt>
          </View>

          {/* Tasas activas (se cambian en la pestaña Tasas) */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {priceMode === "list" ? (
              <RateTile
                label="Tienda"
                source={STORE_SOURCE_NAME[storeSource]}
                text={storeRateText}
                onPress={() => setTab("rates")}
              />
            ) : null}
            <RateTile
              label={mode === "have" ? "Vendes" : "Compras"}
              source={DOLLAR_SOURCE_NAME[dollarSource]}
              text={dollarRateText}
              onPress={() => setTab("rates")}
            />
          </View>

          {/* Precios */}
          <Card style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Txt size={15} weight={800}>
                Precio en la tienda
              </Txt>
              <Pressable
                onPress={clearAll}
                disabled={!hasData}
                accessibilityRole="button"
                accessibilityLabel="Limpiar precios"
                accessibilityState={{ disabled: !hasData }}
                hitSlop={8}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  minHeight: 36,
                  paddingHorizontal: 12,
                  borderRadius: RADIUS.pill,
                  backgroundColor: colors.chip,
                  opacity: !hasData ? 0.45 : pressed ? 0.7 : 1,
                })}
              >
                <Icon name="trash" size={15} color={colors.textSecondary} />
                <Txt size={12} weight={700} color={colors.textSecondary}>
                  Limpiar
                </Txt>
              </Pressable>
            </View>
            <Segmented options={PRICE_MODES} value={priceMode} onChange={setPriceMode} />

            {priceMode === "list" ? (
              <>
                <Field
                  label="Precio de lista"
                  prefix="US$"
                  value={listUsd}
                  onChangeText={(t) => setListUsd((p) => formatAmountInput(t, p))}
                  placeholder="100"
                  {...fieldProps("listUsd")}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    backgroundColor: colors.accentSoft,
                    borderRadius: RADIUS.md,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Txt size={12} weight={700} color={colors.accentFg}>
                      Pagando en Bs
                    </Txt>
                    <Txt size={11} color={colors.accentFg}>
                      Lista × tasa {STORE_SOURCE_NAME[storeSource]}
                    </Txt>
                  </View>
                  <Txt size={20} weight={800} num color={colors.accentFg} adjustsFontSizeToFit numberOfLines={1}>
                    {nVes > 0 ? formatVes(nVes) : "—"}
                  </Txt>
                </View>
              </>
            ) : (
              <Field
                label="Precio pagando en Bs"
                prefix="Bs"
                value={priceVes}
                onChangeText={(t) => setPriceVes((p) => formatAmountInput(t, p))}
                placeholder="100.000"
                {...fieldProps("priceVes")}
              />
            )}

            <Field
              label="Precio pagando en USD (efectivo o Binance)"
              prefix="US$"
              value={priceUsd}
              onChangeText={(t) => setPriceUsd((p) => formatAmountInput(t, p))}
              placeholder="75"
              hint="El precio con descuento que te da la tienda."
              {...fieldProps("priceUsd")}
            />
          </Card>

          {/* Costos extra */}
          <Card style={{ paddingVertical: 8 }}>
            <Pressable
              onPress={() => setExtrasOpen((o) => !o)}
              accessibilityRole="button"
              accessibilityState={{ expanded: extrasOpen }}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: colors.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="sliders" size={18} color={colors.accentFg} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={14} weight={800}>
                  Costos extra
                </Txt>
                <Txt size={12} color={colors.textSecondary}>
                  {extrasSummary || "Comisiones e IGTF (opcional)"}
                </Txt>
              </View>
              <View style={{ transform: [{ rotate: extrasOpen ? "180deg" : "0deg" }] }}>
                <Icon name="chevronDown" size={20} color={colors.muted} />
              </View>
            </Pressable>

            {extrasOpen ? (
              <View style={{ gap: 12, paddingTop: 8, paddingBottom: 8 }}>
                <View style={{ height: 1, backgroundColor: colors.divider }} />
                <Field
                  label={mode === "have" ? "Comisión al vender dólares" : "Comisión al comprar dólares"}
                  suffix="%"
                  value={commission}
                  onChangeText={(t) => setCommission((p) => formatAmountInput(t, p))}
                  placeholder="0"
                  size={18}
                  hint="Binance, transferencia, casa de cambio… Se suma al costo."
                  {...fieldProps("commission")}
                />
                <ToggleRow
                  label={`IGTF ${IGTF_PCT} %`}
                  hint="Impuesto por pagar en divisas. Actívalo si la tienda lo cobra."
                  value={igtf}
                  onValueChange={setIgtf}
                />
              </View>
            ) : null}
          </Card>
        </View>
      </ScrollView>

      {/* Barra fija con el botón de resultado (se oculta con el teclado abierto) */}
      {kbHeight === 0 ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            paddingTop: 12,
            paddingHorizontal: 16,
            paddingBottom: 12,
            backgroundColor: colors.page,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Pressable
            onPress={openResult}
            disabled={!result}
            accessibilityRole="button"
            accessibilityState={{ disabled: !result }}
            style={({ pressed }) => ({
              width: "100%",
              maxWidth: 520,
              minHeight: 54,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: RADIUS.lg,
              backgroundColor: result ? colors.accent : colors.chip,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Icon name="scale" size={20} color={result ? colors.onAccent : colors.muted} />
            <Txt size={16} weight={800} color={result ? colors.onAccent : colors.muted}>
              {result ? "Ver resultado" : "Completa los precios y las tasas"}
            </Txt>
          </Pressable>
        </View>
      ) : null}

      <KeyboardAccessory
        id={ACCESSORY_ID}
        hasNext={!!(focusedKey && nextStop(focusedKey))}
        onPress={() => (focusedKey ? goNext(focusedKey) : Keyboard.dismiss())}
      />

      <ResultModal
        visible={resultOpen && !!result}
        onClose={() => setResultOpen(false)}
        result={result}
        priceUsd={nUsd}
        rate={dollarRate}
        onShare={onShare}
      />
    </View>
  );
}
