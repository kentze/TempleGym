import React, { useEffect, useState } from 'react';
import { MotiView } from 'moti';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { api } from '../../services/api';

const TIERS = [
  { name: 'Champion', min: 2801, color: '#FF4500' },
  { name: 'Master',   min: 2001, color: '#C084FC' },
  { name: 'Diamond',  min: 1401, color: '#67E8F9' },
  { name: 'Platinum', min: 901,  color: '#94A3B8' },
  { name: 'Gold',     min: 501,  color: '#F0C040' },
  { name: 'Silver',   min: 201,  color: '#CBD5E1' },
  { name: 'Bronze',   min: 1,    color: '#CD7F32' },
  { name: 'Unranked', min: 0,    color: '#6B7280' },
];

function getTier(pts: number) {
  return TIERS.find((t) => pts >= t.min) ?? TIERS[TIERS.length - 1];
}

function tierBg(pts: number) {
  const hex = getTier(pts).color;
  return hex + '18';
}
import { useAuthStore } from '../../store/auth.store';
import { useWorkoutStore } from '../../store/workout.store';
import { useRoutinesStore } from '../../store/routines.store';
import type { MainStackParamList } from '../../navigation/types';
import type { SessionType, Exercise, WorkoutSession, WorkoutsListResponse } from '@templegym/types';

type Nav   = NativeStackNavigationProp<MainStackParamList, 'Home'>;
type Route = RouteProp<MainStackParamList, 'Home'>;

const SESSION_INFO: Record<SessionType, { label: string; description: string }> = {
  PUSH: { label: 'Push', description: 'Chest, shoulders and triceps' },
  PULL: { label: 'Pull', description: 'Back, biceps and rear delts' },
};

const SESSION_CARDS: { type: SessionType; label: string; description: string }[] = [
  { type: 'PUSH', label: 'Push', description: 'Chest, shoulders and triceps' },
  { type: 'PULL', label: 'Pull', description: 'Back, biceps and rear delts' },
];


function suggestedSession(lastType: SessionType | null): SessionType {
  if (!lastType || lastType === 'PULL') return 'PUSH';
  return 'PULL';
}

function detectType(exs: { category: SessionType }[]): SessionType {
  const push = exs.filter((e) => e.category === 'PUSH').length;
  return push >= exs.length / 2 ? 'PUSH' : 'PULL';
}

