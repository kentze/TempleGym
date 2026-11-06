import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { Exercise } from '@templegym/types';

// Height of one row + the gap below it.
// Must match: exerciseRow vertical padding (12+12=24) + content (~44) + gap (8) ≈ 76
const ITEM_H = 76;

// All animations run on the JS thread so setValue/addListener stay in sync.
const TIMING = (v: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(v, { toValue, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false });

interface Props {
  // 1 for the first routine in the folder, 2 for the second, and so on
  number: number;
  name: string;
  exercises: Exercise[];
  autoFocus?: boolean;
  onNameChange: (name: string) => void;
  onExercisesChange: (exercises: Exercise[]) => void;
  onAddExercise: () => void;
  onRemove: () => void;
  // Lets the screen stop scrolling while an exercise is being dragged
  onDragChange: (dragging: boolean) => void;
}

// One routine inside the folder editor: its name, and its exercises that can be reordered by dragging.
export default function RoutineEditorSection({
  number, name, exercises, autoFocus,
  onNameChange, onExercisesChange, onAddExercise, onRemove, onDragChange,
}: Props) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Y translation for the floating item
  const dragY = useRef(new Animated.Value(0)).current;

  // Refs read inside PanResponder callbacks (stale-closure safe)
  const activeRef     = useRef<number | null>(null);
  const targetRef     = useRef<number | null>(null);
  const exLenRef      = useRef(exercises.length);
  const listenerIdRef = useRef<string | null>(null);
  const exercisesRef  = useRef(exercises);
  const onChangeRef   = useRef(onExercisesChange);
  const onDragRef     = useRef(onDragChange);
  exercisesRef.current = exercises;
  onChangeRef.current  = onExercisesChange;
  onDragRef.current    = onDragChange;

  // Per-slot Y-shift animations (one value per visual position)
  const itemShifts = useRef<Animated.Value[]>(
    Array.from({ length: exercises.length }, () => new Animated.Value(0)),
  );
  const prCacheRef = useRef<Map<number, ReturnType<typeof PanResponder.create>>>(new Map());
  const prevLenRef = useRef(exercises.length);

  // Keep arrays in sync when exercises are added / removed
  if (prevLenRef.current !== exercises.length) {
    const old = itemShifts.current;
    itemShifts.current = Array.from(
      { length: exercises.length },
      (_, i) => old[i] ?? new Animated.Value(0),
    );
    prCacheRef.current.clear();
    prevLenRef.current = exercises.length;
    exLenRef.current   = exercises.length;
  }

  // Animate every neighbour to their new position given a from→to drag
  function animateNeighbours(from: number, to: number, duration = 160) {
    itemShifts.current.forEach((anim, i) => {
      if (i === from) return;
      let toValue = 0;
      if (from < to && i > from && i <= to) toValue = -ITEM_H;
      if (from > to && i < from && i >= to) toValue =  ITEM_H;
      TIMING(anim, toValue, duration).start();
    });
  }

  function stopAndReset() {
    itemShifts.current.forEach(v => { v.stopAnimation(); v.setValue(0); });
    dragY.stopAnimation();
    dragY.setValue(0);
  }

  function getPanResponder(index: number) {
    if (!prCacheRef.current.has(index)) {
      prCacheRef.current.set(index, PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onPanResponderGrant: () => {
          activeRef.current = index;
          targetRef.current = index;
          dragY.setValue(0);
          setDraggingIndex(index);
          onDragRef.current(true);

          // Animate neighbours directly from the Animated.Value — zero React
          // state updates means zero render lag during the gesture.
          listenerIdRef.current = dragY.addListener(({ value }) => {
            const from = activeRef.current;
            if (from === null) return;
            const next = Math.max(0, Math.min(
              exLenRef.current - 1,
              from + Math.round(value / ITEM_H),
            ));
            if (next === targetRef.current) return;
            targetRef.current = next;
            animateNeighbours(from, next);
          });
        },

        onPanResponderMove: (_, gs) => {
          dragY.setValue(gs.dy);
        },

        onPanResponderRelease: (_, gs) => {
          const from = activeRef.current;
          if (listenerIdRef.current) {
            dragY.removeListener(listenerIdRef.current);
            listenerIdRef.current = null;
          }
          if (from === null) return;

          const to = Math.max(0, Math.min(
            exLenRef.current - 1,
            from + Math.round(gs.dy / ITEM_H),
          ));

          // Snap the floating item to its exact landing position.
          // When the animation finishes, the dragged item is visually AT
          // layout[to], so resetting dragY to 0 and reordering the array
          // means layout[to] === visual position — no jump.
          const snapY = (to - from) * ITEM_H;
          animateNeighbours(from, to, 120);
          TIMING(dragY, snapY, 120).start(() => {
            stopAndReset();
            const next = [...exercisesRef.current];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            onChangeRef.current(next);
            prCacheRef.current.clear();
            activeRef.current = null;
            targetRef.current = null;
            setDraggingIndex(null);
            onDragRef.current(false);
          });
        },

        onPanResponderTerminate: () => {
          if (listenerIdRef.current) {
            dragY.removeListener(listenerIdRef.current);
            listenerIdRef.current = null;
          }
          stopAndReset();
          prCacheRef.current.clear();
          activeRef.current = null;
          targetRef.current = null;
          setDraggingIndex(null);
          onDragRef.current(false);
        },
      }));
    }
    return prCacheRef.current.get(index)!;
  }

  function removeExercise(index: number) {
    onExercisesChange(exercises.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.part}>
      <View style={styles.partHeader}>
        <Text style={styles.partTitle}>Routine {number}</Text>
        <TouchableOpacity onPress={onRemove} hitSlop={10}>
          <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Routine Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Upper Body, Leg Day, Cardio..."
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={onNameChange}
        autoFocus={autoFocus}
        maxLength={40}
        returnKeyType="done"
      />

      <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Workout Content</Text>

      <TouchableOpacity style={styles.addExerciseBtn} onPress={onAddExercise} activeOpacity={0.75}>
        <Text style={styles.addExerciseBtnText}>+ Exercise</Text>
      </TouchableOpacity>

      {exercises.length > 0 && (
        <View style={styles.exerciseList}>
          {exercises.map((ex, i) => {
            const isDragging = draggingIndex === i;
            const shiftAnim  = itemShifts.current[i] ?? new Animated.Value(0);
            return (
              <Animated.View
                key={`${ex.id}-${i}`}
                style={{
                  transform:  [{ translateY: isDragging ? dragY : shiftAnim }],
                  zIndex:     isDragging ? 99 : 1,
                  // Shadow only on the active item (iOS)
                  shadowColor:   isDragging ? '#000' : 'transparent',
                  shadowOpacity: isDragging ? 0.2 : 0,
                  shadowRadius:  isDragging ? 8 : 0,
                  shadowOffset:  { width: 0, height: isDragging ? 4 : 0 },
                  // Android elevation
                  elevation: isDragging ? 10 : 0,
                }}
              >
                <View style={[styles.exerciseRow, isDragging && styles.exerciseRowDragging]}>
                  <View style={styles.exerciseOrder} {...getPanResponder(i).panHandlers}>
                    <Text style={styles.exerciseOrderNum}>{i + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseMuscles}>{ex.muscleGroups.join(', ')}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeExercise(i)} hitSlop={8}>
                    <Ionicons name="close-circle-outline" size={22} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  part:                 { gap: 10 },
  partHeader:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  partTitle:            { fontSize: 15, fontWeight: '700', color: Colors.text },
  sectionLabel:         { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionSpacing:       { marginTop: 4 },
  input:                { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.text, fontSize: 16, letterSpacing: 0 },
  exerciseList:         { gap: 8 },
  exerciseRow:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12, gap: 12 },
  exerciseRowDragging:  { borderColor: Colors.primary },
  exerciseOrder:        { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryFaded, alignItems: 'center', justifyContent: 'center' },
  exerciseOrderNum:     { fontSize: 13, fontWeight: '700', color: Colors.primary },
  exerciseInfo:         { flex: 1, gap: 2 },
  exerciseName:         { fontSize: 15, fontWeight: '600', color: Colors.text },
  exerciseMuscles:      { fontSize: 12, color: Colors.textMuted },
  addExerciseBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 14 },
  addExerciseBtnText:   { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
