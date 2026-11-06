import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { SIMPLE_OPTIONS } from '../constants/simpleExercises';
import type { Exercise } from '@templegym/types';

interface Props {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  emptyText: string;
}

// Upper, lower or cardio. Nothing else, so it is easy for a beginner.
export default function SimpleExerciseList({ exercises, onSelect, emptyText }: Props) {
  const options = SIMPLE_OPTIONS
    .map((o) => ({ ...o, exercise: exercises.find((e) => e.name === o.name) }))
    .filter((o) => o.exercise);

  return (
    <View style={styles.container}>
      {options.length === 0 ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        options.map((o) => (
          <TouchableOpacity
            key={o.name}
            style={styles.card}
            onPress={() => onSelect(o.exercise!)}
            activeOpacity={0.75}
          >
            <Text style={styles.name}>{o.name}</Text>
            <Text style={styles.blurb}>{o.blurb}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 22,
    paddingHorizontal: 18,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  blurb: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: 40,
    fontSize: 14,
    paddingHorizontal: 20,
  },
});
