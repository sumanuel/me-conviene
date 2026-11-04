import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { RADIUS, useTheme } from "../theme";
import ResultCard from "./ResultCard";
import { Txt } from "./ui";

/** Muestra la tarjeta de resultado sobre un fondo atenuado. */
export default function ResultModal({ visible, onClose, ...cardProps }) {
  const { colors } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
        {/* Tocar fuera de la tarjeta cierra el modal */}
        <Pressable
          onPress={onClose}
          accessibilityLabel="Cerrar resultado"
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View accessibilityViewIsModal style={{ width: "100%", maxWidth: 440, gap: 12 }}>
            <ResultCard {...cardProps} />
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 48,
                borderRadius: RADIUS.md,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Txt size={14} weight={800}>
                Cerrar
              </Txt>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
