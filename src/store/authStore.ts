import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscription?: any;
  isSubscribed?: boolean;
  charityId?: string | null;
  charityPercentage?: number;
  charity?: any | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  refreshUser: async () => {
    try {
      const { data } = await import('axios').then(m => m.default).get('/api/auth/me');
      set({ user: data.user, isAuthenticated: !!data.user, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
