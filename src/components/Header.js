import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";
import { Txt } from "./ui";

/**
 * Header fijo de cada pantalla. Usa el mismo fondo y borde que la barra inferior
 * para que las dos enmarquen el contenido.
 *
 * @param {object} p
 * @param {string} p.title
 * @param {string} [p.subtitle]
 * @param {boolean} [p.logo]   Muestra la moneda de la marca a la izquierda
 * @param {React.ReactNode} [p.right]  Acción a la derecha
 */
export default function Header({ title, subtitle, logo = false, right = null }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingTop: insets.top + 8,
        paddingBottom: 10,
        paddingHorizontal: 16,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 520,
          minHeight: 44,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {logo ? (
          <LinearGradient
            colors={[colors.accent, colors.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Txt size={15.5} weight={800} color={colors.onAccent} style={{ letterSpacing: -0.2 }}>
              VE$
            </Txt>
          </LinearGradient>
        ) : null}
        <View style={{ flex: 1 }}>
          <Txt size={20} weight={800} style={{ letterSpacing: -0.3 }} numberOfLines={1} accessibilityRole="header">
            {title}
          </Txt>
          {subtitle ? (
            <Txt size={12} color={colors.textSecondary} numberOfLines={1}>
              {subtitle}
            </Txt>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}
