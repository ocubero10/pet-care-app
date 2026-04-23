import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DriverTabParamList } from './types';

// Screens
import PickupsScreen from '@screens/driver/PickupsScreen';
import DeliveriesScreen from '@screens/driver/DeliveriesScreen';
import ScheduleScreen from '@screens/driver/ScheduleScreen';
import ProfileScreen from '@screens/ProfileScreen';

const Tab = createBottomTabNavigator<DriverTabParamList>();
const Stack = createNativeStackNavigator();

const PickupsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Pickups',
      }}
    >
      <Stack.Screen name="Pickups" component={PickupsScreen} />
    </Stack.Navigator>
  );
};

const DeliveriesStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Deliveries',
      }}
    >
      <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
    </Stack.Navigator>
  );
};

const ScheduleStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Schedule',
      }}
    >
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
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

const DriverTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Pickups" component={PickupsStack} />
      <Tab.Screen name="Deliveries" component={DeliveriesStack} />
      <Tab.Screen name="Schedule" component={ScheduleStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default DriverTabNavigator;
