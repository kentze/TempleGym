import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import LogoLoader from './LogoLoader';
import GymExerciseList, { gymName, groupName, groupNames } from './GymExerciseList';
import SimpleExerciseList from './SimpleExerciseList';
import MuscleGroupFilter from './MuscleGroupFilter';
import { Colors } from '../constants/colors';
import { isSimpleExercise } from '../constants/simpleExercises';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import type { Exercise } from '@templegym/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  // Exercises already in the workout or routine, so they are not offered again
  excludeIds?: Set<string>;
}

// The Add Exercise sheet shared by the workout screen and the routine builder:
// a Simple tab (upper, lower, cardio) and a Detailed tab (the gym list with a muscle group filter).
export default function ExercisePickerSheet({ visible, onClose, onSelect, excludeIds }: Props) {
  const gymId = useAuthStore((s) => s.user?.gymId) ?? 'city';

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [tab, setTab]             = useState<'simple' | 'detailed'>('simple');
  const [filter, setFilter]       = useState('All');

  // Load the exercises for the user's gym the first time the sheet opens
  useEffect(() => {
    if (!visible || exercises.length > 0 || loading) return;
    setLoading(true);
    setError(null);
    api.get<Exercise[]>('/exercises')
      .then(({ data }) => setExercises(data))
      .catch(() => setError('Could not load exercises.'))
      .finally(() => setLoading(false));
  }, [visible]);

  function handleSelect(exercise: Exercise) {
    onSelect(exercise);
    onClose();
  }

  const pickable         = exercises.filter((e) => !excludeIds?.has(e.id));
  const simplePickable   = pickable.filter(isSimpleExercise);
  const detailedPickable = pickable.filter((e) => !isSimpleExercise(e));
  const filterOptions    = groupNames(detailedPickable);
  const activeFilter     = filterOptions.includes(filter) ? filter : 'All';
  const detailedShown    = activeFilter === 'All'
    ? detailedPickable
    : detailedPickable.filter((e) => groupName(e) === activeFilter);
  const simpleMissing    = exercises.length > 0 && !exercises.some(isSimpleExercise);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <Text style={styles.modalSubtitle}>
              {tab === 'simple'
                ? "New to the gym? Pick the area you're training"
                : `Showing equipment for ${gymName(gymId)}`}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {(['simple', 'detailed'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'simple' ? 'Simple' : 'Detailed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'detailed' && !loading && !error && (
          <MuscleGroupFilter
            options={filterOptions}
            value={activeFilter}
            onChange={setFilter}
          />
        )}

        {loading
          ? <LogoLoader />
          : error
            ? <Text style={styles.emptyText}>{error}</Text>
            : tab === 'simple'
              ? simpleMissing
                ? <Text style={styles.emptyText}>Simple options are not set up yet. Use the Detailed tab.</Text>
                : <SimpleExerciseList
                    exercises={simplePickable}
                    onSelect={handleSelect}
                    emptyText="All simple options already added."
                  />
              : <GymExerciseList
                  key={activeFilter}
                  exercises={detailedShown}
                  onSelect={handleSelect}
                  emptyText="All exercises already added."
                />
        }
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal:         { flex: 1, backgroundColor: Colors.background },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle:    { fontSize: 18, fontWeight: '700', color: Colors.text },
  modalSubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  modalClose:    { color: Colors.primary, fontSize: 16 },
  tabBar:        { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:           { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:     { borderBottomColor: Colors.primary },
  tabText:       { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.text },
  emptyText:     { textAlign: 'center', color: Colors.textMuted, marginTop: 40, paddingHorizontal: 20 },
});
