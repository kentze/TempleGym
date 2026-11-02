import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import ExercisePickerSheet from '../../components/ExercisePickerSheet';
import RoutineEditorSection from '../../components/RoutineEditorSection';
import { useRoutinesStore } from '../../store/routines.store';
import { prepareRoutines, type RoutineDraft } from '../../utils/routineEditor';
import type { MainStackParamList } from '../../navigation/types';

type Nav   = NativeStackNavigationProp<MainStackParamList, 'EditRoutine'>;
type Route = RouteProp<MainStackParamList, 'EditRoutine'>;

// A routine in the editor. The key keeps each one steady while others are added or removed.
interface Part extends RoutineDraft {
  key: number;
}

// Edits every routine in a folder: change a name or its exercises, remove a routine, or add new ones.
// Nothing is saved until Save is pressed, so going back throws the changes away.
export default function EditRoutineScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { folderId, folderName } = params;
  const insets     = useSafeAreaInsets();
  const scrollRef  = useRef<ScrollView>(null);

  const setFolderRoutines = useRoutinesStore((s) => s.setFolderRoutines);

  const nextKey = useRef(0);
  const [parts, setParts] = useState<Part[]>(() => {
    const state = useRoutinesStore.getState();
    const saved = folderId === 'default'
      ? state.defaultItems
      : (state.folders.find((f) => f.id === folderId)?.items ?? []);
    const existing = saved.map((r) => ({ key: nextKey.current++, name: r.name, exercises: r.exercises }));
    // A folder with nothing in it starts with one blank routine to fill in
    return existing.length > 0 ? existing : [{ key: nextKey.current++, name: '', exercises: [] }];
  });
  const [focusKey, setFocusKey]       = useState<number | null>(() => (parts.length === 1 && !parts[0].name ? parts[0].key : null));
  const [pickerFor, setPickerFor]     = useState<number | null>(null);
  const [dragging, setDragging]       = useState(false);

  const { routines, missingName, missingExercises } = prepareRoutines(parts, folderId);
  const cannotSave = missingName || missingExercises;

  function updatePart(key: number, change: Partial<RoutineDraft>) {
    setParts((prev) => prev.map((p) => (p.key === key ? { ...p, ...change } : p)));
  }

  function addPart() {
    const key = nextKey.current++;
    setParts((prev) => [...prev, { key, name: '', exercises: [] }]);
    setFocusKey(key);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }

  function removePart(key: number) {
    setParts((prev) => prev.filter((p) => p.key !== key));
  }

  function handleSave() {
    if (cannotSave) return;
    setFolderRoutines(folderId, routines);
    navigation.goBack();
  }

  const pickerPart = parts.find((p) => p.key === pickerFor);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerLabel}>Editing</Text>
          <Text style={styles.headerFolder}>{folderName}</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!dragging}
      >
        {parts.map((part, index) => (
          <View key={part.key}>
            {index > 0 && <View style={styles.divider} />}
            <RoutineEditorSection
              number={index + 1}
              name={part.name}
              exercises={part.exercises}
              autoFocus={part.key === focusKey}
              onNameChange={(name) => updatePart(part.key, { name })}
              onExercisesChange={(exercises) => updatePart(part.key, { exercises })}
              onAddExercise={() => setPickerFor(part.key)}
              onRemove={() => removePart(part.key)}
              onDragChange={setDragging}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addRoutineBtn} onPress={addPart} activeOpacity={0.75}>
          <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.addRoutineBtnText}>Add another routine</Text>
        </TouchableOpacity>
      </ScrollView>

      <ExercisePickerSheet
        visible={pickerPart !== undefined}
        onClose={() => setPickerFor(null)}
        onSelect={(exercise) => {
          if (pickerPart) updatePart(pickerPart.key, { exercises: [...pickerPart.exercises, exercise] });
        }}
        excludeIds={new Set((pickerPart?.exercises ?? []).map((e) => e.id))}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {cannotSave && (
          <Text style={styles.hint}>
            {missingName && missingExercises
              ? 'Give every routine a name and at least one exercise to save.'
              : missingName
                ? 'Give every routine a name to save.'
                : 'Add at least one exercise to every routine to save.'}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.saveBtn, cannotSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={cannotSave}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: Colors.background },
  header:            { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  backBtn:           { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle:       { gap: 1 },
  headerLabel:       { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  headerFolder:      { fontSize: 16, fontWeight: '700', color: Colors.text },
  content:           { padding: 20, paddingBottom: 32 },
  divider:           { height: 1, backgroundColor: Colors.border, marginVertical: 24 },
  addRoutineBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 14, marginTop: 24 },
  addRoutineBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  footer:            { padding: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  hint:              { fontSize: 13, color: Colors.error, textAlign: 'center' },
  saveBtn:           { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled:   { opacity: 0.4 },
  saveBtnText:       { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
