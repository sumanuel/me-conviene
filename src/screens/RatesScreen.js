import React, { useMemo, useRef } from "react";
import { ActivityIndicator, Keyboard, Pressable, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RADIUS, useTheme } from "../theme";
import { useApp } from "../context/AppContext";
import { formatAmountInput, formatDecimalVe, formatVes, timeAgo } from "../logic/format";
import { useFieldChain, useKeyboardHeight } from "../hooks/useFieldChain";
import Header from "../components/Header";
import Icon from "../components/Icon";
import KeyboardAccessory from "../components/KeyboardAccessory";
import { Card, Field, Notice, RateChip, Txt } from "../components/ui";

const ACCESSORY_ID = "mc-kb-rates";

/** Valor grande de una tasa automática (solo lectura). */
function RateValue({ value, note }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.accentSoft,
        borderRadius: RADIUS.md,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <Txt size={24} weight={800} num color={colors.accentFg}>
          {value ? formatVes(Number(value)) : "—"}
        </Txt>
        <Txt size={12} weight={700} color={colors.accentFg}>
          por US$
        </Txt>
      </View>
      <Txt size={11} color={colors.accentFg}>
        {note}
      </Txt>
    </View>
  );
}

export default function RatesScreen() {
  const { colors } = useTheme();
  const kbHeight = useKeyboardHeight();
  const scrollRef = useRef(null);

  const {
    mode,
    side,
    rates,
    refresh,
    refreshing,
    offline,
    stale,
    storeSource,
    setStoreSource,
    storeManual,
    setStoreManual,
    dollarSource,
    setDollarSource,
    fisicoText,
    setFisicoText,
  } = useApp();

  const order = useMemo(() => ["store", "dollar"], []);
  const isStop = useMemo(
    () => (key) => (key === "store" ? storeSource === "manual" : dollarSource === "fisico"),
    [storeSource, dollarSource],
  );
  const { fieldProps, focus, goNext, nextStop, focusedKey } = useFieldChain({
    order,
    isStop,
    scrollRef,
    accessoryId: ACCESSORY_ID,
  });

  const have = mode === "have";
  const bcv = rates?.bcv?.buy;
  const binance = rates?.binance?.[side];

  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <StatusBar style={colors.statusBar} />
      <Header
        title="Tasas"
        subtitle="Tienda y dólar"
        right={
          <Pressable
            onPress={() => refresh(rates)}
            disabled={refreshing}
            accessibilityRole="button"
            accessibilityLabel="Actualizar tasas"
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              minHeight: 38,
              paddingHorizontal: 14,
              borderRadius: RADIUS.pill,
              backgroundColor: colors.accentSoft,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={colors.accentFg} />
            ) : (
              <Icon name="refresh" size={16} color={colors.accentFg} />
            )}
            <Txt size={12.5} weight={700} color={colors.accentFg}>
              {refreshing ? "Actualizando…" : rates?.fetchedAt ? timeAgo(rates.fetchedAt) : "Actualizar"}
            </Txt>
          </Pressable>
        }
      />
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: 32 + kbHeight,
          paddingHorizontal: 16,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 520, gap: 14 }}>
          {offline && !rates ? (
            <Notice tone="warn" action="Reintentar" onAction={() => refresh(null)}>
              Sin conexión. Escribe las tasas a mano.
            </Notice>
          ) : stale ? (
            <Notice tone="warn" action="Actualizar" onAction={() => refresh(rates)}>
              Estas tasas son viejas ({timeAgo(rates.fetchedAt)}). Verifícalas.
            </Notice>
          ) : null}

          {/* Tasa de la tienda */}
          <Card style={{ gap: 12 }}>
            <View style={{ gap: 4 }}>
              <Txt size={15} weight={800}>
                Tasa de la tienda
              </Txt>
              <Txt size={12.5} color={colors.textSecondary}>
                La que usa la tienda para pasar su precio en dólares a bolívares. Normalmente es la oficial.
              </Txt>
              <Txt size={12} color={colors.muted}>
                Ejemplo: la tienda marca US$ 100 y te cobra los bolívares a la tasa BCV.
              </Txt>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <RateChip
                label="BCV"
                value={bcv ? formatDecimalVe(bcv, 2) : "—"}
                active={storeSource === "bcv"}
                disabled={!bcv}
                onPress={() => {
                  Keyboard.dismiss();
                  setStoreSource("bcv");
                }}
              />
              <RateChip
                label="Manual"
                value={storeManual || "Escribir"}
                active={storeSource === "manual"}
                onPress={() => {
                  setStoreSource("manual");
                  setTimeout(() => focus("store"), 50);
                }}
              />
            </View>

            {storeSource === "bcv" ? (
              <RateValue value={bcv} note="Tasa oficial del Banco Central de Venezuela" />
            ) : (
              <Field
                label="Tasa de la tienda"
                prefix="Bs"
                suffix="por US$"
                value={storeManual}
                onChangeText={(t) => setStoreManual((p) => formatAmountInput(t, p))}
                placeholder="0,00"
                {...fieldProps("store")}
              />
            )}
          </Card>

          {/* Tasa para conseguir los dólares */}
          <Card style={{ gap: 12 }}>
            <View style={{ gap: 4 }}>
              <Txt size={15} weight={800}>
                {have ? "Tasa para vender tus dólares" : "Tasa para comprar dólares"}
              </Txt>
              <Txt size={12.5} color={colors.textSecondary}>
                {have
                  ? "A cómo puedes vender tus dólares: en Binance o en físico."
                  : "A cómo consigues tú los dólares: en Binance o en físico."}
              </Txt>
              <Txt size={12} color={colors.muted}>
                {have
                  ? "Ejemplo: si pagas en bolívares, antes vendes tus dólares a esta tasa."
                  : "Ejemplo: para pagar en dólares, antes compras esos dólares a esta tasa."}
              </Txt>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <RateChip
                label="Físico"
                value={fisicoText || "Escribir"}
                active={dollarSource === "fisico"}
                onPress={() => {
                  setDollarSource("fisico");
                  setTimeout(() => focus("dollar"), 50);
                }}
              />
              <RateChip
                label="Binance"
                value={binance ? formatDecimalVe(binance, 2) : "—"}
                active={dollarSource === "binance"}
                disabled={!binance}
                onPress={() => {
                  Keyboard.dismiss();
                  setDollarSource("binance");
                }}
              />
            </View>

            {dollarSource === "binance" ? (
              <RateValue
                value={binance}
                note={`Binance P2P (USDT) · precio de ${have ? "venta" : "compra"}`}
              />
            ) : (
              <Field
                label={have ? "A cómo vendes el dólar físico" : "A cómo compras el dólar físico"}
                prefix="Bs"
                suffix="por US$"
                value={fisicoText}
                onChangeText={(t) => setFisicoText((p) => formatAmountInput(t, p))}
                placeholder="0,00"
                {...fieldProps("dollar")}
              />
            )}
          </Card>

          <Txt size={11} color={colors.muted} style={{ textAlign: "center", paddingHorizontal: 12 }}>
            Las tasas automáticas vienen de fuentes públicas y son referenciales. Usa la tasa real a la que consigues los dólares.
          </Txt>
        </View>
      </ScrollView>

      <KeyboardAccessory
        id={ACCESSORY_ID}
        hasNext={!!(focusedKey && nextStop(focusedKey))}
        onPress={() => (focusedKey ? goNext(focusedKey) : Keyboard.dismiss())}
      />
    </View>
  );
}
