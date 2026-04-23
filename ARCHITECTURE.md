# Pet Care Pro - Architecture Documentation

## System Overview

Pet Care Pro is a role-based mobile application with three user types:
1. **Pet Owners**: Schedule grooming services and provide requirements
2. **Grooming Staff**: Execute services based on detailed requirements
3. **Drivers**: Capture requirements during pickup, handle delivery

## Key Problem Solved

**Issue**: Drivers miss owner requirements during pickup → Staff waits for clarification → Service delays

**Solution**: The app captures detailed requirements during pickup and ensures staff has complete information before work starts.

## Application Architecture

```
┌─────────────────────────────────────────────────┐
│           React Navigation Layers               │
│  ┌──────────────────────────────────────────┐  │
│  │  RootNavigator (Auth Gate)               │  │
│  │  ├── AuthStack (Login/Register)          │  │
│  │  └── MainStack (Role-based)              │  │
│  │      ├── OwnerTabNavigator               │  │
│  │      ├── StaffTabNavigator               │  │
│  │      └── DriverTabNavigator              │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│        Redux Store (State Management)           │
│  ┌──────────────────────────────────────────┐  │
│  │  authSlice                               │  │
│  │  ├── user: User | null                   │  │
│  │  ├── token: string                       │  │
│  │  └── isAuthenticated: boolean            │  │
│  │                                          │  │
│  │  ordersSlice                             │  │
│  │  ├── orders: Order[]                     │  │
│  │  ├── selectedOrder: Order | null         │  │
│  │  └── filters: { status, petId }          │  │
│  │                                          │  │
│  │  petsSlice                               │  │
│  │  ├── pets: Pet[]                         │  │
│  │  └── selectedPet: Pet | null             │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│         Services Layer (API Integration)        │
│  ┌──────────────────────────────────────────┐  │
│  │  AuthService (login, register, logout)   │  │
│  │  PetService (CRUD pets)                  │  │
│  │  OrderService (booking, status updates)  │  │
│  │  RequirementService (capture, clarify)   │  │
│  │  UploadService (image uploads)           │  │
│  └──────────────────────────────────────────┘  │
│              via
│  ┌──────────────────────────────────────────┐  │
│  │  ApiClient (Axios wrapper)               │  │
│  │  ├── Error handling                      │  │
│  │  ├── Request/response interceptors       │  │
│  │  └── Auth token management               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│        Backend API (REST/GraphQL)               │
│  ├── User Management                           │
│  ├── Pet Profiles                              │
│  ├── Order Management                          │
│  ├── Requirement Capture & Clarification       │
│  └── Real-time Notifications                   │
└─────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
LoginScreen
    │
    ├─→ authService.login(email, password)
    │       │
    │       └─→ apiClient.post('/auth/login')
    │               │
    │               └─→ Backend
    │                   Returns: { user, token, refreshToken }
    │
    └─→ dispatch(loginSuccess(authResponse))
            │
            └─→ Redux updates auth state
                RootNavigator re-renders based on isAuthenticated
                Routes to appropriate TabNavigator
```

### 2. Creating an Order (Owner)

```
OwnerHomeScreen or CreateOrderScreen
    │
    ├─→ User selects pet → selectPet()
    ├─→ User adds services
    ├─→ User fills requirements:
    │   ├── Grooming preferences
    │   ├── Special notes
    │   ├── Medical conditions
    │   └── Dietary needs
    │
    └─→ onSubmit()
            │
            └─→ orderService.createOrder(orderData)
                    │
                    └─→ apiClient.post('/orders', data)
                            │
                            └─→ Backend creates order
                                Status: 'pending'
                                Returns: Order
                                │
                                └─→ dispatch(addOrder(order))
                                    Redux state updated
                                    Navigate to OrderDetailScreen
```

### 3. Driver Pickup Flow

```
PickupsScreen (showing pending pickups)
    │
    ├─→ Driver taps "Start Pickup"
    │       │
    │       └─→ PetPickupScreen
    │           ├─→ Shows order details
    │           ├─→ Shows owner requirements
    │           ├─→ Driver confirms pet details
    │           ├─→ Driver can add notes/images
    │           └─→ Driver requests owner clarification if needed
    │
    └─→ onConfirmPickup()
            │
            └─→ orderService.updateOrderStatus(orderId, 'picked_up')
                    │
                    └─→ apiClient.put(`/orders/${id}`, { status: 'picked_up' })
                            │
                            └─→ Backend updates
                                dispatch(updateOrderStatus(orderId, 'picked_up'))
                                Redux state updated
                                Notification sent to Staff
```

### 4. Staff Requirement Clarification Flow

```
StaffDashboard or RequirementClarificationScreen
    │
    ├─→ Staff sees orders with missing requirements
    │   (Orders marked as 'needs_clarification')
    │
    └─→ Staff taps "Request Clarification"
            │
            └─→ ClarificationRequestModal
                ├─→ Select which requirements need clarification
                ├─→ Add notes/questions
                │
                └─→ onSubmitRequest()
                        │
                        └─→ requirementService.requestClarification(orderId, questions)
                                │
                                └─→ apiClient.post(`/orders/${id}/clarifications`, data)
                                        │
                                        └─→ Backend creates clarification request
                                            Notification sent to Driver
                                            Driver can respond via app
                                            Once answered → Order status updated
```

## Component Hierarchy

