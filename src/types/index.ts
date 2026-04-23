// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'staff' | 'driver';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Pet Types
export interface Pet {
  id: string;
  name: string;
  ownerId: string;
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  specialNotes?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export type ServiceType = 'grooming' | 'haircut' | 'nails' | 'bath' | 'other';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  duration: number; // in minutes
  price: number;
  description?: string;
}

// Booking/Order Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'picked_up'
  | 'in_service'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export interface OrderRequirements {
  grooming?: string;
  haircut?: string;
  nails?: string;
  bath?: string;
  otherRequirements?: string;
  temperamentNotes?: string;
  dietaryNeeds?: string;
  medicalConditions?: string;
}

export interface Order {
  id: string;
  petId: string;
  ownerId: string;
  services: ServiceType[];
  requirements: OrderRequirements;
  status: OrderStatus;
  pickupDateTime: string;
  estimatedCompletionTime: string;
  actualCompletionTime?: string;
  driverId?: string;
  staffId?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Location Types
export interface Location {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  label: string; // 'home', 'work', etc.
  isDefault: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth Types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Error Type
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
