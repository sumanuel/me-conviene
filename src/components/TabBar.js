import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RADIUS, useTheme } from "../theme";
import Icon from "./Icon";
import { Txt } from "./ui";

export const TABS = [
  { key: "home", label: "Inicio", icon: "home" },
  { key: "rates", label: "Tasas", icon: "trend" },
  { key: "more", label: "Más", icon: "more" },
];

export default function TabBar({ active, onChange }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 3,
        // Medidas como la barra de RecuerdaMed. Margen seguro inferior: con gestos el inset es
        // pequeño y se respeta entero; con los tres botones de Android (inset grande) se recorta
        // un poco. Mínimo 4 por si el sistema no reporta margen.
        paddingBottom: Math.max(insets.bottom >= 40 ? insets.bottom - 14 : insets.bottom, 4),
        paddingLeft: insets.left + 8,
        paddingRight: insets.right + 8,
      }}
    >
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
            style={{ flex: 1, alignItems: "center", gap: 0 }}
          >
            <View
              style={{
                width: 52,
                height: 24,
                borderRadius: RADIUS.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? colors.accentSoft : "transparent",
              }}
            >
              <Icon
                name={t.icon}
                size={20}
                color={on ? colors.accentFg : colors.muted}
                strokeWidth={t.icon === "more" ? 3.6 : on ? 2.1 : 1.8}
              />
            </View>
            <Txt
              size={11}
              weight={on ? 800 : 600}
              color={on ? colors.text : colors.muted}
              style={{ lineHeight: 13 }}
            >
              {t.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
