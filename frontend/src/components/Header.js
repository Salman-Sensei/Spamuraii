import React from 'react';
import { useTheme } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = () => {
  const { theme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <div className="logo-icon">🥷</div>
          <div className="logo-text">
            <h1>Spamurai</h1>
            <p className="tagline">Email Spam & Phishing Detection Web Application</p>
          </div>
        </div>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;

