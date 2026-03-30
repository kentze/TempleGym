import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import type { MainStackParamList } from '../../navigation/types';
import type { Exercise } from '@templegym/types';


type Nav   = NativeStackNavigationProp<MainStackParamList, 'AddRoutine'>;
type Route = RouteProp<MainStackParamList, 'AddRoutine'>;

export default function AddRoutineScreen() {
  const navigation    = useNavigation<Nav>();
  const route         = useRoute<Route>();
  const { params }    = route;
  const insets        = useSafeAreaInsets();
  const [name, setName]           = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // When ExercisePicker navigates back with a selected exercise
  useEffect(() => {
    if (params?.selectedExercise) {
      setExercises((prev) => {
        if (prev.some((e) => e.id === params.selectedExercise!.id)) return prev;
        return [...prev, params.selectedExercise!];
      });
      navigation.setParams({ selectedExercise: undefined });
    }
  }, [params?.selectedExercise]);

  function handleAddExercise() {
    navigation.navigate('ExercisePicker', {
      folderId:   params.folderId,
      folderName: params.folderName,
    });
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerLabel}>Adding to</Text>
          <Text style={styles.headerFolder}>{params.folderName}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Routine Name */}
        <Text style={styles.sectionLabel}>Routine Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Upper Body, Leg Day, Cardio..."
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus
          maxLength={40}
          returnKeyType="done"
        />

        {/* Workout Content */}
        <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Workout Content</Text>

        {exercises.length === 0 ? (
          <View style={styles.emptyContent}>
            <Ionicons name="barbell-outline" size={28} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No exercises added yet</Text>
          </View>
        ) : (
          <View style={styles.exerciseList}>
            {exercises.map((ex, i) => (
              <View key={ex.id} style={styles.exerciseRow}>
                <View style={styles.exerciseOrder}>
                  <Text style={styles.exerciseOrderNum}>{i + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseMuscles}>{ex.muscleGroups.join(', ')}</Text>
                </View>
                <TouchableOpacity onPress={() => removeExercise(ex.id)} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* + Exercise */}
        <TouchableOpacity style={styles.addExerciseBtn} onPress={handleAddExercise} activeOpacity={0.75}>
          <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.addExerciseBtnText}>+ Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
          onPress={() => {
            navigation.navigate('Home', {
              newRoutine: {
                folderId:  params.folderId,
                name:      name.trim(),
                exercises,
              },
            });
          }}
          disabled={!name.trim()}
        >
          <Text style={styles.saveBtnText}>Save Routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.background },
  header:             { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  backBtn:            { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle:        { gap: 1 },
  headerLabel:        { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  headerFolder:       { fontSize: 16, fontWeight: '700', color: Colors.text },
  content:            { padding: 20, gap: 10, paddingBottom: 24 },
  sectionLabel:       { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionSpacing:     { marginTop: 12 },
  input:              { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.text, fontSize: 16 },
  emptyContent:       { alignItems: 'center', paddingVertical: 24, gap: 8, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  emptyText:          { fontSize: 13, color: Colors.textMuted },
  exerciseList:       { gap: 8 },
  exerciseRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12, gap: 12 },
  exerciseOrder:      { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryFaded, alignItems: 'center', justifyContent: 'center' },
  exerciseOrderNum:   { fontSize: 13, fontWeight: '700', color: Colors.primary },
  exerciseInfo:       { flex: 1, gap: 2 },
  exerciseName:       { fontSize: 15, fontWeight: '600', color: Colors.text },
  exerciseMuscles:    { fontSize: 12, color: Colors.textMuted },
  addExerciseBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 14, marginTop: 4 },
  addExerciseBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  footer:             { padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: Colors.border },
  saveBtn:            { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled:    { opacity: 0.4 },
  saveBtnText:        { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
