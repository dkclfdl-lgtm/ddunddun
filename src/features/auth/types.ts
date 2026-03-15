export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'owner' | 'manager';
  avatar_url: string | null;
  brand_id: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  brandName?: string;
}

export interface ForgotPasswordData {
  email: string;
}
