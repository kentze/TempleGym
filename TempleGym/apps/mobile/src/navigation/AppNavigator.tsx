import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import Sidebar from './Sidebar';
import { MainStackParamList } from './types';

import HomeScreen           from '../screens/home/HomeScreen';
import WorkoutScreen        from '../screens/workout/WorkoutScreen';
import SessionLoggingScreen from '../screens/workout/SessionLoggingScreen';
import HistoryScreen        from '../screens/history/HistoryScreen';
import SessionDetailScreen  from '../screens/history/SessionDetailScreen';
import LeaderboardScreen    from '../screens/leaderboard/LeaderboardScreen';
import ShopScreen           from '../screens/shop/ShopScreen';
import ShopDetailScreen     from '../screens/shop/ShopDetailScreen';
import FavouritesScreen     from '../screens/favourites/FavouritesScreen';
import SettingsScreen       from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function AppNavigator() {
  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home"           component={HomeScreen} />
          <Stack.Screen name="Workout"        component={WorkoutScreen} />
          <Stack.Screen name="SessionLogging" component={SessionLoggingScreen} />
          <Stack.Screen name="History"        component={HistoryScreen} />
          <Stack.Screen name="SessionDetail"  component={SessionDetailScreen} />
          <Stack.Screen name="Leaderboard"    component={LeaderboardScreen} />
          <Stack.Screen name="Shop"           component={ShopScreen} />
          <Stack.Screen name="ShopDetail"     component={ShopDetailScreen} />
          <Stack.Screen name="Favourites"     component={FavouritesScreen} />
          <Stack.Screen name="Settings"       component={SettingsScreen} />
        </Stack.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: Colors.background },
  content:   { flex: 1 },
});
