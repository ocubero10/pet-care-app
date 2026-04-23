import { apiClient } from '@utils/api';
import { Pet } from '@definitions/index';

interface ApiSuccess<T> { success: boolean; data: T; message?: string }

export const petsService = {
  async getPets(ownerId?: string): Promise<Pet[]> {
    const url = ownerId ? `/pets?ownerId=${ownerId}` : '/pets';
    const response = await apiClient.get<ApiSuccess<Pet[]>>(url);
    return response.data;
  },

  async getPetById(id: string): Promise<Pet> {
    const response = await apiClient.get<ApiSuccess<Pet>>(`/pets/${id}`);
    return response.data;
  },

  async createPet(data: {
    name: string;
    breed: string;
    age: number;
    size: 'small' | 'medium' | 'large';
    specialNotes?: string;
    profileImage?: string;
  }): Promise<Pet> {
    const response = await apiClient.post<ApiSuccess<Pet>>('/pets', data);
    return response.data;
  },

  async updatePet(
    id: string,
    data: Partial<{
      name: string;
      breed: string;
      age: number;
      size: 'small' | 'medium' | 'large';
      specialNotes?: string;
      profileImage?: string;
    }>
  ): Promise<Pet> {
    const response = await apiClient.put<ApiSuccess<Pet>>(`/pets/${id}`, data);
    return response.data;
  },

  async deletePet(id: string): Promise<void> {
    await apiClient.delete(`/pets/${id}`);
  },
};
