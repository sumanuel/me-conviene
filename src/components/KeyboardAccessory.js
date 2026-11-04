import React from "react";
import { InputAccessoryView, Platform, Pressable, View } from "react-native";
import { RADIUS, useTheme } from "../theme";
import { Txt } from "./ui";

/** iOS: el teclado numérico no tiene tecla de avance, se añade esta barra. */
export default function KeyboardAccessory({ id, hasNext, onPress }) {
  const { colors } = useTheme();
  if (Platform.OS !== "ios") return null;
  return (
    <InputAccessoryView nativeID={id}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={{
            minHeight: 40,
            paddingHorizontal: 18,
            borderRadius: RADIUS.pill,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Txt size={14} weight={800} color={colors.onAccent}>
            {hasNext ? "Siguiente" : "Listo"}
          </Txt>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}
