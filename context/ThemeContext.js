import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';
import { getTheme, saveTheme } from '../utils/storage';

export const lightTheme = {
  mode: 'light',
  dark: false,
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F7F7F5',
  primary: '#00C9A7',
  primaryLight: '#E6FAF6',
  primaryDark: '#00A088',
  text: '#0A0A0A',
  textSecondary: '#545454',
  textMuted: '#9A9A9A',
  border: '#EBEBEB',
  borderDark: '#D8D8D8',
  error: '#FF3B30',
  errorLight: '#FFF5F4',
  success: '#34C759',
  successLight: '#EAFBEF',
  warning: '#FF9500',
  warningLight: '#FFF8F0',
  divider: '#EBEBEB',
};

export const darkTheme = {
  mode: 'dark',
  dark: true,
  background: '#0A0A0A',
  surface: '#141414',
  surfaceSubtle: '#1E1E1C',
  primary: '#00C9A7',
  primaryLight: 'rgba(0, 201, 167, 0.15)',
  primaryDark: '#00A088',
  text: '#FFFFFF',
  textSecondary: '#B5B5B5',
  textMuted: '#686868',
  border: '#222222',
  borderDark: '#333333',
  error: '#FF3B30',
  errorLight: '#450A0A',
  success: '#34C759',
  successLight: '#064E3B',
  warning: '#FF9500',
  warningLight: '#451A03',
  divider: '#222222',
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
