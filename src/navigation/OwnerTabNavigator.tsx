import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { OwnerTabParamList } from './types';
import { colors } from '@constants/theme';

// Screens
import OwnerHomeScreen from '@screens/owner/OwnerHomeScreen';
import OrdersListScreen from '@screens/owner/OrdersListScreen';
import PetsListScreen from '@screens/owner/PetsListScreen';
import CalendarScreen from '@screens/CalendarScreen';
import ProfileScreen from '@screens/ProfileScreen';

const Tab = createBottomTabNavigator<OwnerTabParamList>();
const Stack = createNativeStackNavigator();

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, title: 'Inicio' }}>
      <Stack.Screen name="Home" component={OwnerHomeScreen} />
    </Stack.Navigator>
  );
};

const OrdersStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, title: 'Mis citas' }}>
      <Stack.Screen name="Orders" component={OrdersListScreen} />
    </Stack.Navigator>
  );
};

const PetsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, title: 'Mis mascotas' }}>
      <Stack.Screen name="Pets" component={PetsListScreen} />
    </Stack.Navigator>
  );
};

const CalendarStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, title: 'Calendario' }}>
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

const OwnerTabNavigator: React.FC = () => {
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
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: 'Citas',
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Pets"
        component={PetsStack}
        options={{
          tabBarLabel: 'Mascotas',
          tabBarIcon: ({ color, size }) => <Ionicons name="paw" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{
          tabBarLabel: 'Calendario',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default OwnerTabNavigator;
