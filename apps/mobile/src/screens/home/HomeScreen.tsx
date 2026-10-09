import { useEffect, useState, useRef } from "react";
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
  Animated,
  LayoutAnimation,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth.store";
import { useWorkoutStore } from "../../store/workout.store";
import { useRoutinesStore } from "../../store/routines.store";
import { GYM_WORKOUT_CATALOG } from "../../../../server/src/data/gymWorkouts";
import type { MainStackParamList } from "../../navigation/types";
import type {
  Exercise,
  SessionType,
  WorkoutSession,
  WorkoutsListResponse,
} from "@templegym/types";

type Nav = NativeStackNavigationProp<MainStackParamList, "Home">;
type Route = RouteProp<MainStackParamList, "Home">;

function detectType(exs: { category: SessionType }[]): SessionType {
  if (!exs.length) return "FULL_BODY";
  const counts = {} as Record<SessionType, number>;
  for (const e of exs) counts[e.category] = (counts[e.category] ?? 0) + 1;
  return Object.entries(counts).sort(
    (a, b) => b[1] - a[1],
  )[0][0] as SessionType;
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const startSession = useWorkoutStore((s) => s.startSession);

  const {
    folders,
    defaultItems,
    _defaultOpen,
    hydrate,
    addFolder,
    toggleFolder,
    addToFolder,
    addToDefault,
    setDefaultOpen,
    removeRoutineItem,
    duplicateRoutineItem,
    replaceRoutineItem,
    deleteFolder,
    deleteDefaultFolder,
    _defaultHidden,
  } = useRoutinesStore();
  const defaultRoutineName = "My Routine";

  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null);
  const [folderVisible, setFolderVisible] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [glowingId, setGlowingId] = useState<number | "default" | null>(null);
  const [popupId, setPopupId] = useState<number | "default" | null>(null);
  const [popupTop, setPopupTop] = useState(0);

  // 3-dot card popup
  const [cardMenuKey, setCardMenuKey] = useState<string | null>(null);
  const [cardMenuTop, setCardMenuTop] = useState(0);

  // Hydrate persisted routines on mount
  useEffect(() => {
    if (user?.id) hydrate(user.id);
  }, [user?.id]);

  // Receive saved/updated routine navigated back from AddRoutineScreen
  useEffect(() => {
    const nr = route.params?.newRoutine;
    const idx = route.params?.replaceIndex;
    if (!nr) return;
    if (idx !== undefined) {
      replaceRoutineItem(nr.folderId, idx, nr);
    } else if (nr.folderId === "default") {
      addToDefault(nr);
    } else {
      addToFolder(nr.folderId as number, nr);
    }
    navigation.setParams({ newRoutine: undefined, replaceIndex: undefined });
  }, [route.params?.newRoutine]);

  function handleAddRoutine() {
    setNewRoutineName("");
    setFolderVisible(true);
  }

  function handleConfirmRoutine() {
    const name = newRoutineName.trim();
    if (!name) return;
    addFolder(name);
    setFolderVisible(false);
  }

  function handleBarbellPress(id: number | "default", pageY: number) {
    setGlowingId(id);
    setTimeout(() => setGlowingId(null), 600);
    setPopupTop(pageY - 16);
    setPopupId((prev) => (prev === id ? null : id));
  }

  const [refreshing, setRefreshing] = useState(false);

  // Temple-logo refresh indicator
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (refreshing) {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 12,
        }),
      ]).start(() => {
        pulseRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(logoScale, {
              toValue: 1.12,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
              toValue: 0.93,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        );
        pulseRef.current.start();
      });
    } else {
      pulseRef.current?.stop();
      pulseRef.current = null;
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [refreshing]);

  async function fetchHomeData() {
    await Promise.all([
      api
        .get<WorkoutsListResponse>("/me/workouts?limit=1")
        .then(({ data }) => {
          setLastWorkout(data.sessions[0] ?? null);
        })
        .catch(() => {}),
      api
        .get("/me")
        .then(({ data }) => setUser(data))
        .catch(() => {}),
    ]);
  }

  useEffect(() => {
    fetchHomeData();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  }

  const firstName = user?.displayName ?? user?.email?.split("@")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Current gym exercises based on user's gymId ('city' or 'hillside')
  const currentGymId = user?.gymId ?? "city";
  const gymExercises = GYM_WORKOUT_CATALOG[currentGymId] ?? [];

  function handleStartEmptySession() {
    startSession("FULL_BODY", []);
    navigation.navigate("SessionLogging");
  }

  function handleStartRoutine(exercises: Exercise[]) {
    startSession(detectType(exercises), exercises);
    navigation.navigate("SessionLogging");
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={["transparent"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{today}</Text>
            <Text style={styles.greeting}>Hey, {firstName}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons Section with increased spacing */}
        <View style={styles.actionButtonsContainer}>
          {/* Start Empty Session Button */}
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={handleStartEmptySession}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.startWorkoutText}>Start Workout</Text>
          </TouchableOpacity>

          {/* Show Exercises Button */}
          <TouchableOpacity
            style={styles.showExercisesButton}
            onPress={() => navigation.navigate("GymExercises")}
            activeOpacity={0.8}
          >
            <Ionicons name="fitness-outline" size={20} color={Colors.primary} />
            <Text style={styles.showExercisesText}>Show exercises</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Routines */}
        <View style={styles.routinesSectionHeader}>
          <Text style={styles.sectionLabel}>Routines</Text>
          <TouchableOpacity onPress={handleAddRoutine} hitSlop={8}>
            <Ionicons
              name="folder-open-outline"
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        {folders.map((routine) => (
          <View key={routine.id} style={styles.routineGroup}>
            <TouchableOpacity
              style={styles.routinesHeader}
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                toggleFolder(routine.id);
              }}
              activeOpacity={0.75}
            >
              <View
                style={{
                  transform: [{ rotate: routine.open ? "90deg" : "0deg" }],
                }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              </View>
              <Text style={styles.routinesTitle}>{routine.name}</Text>
              <TouchableOpacity
                onPress={(e) =>
                  handleBarbellPress(routine.id, e.nativeEvent.pageY)
                }
                hitSlop={8}
              >
                <Ionicons
                  name="barbell-outline"
                  size={20}
                  color={
                    glowingId === routine.id ? Colors.primary : Colors.textMuted
                  }
                />
              </TouchableOpacity>
            </TouchableOpacity>

            {routine.open && (
              <View style={styles.routinesDropdown}>
                {routine.items.map((item, i) => (
                  <View key={i} style={styles.routineCard}>
                    <View style={styles.routineCardHeader}>
                      <Text style={styles.routineCardType}>{item.name}</Text>
                      <TouchableOpacity
                        onPress={(e) =>
                          // @ts-ignore
                          openCardMenu(routine.id, i, e.nativeEvent.pageY)
                        }
                        hitSlop={8}
                      >
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={18}
                          color={Colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.routineCardCount}>
                      {item.exercises.length} exercise
                      {item.exercises.length !== 1 ? "s" : ""}
                    </Text>
                    {item.exercises.length === 0 ? (
                      <Text style={styles.routineCardEmpty}>No exercises</Text>
                    ) : (
                      item.exercises.map((ex, idx, arr) => (
                        <Text
                          key={`${ex.id}-${idx}`}
                          style={
                            idx === arr.length - 1
                              ? styles.routineCardLastEx
                              : styles.routineCardExercise
                          }
                        >
                          {ex.name}
                        </Text>
                      ))
                    )}
                    <TouchableOpacity
                      style={styles.routineCardStart}
                      onPress={() => handleStartRoutine(item.exercises)}
                    >
                      <Text style={styles.routineCardStartText}>Start</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        {/* Default My Routine */}
        {!_defaultHidden && (
          <View style={styles.routineGroup}>
            <TouchableOpacity
              style={styles.routinesHeader}
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setDefaultOpen(!_defaultOpen);
              }}
              activeOpacity={0.75}
            >
              <View
                style={{
                  transform: [{ rotate: _defaultOpen ? "90deg" : "0deg" }],
                }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              </View>
              <Text style={styles.routinesTitle}>{defaultRoutineName}</Text>
              <TouchableOpacity
                onPress={(e) =>
                  handleBarbellPress("default", e.nativeEvent.pageY)
                }
                hitSlop={8}
              >
                <Ionicons
                  name="barbell-outline"
                  size={20}
                  color={
                    glowingId === "default" ? Colors.primary : Colors.textMuted
                  }
                />
              </TouchableOpacity>
            </TouchableOpacity>

            {_defaultOpen && (
              <View style={styles.routinesDropdown}>
                {defaultItems.map((item, i) => (
                  <View key={i} style={styles.routineCard}>
                    <View style={styles.routineCardHeader}>
                      <Text style={styles.routineCardType}>{item.name}</Text>
                      <TouchableOpacity
                        onPress={(e) =>
                          // @ts-ignore
                          openCardMenu("default", i, e.nativeEvent.pageY)
                        }
                        hitSlop={8}
                      >
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={18}
                          color={Colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.routineCardCount}>
                      {item.exercises.length} exercise
                      {item.exercises.length !== 1 ? "s" : ""}
                    </Text>
                    {item.exercises.length === 0 ? (
                      <Text style={styles.routineCardEmpty}>No exercises</Text>
                    ) : (
                      item.exercises.map((ex, idx, arr) => (
                        <Text
                          key={ex.id}
                          style={
                            idx === arr.length - 1
                              ? styles.routineCardLastEx
                              : styles.routineCardExercise
                          }
                        >
                          {ex.name}
                        </Text>
                      ))
                    )}
                    <TouchableOpacity
                      style={styles.routineCardStart}
                      onPress={() => handleStartRoutine(item.exercises)}
                    >
                      <Text style={styles.routineCardStartText}>Start</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        {/* New Folder Modal */}
        <Modal visible={folderVisible} transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setFolderVisible(false)}
          >
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
                style={[
                  styles.modalClose,
                  !newRoutineName.trim() && { opacity: 0.4 },
                ]}
                onPress={handleConfirmRoutine}
                disabled={!newRoutineName.trim()}
              >
                <Text style={styles.modalCloseText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.planCancelBtn}
                onPress={() => setFolderVisible(false)}
              >
                <Text style={styles.planCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </ScrollView>

      {/* Temple-logo pull-to-refresh indicator */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.refreshLogoWrap,
          { top: insets.top + 6, opacity: logoOpacity },
        ]}
      >
        <Animated.Image
          source={require("../../../assets/temple-logo.png")}
          style={[styles.refreshLogoImg, { transform: [{ scale: logoScale }] }]}
        />
      </Animated.View>

      {/* Floating barbell popup */}
      {popupId !== null &&
        (() => {
          const isDefault = popupId === "default";
          const visibleCount = folders.length + (_defaultHidden ? 0 : 1);
          const canDelete = visibleCount > 1;
          const folderName = isDefault
            ? defaultRoutineName
            : (folders.find((f) => f.id === popupId)?.name ?? "");
          return (
            <Pressable
              style={styles.popupOverlay}
              onPress={() => setPopupId(null)}
            >
              <View style={[styles.barbellPopup, { top: popupTop }]}>
                <TouchableOpacity
                  style={styles.popupRow}
                  onPress={() => {
                    setPopupId(null);
                    navigation.navigate("AddRoutine", {
                      folderId: popupId!,
                      folderName,
                    });
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={16}
                    color={Colors.primary}
                  />
                  <Text style={styles.barbellPopupText}>Add new routine</Text>
                </TouchableOpacity>
                {canDelete && (
                  <>
                    <View style={styles.popupDivider} />
                    <TouchableOpacity
                      style={styles.popupRow}
                      onPress={() => {
                        setPopupId(null);
                        if (isDefault) {
                          deleteDefaultFolder();
                        } else {
                          deleteFolder(popupId as number);
                        }
                      }}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={Colors.error}
                      />
                      <Text
                        style={[
                          styles.barbellPopupText,
                          { color: Colors.error },
                        ]}
                      >
                        Delete folder
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </Pressable>
          );
        })()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 20, paddingBottom: 24 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  date: { fontSize: 13, color: Colors.textMuted, marginBottom: 2 },
  greeting: { fontSize: 24, fontWeight: "700", color: Colors.text },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  actionButtonsContainer: {
    gap: 12,
    marginVertical: 4,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },

  showExercisesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  showExercisesText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },

  // Start Workout Button
  startWorkoutButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startWorkoutText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  // Gym Exercises Section
  gymSectionHeader: { marginTop: 4 },
  gymExercisesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 10,
  },
  gymExerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  gymExerciseName: { fontSize: 15, fontWeight: "600", color: Colors.text },
  gymExerciseCategory: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
  },

  // Routines
  routinesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  routineGroup: { gap: 10 },
  routinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  routinesTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  routinesDropdown: { gap: 10 },
  routineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 4,
  },
  routineCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routineCardType: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  routineCardCount: { fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  routineCardEmpty: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: "italic",
    paddingRight: 64,
  },
  routineCardExercise: { fontSize: 14, color: Colors.text },
  routineCardLastEx: { fontSize: 14, color: Colors.text, paddingRight: 64 },
  routineCardStart: {
    position: "absolute",
    right: 16,
    bottom: 10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  routineCardStartText: { fontSize: 13, fontWeight: "700", color: Colors.text },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    gap: 12,
    width: "100%",
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: Colors.text },
  modalClose: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  modalCloseText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  popupOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  barbellPopup: {
    position: "absolute",
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  popupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  popupDivider: { height: 1, backgroundColor: Colors.border },
  barbellPopupText: { fontSize: 13, color: Colors.text, fontWeight: "500" },
  folderInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 15,
  },
  refreshLogoWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 200,
  },
  refreshLogoImg: { width: 38, height: 38, resizeMode: "contain" },
  planCancelBtn: { paddingVertical: 10, alignItems: "center" },
  planCancelText: { color: Colors.textMuted, fontSize: 14 },
});
