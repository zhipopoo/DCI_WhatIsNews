import { create } from 'zustand';
import type { LoginResponse } from '@/types';

interface AuthState {
  token: string | null;
  username: string | null;
  displayName: string | null;
  isAuthenticated: boolean;

  setAuth: (data: LoginResponse) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  displayName: null,
  isAuthenticated: false,

  setAuth: (data: LoginResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      username: data.username,
      displayName: data.displayName,
    }));
    set({
      token: data.token,
      username: data.username,
      displayName: data.displayName,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      username: null,
      displayName: null,
      isAuthenticated: false,
    });
  },

  initialize: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          token,
          username: user.username,
          displayName: user.displayName,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },
}));
