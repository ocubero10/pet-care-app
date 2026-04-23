import { apiClient } from '@utils/api';
import { Order, OrderStatus, OrderRequirements } from '@definitions/index';

interface ApiSuccess<T> { success: boolean; data: T; message?: string }

export const ordersService = {
  async getOrders(filters?: { status?: OrderStatus }): Promise<Order[]> {
    let url = '/orders';
    if (filters?.status) {
      url += `?status=${filters.status}`;
    }
    const response = await apiClient.get<ApiSuccess<Order[]>>(url);
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<ApiSuccess<Order>>(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: {
    petId: string;
    services: string[];
    requirements: OrderRequirements;
    pickupDateTime: string;
    estimatedCompletionTime: string;
    notes?: string;
  }): Promise<Order> {
    const response = await apiClient.post<ApiSuccess<Order>>('/orders', data);
    return response.data;
  },

  async updateOrder(
    id: string,
    data: Partial<{
      notes?: string;
      requirements?: OrderRequirements;
    }>
  ): Promise<Order> {
    const response = await apiClient.put<ApiSuccess<Order>>(`/orders/${id}`, data);
    return response.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await apiClient.patch<ApiSuccess<Order>>(`/orders/${id}/status`, {
      status,
    });
    return response.data;
  },

  async assignDriver(orderId: string, driverId: string): Promise<Order> {
    const response = await apiClient.post<ApiSuccess<Order>>(`/orders/${orderId}/assign-driver`, {
      driverId,
    });
    return response.data;
  },

  async requestClarification(orderId: string, question: string): Promise<Order> {
    const response = await apiClient.post<ApiSuccess<Order>>(`/orders/${orderId}/clarifications`, {
      question,
    });
    return response.data;
  },

  async respondToClarification(
    orderId: string,
    clarificationId: string,
    answer: string
  ): Promise<Order> {
    const response = await apiClient.post<ApiSuccess<Order>>(
      `/orders/${orderId}/clarifications/${clarificationId}/respond`,
      { answer }
    );
    return response.data;
  },
};
