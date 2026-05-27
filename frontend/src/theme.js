// Theme configuration with dark and light modes
export const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceElevated: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      textLight: '#94a3b8',
      
      border: '#e2e8f0',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowStrong: 'rgba(0, 0, 0, 0.15)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      card: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#818cf8',
      secondary: '#a78bfa',
      accent: '#f472b6',
      success: '#34d399',
      danger: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa',
      
      background: '#0f172a',
      surface: '#1e293b',
      surfaceElevated: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textLight: '#94a3b8',
      
      border: '#334155',
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowStrong: 'rgba(0, 0, 0, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
      secondary: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
      success: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      danger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      card: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    }
  }
};

export const getTheme = (mode) => themes[mode] || themes.dark;

