import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WorkoutSession } from '@templegym/types';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Home:           undefined;
  Workout:        undefined;
  SessionLogging: undefined;
  History:        undefined;
  SessionDetail:  { session: WorkoutSession };
  Leaderboard:    undefined;
  Favourites:     undefined;
  Settings:       undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;
