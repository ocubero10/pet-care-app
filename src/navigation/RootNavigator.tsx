import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@hooks/index';
import { RootStackParamList } from './types';

// Screens
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import OwnerTabNavigator from './OwnerTabNavigator';
import StaffTabNavigator from './StaffTabNavigator';
import DriverTabNavigator from './DriverTabNavigator';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        </RootStack.Navigator>
      ) : (
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {user?.role === 'owner' && <RootStack.Screen name="Main" component={OwnerTabNavigator} />}
          {user?.role === 'staff' && <RootStack.Screen name="Main" component={StaffTabNavigator} />}
          {user?.role === 'driver' && (
            <RootStack.Screen name="Main" component={DriverTabNavigator} />
          )}
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
};

const AuthStack = createNativeStackNavigator();

const AuthStackNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

export default RootNavigator;
