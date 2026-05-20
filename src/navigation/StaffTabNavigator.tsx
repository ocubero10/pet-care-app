import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StaffTabParamList } from './types';
import { colors } from '@constants/theme';

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
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.borderSoft, backgroundColor: colors.surface, height: 60, paddingBottom: 6, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{
          tabBarLabel: 'Calendario',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cut' : 'cut-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Pets"
        component={PetsStack}
        options={{
          tabBarLabel: 'Mascotas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'paw' : 'paw-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;
