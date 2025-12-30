import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'DARK');
    const [accentColor, setAccentColor] = useState(localStorage.getItem('accent') || '#D4AF37');

    useEffect(() => {
        // Apply theme to document
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme.toLowerCase());
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        // Apply accent color
        document.documentElement.style.setProperty('--accent-color', accentColor);
        localStorage.setItem('accent', accentColor);
    }, [accentColor]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'DARK' ? 'LIGHT' : 'DARK');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
