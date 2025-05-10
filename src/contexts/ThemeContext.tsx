
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      return savedTheme || "light";
    }
    return "light";
  });
  
  const { upsertSystemSetting } = useSystemSettings();
  
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    localStorage.setItem("theme", theme);
    
    // Save to Supabase as well for admin settings
    upsertSystemSetting.mutate({
      key: "darkMode",
      value: theme === "dark",
      isPublic: true,
      description: "Dark mode setting for the application"
    });
  }, [theme, upsertSystemSetting]);
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
