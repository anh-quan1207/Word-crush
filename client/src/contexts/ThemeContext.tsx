import React, { createContext, useContext, useState } from 'react';

type Theme = 'pink' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const defaultContext: ThemeContextType = {
  theme: 'pink',
  toggleTheme: () => {}
};

const ThemeContext = createContext(defaultContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('pink' as Theme);

  const toggleTheme = () => {
    setTheme(currentTheme => {
      if (currentTheme === 'pink') return 'dark';
      return 'pink';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 