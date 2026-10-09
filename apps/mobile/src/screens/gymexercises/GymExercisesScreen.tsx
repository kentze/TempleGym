import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GYM_WORKOUT_CATALOG } from "../../../../server/src/data/gymWorkouts";
import { Colors } from "../../constants/colors";

type GymLocation = "city" | "hillside";

export default function GymExercisesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedGym, setSelectedGym] = useState<GymLocation>("city");

  const exercises = GYM_WORKOUT_CATALOG[selectedGym] ?? [];
  const gymTitle = selectedGym === "city" ? "City Campus" : "Hillside";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{gymTitle} Exercises</Text>
      <Text style={styles.subtitle}>
        Available equipment and workouts at your selected gym location.
      </Text>

      {/* Local Gym Toggle Switch */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            selectedGym === "city" && styles.toggleBtnActive,
          ]}
          onPress={() => setSelectedGym("city")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              selectedGym === "city" && styles.toggleTextActive,
            ]}
          >
            City Campus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            selectedGym === "hillside" && styles.toggleBtnActive,
          ]}
          onPress={() => setSelectedGym("hillside")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              selectedGym === "hillside" && styles.toggleTextActive,
            ]}
          >
            Hillside
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {exercises.length === 0 ? (
          <Text style={styles.emptyText}>No exercises found for this gym.</Text>
        ) : (
          exercises.map((ex, idx) => (
            <View
              key={idx}
              style={[
                styles.exerciseRow,
                idx === exercises.length - 1 && styles.lastRow,
              ]}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseCategory}>{ex.category}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: -4 },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  toggleTextActive: {
    color: "#fff",
  },

  listContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  exerciseRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  exerciseInfo: { gap: 3 },
  exerciseName: { fontSize: 16, fontWeight: "600", color: Colors.text },
  exerciseCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
});