```
App.tsx
├── Redux Provider
├── Paper Provider
└── RootNavigator
    ├── AuthStack (when not authenticated)
    │   ├── LoginScreen
    │   └── RegisterScreen
    │
    └── MainStack (when authenticated)
        ├── OwnerTabNavigator
        │   ├── HomeStack → OwnerHomeScreen
        │   ├── OrdersStack → OrdersListScreen
        │   ├── PetsStack → PetsListScreen
        │   └── ProfileStack → ProfileScreen
        │
        ├── StaffTabNavigator
        │   ├── DashboardStack → StaffDashboardScreen
        │   ├── OrdersStack → StaffOrdersScreen
        │   ├── ClarificationStack → RequirementClarificationScreen
        │   └── ProfileStack → ProfileScreen
        │
        └── DriverTabNavigator
            ├── PickupsStack → PickupsScreen
            ├── DeliveriesStack → DeliveriesScreen
            ├── ScheduleStack → ScheduleScreen
            └── ProfileStack → ProfileScreen
```

## State Management Strategy

### Redux Store Design

**Normalized State Structure**:
```typescript
{
  auth: {
    user: User | null,
    token: string,
    refreshToken: string,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  orders: {
    orders: Order[],         // Denormalized for now
    selectedOrder: Order | null,
    isLoading: boolean,
    error: string | null,
    filters: {
      status?: OrderStatus,
      petId?: string
    }
  },
  pets: {
    pets: Pet[],
    selectedPet: Pet | null,
    isLoading: boolean,
    error: string | null
  }
}
```

**Action Categories**:
1. **Fetch Actions**: `fetchStart`, `fetchSuccess`, `fetchFailure`
2. **CRUD Actions**: `create`, `update`, `delete`
3. **Selection**: `select` entities
4. **Filtering**: Filter by status, date, etc.
5. **Cache**: Clear when logging out

## Error Handling Strategy

```typescript
// Centralized error parsing
try {
  const data = await apiClient.get('/endpoint');
} catch (error) {
  const appError = error as AppError;
  
  // Handle by error code
  if (appError.code === 'ERR_401') {
    // Unauthorized - logout
    dispatch(logout());
  } else if (appError.code === 'ERR_NETWORK') {
    // No internet - show offline message
    showOfflineUI();
  } else if (appError.code === 'ERR_VALIDATION') {
    // Server validation error
    displayFieldErrors(appError.details);
  }
}
```

## API Integration Points

### Required Backend Endpoints

```
Authentication:
  POST   /auth/login              → AuthResponse
  POST   /auth/register           → AuthResponse
  POST   /auth/refresh-token      → { token, refreshToken }
  POST   /auth/logout             → { success }

Users:
  GET    /users/profile           → User
  PUT    /users/profile           → User

Pets:
  GET    /pets                    → Pet[]
  POST   /pets                    → Pet
  GET    /pets/:id                → Pet
  PUT    /pets/:id                → Pet
  DELETE /pets/:id                → { success }

Orders:
  GET    /orders                  → Order[]
  POST   /orders                  → Order
  GET    /orders/:id              → Order
  PUT    /orders/:id              → Order
  PATCH  /orders/:id/status       → Order

Requirements/Clarifications:
  GET    /orders/:id/requirements → OrderRequirements
  POST   /orders/:id/requirements → OrderRequirements
  POST   /orders/:id/clarifications → ClarificationRequest
  GET    /orders/:id/clarifications → ClarificationRequest[]
  POST   /clarifications/:id/respond → Response
```

## Key Design Decisions

### 1. Role-Based Navigation
- Different bottom tab navigators per role
- Reduces cognitive load for each user type
- Each role sees only relevant features

### 2. Requirement Capture During Pickup
- Driver must acknowledge requirements
- Can request clarification from owner
- Staff sees complete information before starting work

### 3. Redux for Global State
- Authentication state needs to persist across app
- Order state shared between multiple screens
- Pet state accessible from anywhere

### 4. Centralized API Client
- Single source for API configuration
- Consistent error handling
- Token management in one place
- Easy to add logging, analytics, etc.

### 5. TypeScript for Type Safety
- Prevents runtime errors
- Better IDE autocomplete
- Self-documenting code
- Refactoring confidence

## Scalability Considerations

### Current (MVP)
- Redux for state management
- REST API communication
- Local data storage in Redux

### Future Enhancements
- **Real-time Updates**: WebSocket/Firebase for live order status
- **Offline Support**: Redux Persist + offline queue
- **Pagination**: Lazy load orders/pets
- **Caching**: Redux persist for faster app startup
- **Analytics**: Track user behavior
- **Push Notifications**: Order status, clarification requests
- **Maps Integration**: Route optimization for drivers
- **Image Optimization**: Compress photos before upload

## Performance Optimizations

1. **Memoization**: React.memo for expensive components
2. **List Virtualization**: FlatList with keyExtractor
3. **Lazy Loading**: Conditional rendering
4. **Debouncing**: API calls in search, filters
5. **Bundle Splitting**: Code splitting per role

## Security Considerations

1. **Token Management**: Secure storage in device
2. **API Validation**: Zod schemas for all inputs
3. **HTTPS Only**: Enforce in production
4. **Sensitive Data**: Don't log tokens or passwords
5. **Input Sanitization**: Prevent injection attacks
6. **Permission Checks**: Verify on backend

## Testing Strategy

### Unit Tests
- Redux reducers
- Utility functions
- Validation schemas

### Integration Tests
- Redux + async actions
- API integration flows
- Navigation flows

### E2E Tests (Future)
- Complete user journeys per role
- Offline/online transitions
