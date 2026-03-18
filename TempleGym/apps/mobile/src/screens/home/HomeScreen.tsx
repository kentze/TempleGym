import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';
import { useWorkoutStore } from '../../store/workout.store';
import type { MainStackParamList } from '../../navigation/types';
import type { SessionType } from '@templegym/types';

type Nav = NativeStackNavigationProp<MainStackParamList, 'Home'>;

const SESSION_CARDS: { type: SessionType; label: string; description: string }[] = [
  { type: 'PUSH', label: 'Push',  description: 'Chest, shoulders and triceps' },
  { type: 'PULL', label: 'Pull',  description: 'Back, biceps and rear delts' },
];

export default function HomeScreen() {
  const navigation   = useNavigation<Nav>();
  const user         = useAuthStore((s) => s.user);
  const startSession = useWorkoutStore((s) => s.startSession);

  const greeting = user?.displayName
    ? `Hey, ${user.displayName}`
    : user?.email
      ? `Hey, ${user.email.split('@')[0]}`
      : 'Hey there';

  function handleStart(type: SessionType) {
    startSession(type);
    navigation.navigate('SessionLogging');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>{greeting}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.totalPoints ?? 0}</Text>
          <Text style={styles.statLabel}>Total pts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.weeklyPoints ?? 0}</Text>
          <Text style={styles.statLabel}>This week</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Start a session</Text>

      {SESSION_CARDS.map((card) => (
        <TouchableOpacity
          key={card.type}
          style={styles.card}
          onPress={() => handleStart(card.type)}
          activeOpacity={0.75}
        >
          <View>
            <Text style={styles.cardLabel}>{card.label}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  content:       { padding: 20, gap: 16 },
  greeting:      { fontSize: 22, fontWeight: '700', color: Colors.text },
  statsRow:      { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  stat:          { flex: 1, alignItems: 'center', gap: 4 },
  statValue:     { fontSize: 24, fontWeight: '700', color: Colors.primary },
  statLabel:     { fontSize: 12, color: Colors.textMuted },
  statDivider:   { width: 1, backgroundColor: Colors.border, marginHorizontal: 8 },
  sectionLabel:  { fontSize: 13, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  card:          { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLabel:     { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardDescription: { fontSize: 13, color: Colors.textMuted },
  cardArrow:     { fontSize: 24, color: Colors.primary },
});
