import React from 'react';
import { useTheme } from './ThemeProvider';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-toggle ${themeMode}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          {themeMode === 'dark' ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;

