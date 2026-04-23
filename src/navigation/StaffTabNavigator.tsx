import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StaffTabParamList } from './types';

// Screens
import StaffDashboardScreen from '@screens/staff/StaffDashboardScreen';
import StaffOrdersScreen from '@screens/staff/StaffOrdersScreen';
import RequirementClarificationScreen from '@screens/staff/RequirementClarificationScreen';
import ProfileScreen from '@screens/ProfileScreen';

const Tab = createBottomTabNavigator<StaffTabParamList>();
const Stack = createNativeStackNavigator();

const DashboardStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Dashboard',
      }}
    >
      <Stack.Screen name="Dashboard" component={StaffDashboardScreen} />
    </Stack.Navigator>
  );
};

const OrdersStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Orders',
      }}
    >
      <Stack.Screen name="Orders" component={StaffOrdersScreen} />
    </Stack.Navigator>
  );
};

const ClarificationStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Clarifications Needed',
      }}
    >
      <Stack.Screen name="RequirementClarification" component={RequirementClarificationScreen} />
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

const StaffTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="RequirementClarification" component={ClarificationStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;
