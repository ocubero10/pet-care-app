import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StaffTabParamList } from './types';

// Screens
import StaffDashboardScreen from '@screens/staff/StaffDashboardScreen';
import OrdersListScreen from '@screens/owner/OrdersListScreen';
import PetsListScreen from '@screens/owner/PetsListScreen';
import CalendarScreen from '@screens/CalendarScreen';
import ProfileScreen from '@screens/ProfileScreen';

const Tab = createBottomTabNavigator<StaffTabParamList>();
const Stack = createNativeStackNavigator();

const DashboardStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, title: 'Panel de control' }}>
      <Stack.Screen name="Dashboard" component={StaffDashboardScreen} />
    </Stack.Navigator>
  );
};

const OrdersStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Servicios',
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
        title: 'Mascotas',
      }}
    >
      <Stack.Screen name="Pets" component={PetsListScreen} />
    </Stack.Navigator>
  );
};

const CalendarStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Calendario',
      }}
    >
      <Stack.Screen name="Calendar" component={CalendarScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, title: 'Perfil' }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const StaffTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Calendar" component={CalendarStack} options={{ tabBarLabel: 'Calendario' }} />
      <Tab.Screen name="Orders" component={OrdersStack} options={{ tabBarLabel: 'Servicios' }} />
      <Tab.Screen name="Pets" component={PetsStack} options={{ tabBarLabel: 'Mascotas' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;
