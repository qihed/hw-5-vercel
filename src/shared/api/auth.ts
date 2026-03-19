import api from 'api/api';
import { LocalStorageModel } from 'store/LocalStorageModel';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';


type StrapiUser = {
  username: string;
  email: string;
};

type AuthResponse = {
  user: StrapiUser;
  jwt: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  code: string;
  password: string;
  passwordConfirmation: string;
};

export function getToken(): string | null {
  return LocalStorageModel.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string): void {
  LocalStorageModel.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken(): void {
  LocalStorageModel.removeItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): string | null {
  return LocalStorageModel.getItem(AUTH_USER_KEY);
}

export function setStoredUser(user: string): void {
  LocalStorageModel.setItem(AUTH_USER_KEY, user);
}

export function clearStoredUser(): void {
  LocalStorageModel.removeItem(AUTH_USER_KEY);
}

export async function register(username: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/local/register', {
    username: username,
    email: email,
    password: password,
  });
  setToken(data.jwt);
  setStoredUser(data.user.username);
  return data.user;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/local', {
    identifier: email,
    password: password,
  });
  setToken(data.jwt);
  setStoredUser(data.user.username);
  return data.user;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post<void>('/auth/forgot-password', { email } satisfies ForgotPasswordRequest);
}

export async function resetPassword(params: ResetPasswordRequest): Promise<void> {
  await api.post<void>('/auth/reset-password', params);
}

export function logout(): Promise<void> {
  clearToken();
  clearStoredUser();
  return Promise.resolve();
}

