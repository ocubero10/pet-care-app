import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OwnerTabParamList } from './types';

// Screens
import OwnerHomeScreen from '@screens/owner/OwnerHomeScreen';
import OrdersListScreen from '@screens/owner/OrdersListScreen';
import PetsListScreen from '@screens/owner/PetsListScreen';
import ProfileScreen from '@screens/ProfileScreen';

const Tab = createBottomTabNavigator<OwnerTabParamList>();
const Stack = createNativeStackNavigator();

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Home',
      }}
    >
      <Stack.Screen name="Home" component={OwnerHomeScreen} />
    </Stack.Navigator>
  );
};

const OrdersStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'My Orders',
      }}
    >
      <Stack.Screen name="Orders" component={OrdersListScreen} />
    </Stack.Navigator>
  );
};

const PetsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'My Pets',
      }}
    >
      <Stack.Screen name="Pets" component={PetsListScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Profile',
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const OwnerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Pets" component={PetsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default OwnerTabNavigator;
