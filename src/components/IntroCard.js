import React from "react";
import { Pressable, View } from "react-native";
import { RADIUS, useTheme } from "../theme";
import Icon from "./Icon";
import { Txt } from "./ui";

/**
 * Tarjeta de primera vez: explica que hay dos tasas y lleva a la pestaña Tasas.
 * Se descarta con un toque y no vuelve a aparecer.
 */
export default function IntroCard({ onGo, onDismiss }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.accentSoft,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.accent,
        padding: 14,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="info" size={18} color={colors.onAccent} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Txt size={14.5} weight={800} color={colors.accentFg}>
            Antes de empezar: revisa tus tasas
          </Txt>
          <Txt size={12.5} color={colors.accentFg} style={{ lineHeight: 18 }}>
            Hay dos: la tasa que usa la tienda (BCV) y la tasa a la que tú consigues los dólares
            (Binance o físico). Con ellas se hace la comparación.
          </Txt>
        </View>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
          hitSlop={10}
          style={{ padding: 2 }}
        >
          <Icon name="close" size={18} color={colors.accentFg} />
        </Pressable>
      </View>
      <Pressable
        onPress={onGo}
        accessibilityRole="button"
        style={({ pressed }) => ({
          alignSelf: "flex-start",
          minHeight: 40,
          paddingHorizontal: 18,
          borderRadius: RADIUS.pill,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Txt size={13} weight={800} color={colors.onAccent}>
          Ir a Tasas
        </Txt>
      </Pressable>
    </View>
  );
}
