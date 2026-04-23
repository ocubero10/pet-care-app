# Development Guide

## Adding a New Screen

### 1. Create the Screen Component
```typescript
// src/screens/owner/NewScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const NewScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>New Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewScreen;
```

### 2. Add Route Type
Update `src/navigation/types.ts` with the new screen:
```typescript
export type OwnerTabParamList = {
  // ... existing screens
  NewScreen: { param?: string };
};
```

### 3. Add Navigation
Update the relevant navigator file to include the new screen.

## Creating a Service

### API Service Example
```typescript
// src/services/exampleService.ts
import { apiClient } from '@utils/api';
import { Example, ApiResponse } from '@types/index';

export const exampleService = {
  async getExamples(): Promise<Example[]> {
    return apiClient.get<Example[]>('/examples');
  },

  async createExample(data: Partial<Example>): Promise<Example> {
    return apiClient.post<Example>('/examples', data);
  },

  async updateExample(id: string, data: Partial<Example>): Promise<Example> {
    return apiClient.put<Example>(`/examples/${id}`, data);
  },

  async deleteExample(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/examples/${id}`);
  },
};
```

## Creating a Redux Slice

### Basic Slice Pattern
```typescript
// src/store/exampleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Example } from '@types/index';

interface ExampleState {
  items: Example[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ExampleState = {
  items: [],
  isLoading: false,
  error: null,
};

export const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSuccess: (state, action: PayloadAction<Example[]>) => {
      state.isLoading = false;
      state.items = action.payload;
    },
    fetchFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure } = exampleSlice.actions;
export default exampleSlice.reducer;
```

Then add to `src/store/index.ts`:
```typescript
export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    pets: petsReducer,
    example: exampleReducer, // Add here
  },
});
```

## Using Redux in Components

### Dispatching Actions
```typescript
import { useAppDispatch, useAppSelector } from '@hooks/index';
import { fetchStart, fetchSuccess, fetchFailure } from '@store/exampleSlice';
import { exampleService } from '@services/exampleService';

const MyComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const handleFetch = async () => {
    dispatch(fetchStart());
    try {
      const data = await exampleService.getExamples();
      dispatch(fetchSuccess(data));
    } catch (error) {
      dispatch(fetchFailure((error as Error).message));
    }
  };
  
  return <></>;
};
```

### Reading State
```typescript
const MyComponent: React.FC = () => {
  const items = useAppSelector((state) => state.example.items);
  const isLoading = useAppSelector((state) => state.example.isLoading);
  
  return <></>;
};
```

## Form Handling with React Hook Form

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(0).max(150),
});

type FormData = z.infer<typeof formSchema>;

const MyForm: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 0,
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <>
            {/* TextInput component */}
            {errors.name && <Text>{errors.name.message}</Text>}
          </>
        )}
      />
      {/* More fields */}
    </>
  );
};
```

## Handling Navigation with Type Safety

```typescript
import { useNavigation } from '@react-navigation/native';
import { RootStackScreenProps } from '@navigation/types';

type Props = RootStackScreenProps<'OrderDetail'>;

const OrderDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId } = route.params;
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  return <></>;
};
```

## Error Handling Pattern

```typescript
try {
  const result = await someAsyncOperation();
} catch (error) {
  const appError = error as AppError;
  console.error(`Error [${appError.code}]: ${appError.message}`);
  
  // Handle specific errors
  if (appError.code === 'ERR_401') {
    // Handle unauthorized
    dispatch(logout());
  } else if (appError.code === 'ERR_NETWORK') {
    // Handle network error
    showRetryButton();
  }
}
```

## Adding New Types

Always define types in `src/types/index.ts`:

```typescript
export interface NewType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

## Component Best Practices

### ✅ DO:
- Use TypeScript for all components
- Define prop interfaces
- Use `React.FC<Props>` for function components
- Keep components focused and single-responsibility
- Use custom hooks for reusable logic
- Memoize components if they have expensive renders

### ❌ DON'T:
- Use `any` types
- Create huge monolithic components
- Use magic strings (use constants)
- Skip error handling
- Forget to unsubscribe from subscriptions
- Create components in deeply nested folder structures

## Testing Components

### Unit Test Example
```typescript
import { render, screen } from '@testing-library/react-native';
import MyComponent from '@screens/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeTruthy();
  });
});
```

## Performance Tips

1. **Memoization**: Wrap expensive components with `React.memo()`
2. **Lazy Loading**: Use `React.lazy()` for route-based code splitting
3. **Optimization**: Use `useCallback` for event handlers passed to child components
4. **State Structure**: Keep Redux state normalized
5. **List Rendering**: Use `FlatList` with `keyExtractor` for large lists

## Debugging

### Redux DevTools
Install and use Redux DevTools for state inspection during development.

### Console Logging
Use appropriately:
```typescript
console.warn('Warning message'); // For warnings
console.error('Error message');  // For errors
```

### React Native Debugger
- Install: `npm install -g react-native-debugger`
- Launch before running the app
- Enable debugging in the app menu

## Git Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "feat: description"`
3. Ensure code quality: `npm run lint && npm run prettier`
4. Push and create PR

## Common Issues

### TypeScript Errors
- Check `tsconfig.json` for path aliases
- Verify imports use correct paths (`@services/`, `@screens/`, etc.)
- Run `tsc --noEmit` to check for type errors

### Redux Issues
- Verify slice is added to `store/index.ts`
- Check action creator exports match usage
- Use Redux DevTools to inspect state

### Navigation Issues
- Verify screen is added to route types
- Check navigator includes the screen
- Ensure route params match type definitions
