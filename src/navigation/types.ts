import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type OwnerTabParamList = {
  Home: undefined;
  Orders: undefined;
  Pets: undefined;
  Profile: undefined;
};

export type StaffTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  RequirementClarification: undefined;
  Profile: undefined;
};

export type DriverTabParamList = {
  Pickups: undefined;
  Deliveries: undefined;
  Schedule: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type OwnerTabScreenProps<Screen extends keyof OwnerTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<OwnerTabParamList, Screen>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type StaffTabScreenProps<Screen extends keyof StaffTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<StaffTabParamList, Screen>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type DriverTabScreenProps<Screen extends keyof DriverTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<DriverTabParamList, Screen>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
