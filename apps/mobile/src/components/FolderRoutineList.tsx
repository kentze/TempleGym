import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import type { SavedRoutine } from '../navigation/types';

interface Props {
  routines: SavedRoutine[];
  // Starts one workout with every routine in the folder
  onStart: () => void;
}

// The routines inside an open folder, one after another with a line between them.
// The folder's single Start button sits on the same line as the last exercise of the last routine.
export default function FolderRoutineList({ routines, onStart }: Props) {
  return (
    <>
      {routines.map((routine, index) => {
        const isLastRoutine = index === routines.length - 1;
        const count = routine.exercises.length;
        return (
          <View key={index} style={[styles.routine, index > 0 && styles.divider]}>
            <Text style={styles.name}>{routine.name}</Text>
            <Text style={styles.count}>
              {count} exercise{count !== 1 ? 's' : ''}
            </Text>

            {count === 0 ? (
              <Line text="No exercises" muted onStart={isLastRoutine ? onStart : undefined} />
            ) : (
              routine.exercises.map((exercise, i) => (
                <Line
                  key={`${exercise.id}-${i}`}
                  text={exercise.name}
                  onStart={isLastRoutine && i === count - 1 ? onStart : undefined}
                />
              ))
            )}
          </View>
        );
      })}
    </>
  );
}

// One line of text. When it carries the Start button, the button sits at the right end of the same line.
function Line({ text, muted, onStart }: { text: string; muted?: boolean; onStart?: () => void }) {
  return (
    <View style={styles.line}>
      <Text style={[styles.lineText, muted && styles.lineTextMuted]}>{text}</Text>
      {onStart && (
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.8}>
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  routine: {
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 4,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  // Gold, so each routine's name stands out from its exercises
  name: { fontSize: 17, fontWeight: '700', color: Colors.gold },
  count: { fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  lineText: { flex: 1, fontSize: 14, color: Colors.text },
  lineTextMuted: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  // The negative margin keeps the button from making its line taller than the other exercise lines
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginVertical: -4,
  },
  startText: { fontSize: 14, fontWeight: '700', color: Colors.text },
});
