import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Colors } from '../constants/colors';

const NAV_ITEMS = [
  { key: 'Home',        icon: '🏠', label: 'Home' },
  { key: 'History',     icon: '📋', label: 'History' },
  { key: 'Leaderboard', icon: '🏆', label: 'Board' },
  { key: 'Shop',        icon: '🛍', label: 'Shop' },
  { key: 'Favourites',  icon: '⭐', label: 'Fav' },
] as const;

function activeBase(name: string): string {
  if (name === 'Workout' || name === 'SessionLogging') return 'Home';
  if (name === 'SessionDetail')                        return 'History';
  if (name === 'ShopDetail')                           return 'Shop';
  return name;
}

export default function Sidebar() {
  const navigation = useNavigation<any>();
  const routeName  = useNavigationState((s) => s.routes[s.index]?.name ?? 'Home');
  const active     = activeBase(routeName);

  return (
    <View style={styles.sidebar}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.item, active === item.key && styles.itemActive]}
          onPress={() => navigation.navigate(item.key)}
        >
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={[styles.label, active === item.key && styles.labelActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.spacer} />
      <TouchableOpacity
        style={[styles.item, active === 'Settings' && styles.itemActive]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.icon}>⚙️</Text>
        <Text style={[styles.label, active === 'Settings' && styles.labelActive]}>Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar:     { width: 56, backgroundColor: Colors.surfaceDeep, alignItems: 'center', paddingVertical: 16, gap: 4, borderRightWidth: 1, borderRightColor: Colors.border },
  item:        { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 2 },
  itemActive:  { backgroundColor: `${Colors.primary}1a` },
  icon:        { fontSize: 20 },
  label:       { fontSize: 8, color: Colors.textMuted },
  labelActive: { color: Colors.primary },
  spacer:      { flex: 1 },
});
