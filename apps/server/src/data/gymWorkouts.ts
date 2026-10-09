// apps/server/src/data/gymWorkouts.ts

export type MuscleGroup = "Chest" | "Back" | "Shoulders" | "Tricep" | "Legs";

export interface ExerciseItem {
  name: string;
  category: MuscleGroup;
}

export const GYM_WORKOUT_CATALOG: Record<string, ExerciseItem[]> = {
  city: [
    // Chest
    { name: "Dumbbell Chest Press", category: "Chest" },
    { name: "Bench Press", category: "Chest" },
    { name: "Incline Dumbbell Chest Press", category: "Chest" },
    { name: "Incline Bench Press", category: "Chest" },
    { name: "Cable Flies (High, Middle, Low)", category: "Chest" },
    { name: "Machine Chest Press", category: "Chest" },
    // Back
    { name: "Lat Pull down (Close Grip, Neutral Grip)", category: "Back" },
    { name: "Seated Cable Rows (Wide, One Arm)", category: "Back" },
    { name: "Bent Over Rows (Reverse Grip)", category: "Back" },
    { name: "Straight Arm Pulldown", category: "Back" },
    { name: "Pull ups", category: "Back" },
    { name: "Reverse Cable Flies", category: "Back" },
    { name: "Dumbbell Flies", category: "Back" },
    { name: "Face Pulls", category: "Back" },
    // Shoulders
    { name: "Shoulder Press Machine", category: "Shoulders" },
    { name: "Dumbbell Shoulder Press", category: "Shoulders" },
    { name: "Cable Lateral Raise (Dumbbell)", category: "Shoulders" },
    { name: "Upright Row", category: "Shoulders" },
    // Tricep
    { name: "Cable Tricep Pushdown (Rope)", category: "Tricep" },
    { name: "Cable Tricep Overhead", category: "Tricep" },
    { name: "Skull crushers", category: "Tricep" },
    { name: "One Arm Cable Pulldowns", category: "Tricep" },
    { name: "Tricep Kickbacks", category: "Tricep" },
    // Legs
    { name: "Barbell Squats", category: "Legs" },
    { name: "Leg Extensions", category: "Legs" },
    { name: "Leg Curls", category: "Legs" },
    { name: "Leg Press", category: "Legs" },
    { name: "Deadlifts", category: "Legs" },
    { name: "Bulgarian Split Squats (Dumbbell or Barbell)", category: "Legs" },
    { name: "Cable Leg Flies", category: "Legs" },
    { name: "Calf Raises (Machine or Dumbbell)", category: "Legs" },
    { name: "Farmer Walks", category: "Legs" },
  ],
  hillside: [
    // Chest
    { name: "Smith machine bench press", category: "Chest" },
    { name: "Dumbbell Chest Press", category: "Chest" },
    { name: "Bench Press", category: "Chest" },
    { name: "Incline Dumbbell Chest Press", category: "Chest" },
    { name: "Incline Bench Press", category: "Chest" },
    { name: "Cable Flies (High, Middle, Low)", category: "Chest" },
    { name: "Machine Chest Press", category: "Chest" },
    // Back
    { name: "Smith machine rows", category: "Back" },
    { name: "Lat Pull down (Close Grip, Neutral Grip)", category: "Back" },
    { name: "Seated Cable Rows (Wide, One Arm)", category: "Back" },
    { name: "Bent Over Rows (Reverse Grip)", category: "Back" },
    { name: "Straight Arm Pulldown", category: "Back" },
    { name: "Pull ups", category: "Back" },
    { name: "Reverse Cable Flies", category: "Back" },
    { name: "Dumbbell Flies", category: "Back" },
    { name: "Face Pulls", category: "Back" },
    { name: "One arm machine rows", category: "Back" },
    // Shoulders
    { name: "Shoulder Press Machine", category: "Shoulders" },
    { name: "Dumbbell Shoulder Press", category: "Shoulders" },
    { name: "Cable Lateral Raise (Dumbbell)", category: "Shoulders" },
    { name: "Upright Row", category: "Shoulders" },
    // Tricep
    { name: "Cable Tricep Pushdown (Rope)", category: "Tricep" },
    { name: "Cable Tricep Overhead", category: "Tricep" },
    { name: "Skull crushers", category: "Tricep" },
    { name: "One Arm Cable Pulldowns", category: "Tricep" },
    { name: "Tricep Kickbacks", category: "Tricep" },
    // Legs
    { name: "Barbell Squats", category: "Legs" },
    { name: "Leg Extensions", category: "Legs" },
    { name: "Leg Curls", category: "Legs" },
    { name: "Leg Press", category: "Legs" },
    { name: "Deadlifts", category: "Legs" },
    { name: "Bulgarian Split Squats (Dumbbell or Barbell)", category: "Legs" },
    { name: "Cable Leg Flies", category: "Legs" },
    { name: "Calf Raises (Machine or Dumbbell)", category: "Legs" },
    { name: "Farmer Walks", category: "Legs" },
    { name: "Sled leg press", category: "Legs" },
    { name: "Machine hip thrust", category: "Legs" },
    { name: "Deadlift Assist", category: "Legs" },
  ],
};
