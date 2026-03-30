import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WorkoutSession, Exercise } from '@templegym/types';

export type AuthStackParamList = {
  Login: undefined;
};

export interface SavedRoutine {
  folderId:  number | 'default';
  name:      string;
  exercises: Exercise[];
}

export type MainStackParamList = {
  Home:            { newRoutine?: SavedRoutine } | undefined;
  Workout:         undefined;
  SessionLogging:  undefined;
  History:         undefined;
  SessionDetail:   { session: WorkoutSession };
  Leaderboard:     undefined;
  Favourites:      undefined;
  Settings:        undefined;
  AddRoutine:      { folderId: number | 'default'; folderName: string; selectedExercise?: Exercise };
  ExercisePicker:  { folderId: number | 'default'; folderName: string };
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;
