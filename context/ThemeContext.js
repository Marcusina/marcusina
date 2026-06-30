import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';
import { getTheme, saveTheme } from '../utils/storage';

export const lightTheme = {
  mode: 'light',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F3F4F6',
  primary: '#000000',
  primaryLight: '#F3F4F6',
  primaryDark: '#000000',
  text: '#000000',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
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
  background: '#000000',
  surface: '#111111',
  surfaceSubtle: '#1F2937',
  primary: '#FFFFFF',
  primaryLight: '#1F2937',
  primaryDark: '#FFFFFF',
  text: '#FFFFFF',
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
  const deviceColorScheme = useDeviceColorScheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themeMode, setThemeModeState] = useState('system'); // 'system', 'light', 'dark'
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getTheme();
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setThemeModeState(savedTheme);
        setColorScheme(savedTheme);
      } else {
        setThemeModeState('system');
        setColorScheme('system');
      }
      setIsInitialized(true);
    };
    loadTheme();
  }, [setColorScheme]);

  const setThemeMode = async (mode) => {
    if (mode === 'light' || mode === 'dark' || mode === 'system') {
      setThemeModeState(mode);
      setColorScheme(mode);
      await saveTheme(mode);
    }
  };

  const toggleTheme = async () => {
    const activeScheme = colorScheme || deviceColorScheme || 'light';
    const newMode = activeScheme === 'dark' ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  // Determine active colors based on resolved NativeWind colorScheme
  const activeScheme = colorScheme || deviceColorScheme || 'light';
  const theme = activeScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme, isInitialized }}>
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
