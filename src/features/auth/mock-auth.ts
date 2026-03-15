import type { AuthUser, SignupData } from './types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockLogin(email: string, _password: string): Promise<AuthUser> {
  await delay(500);

  return {
    id: 'user-001',
    email,
    name: '관리자',
    role: 'admin',
    avatar_url: null,
    brand_id: 'brand-001',
  };
}

export async function mockSignup(data: SignupData): Promise<AuthUser> {
  await delay(500);

  return {
    id: 'user-' + Date.now(),
    email: data.email,
    name: data.name,
    role: 'owner',
    avatar_url: null,
    brand_id: 'brand-' + Date.now(),
  };
}

export async function mockForgotPassword(_email: string): Promise<void> {
  await delay(500);
}
