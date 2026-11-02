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
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { api } from "../../services/api";
import GymTabs from "../../components/GymTabs";
import { useGreetingStore } from "../../store/greeting.store";
import TipCard from "../../components/TipCard";
import RoutinePocket from "../../components/RoutinePocket";
import FolderRoutineList from "../../components/FolderRoutineList";
import type { GymId } from "../../constants/gyms";
import { useAuthStore } from "../../store/auth.store";
import { useWorkoutStore } from "../../store/workout.store";
import { useRoutinesStore } from "../../store/routines.store";
import type { MainStackParamList, SavedRoutine } from "../../navigation/types";
import { seedFromRoutines } from "../../utils/routineSession";
import type {
  SessionType,
  UserProfile,
} from "@templegym/types";

const TIERS = [
  { name: "Champion", min: 2801, color: Colors.champion },
  { name: "Master", min: 2001, color: Colors.masters },
  { name: "Diamond", min: 1401, color: Colors.diamond },
  { name: "Platinum", min: 901, color: Colors.platinum },
  { name: "Gold", min: 501, color: Colors.gold },
  { name: "Silver", min: 201, color: Colors.silver },
  { name: "Bronze", min: 1, color: Colors.bronze },
  { name: "Unranked", min: 0, color: Colors.unranked },
];

function getTier(pts: number) {
  return TIERS.find((t) => pts >= t.min) ?? TIERS[TIERS.length - 1];
}

function tierBg(pts: number) {
  const hex = getTier(pts).color;
  return hex + "18";
}

function tierOuterBg(pts: number) {
  const hex = getTier(pts).color;
  return hex + "0C"; // ~5% — very light halo on the outer card
}

type Nav = NativeStackNavigationProp<MainStackParamList, "Home">;

