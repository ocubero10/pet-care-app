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
export type PetSex = 'male' | 'female';
export type PetSize = 'small' | 'medium' | 'large';

export interface Pet {
  id: string;
  _id?: string;
  name: string;
  ownerId: string;
  breed: string;
  age: number;
  size?: PetSize;
  sex: PetSex;
  weight: number;
  coatColor: string;
  allergies?: string[];
  vaccines?: string[];
  specialNotes?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export type ServiceType =
  | 'bath'
  | 'breed_cut'
  | 'nails'
  | 'ear_cleaning'
  | 'de_shedding'
  | 'hygienic_cut'
  | 'grooming'
  | 'haircut'
  | 'other';

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
  _id?: string;
  petId: string | Pet;
  ownerId: string | User;
  services: ServiceType[];
  requirements: OrderRequirements;
  status: OrderStatus;
  pickupDateTime: string;
  estimatedCompletionTime: string;
  actualCompletionTime?: string;
  driverId?: string;
  staffId?: string;
  coatCondition?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  cedula?: string;
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
