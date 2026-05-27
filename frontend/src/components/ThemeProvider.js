import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTheme } from '../theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    // Get from localStorage or default to dark
    const saved = localStorage.getItem('themeMode');
    return saved || 'dark';
  });

  const theme = getTheme(themeMode);

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  useEffect(() => {
    // Apply theme to document root for CSS variables and Tailwind dark mode
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeMode);
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

