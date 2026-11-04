import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Platform } from "react-native";

/** Altura actual del teclado (0 si está cerrado). */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const ios = Platform.OS === "ios";
    const show = Keyboard.addListener(ios ? "keyboardWillShow" : "keyboardDidShow", (e) =>
      setHeight(e?.endCoordinates?.height ?? 0),
    );
    const hide = Keyboard.addListener(ios ? "keyboardWillHide" : "keyboardDidHide", () =>
      setHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

/**
 * Navegación entre campos con el teclado ("Siguiente" / "Listo") y scroll
 * automático para que el campo enfocado quede por encima del teclado.
 *
 * @param {object} o
 * @param {string[]} o.order       Campos de la pantalla, en orden visual
 * @param {(key: string) => boolean} [o.isStop]  false = el campo se salta al avanzar
 * @param {React.RefObject} o.scrollRef  ScrollView de la pantalla
 * @param {() => void} [o.onDone]  Se llama al enviar el último campo
 * @param {string} o.accessoryId   nativeID de la barra del teclado en iOS
 */
export function useFieldChain({ order, isStop = () => true, scrollRef, onDone, accessoryId }) {
  const refs = useRef({});
  const [focusedKey, setFocusedKey] = useState(null);
  const ref = (key) => (refs.current[key] ??= React.createRef());

  const nextStop = useCallback(
    (key) => {
      const i = order.indexOf(key);
      for (let j = i + 1; j < order.length; j++) if (isStop(order[j])) return order[j];
      return null;
    },
    [order, isStop],
  );

  const focus = useCallback((key) => refs.current[key]?.current?.focus(), []);

  const goNext = useCallback(
    (key) => {
      const next = nextStop(key);
      if (next) {
        focus(next);
        return;
      }
      Keyboard.dismiss();
      onDone?.();
    },
    [nextStop, focus, onDone],
  );

  const scrollToField = useCallback(
    (key) => {
      setFocusedKey(key);
      setTimeout(() => {
        try {
          const input = refs.current[key]?.current;
          const sv = scrollRef?.current;
          const inner = sv?.getInnerViewRef?.() ?? sv?.getInnerViewNode?.();
          if (!input?.measureLayout || !inner) return;
          input.measureLayout(
            inner,
            (_x, y) => sv.scrollTo({ y: Math.max(0, y - 150), animated: true }),
            () => {},
          );
        } catch {}
      }, 120);
    },
    [scrollRef],
  );

  const fieldProps = (key) => ({
    inputRef: ref(key),
    returnKeyType: nextStop(key) ? "next" : "done",
    onSubmitEditing: () => goNext(key),
    onFocus: () => scrollToField(key),
    inputAccessoryViewID: Platform.OS === "ios" ? accessoryId : undefined,
  });

  return { fieldProps, focus, goNext, nextStop, focusedKey };
}
