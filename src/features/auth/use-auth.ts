import { create } from 'zustand';
import type { AuthUser, LoginCredentials, SignupData } from './types';
import { mockLogin, mockSignup, mockForgotPassword } from './mock-auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const user = await mockLogin(credentials.email, credentials.password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('로그인에 실패했습니다');
    }
  },

  signup: async (data: SignupData) => {
    set({ isLoading: true });
    try {
      const user = await mockSignup(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('회원가입에 실패했습니다');
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      await mockForgotPassword(email);
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('비밀번호 재설정 이메일 전송에 실패했습니다');
    }
  },
}));
