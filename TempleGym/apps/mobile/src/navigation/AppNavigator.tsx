import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import BottomTabBar from './BottomTabBar';
import { MainStackParamList } from './types';

import HomeScreen           from '../screens/home/HomeScreen';
import WorkoutScreen        from '../screens/workout/WorkoutScreen';
import SessionLoggingScreen from '../screens/workout/SessionLoggingScreen';
import HistoryScreen        from '../screens/history/HistoryScreen';
import SessionDetailScreen  from '../screens/history/SessionDetailScreen';
import LeaderboardScreen    from '../screens/leaderboard/LeaderboardScreen';
import FavouritesScreen     from '../screens/favourites/FavouritesScreen';
import SettingsScreen       from '../screens/settings/SettingsScreen';
import AddRoutineScreen      from '../screens/routine/AddRoutineScreen';
import ExercisePickerScreen  from '../screens/routine/ExercisePickerScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function AppNavigator() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home"           component={HomeScreen} />
          <Stack.Screen name="Workout"        component={WorkoutScreen} />
          <Stack.Screen name="SessionLogging" component={SessionLoggingScreen} />
          <Stack.Screen name="History"        component={HistoryScreen} />
          <Stack.Screen name="SessionDetail"  component={SessionDetailScreen} />
          <Stack.Screen name="Leaderboard"    component={LeaderboardScreen} />
          <Stack.Screen name="Favourites"     component={FavouritesScreen} />
          <Stack.Screen name="Settings"       component={SettingsScreen} />
          <Stack.Screen name="AddRoutine"      component={AddRoutineScreen} />
          <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} />
        </Stack.Navigator>
      </View>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: Colors.background },
  content:   { flex: 1 },
});
