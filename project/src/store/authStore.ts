import { create } from 'zustand';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { User } from '../types'; // Import User from types.ts

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });
      const token = response.data.token;
      localStorage.setItem('token', token);

      // Decode JWT to extract user data
      const decoded: { id: string; username: string; displayName: string } = jwtDecode(token);
      set({
        user: {
          id: decoded.id,
          username: decoded.username,
          displayName: decoded.displayName,
          // avatar is optional and not included in JWT; set to undefined
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.error || 'Invalid username or password');
    }
  },

  register: async (username: string, email: string, password: string, displayName: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
        displayName,
      });
      const token = response.data.token;
      localStorage.setItem('token', token);

      // Decode JWT to extract user data
      const decoded: { id: string; username: string; displayName: string } = jwtDecode(token);
      set({
        user: {
          id: decoded.id,
          username: decoded.username,
          displayName: decoded.displayName,
          email,
          // avatar is optional and not included in JWT; set to undefined
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (userData: Partial<User>) => {
    set({ isLoading: true });
    try {
      const response = await axios.patch('http://localhost:5000/api/auth/profile', userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.error || 'Profile update failed');
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT to extract user data
        const decoded: { id: string; username: string; displayName: string } = jwtDecode(token);
        set({
          user: {
            id: decoded.id,
            username: decoded.username,
            displayName: decoded.displayName,
          },
          isAuthenticated: true,
        });
      } catch (error) {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));