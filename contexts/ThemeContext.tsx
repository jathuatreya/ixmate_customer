import React, { createContext, useContext } from "react";

type ThemeMode = "dark";

interface ThemeContextType {
  theme: "dark";
  mode: "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Hardcoded to dark as requested
  const theme = "dark";
  const mode = "dark";
  const handleSetMode = () => {}; // No-op

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode: handleSetMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Common Colors for the App (Simplified to Dark Palette Only)
export const getColors = (theme: "light" | "dark" = "dark") => {
  return {
    primary: "#10B981", // Emerald 500
    primaryDark: "#059669",
    secondary: "#3B82F6",
    background: "#020617", // Deepest Blue
    surface: "#0f172a", // Deep blue
    card: "#1e293b", // Mid blue
    textMain: "#f8fafc", // White
    textSub: "#94a3b8", // Slate-400
    border: "#1e293b", // Slate-800
    white: "#FFFFFF",
    red: "#ef4444",
    itemBg: "#1e293b", // Slate-800
  };
};
