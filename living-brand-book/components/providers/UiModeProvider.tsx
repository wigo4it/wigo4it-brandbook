"use client";

import {
  createContext,
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

const UiModeContext = createContext<UiModeContextValue | null>(null);

type UiModeProviderProps = {
  children: ReactNode;
};

export function UiModeProvider({ children }: UiModeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPixelMode, setIsPixelMode] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dataset.pixelMode = isPixelMode ? "on" : "off";
  }, [isPixelMode]);

  const value = useMemo(
    () => ({
      isDarkMode,
      isPixelMode,
      toggleDarkMode: () => {
        setIsDarkMode((current) => !current);
      },
      togglePixelMode: () => {
        setIsPixelMode((current) => !current);
      },
    }),
    [isDarkMode, isPixelMode],
  );

  return <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>;
}

export function useUiMode() {
  const context = useContext(UiModeContext);

  if (!context) {
    throw new Error("useUiMode must be used within UiModeProvider");
  }

  return context;
}