import { apiRequest } from './client';
import { UserResponse } from '../types';

export function login(
  username: string,
  password: string
): Promise<UserResponse> {
  return apiRequest<UserResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST' });
}

export function getMe(): Promise<UserResponse> {
  return apiRequest<UserResponse>('/auth/me');
}
