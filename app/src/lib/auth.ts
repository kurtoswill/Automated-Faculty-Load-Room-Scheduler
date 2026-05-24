import { api } from './api';

export interface AuthUser {
  id:          number;
  first_name:  string;
  last_name:   string;
  email:       string;
  role:        'Admin' | 'Instructor' | 'Student';
  is_irregular:boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await api.post<ApiEnvelope<{ token: string; user: AuthUser }>>('/login', { email, password });
  sessionStorage.removeItem('token');
  localStorage.setItem('token', response.data.token);
  document.cookie = `token=${encodeURIComponent(response.data.token)}; path=/; samesite=lax; max-age=2592000`;
  document.cookie = `role=${encodeURIComponent(response.data.user.role)}; path=/; samesite=lax; max-age=2592000`;
  return response.data.user;
}

export function logout() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  document.cookie = 'token=; path=/; samesite=lax; max-age=0';
  document.cookie = 'role=; path=/; samesite=lax; max-age=0';
  window.location.href = '/';
}

export async function me(): Promise<AuthUser> {
  const response = await api.get<ApiEnvelope<AuthUser>>('/auth/me');
  return response.data;
}
