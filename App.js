import React, { useEffect } from "react";
import { BackHandler, KeyboardAvoidingView, View } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { AppProvider, useApp } from "./src/context/AppContext";
import { ThemeProvider, useTheme } from "./src/theme";
import { useKeyboardHeight } from "./src/hooks/useFieldChain";
import TabBar from "./src/components/TabBar";
import HomeScreen from "./src/screens/HomeScreen";
import RatesScreen from "./src/screens/RatesScreen";
import MoreScreen from "./src/screens/MoreScreen";

SplashScreen.preventAutoHideAsync().catch(() => {});

const SCREENS = {
  home: HomeScreen,
  rates: RatesScreen,
  more: MoreScreen,
};

/** Las tres pestañas siguen montadas para no perder lo escrito al cambiar de una a otra. */
function Shell() {
  const { colors } = useTheme();
  const { tab, setTab } = useApp();
  const kbHeight = useKeyboardHeight();

  // Atrás en Android: de Tasas o Más vuelve a Inicio.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (tab !== "home") {
        setTab("home");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [tab, setTab]);

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.page }}>
      <View style={{ flex: 1 }}>
        {Object.entries(SCREENS).map(([key, Screen]) => (
          <View
            key={key}
            style={{ flex: 1, display: key === tab ? "flex" : "none" }}
            accessibilityElementsHidden={key !== tab}
            importantForAccessibility={key === tab ? "auto" : "no-hide-descendants"}
          >
            <Screen />
          </View>
        ))}
      </View>
      {kbHeight === 0 ? <TabBar active={tab} onChange={setTab} /> : null}
    </KeyboardAvoidingView>
  );
}

function Root() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const { colors } = useTheme();
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.page }} />;

  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

export default function App() {
  return (
    // initialWindowMetrics: los márgenes seguros están listos desde el primer cuadro,
    // sin que la barra inferior "salte" cuando se miden.
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
