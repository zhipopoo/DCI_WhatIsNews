import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

// Restore auth state from localStorage BEFORE first render so admin pages
// don't flash blank and redirect to /admin/login on refresh.
useAuthStore.getState().initialize();

// Initialize theme from localStorage instantly (synchronous, no flash),
// then fetch latest server-side settings in the background.
useThemeStore.getState().initTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
