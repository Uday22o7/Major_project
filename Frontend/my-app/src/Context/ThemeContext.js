import React, { createContext, useState, useContext } from 'react';

// Create the ThemeContext
const ThemeContext = createContext();

// Create a custom provider
export const ThemeProvider = ({ children }) => {
  const [theme] = useState('light');

  const toggleTheme = () => { };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for consuming the ThemeContext
export const useTheme = () => useContext(ThemeContext);
