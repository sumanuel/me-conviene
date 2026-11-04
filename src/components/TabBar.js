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
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingHorizontal: 8,
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
            style={{ flex: 1, alignItems: "center", gap: 4, minHeight: 52 }}
          >
            <View
              style={{
                width: 60,
                height: 30,
                borderRadius: RADIUS.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? colors.accentSoft : "transparent",
              }}
            >
              <Icon
                name={t.icon}
                size={22}
                color={on ? colors.accentFg : colors.muted}
                strokeWidth={t.icon === "more" ? 3.6 : on ? 2.1 : 1.8}
              />
            </View>
            <Txt size={11.5} weight={on ? 800 : 600} color={on ? colors.text : colors.muted}>
              {t.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
