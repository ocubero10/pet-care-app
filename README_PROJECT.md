# Pet Care Pro - Mobile App

A modern React Native application for managing pet grooming and care services. The app solves the key problem of miscommunication by allowing drivers to capture detailed pet care requirements directly from owners before pickup.

## Overview

**Problem**: Drivers sometimes miss owner requirements when picking up pets, causing staff to wait for clarification.

**Solution**: The app enables:
- **Pet Owners**: Create orders with detailed requirements (grooming style, special notes, diet, medical conditions)
- **Drivers**: Capture requirements during pickup, clarify with owners, notify staff
- **Staff**: Access complete requirements before starting work, request clarification if needed

## Project Structure

```
pet-care-mobile/
├── src/
│   ├── screens/              # Screen components by role
│   │   ├── auth/            # Login, Register
│   │   ├── owner/           # Owner-specific screens
│   │   ├── staff/           # Staff/groomer screens
│   │   └── driver/          # Driver-specific screens
│   ├── components/          # Reusable UI components
│   ├── navigation/          # React Navigation setup
│   │   ├── RootNavigator    # Main app navigator
│   │   ├── OwnerTabNavigator
│   │   ├── StaffTabNavigator
│   │   └── DriverTabNavigator
│   ├── services/            # API calls and backend integration
│   ├── store/               # Redux state management
│   │   ├── authSlice        # Authentication state
│   │   ├── ordersSlice      # Orders state
│   │   └── petsSlice        # Pets state
│   ├── types/               # TypeScript interfaces
│   ├── constants/           # App-wide constants
│   ├── utils/               # Helper functions
│   └── hooks/               # Custom React hooks
├── App.tsx                  # Entry point
├── app.json                 # Expo configuration
├── tsconfig.json           # TypeScript configuration
├── .eslintrc.js            # ESLint rules
└── .prettierrc              # Prettier formatting
```

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **UI Library**: React Native Paper
- **Code Quality**: ESLint + Prettier

## Key Features

### Owner Features
- Register and manage profile
- Add and manage multiple pets with details
- Create service orders with detailed requirements
- Track order status in real-time
- View order history

### Staff Features
- Dashboard with daily workload
- View orders with owner requirements
- Flag orders missing critical information
- Request clarification from drivers
- Mark work as complete

### Driver Features
- View assigned pickups for the day
- Capture owner requirements during pickup (images, notes)
- Request owner clarification if needed
- Confirm pet delivery
- Track schedule and route

## Data Types

### User Roles
- **owner**: Pet owner creating orders
- **staff**: Grooming staff executing services
- **driver**: Pickup/delivery personnel

### Order Requirements
Orders capture detailed needs:
- Grooming specifications
- Hair cut preferences
- Nail trim details
- Bath preferences
- Special notes
- Temperament information
- Dietary needs
- Medical conditions

### Order Status Flow
```
pending → confirmed → picked_up → in_service → completed → delivered
```

## API Integration

The app expects a backend API at `EXPO_PUBLIC_API_URL` (default: `http://localhost:3000/api`)

### Key Endpoints (to be implemented)
```
POST   /auth/login
POST   /auth/register
GET    /users/profile
GET    /pets
POST   /pets
GET    /orders
POST   /orders
PUT    /orders/:id
GET    /orders/:id/requirements
POST   /orders/:id/clarification-request
```

## Redux Store Structure

```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    refreshToken: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  orders: {
    orders: Order[],
    selectedOrder: Order | null,
    isLoading: boolean,
    error: string | null,
    filters: { status?, petId? }
  },
  pets: {
    pets: Pet[],
    selectedPet: Pet | null,
    isLoading: boolean,
    error: string | null
  }
}
```

## Setup & Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation
```bash
cd pet-care-mobile
npm install
```

### Environment Variables
Create a `.env` file:
```
EXPO_PUBLIC_API_URL=http://your-backend-url/api
```

### Running the App
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web

# Expo Go
npx expo start
```

### Linting and Formatting
```bash
# Check lint
npx eslint src/

# Fix lint issues
npx eslint src/ --fix

# Format code
npx prettier --write src/
```

## Type Safety

The entire app is built with TypeScript. Key types are in `src/types/index.ts`:
- `User`: Authentication user
- `Pet`: Pet information
- `Order`: Service order with requirements
- `OrderRequirements`: Detailed service requirements
- `OrderStatus`: Order lifecycle states
- `ApiResponse<T>`: Generic API response wrapper

## Error Handling

The app includes:
- API error parsing in `utils/api.ts`
- Redux error states for async operations
- User-friendly error messages
- Network error detection

## Next Steps for Implementation

1. **API Services** (`src/services/`)
   - `authService.ts` - Login, register, token refresh
   - `petService.ts` - CRUD operations for pets
   - `orderService.ts` - Order management
   - `uploadService.ts` - Image uploads for requirements

2. **Complete Screens**
   - Requirement capture screen for drivers
   - Order detail views with timeline
   - Clarification request interface

3. **Components**
   - Order status indicator
   - Pet card component
   - Requirement detail view
   - Chat/message component for clarifications

4. **Features**
   - Real-time updates (WebSocket/Firebase)
   - Push notifications for status changes
   - Offline support with local caching
   - Map integration for pickups/deliveries
   - Image upload and gallery

5. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Detox)

## Code Quality Standards

- All components use TypeScript
- No `any` types (use `unknown` if necessary)
- Console logs only for warnings/errors
- No unused variables
- ESLint and Prettier enforce consistency
- Functions have clear return types

## Best Practices Implemented

✅ Redux for centralized state  
✅ Custom hooks for Redux (useAppSelector, useAppDispatch)  
✅ Type-safe navigation with TypeScript  
✅ Centralized API client with error handling  
✅ Constants for magic strings  
✅ Validation schemas with Zod  
✅ Consistent error handling  
✅ Modular component structure  
✅ Environment-based configuration  

## Contributing

1. Create a feature branch
2. Follow TypeScript and ESLint rules
3. Write readable, well-typed code
4. Keep components focused and reusable
5. Update types in `src/types/` when adding data structures

## License

MIT
