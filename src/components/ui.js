import React, { useState } from "react";
import {
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { RADIUS, useTheme } from "../theme";
import Icon from "./Icon";

const FAMILY = {
  400: "PlusJakartaSans_400Regular",
  500: "PlusJakartaSans_500Medium",
  600: "PlusJakartaSans_600SemiBold",
  700: "PlusJakartaSans_700Bold",
  800: "PlusJakartaSans_800ExtraBold",
};

/** Texto con la tipografía de la app. `num` activa cifras tabulares. */
export function Txt({ size = 14, weight = 500, color, num, style, children, ...rest }) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: FAMILY[weight] || FAMILY[500],
          fontSize: size,
          color: color || colors.text,
          ...(num ? { fontVariant: ["tabular-nums"] } : null),
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({ style, children }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Pestañas segmentadas (selección única). */
export function Segmented({ options, value, onChange }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        backgroundColor: colors.segment,
        borderRadius: RADIUS.md,
        padding: 4,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: RADIUS.md - 4,
              backgroundColor: active ? colors.surface : "transparent",
              paddingHorizontal: 6,
              ...(active
                ? {
                    shadowColor: colors.shadow,
                    shadowOpacity: 0.12,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }
                : null),
            }}
          >
            <Txt
              size={13}
              weight={active ? 700 : 600}
              color={active ? colors.accentFg : colors.textSecondary}
              style={{ textAlign: "center" }}
            >
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Campo numérico grande con prefijo/sufijo. */
export function Field({
  label,
  value,
  onChangeText,
  prefix,
  suffix,
  placeholder = "0",
  size = 22,
  hint,
  style,
  inputRef,
  accessibilityLabel,
  onFocus,
  onSubmitEditing,
  returnKeyType,
  inputAccessoryViewID,
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ flex: 1 }, style]}>
      {label ? (
        <Txt size={12} weight={700} color={colors.textSecondary} style={{ marginBottom: 6 }}>
          {label}
        </Txt>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: 56,
          borderRadius: RADIUS.md,
          borderWidth: focused ? 2 : 1,
          borderColor: focused ? colors.accent : colors.border,
          backgroundColor: colors.surfaceAlt,
          paddingHorizontal: focused ? 11 : 12,
        }}
      >
        {prefix ? (
          <Txt size={14} weight={700} color={colors.muted} style={{ marginRight: 6 }}>
            {prefix}
          </Txt>
        ) : null}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          submitBehavior="submit"
          inputAccessoryViewID={inputAccessoryViewID}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
          inputMode="decimal"
          selectTextOnFocus
          accessibilityLabel={accessibilityLabel || label}
          style={{
            flex: 1,
            minWidth: 0,
            paddingVertical: 10,
            fontFamily: FAMILY[800],
            fontSize: size,
            color: colors.text,
            fontVariant: ["tabular-nums"],
            ...(Platform.OS === "web" ? { outlineStyle: "none" } : null),
          }}
        />
        {suffix ? (
          <Txt size={14} weight={700} color={colors.muted} style={{ marginLeft: 6 }}>
            {suffix}
          </Txt>
        ) : null}
      </View>
      {hint ? (
        <Txt size={11} weight={500} color={colors.muted} style={{ marginTop: 6 }}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

/** Opción de fuente de tasa: nombre + valor. */
export function RateChip({ label, value, active, onPress, disabled }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      accessibilityLabel={`${label} ${value}`}
      style={{
        flex: 1,
        minHeight: 56,
        borderRadius: RADIUS.md,
        borderWidth: active ? 2 : 1,
        borderColor: active ? colors.accent : colors.border,
        backgroundColor: active ? colors.accentSoft : colors.surface,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Txt size={11} weight={700} color={active ? colors.accentFg : colors.textSecondary}>
        {label}
      </Txt>
      <Txt size={13} weight={800} num color={active ? colors.accentFg : colors.text} numberOfLines={1}>
        {value}
      </Txt>
    </Pressable>
  );
}

export function ToggleRow({ label, hint, value, onValueChange }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={{ flexDirection: "row", alignItems: "center", minHeight: 52, gap: 12 }}
    >
      <View style={{ flex: 1 }}>
        <Txt size={14} weight={700}>
          {label}
        </Txt>
        {hint ? (
          <Txt size={12} color={colors.textSecondary} style={{ marginTop: 2 }}>
            {hint}
          </Txt>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={value ? colors.onAccent : "#ffffff"}
      />
    </Pressable>
  );
}

/** Aviso con icono (tonos warn / info / danger). */
export function Notice({ tone = "warn", icon = "alert", children, action, onAction }) {
  const { colors } = useTheme();
  const t = colors[tone];
  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: t.bg,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: 12,
      }}
    >
      <Icon name={icon} size={18} color={t.fg} />
      <Txt size={12.5} weight={600} color={t.fg} style={{ flex: 1 }}>
        {children}
      </Txt>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Txt size={12.5} weight={800} color={t.fg} style={{ textDecorationLine: "underline" }}>
            {action}
          </Txt>
        </Pressable>
      ) : null}
    </View>
  );
}
