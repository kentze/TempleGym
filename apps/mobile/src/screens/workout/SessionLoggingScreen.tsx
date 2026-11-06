import { useState, useEffect, Fragment } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ExercisePickerSheet from '../../components/ExercisePickerSheet';
import { sectionMarks } from '../../utils/routineSession';
import { parseStrengthSet, parseCardioSet } from '../../utils/setInput';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';
import { useWorkoutStore } from '../../store/workout.store';
import type { MainStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList, 'SessionLogging'>;

interface SetInputs {
  weightKg: string;
  reps: string;
  minutes: string;
}

export default function SessionLoggingScreen() {
  const navigation    = useNavigation<Nav>();
  const insets        = useSafeAreaInsets();
  const user          = useAuthStore((s) => s.user);
  const preferMetric  = user?.preferMetric ?? true;
  const { activeSession, addExercise, addSet, endSession, isSubmitting, clearSession } = useWorkoutStore();

  const [pickerVisible, setPickerVisible]        = useState(false);
  const [setInputs, setSetInputs]                = useState<Record<string, SetInputs>>({});
  const [error, setError]                        = useState<string | null>(null);

  useEffect(() => {
    if (!activeSession) {
      navigation.goBack();
      return;
    }
  }, [activeSession]);

  function updateSetInput(slotKey: string, field: keyof SetInputs, value: string) {
    setSetInputs((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], [field]: value },
    }));
  }

  // Cardio logs minutes, everything else logs weight and reps
  function handleAddSet(slotKey: string, isCardio: boolean) {
    const inputs = setInputs[slotKey];
    const parsed = isCardio
      ? parseCardioSet(inputs?.minutes ?? '')
      : parseStrengthSet(inputs?.weightKg ?? '', inputs?.reps ?? '', preferMetric);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    addSet(slotKey, parsed.set);
    setSetInputs((prev) => ({ ...prev, [slotKey]: { weightKg: '', reps: '', minutes: '' } }));
  }

  async function handleEndSession() {
    if (!activeSession) return;
    const exercisesWithSets = activeSession.exercises.filter((e) => e.sets.length > 0);
    if (exercisesWithSets.length === 0) {
      Alert.alert('No sets logged', 'Add at least one set before ending the session.');
      return;
    }
    try {
      await endSession();
      navigation.goBack();
    } catch {
      setError('Failed to save session. Try again.');
    }
  }

  function handleDiscard() {
    Alert.alert('Discard session', 'Are you sure you want to discard this session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => { clearSession(); navigation.goBack(); } },
    ]);
  }

  if (!activeSession) return null;

  const addedIds = new Set(activeSession.exercises.map((e) => e.exerciseId));
  const marks    = sectionMarks(activeSession.exercises.map((e) => e.group));
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Workout Session</Text>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={styles.discard}>Discard</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeSession.exercises.map((ex, index) => (
          <Fragment key={ex.slotKey}>
          {marks[index].divider && <View style={styles.sectionDivider} />}
          {marks[index].label && <Text style={styles.sectionLabel}>{marks[index].label}</Text>}
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{ex.name}</Text>

            {ex.sets.map((s) => {
              if ('minutes' in s) {
                return (
                  <Text key={s.setNumber} style={styles.setRow}>
                    {s.minutes} min
                  </Text>
                );
              }
              const displayWeight = preferMetric
                ? `${s.weightKg}kg`
                : `${(s.weightKg * 2.20462).toFixed(1)}lbs`;
              return (
                <Text key={s.setNumber} style={styles.setRow}>
                  Set {s.setNumber}: {displayWeight} x {s.reps} reps
                </Text>
              );
            })}

            <View style={styles.setInputRow}>
              {ex.isCardio ? (
                <TextInput
                  style={styles.setInput}
                  placeholder="minutes"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  value={setInputs[ex.slotKey]?.minutes ?? ''}
                  onChangeText={(v) => updateSetInput(ex.slotKey, 'minutes', v)}
                />
              ) : (
                <>
                  <TextInput
                    style={styles.setInput}
                    placeholder={preferMetric ? 'kg' : 'lbs'}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                    value={setInputs[ex.slotKey]?.weightKg ?? ''}
                    onChangeText={(v) => updateSetInput(ex.slotKey, 'weightKg', v)}
                  />
                  <TextInput
                    style={styles.setInput}
                    placeholder="reps"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    value={setInputs[ex.slotKey]?.reps ?? ''}
                    onChangeText={(v) => updateSetInput(ex.slotKey, 'reps', v)}
                  />
                </>
              )}
              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => handleAddSet(ex.slotKey, ex.isCardio)}
              >
                <Text style={styles.addSetButtonText}>{ex.isCardio ? '+ Log' : '+ Set'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          </Fragment>
        ))}

        <TouchableOpacity style={styles.addExerciseButton} onPress={() => setPickerVisible(true)}>
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.endButton, isSubmitting && styles.endButtonDisabled]}
          onPress={handleEndSession}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color={Colors.text} />
            : <Text style={styles.endButtonText}>End Session</Text>
          }
        </TouchableOpacity>
      </View>

      <ExercisePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={addExercise}
        excludeIds={addedIds}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.background },
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:              { fontSize: 30, fontWeight: '700', color: Colors.text },
  discard:            { color: Colors.error, fontSize: 14 },
  error:              { color: Colors.error, fontSize: 13, textAlign: 'center', paddingHorizontal: 20, paddingTop: 8 },
  scroll:             { flex: 1 },
  scrollContent:      { padding: 16, gap: 12 },
  sectionDivider:     { height: 1, backgroundColor: Colors.border },
  sectionLabel:       { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  exerciseCard:       { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 8 },
  exerciseName:       { fontSize: 16, fontWeight: '600', color: Colors.text },
  setRow:             { fontSize: 13, color: Colors.textMuted },
  setInputRow:        { flexDirection: 'row', gap: 8, alignItems: 'center' },
  setInput:           { flex: 1, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: Colors.text, fontSize: 14, letterSpacing: 0 },
  addSetButton:       { backgroundColor: Colors.primaryFaded, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  addSetButtonText:   { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  addExerciseButton:  { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, borderStyle: 'dashed', paddingVertical: 14, alignItems: 'center' },
  addExerciseText:    { color: Colors.textMuted, fontSize: 15 },
  footer:             { padding: 16, paddingBottom: 0, borderTopWidth: 1, borderTopColor: Colors.border },
  endButton:          { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  endButtonDisabled:  { opacity: 0.6 },
  endButtonText:      { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
