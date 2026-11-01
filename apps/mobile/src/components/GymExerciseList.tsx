import { useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet, SectionList } from 'react-native';
import { Colors } from '../constants/colors';
import type { Exercise } from '@templegym/types';

const GYM_NAMES: Record<string, string> = {
  city:     'City Campus',
  hillside: 'Hillside',
};

export function gymName(gymId: string): string {
  return GYM_NAMES[gymId] ?? GYM_NAMES.city;
}

// The group an exercise is listed under, e.g. Chest, Back, Legs
export function groupName(exercise: Exercise): string {
  return exercise.muscleGroups[0] ?? 'Other';
}

// Every group present in the given exercises, in the order the list shows them
export function groupNames(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map(groupName))].sort((a, b) => a.localeCompare(b));
}

interface Props {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  emptyText: string;
}

// Exercises grouped by their first muscle group, e.g. Chest, Back, Legs
export default function GymExerciseList({ exercises, onSelect, emptyText }: Props) {
  const sections = useMemo(() => {
    const groups = new Map<string, Exercise[]>();
    for (const ex of exercises) {
      const key = groupName(ex);
      groups.set(key, [...(groups.get(key) ?? []), ex]);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [exercises]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionLabel}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.exerciseCard} onPress={() => onSelect(item)} activeOpacity={0.75}>
          <Text style={styles.exerciseName}>{item.name}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 10,
  },
  exerciseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: 40,
    fontSize: 14,
  },
});
