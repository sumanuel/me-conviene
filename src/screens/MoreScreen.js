import React from "react";
import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RADIUS, useTheme } from "../theme";
import Header from "../components/Header";
import Icon from "../components/Icon";
import { Card, Segmented, Txt } from "../components/ui";
import app from "../../app.json";

const THEMES = [
  { value: "system", label: "Automático" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

const STEPS = [
  "Elige la tasa de la tienda (BCV) y la tasa a la que consigues los dólares (Binance o físico) en la pestaña Tasas.",
  "En Inicio escribe el precio de lista en dólares y el precio con descuento al pagar en divisas.",
  "Toca «Ver resultado»: te dice qué opción te ahorra más y a qué tasa cambia la recomendación.",
];

function SectionTitle({ icon, children }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          backgroundColor: colors.accentSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={18} color={colors.accentFg} />
      </View>
      <Txt size={15} weight={800}>
        {children}
      </Txt>
    </View>
  );
}

export default function MoreScreen() {
  const { colors, isDark, pref, setPref } = useTheme();
  // Amarillo de la app; en modo claro un tono más profundo para que se lea sobre blanco.
  const brand = isDark ? colors.accent : colors.accentDark;

  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <StatusBar style={colors.statusBar} />
      <Header title="Más" subtitle="Apariencia e información de la app" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: 32,
          paddingHorizontal: 16,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 520, gap: 14 }}>
          {/* Apariencia */}
          <Card style={{ gap: 12 }}>
            <SectionTitle icon="moon">Apariencia</SectionTitle>
            <Segmented options={THEMES} value={pref} onChange={setPref} />
            <Txt size={12} color={colors.textSecondary}>
              «Automático» sigue el modo claro u oscuro de tu teléfono.
            </Txt>
          </Card>

          {/* Cómo funciona */}
          <Card style={{ gap: 12 }}>
            <SectionTitle icon="info">Cómo funciona</SectionTitle>
            <Txt size={13} color={colors.textSecondary} style={{ lineHeight: 20 }}>
              En muchas tiendas el precio está en dólares pero te cobran en bolívares a la tasa BCV, y te
              dan descuento si pagas en dólares.{" "}
              <Txt size={13} weight={800} color={brand} style={{ lineHeight: 20 }}>
                Me conviene
              </Txt>{" "}
              compara las dos opciones con tus números.
            </Txt>
            <View style={{ gap: 10 }}>
              {STEPS.map((s, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 10 }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: colors.accent,
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    <Txt size={12} weight={800} color={colors.onAccent}>
                      {i + 1}
                    </Txt>
                  </View>
                  <Txt size={13} style={{ flex: 1, lineHeight: 20 }}>
                    {s}
                  </Txt>
                </View>
              ))}
            </View>
          </Card>

          {/* Fuentes y aviso */}
          <Card style={{ gap: 10 }}>
            <SectionTitle icon="shield">Fuentes y aviso</SectionTitle>
            <Txt size={13} color={colors.textSecondary} style={{ lineHeight: 20 }}>
              Tasa BCV: ve.dolarapi.com{"\n"}Binance P2P (USDT): criptoya.com
            </Txt>
            <Txt size={12} color={colors.textSecondary} style={{ lineHeight: 18 }}>
              Las tasas automáticas son referenciales y pueden diferir de la que realmente consigues. No
              es asesoría financiera: verifica siempre los valores antes de decidir.
            </Txt>
            <Txt size={12} color={colors.textSecondary} style={{ lineHeight: 18 }}>
              La app no pide registro y no envía tus precios a ningún servidor; todo se calcula en tu
              teléfono.
            </Txt>
          </Card>

          <View
            style={{
              alignItems: "center",
              paddingVertical: 8,
              gap: 2,
            }}
          >
            <Txt size={13} weight={800} color={brand}>
              Me conviene
            </Txt>
            <Txt size={12} color={colors.muted}>
              Versión {app.expo.version}
            </Txt>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
