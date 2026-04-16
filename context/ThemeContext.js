import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, saveTheme } from '../utils/storage';

export const lightTheme = {
  mode: 'light',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSubtle: '#F3F4F6',
  primary: '#7C3AED',
  primaryLight: '#F5F3FF',
  primaryDark: '#6D28D9',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#F3F4F6',
  borderDark: '#E5E7EB',
  error: '#EF4444',
  errorLight: '#FFF1F2',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  divider: '#E5E7EB',
};

export const darkTheme = {
  mode: 'dark',
  background: '#111827',
  surface: '#1F2937',
  surfaceSubtle: '#374151',
  primary: '#8B5CF6',
  primaryLight: '#2D214F',
  primaryDark: '#7C3AED',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  border: '#374151',
  borderDark: '#4B5563',
  error: '#F87171',
  errorLight: '#450A0A',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#451A03',
  divider: '#374151',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getTheme();
      if (savedTheme) {
        setThemeMode(savedTheme);
      } else if (systemColorScheme) {
        setThemeMode(systemColorScheme);
      }
      setIsInitialized(true);
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    await saveTheme(newMode);
  };

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, isInitialized }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
