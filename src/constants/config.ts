// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://icy-queens-throw.loca.lt/api';
export const API_TIMEOUT = 15000; // 15 seconds

// Service Types
export const SERVICE_TYPES = {
  grooming: 'Grooming',
  haircut: 'Hair Cut',
  nails: 'Nails',
  bath: 'Bath',
  other: 'Other',
} as const;

// Pet Sizes
export const PET_SIZES = {
  small: 'Small (0-15 lbs)',
  medium: 'Medium (15-50 lbs)',
  large: 'Large (50+ lbs)',
} as const;

// Order Status
export const ORDER_STATUS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
  in_service: 'In Service',
  completed: 'Completed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const;

// Order Status Colors
export const ORDER_STATUS_COLORS = {
  pending: '#FFA500',
  confirmed: '#4169E1',
  picked_up: '#32CD32',
  in_service: '#1E90FF',
  completed: '#228B22',
  delivered: '#006400',
  cancelled: '#DC143C',
} as const;

// App Roles
export const USER_ROLES = {
  owner: 'Pet Owner',
  staff: 'Grooming Staff',
  driver: 'Driver',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  user: 'user_data',
  lastSync: 'last_sync',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  pickup: 'PICKUP',
  delivery: 'DELIVERY',
  status_update: 'STATUS_UPDATE',
  requirement_clarification: 'REQUIREMENT_CLARIFICATION',
} as const;
