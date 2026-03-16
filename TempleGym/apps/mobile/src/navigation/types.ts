import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Home:           undefined;
  Workout:        { sessionType: 'PUSH' | 'PULL' };
  SessionLogging: undefined;
  History:        undefined;
  SessionDetail:  { sessionId: string };
  Leaderboard:    undefined;
  Shop:           undefined;
  ShopDetail:     { itemId: string };
  Favourites:     undefined;
  Settings:       undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;
