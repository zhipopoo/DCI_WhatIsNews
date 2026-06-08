import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useAuthStore } from '@/store/authStore';

// Restore auth state from localStorage BEFORE first render so admin pages
// don't flash blank and redirect to /admin/login on refresh.
useAuthStore.getState().initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
