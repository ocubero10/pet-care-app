import { apiClient } from '@utils/api';
import { Client, User } from '@definitions/index';

interface ApiSuccess<T> { success: boolean; data: T; message?: string }

export interface ManagedUser extends User {
  _id: string;
  cedula?: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  cedula?: string;
  role?: 'owner' | 'staff' | 'driver';
  isActive?: boolean;
  password?: string;
}

export const usersService = {
  async getClients(): Promise<Client[]> {
    const response = await apiClient.get<ApiSuccess<Client[]>>('/auth/clients');
    return response.data;
  },

  async listUsers(opts?: { role?: string; includeInactive?: boolean }): Promise<ManagedUser[]> {
    const params = new URLSearchParams();
    if (opts?.role) params.set('role', opts.role);
    if (opts?.includeInactive) params.set('includeInactive', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<ApiSuccess<ManagedUser[]>>(`/auth/users${qs}`);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserPayload): Promise<ManagedUser> {
    const response = await apiClient.put<ApiSuccess<ManagedUser>>(`/auth/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/auth/users/${id}`);
  },
};