export default function HomeScreen() {
  const navigation   = useNavigation<Nav>();
  const route        = useRoute<Route>();
  const insets       = useSafeAreaInsets();
  const user         = useAuthStore((s) => s.user);
  const setUser      = useAuthStore((s) => s.setUser);
  const startSession = useWorkoutStore((s) => s.startSession);

  const {
    folders, defaultItems, _defaultOpen,
    hydrate, addFolder, toggleFolder, addToFolder, addToDefault, setDefaultOpen,
  } = useRoutinesStore();
  const defaultRoutineName = 'My Routine';

  const [lastWorkout, setLastWorkout]   = useState<WorkoutSession | null>(null);
  const [infoVisible, setInfoVisible]   = useState(false);
  const [planVisible, setPlanVisible]   = useState(false);
  const [folderVisible, setFolderVisible]   = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [glowingId, setGlowingId]         = useState<number | 'default' | null>(null);
  const [popupId, setPopupId]             = useState<number | 'default' | null>(null);
  const [popupTop, setPopupTop]           = useState(0);

  // Hydrate persisted routines on mount
  useEffect(() => { hydrate(); }, []);

  // Receive saved routine navigated back from AddRoutineScreen
  useEffect(() => {
    const nr = route.params?.newRoutine;
    if (!nr) return;
    if (nr.folderId === 'default') {
      addToDefault(nr);
    } else {
      addToFolder(nr.folderId as number, nr);
    }
    navigation.setParams({ newRoutine: undefined });
  }, [route.params?.newRoutine]);

  function handleAddRoutine() {
    setNewRoutineName('');
    setFolderVisible(true);
  }

  function handleConfirmRoutine() {
    const name = newRoutineName.trim();
    if (!name) return;
    addFolder(name);
    setFolderVisible(false);
  }

  function handleBarbellPress(id: number | 'default', pageY: number) {
    setGlowingId(id);
    setTimeout(() => setGlowingId(null), 600);
    setPopupTop(pageY - 16);
    setPopupId((prev) => (prev === id ? null : id));
  }
  const [exercises, setExercises]   = useState<{ PUSH: Exercise[]; PULL: Exercise[] }>({ PUSH: [], PULL: [] });
  const [refreshing, setRefreshing] = useState(false);

  async function fetchHomeData() {
    await Promise.all([
      api.get<WorkoutsListResponse>('/me/workouts?limit=1').then(({ data }) => {
        setLastWorkout(data.sessions[0] ?? null);
      }).catch(() => {}),
      api.get<Exercise[]>('/exercises').then(({ data }) => {
        setExercises({
          PUSH: data.filter((e) => e.category === 'PUSH'),
          PULL: data.filter((e) => e.category === 'PULL'),
        });
      }).catch(() => {}),
      api.get('/me').then(({ data }) => setUser(data)).catch(() => {}),
    ]);
  }

  useEffect(() => { fetchHomeData(); }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  }

  const firstName = user?.displayName
    ?? user?.email?.split('@')[0]
    ?? 'there';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const todayType    = suggestedSession(lastWorkout?.type ?? null);
  const todaySession = SESSION_INFO[todayType];

  function handleStart(type: SessionType) {
    setPlanVisible(false);
    startSession(type);
    navigation.navigate('SessionLogging');
  }

  return (
    <View style={styles.screen}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{today}</Text>
          <Text style={styles.greeting}>Hey, {firstName}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderRadius: 10, padding: 8 }]}>
          <Text style={styles.statValue}>{user?.totalPoints ?? 0}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={[styles.statCard, { backgroundColor: tierBg(user?.weeklyPoints ?? 0), borderRadius: 10, padding: 8 }]}>
          <Text style={[styles.statValue, { color: getTier(user?.weeklyPoints ?? 0).color }]}>{user?.weeklyPoints ?? 0}</Text>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={[styles.statTier, { color: getTier(user?.weeklyPoints ?? 0).color }]}>{getTier(user?.weeklyPoints ?? 0).name}</Text>
        </View>
      </View>

      {/* Today's Workout */}
      <View style={styles.todayHeader}>
        <Text style={styles.sectionLabel}>Today's Workout</Text>
        <TouchableOpacity onPress={() => setInfoVisible(true)} hitSlop={8}>
          <View style={styles.infoBtn}>
            <Text style={styles.infoBtnText}>?</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.ghostCard}
        onPress={() => setPlanVisible(true)}
        activeOpacity={0.75}
      >
        <Ionicons name="add-circle-outline" size={22} color={Colors.textMuted} />
        <View style={styles.ghostCardBody}>
          <Text style={styles.ghostCardTitle}>Plan today's workout</Text>
          <Text style={styles.ghostCardSub}>{todaySession.label} day recommended</Text>
        </View>
      </TouchableOpacity>

      {/* Start a Session */}
      <Text style={styles.sectionLabel}>Start a Session</Text>
      <View style={styles.sessionCards}>
        {SESSION_CARDS.map((card) => (
          <TouchableOpacity
            key={card.type}
            style={styles.sessionCard}
            onPress={() => handleStart(card.type)}
            activeOpacity={0.75}
          >
            <View style={styles.sessionCardAccent} />
            <View style={styles.sessionCardBody}>
              <Text style={styles.sessionCardLabel}>{card.label}</Text>
              <Text style={styles.sessionCardDesc}>{card.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} style={styles.sessionCardChevron} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Routines */}
      <View style={styles.routinesSectionHeader}>
        <Text style={styles.sectionLabel}>Routines</Text>
        <TouchableOpacity onPress={handleAddRoutine} hitSlop={8}>
          <Ionicons name="folder-open-outline" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {folders.map((routine) => (
        <View key={routine.id} style={styles.routineGroup}>
          <TouchableOpacity
            style={styles.routinesHeader}
            onPress={() => toggleFolder(routine.id)}
            activeOpacity={0.75}
          >
            <MotiView
              animate={{ rotate: routine.open ? '90deg' : '0deg' }}
              transition={{ type: 'timing', duration: 200 }}
            >
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </MotiView>
            <Text style={styles.routinesTitle}>{routine.name}</Text>
            <TouchableOpacity onPress={(e) => handleBarbellPress(routine.id, e.nativeEvent.pageY)} hitSlop={8}>
              <MotiView animate={{ scale: glowingId === routine.id ? 1.3 : 1 }} transition={{ type: 'spring', damping: 8 }}>
                <Ionicons name="barbell-outline" size={20} color={glowingId === routine.id ? Colors.primary : Colors.textMuted} />
              </MotiView>
            </TouchableOpacity>
          </TouchableOpacity>

          {routine.open && (
            <MotiView
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 200 }}
              style={styles.routinesDropdown}
            >
              {(['PUSH', 'PULL'] as SessionType[]).map((type) => (
                <View key={type} style={styles.routineCard}>
                  <Text style={styles.routineCardType}>{SESSION_INFO[type].label}</Text>
                  <Text style={styles.routineCardCount}>{exercises[type].length} exercises</Text>
                  {exercises[type].map((ex, idx, arr) => (
                    <Text
                      key={ex.id}
                      style={idx === arr.length - 1 ? styles.routineCardLastEx : styles.routineCardExercise}
                    >{ex.name}</Text>
                  ))}
                  <TouchableOpacity style={styles.routineCardStart} onPress={() => handleStart(type)}>
                    <Text style={styles.routineCardStartText}>Start</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {routine.items.map((item, i) => (
                <View key={i} style={styles.routineCard}>
                  <Text style={styles.routineCardType}>{item.name}</Text>
                  <Text style={styles.routineCardCount}>{item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''}</Text>
                  {item.exercises.map((ex, idx, arr) => (
                    <Text
                      key={ex.id}
                      style={idx === arr.length - 1 ? styles.routineCardLastEx : styles.routineCardExercise}
                    >{ex.name}</Text>
                  ))}
                  <TouchableOpacity style={styles.routineCardStart} onPress={() => handleStart(detectType(item.exercises))}>
                    <Text style={styles.routineCardStartText}>Start</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </MotiView>
          )}
        </View>
      ))}

      {/* Default My Routine — always present, cannot be deleted */}
      <View style={styles.routineGroup}>
        <TouchableOpacity
          style={styles.routinesHeader}
          onPress={() => setDefaultOpen(!_defaultOpen)}
          activeOpacity={0.75}
        >
          <MotiView
            animate={{ rotate: _defaultOpen ? '90deg' : '0deg' }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </MotiView>
          <Text style={styles.routinesTitle}>{defaultRoutineName}</Text>
          <TouchableOpacity onPress={(e) => handleBarbellPress('default', e.nativeEvent.pageY)} hitSlop={8}>
            <MotiView animate={{ scale: glowingId === 'default' ? 1.3 : 1 }} transition={{ type: 'spring', damping: 8 }}>
              <Ionicons name="barbell-outline" size={20} color={glowingId === 'default' ? Colors.primary : Colors.textMuted} />
            </MotiView>
          </TouchableOpacity>
        </TouchableOpacity>

        {_defaultOpen && (
          <MotiView
            from={{ opacity: 0, translateY: -6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.routinesDropdown}
          >
            {(['PUSH', 'PULL'] as SessionType[]).map((type) => (
              <View key={type} style={styles.routineCard}>
                <Text style={styles.routineCardType}>{SESSION_INFO[type].label}</Text>
                <Text style={styles.routineCardCount}>{exercises[type].length} exercises</Text>
                {exercises[type].map((ex, idx, arr) => (
                  <Text
                    key={ex.id}
                    style={idx === arr.length - 1 ? styles.routineCardLastEx : styles.routineCardExercise}
                  >{ex.name}</Text>
                ))}
                <TouchableOpacity style={styles.routineCardStart} onPress={() => handleStart(type)}>
                  <Text style={styles.routineCardStartText}>Start</Text>
                </TouchableOpacity>
              </View>
            ))}

            {defaultItems.map((item, i) => (
              <View key={i} style={styles.routineCard}>
                <Text style={styles.routineCardType}>{item.name}</Text>
                <Text style={styles.routineCardCount}>{item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''}</Text>
                {item.exercises.map((ex, idx, arr) => (
                  <Text
                    key={ex.id}
                    style={idx === arr.length - 1 ? styles.routineCardLastEx : styles.routineCardExercise}
                  >{ex.name}</Text>
                ))}
                <TouchableOpacity style={styles.routineCardStart} onPress={() => handleStart(detectType(item.exercises))}>
                  <Text style={styles.routineCardStartText}>Start</Text>
                </TouchableOpacity>
              </View>
            ))}
          </MotiView>
        )}
      </View>

      {/* Info Modal */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setInfoVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Push / Pull Split</Text>
            <Text style={styles.modalBody}>
              The Push/Pull split alternates muscle groups so each group gets a full day of rest before being trained again.
            </Text>
            <Text style={styles.modalBody}>
              <Text style={styles.modalBold}>Push</Text> — Chest, shoulders and triceps. Muscles involved in pushing movements.
            </Text>
            <Text style={styles.modalBody}>
              <Text style={styles.modalBold}>Pull</Text> — Back, biceps and rear delts. Muscles involved in pulling movements.
            </Text>
            <Text style={styles.modalHint}>
              Today's suggestion is based on your last session.
            </Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setInfoVisible(false)}>
              <Text style={styles.modalCloseText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Plan Picker Modal */}
      <Modal visible={planVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPlanVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose your session</Text>
            <Text style={styles.modalHint}>{todaySession.label} day recommended based on your last session.</Text>
            {SESSION_CARDS.map((card) => (
              <TouchableOpacity
                key={card.type}
                style={[styles.sessionCard, card.type === todayType && styles.planCardHighlight]}
                onPress={() => handleStart(card.type)}
                activeOpacity={0.75}
              >
                <View style={styles.sessionCardAccent} />
                <View style={styles.sessionCardBody}>
                  <Text style={styles.sessionCardLabel}>{card.label}</Text>
                  <Text style={styles.sessionCardDesc}>{card.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} style={styles.sessionCardChevron} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.planCancelBtn} onPress={() => setPlanVisible(false)}>
              <Text style={styles.planCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* New Folder Modal */}
      <Modal visible={folderVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setFolderVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Routine</Text>
            <TextInput
              style={styles.folderInput}
              placeholder="Routine name"
              placeholderTextColor={Colors.textMuted}
              value={newRoutineName}
              onChangeText={setNewRoutineName}
              autoFocus
              maxLength={30}
              onSubmitEditing={handleConfirmRoutine}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.modalClose, !newRoutineName.trim() && { opacity: 0.4 }]}
              onPress={handleConfirmRoutine}
              disabled={!newRoutineName.trim()}
            >
              <Text style={styles.modalCloseText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.planCancelBtn} onPress={() => setFolderVisible(false)}>
              <Text style={styles.planCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </ScrollView>

    {/* Floating barbell popup — outside ScrollView so it overlays everything */}
    {popupId !== null && (() => {
      const folderName = popupId === 'default'
        ? defaultRoutineName
        : (folders.find((r) => r.id === popupId)?.name ?? '');
      return (
        <Pressable style={styles.popupOverlay} onPress={() => setPopupId(null)}>
          <TouchableOpacity
            style={[styles.barbellPopup, { top: popupTop }]}
            onPress={() => {
              const targetId = popupId;
              const name = targetId === 'default'
                ? defaultRoutineName
                : (folders.find((r) => r.id === targetId)?.name ?? '');
              setPopupId(null);
              navigation.navigate('AddRoutine', { folderId: targetId!, folderName: name });
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.barbellPopupText}>Add new routine</Text>
          </TouchableOpacity>
        </Pressable>
      );
    })()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen:                { flex: 1 },
  container:             { flex: 1, backgroundColor: Colors.background },
  content:               { padding: 20, gap: 16, paddingBottom: 24 },

  // Header
  header:                { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  date:                  { fontSize: 13, color: Colors.textMuted, marginBottom: 2 },
  greeting:              { fontSize: 24, fontWeight: '700', color: Colors.text },
  settingsBtn:           { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },

  // Today's Workout header row
  todayHeader:           { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoBtn:               { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: Colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  infoBtnText:           { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },

  // Ghost placeholder card
  ghostCard:             { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', padding: 18, gap: 12 },
  ghostCardBody:         { gap: 3 },
  ghostCardTitle:        { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
  ghostCardSub:          { fontSize: 12, color: Colors.textMuted },

  // Stats
  statsRow:              { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 8 },
  statCard:              { flex: 1, alignItems: 'center', gap: 4 },
  statValue:             { fontSize: 28, fontWeight: '700', color: Colors.primary },
  statLabel:             { fontSize: 12, color: Colors.textMuted },
  statDivider:           { width: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  statTier:              { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Session cards
  sectionLabel:          { fontSize: 13, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5 },
  sessionCards:          { gap: 10 },
  sessionCard:           { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  sessionCardAccent:     { width: 4, alignSelf: 'stretch', backgroundColor: Colors.primary },
  sessionCardBody:       { flex: 1, paddingVertical: 18, paddingHorizontal: 16, gap: 4 },
  sessionCardLabel:      { fontSize: 17, fontWeight: '700', color: Colors.text },
  sessionCardDesc:       { fontSize: 13, color: Colors.textMuted },
  sessionCardChevron:    { marginRight: 16 },

  // Routines
  routinesSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routineGroup:          { gap: 10 },
  routinesHeader:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 12 },
  routinesTitle:         { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  routinesDropdown:      { gap: 10 },
  routineCard:           { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 10, gap: 4 },
  routineCardType:       { fontSize: 17, fontWeight: '700', color: Colors.text },
  routineCardCount:      { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  routineCardExercise:   { fontSize: 14, color: Colors.text },
  routineCardLastEx:     { fontSize: 14, color: Colors.text, paddingRight: 64 },
  routineCardStart:      { position: 'absolute', right: 16, bottom: 10, backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  routineCardStartText:  { fontSize: 13, fontWeight: '700', color: Colors.text },

  // Info modal
  modalOverlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalCard:             { backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 24, gap: 12, width: '100%' },
  modalTitle:            { fontSize: 17, fontWeight: '700', color: Colors.text },
  modalBody:             { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  modalBold:             { fontWeight: '700', color: Colors.text },
  modalHint:             { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  modalClose:            { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  modalCloseText:        { color: Colors.text, fontSize: 15, fontWeight: '600' },
  planCardHighlight:     { borderColor: Colors.primary },
  popupOverlay:          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  barbellPopup:          { position: 'absolute', right: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 5 },
  barbellPopupText:      { fontSize: 13, color: Colors.text, fontWeight: '500' },
  folderInput:           { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: Colors.text, fontSize: 15, letterSpacing: 0 },
  planCancelBtn:         { paddingVertical: 10, alignItems: 'center' },
  planCancelText:        { color: Colors.textMuted, fontSize: 14 },
});
