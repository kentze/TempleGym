import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { key: string; label: string; iconOff: IoniconName; iconOn: IoniconName }[] = [
  { key: 'Home',        label: 'Home',    iconOff: 'home-outline',    iconOn: 'home' },
  { key: 'History',     label: 'History', iconOff: 'time-outline',    iconOn: 'time' },
  { key: 'Leaderboard', label: 'Board',   iconOff: 'trophy-outline',  iconOn: 'trophy' },
  { key: 'Stats',       label: 'Stats',   iconOff: 'bar-chart-outline', iconOn: 'bar-chart' },
];

const HIDDEN_ON = ['SessionLogging', 'SessionDetail', 'Workout', 'AddRoutine', 'ExercisePicker'];

function activeBase(name: string): string {
  if (name === 'Workout' || name === 'SessionLogging') return 'Home';
  if (name === 'SessionDetail') return 'History';
  return name;
}

export default function BottomTabBar() {
  const navigation = useNavigation<any>();
  const routeName  = useNavigationState((s) => s?.routes[s?.index ?? 0]?.name ?? 'Home');
  const insets     = useSafeAreaInsets();

  if (HIDDEN_ON.includes(routeName)) return null;

  const active = activeBase(routeName);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.key)}
          >
            <Ionicons
              name={isActive ? tab.iconOn : tab.iconOff}
              size={24}
              color={isActive ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    backgroundColor: Colors.surfaceDeep,
    borderTopWidth:  1,
    borderTopColor:  Colors.border,
    paddingTop:      10,
  },
  tab: {
    flex:           1,
    alignItems:     'center',
    gap:            4,
  },
  label: {
    fontSize: 10,
    color:    Colors.textMuted,
  },
  labelActive: {
    color: Colors.primary,
  },
});
