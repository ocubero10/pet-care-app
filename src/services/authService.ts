import { apiClient } from '@utils/api';
import { User, AuthCredentials, AuthResponse } from '@definitions/index';

interface ApiSuccess<T> { success: boolean; data: T; message?: string }

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'owner' | 'staff' | 'driver';
  }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', credentials);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await apiClient.post<ApiSuccess<{ token: string }>>('/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiSuccess<User>>('/auth/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiSuccess<User>>('/auth/profile', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {});
  },
};