function detectType(exs: { category: SessionType }[]): SessionType {
  if (!exs.length) return "PUSH";
  const counts = {} as Record<SessionType, number>;
  for (const e of exs) counts[e.category] = (counts[e.category] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as SessionType;
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const greeting = useGreetingStore((s) => s.greeting);
  const setUser = useAuthStore((s) => s.setUser);
  const startSession = useWorkoutStore((s) => s.startSession);
  const startSessionFrom = useWorkoutStore((s) => s.startSessionFrom);

  const {
    folders,
    defaultItems,
    _defaultOpen,
    hydrate,
    addFolder,
    toggleFolder,
    setDefaultOpen,
    deleteFolder,
    deleteDefaultFolder,
    renameFolder,
    renameDefaultFolder,
    _defaultHidden,
    _defaultName,
  } = useRoutinesStore();
  const defaultRoutineName = _defaultName;

  const [infoVisible, setInfoVisible] = useState(false);
  const [folderVisible, setFolderVisible] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  // Which folder is being renamed, and the name typed so far
  const [renameTarget, setRenameTarget] = useState<number | "default" | null>(null);
  const [renameValue, setRenameValue] = useState("");
  // Selects the whole old name when the popup opens, so typing replaces it
  const [renameSelection, setRenameSelection] = useState<{ start: number; end: number } | undefined>();

  // The "..." menu on a folder header: which folder, and how far down the screen to draw it
  const [folderMenu, setFolderMenu] = useState<{ id: number | "default"; top: number } | null>(null);

  // Hydrate persisted routines on mount (scoped to logged-in user)
  useEffect(() => {
    if (user?.id) hydrate(user.id);
  }, [user?.id]);

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

  function openRename(id: number | "default", currentName: string) {
    setRenameValue(currentName);
    setRenameSelection({ start: 0, end: currentName.length });
    setRenameTarget(id);
  }

  function handleConfirmRename() {
    const name = renameValue.trim();
    if (!name || renameTarget === null) return;
    if (renameTarget === "default") renameDefaultFolder(name);
    else renameFolder(renameTarget, name);
    setRenameTarget(null);
  }

  // At least one folder always stays, so the last one cannot be deleted
  const canDeleteFolder = folders.length + (_defaultHidden ? 0 : 1) > 1;

  // Delete a folder after asking
  function confirmDeleteFolder(id: number | "default", name: string) {
    if (!canDeleteFolder) return;
    Alert.alert(`Delete ${name}?`, "Everything saved in it will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => (id === "default" ? deleteDefaultFolder() : deleteFolder(id)),
      },
    ]);
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
    await api
      .get("/me")
      .then(({ data }) => setUser(data))
      .catch(() => {});
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


  function openFolderMenu(id: number | "default", pageY: number) {
    const screenH = Dimensions.get("window").height;
    const menuH = 160; // 3 items ~41px each + 2 dividers + buffer
    const top = Math.min(pageY - 16, screenH - menuH - 20);
    setFolderMenu((prev) => (prev?.id === id ? null : { id, top }));
  }

  function handleStartWorkout() {
    startSession("FULL_BODY");
    navigation.navigate("SessionLogging");
  }

  async function handleSelectGym(gymId: GymId) {
    if (!user || (user.gymId ?? "city") === gymId) return;
    const previous = user;
    setUser({ ...user, gymId });
    try {
      const { data } = await api.patch<UserProfile>("/me/profile", { gymId });
      setUser(data);
    } catch {
      setUser(previous);
    }
  }

  // One Start per folder: a single workout holding every routine in it, in order
  function handleStartFolder(routines: SavedRoutine[]) {
    const seeds = seedFromRoutines(routines);
    startSessionFrom(detectType(seeds.map((seed) => seed.exercise)), seeds);
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
            <Text style={styles.greeting}>{greeting}, {firstName}</Text>
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

        {/* Stats */}
        <View
          style={[
            styles.statsRow,
            (user?.weeklyPoints ?? 0) > 0 && {
              backgroundColor: tierOuterBg(user!.weeklyPoints),
            },
          ]}
        >
          <View style={[styles.statCard, { borderRadius: 10, padding: 8 }]}>
            <Text style={styles.statValue}>{user?.totalPoints ?? 0}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: tierBg(user?.weeklyPoints ?? 0),
                borderRadius: 10,
                padding: 8,
                margin: 7,
              },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: getTier(user?.weeklyPoints ?? 0).color },
              ]}
            >
              {user?.weeklyPoints ?? 0}
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
            <Text
              style={[
                styles.statTier,
                { color: getTier(user?.weeklyPoints ?? 0).color },
              ]}
            >
              {getTier(user?.weeklyPoints ?? 0).name}
            </Text>
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
          <GymTabs
            value={user?.gymId ?? "city"}
            onChange={handleSelectGym}
            style={{ marginLeft: "auto" }}
          />
        </View>
        {/* Today's tip: a suggested day, or a workout fact */}
        <TipCard />

        {/* Start workout */}
        <TouchableOpacity
          style={styles.startWorkoutButton}
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.startWorkoutText}>Start Workout</Text>
        </TouchableOpacity>

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

        <View style={styles.folderList}>
        {/* Default My Routine */}
        {!_defaultHidden && <View>
          <TouchableOpacity
            style={[styles.routinesHeader, _defaultOpen && styles.routinesHeaderJoined]}
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
            <Text style={styles.routinesTitle} numberOfLines={1}>{defaultRoutineName}</Text>
            <TouchableOpacity
              onPress={(e) => openFolderMenu("default", e.nativeEvent.pageY)}
              hitSlop={10}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>

          {_defaultOpen && (
            <RoutinePocket empty={defaultItems.length === 0}>
              <FolderRoutineList
                routines={defaultItems}
                onStart={() => handleStartFolder(defaultItems)}
              />
            </RoutinePocket>
          )}
        </View>}

        {folders.map((routine) => {
          return (
          <View key={routine.id}>
            <TouchableOpacity
              style={[styles.routinesHeader, routine.open && styles.routinesHeaderJoined]}
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
              <Text style={styles.routinesTitle} numberOfLines={1}>{routine.name}</Text>
              <TouchableOpacity
                onPress={(e) => openFolderMenu(routine.id, e.nativeEvent.pageY)}
                hitSlop={10}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>

            {routine.open && (
              <RoutinePocket empty={routine.items.length === 0}>
                <FolderRoutineList
                  routines={routine.items}
                  onStart={() => handleStartFolder(routine.items)}
                />
              </RoutinePocket>
            )}
          </View>
          );
        })}

        </View>

        {/* Info Modal */}
        <Modal visible={infoVisible} transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setInfoVisible(false)}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Session Types</Text>
              <Text style={styles.modalBody}>
                <Text style={styles.modalBold}>Push</Text> — Chest, shoulders
                and triceps. Muscles involved in pushing movements.
              </Text>
              <Text style={styles.modalBody}>
                <Text style={styles.modalBold}>Pull</Text> — Back, biceps and
                rear delts. Muscles involved in pulling movements.
              </Text>
              <Text style={styles.modalBody}>
                <Text style={styles.modalBold}>Legs</Text> — Quads, hamstrings,
                glutes and calves.
              </Text>
              <Text style={styles.modalBody}>
                <Text style={styles.modalBold}>Cardio</Text> — Running, cycling,
                rowing, and other endurance work.
              </Text>
              <Text style={styles.modalBody}>
                <Text style={styles.modalBold}>Full Body</Text> — A mix of upper
                and lower body exercises.
              </Text>
              <Text style={styles.modalHint}>
                Today's suggestion rotates through Push, Pull and Legs, one
                for each day.
              </Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setInfoVisible(false)}
              >
                <Text style={styles.modalCloseText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

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

        {/* Rename Folder Modal */}
        <Modal visible={renameTarget !== null} transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setRenameTarget(null)}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Rename Routine</Text>
              <TextInput
                style={styles.folderInput}
                placeholder="Routine name"
                placeholderTextColor={Colors.textMuted}
                value={renameValue}
                onChangeText={(text) => {
                  setRenameSelection(undefined);
                  setRenameValue(text);
                }}
                selection={renameSelection}
                onSelectionChange={(e) => {
                  const { start, end } = e.nativeEvent.selection;
                  if (renameSelection && (start !== renameSelection.start || end !== renameSelection.end)) {
                    setRenameSelection(undefined);
                  }
                }}
                autoFocus
                selectTextOnFocus
                maxLength={30}
                onSubmitEditing={handleConfirmRename}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.modalClose,
                  !renameValue.trim() && { opacity: 0.4 },
                ]}
                onPress={handleConfirmRename}
                disabled={!renameValue.trim()}
              >
                <Text style={styles.modalCloseText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.planCancelBtn}
                onPress={() => setRenameTarget(null)}
              >
                <Text style={styles.planCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
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

      {/* Folder "..." menu: rename, edit its routines, delete */}
      {folderMenu !== null &&
        (() => {
          const { id } = folderMenu;
          const name = id === "default"
            ? defaultRoutineName
            : (folders.find((f) => f.id === id)?.name ?? "");
          return (
            <Pressable style={styles.popupOverlay} onPress={() => setFolderMenu(null)}>
              <View style={[styles.cardMenu, { top: folderMenu.top }]}>
                <TouchableOpacity
                  style={styles.cardMenuItem}
                  onPress={() => {
                    setFolderMenu(null);
                    openRename(id, name);
                  }}
                >
                  <Ionicons name="pencil-outline" size={16} color={Colors.text} />
                  <Text style={styles.cardMenuText}>Rename</Text>
                </TouchableOpacity>
                <View style={styles.cardMenuDivider} />
                <TouchableOpacity
                  style={styles.cardMenuItem}
                  onPress={() => {
                    setFolderMenu(null);
                    navigation.navigate("EditRoutine", { folderId: id, folderName: name });
                  }}
                >
                  <Ionicons name="add-circle-outline" size={16} color={Colors.text} />
                  <Text style={styles.cardMenuText}>Edit routine</Text>
                </TouchableOpacity>
                {canDeleteFolder && (
                  <>
                    <View style={styles.cardMenuDivider} />
                    <TouchableOpacity
                      style={styles.cardMenuItem}
                      onPress={() => {
                        setFolderMenu(null);
                        confirmDeleteFolder(id, name);
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                      <Text style={[styles.cardMenuText, { color: Colors.error }]}>Delete</Text>
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
  content: { padding: 20, gap: 16, paddingBottom: 24 },

  // Header
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

  // Today's Workout header row
  todayHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBtnText: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },

  // Ghost placeholder card

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 5,
  },
  statCard: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  statValue: { fontSize: 28, fontWeight: "700", color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textMuted },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  statTier: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: 4,
  },

  // Session cards
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  // Horizontal scroll cards (Start a Session)
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
  // Full-width session cards (plan picker modal)

  // Routines
  routinesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  folderList: { gap: 12 },
  routinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  routinesTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  popupOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  routinesHeaderJoined: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },

  // Info modal
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
  modalBody: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  modalBold: { fontWeight: "700", color: Colors.text },
  modalHint: { fontSize: 12, color: Colors.textMuted, fontStyle: "italic" },
  modalClose: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  modalCloseText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  folderInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 15,
    letterSpacing: 0,
  },
  refreshLogoWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 200,
  },
  refreshLogoImg: { width: 38, height: 38, resizeMode: "contain" },
  cardMenu: {
    position: "absolute",
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    minWidth: 160,
  },
  cardMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardMenuText: { fontSize: 14, color: Colors.text, fontWeight: "500" },
  cardMenuDivider: { height: 1, backgroundColor: Colors.border },
  planCancelBtn: { paddingVertical: 10, alignItems: "center" },
  planCancelText: { color: Colors.textMuted, fontSize: 14 },
});
