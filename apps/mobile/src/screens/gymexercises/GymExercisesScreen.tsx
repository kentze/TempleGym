import { View, Text, StyleSheet, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { useAuthStore } from "../../store/auth.store";
import { GYM_WORKOUT_CATALOG } from "../../../../server/src/data/gymWorkouts";
import type { Exercise } from "@templegym/types";

type GymLocation = "city" | "hillside";

export default function GymExercisesScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  // Automatically derive the gym location from the user's profile, defaulting to 'city'
  const userGym: GymLocation = user?.gymId === "hillside" ? "hillside" : "city";

  // Fetch catalog exclusively for the user's assigned gym
  const rawCatalog = GYM_WORKOUT_CATALOG[userGym] ?? [];
  const exercises: Exercise[] = rawCatalog.map((ex: any, idx: number) => ({
    id: ex.id ?? `${userGym}-${idx}-${ex.name}`,
    name: ex.name,
    category: ex.category ?? "STRENGTH",
    subCategory: ex.subCategory ?? "General",
    muscleGroups: ex.muscleGroups ?? [ex.category ?? "General"],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Gym Catalog</Text>
        <Text style={styles.subtitle}>
          Showing equipment for{" "}
          {userGym === "hillside" ? "Hillside" : "City Campus"}
        </Text>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <View>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseCategory}>{item.category}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises found for this gym.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  exerciseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  exerciseCategory: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    marginTop: 40,
    fontSize: 14,
  },
});
