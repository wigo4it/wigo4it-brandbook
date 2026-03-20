"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type UiModeContextValue = {
  isDarkMode: boolean;
  isPixelMode: boolean;
  toggleDarkMode: () => void;
  togglePixelMode: () => void;
};

const UiModeContext = createContext<UiModeContextValue | undefined>(undefined);

const DARK_MODE_STORAGE_KEY = "w4-ui-dark-mode";
const PIXEL_MODE_STORAGE_KEY = "w4-ui-pixel-mode";

function readStoredFlag(key: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(key) === "1";
}

export function UiModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => readStoredFlag(DARK_MODE_STORAGE_KEY));
  const [isPixelMode, setIsPixelMode] = useState(() => readStoredFlag(PIXEL_MODE_STORAGE_KEY));

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = isDarkMode ? "dark" : "light";
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, isDarkMode ? "1" : "0");
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.pixelMode = isPixelMode ? "on" : "off";
    window.localStorage.setItem(PIXEL_MODE_STORAGE_KEY, isPixelMode ? "1" : "0");
  }, [isPixelMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const togglePixelMode = useCallback(() => {
    setIsPixelMode((prev) => !prev);
  }, []);

  const value = useMemo<UiModeContextValue>(
    () => ({
      isDarkMode,
      isPixelMode,
      toggleDarkMode,
      togglePixelMode,
    }),
    [isDarkMode, isPixelMode, toggleDarkMode, togglePixelMode],
  );

  return <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>;
}

export function useUiMode() {
  const value = useContext(UiModeContext);

  if (!value) {
    throw new Error("useUiMode must be used inside UiModeProvider");
  }

  return value;
}
