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
    { name: "High Cable Flies", category: "Chest" },
    { name: "Middle Cable Flies", category: "Chest" },
    { name: "Low Cable Flies", category: "Chest" },
    { name: "Machine Chest Press", category: "Chest" },
    // Back
    { name: "Close Grip Lat Pulldown", category: "Back" },
    { name: "Neutral Grip Lat Pulldown", category: "Back" },
    { name: "Wide Seated Cable Rows", category: "Back" },
    { name: "One Arm Seated Cable Rows", category: "Back" },
    { name: "Reverse Grip Bent Over Rows", category: "Back" },
    { name: "Straight Arm Pulldown", category: "Back" },
    { name: "Pull ups", category: "Back" },
    { name: "Reverse Cable Flies", category: "Back" },
    { name: "Dumbbell Flies", category: "Back" },
    { name: "Face Pulls", category: "Back" },
    // Shoulders
    { name: "Shoulder Press Machine", category: "Shoulders" },
    { name: "Dumbbell Shoulder Press", category: "Shoulders" },
    { name: "Cable Lateral Raise", category: "Shoulders" },
    { name: "Dumbbell Lateral Raise", category: "Shoulders" },
    { name: "Upright Row", category: "Shoulders" },
    // Tricep
    { name: "Cable Tricep Pushdown Rope", category: "Tricep" },
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
    { name: "Dumbbell Bulgarian Split Squats", category: "Legs" },
    { name: "Barbell Bulgarian Split Squats", category: "Legs" },
    { name: "Cable Leg Flies", category: "Legs" },
    { name: "Machine Calf Raises", category: "Legs" },
    { name: "Dumbbell Calf Raises", category: "Legs" },
    { name: "Farmer Walks", category: "Legs" },
  ],
  hillside: [
    // Chest
    { name: "Smith machine bench press", category: "Chest" },
    { name: "Dumbbell Chest Press", category: "Chest" },
    { name: "Bench Press", category: "Chest" },
    { name: "Incline Dumbbell Chest Press", category: "Chest" },
    { name: "Incline Bench Press", category: "Chest" },
    { name: "High Cable Flies", category: "Chest" },
    { name: "Middle Cable Flies", category: "Chest" },
    { name: "Low Cable Flies", category: "Chest" },
    { name: "Machine Chest Press", category: "Chest" },
    // Back
    { name: "Smith machine rows", category: "Back" },
    { name: "Close Grip Lat Pulldown", category: "Back" },
    { name: "Neutral Grip Lat Pulldown", category: "Back" },
    { name: "Wide Seated Cable Rows", category: "Back" },
    { name: "One Arm Seated Cable Rows", category: "Back" },
    { name: "Reverse Grip Bent Over Rows", category: "Back" },
    { name: "Straight Arm Pulldown", category: "Back" },
    { name: "Pull ups", category: "Back" },
    { name: "Reverse Cable Flies", category: "Back" },
    { name: "Dumbbell Flies", category: "Back" },
    { name: "Face Pulls", category: "Back" },
    { name: "One arm machine rows", category: "Back" },
    // Shoulders
    { name: "Shoulder Press Machine", category: "Shoulders" },
    { name: "Dumbbell Shoulder Press", category: "Shoulders" },
    { name: "Cable Lateral Raise", category: "Shoulders" },
    { name: "Dumbbell Lateral Raise", category: "Shoulders" },
    { name: "Upright Row", category: "Shoulders" },
    // Tricep
    { name: "Cable Tricep Pushdown Rope", category: "Tricep" },
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
    { name: "Dumbbell Bulgarian Split Squats", category: "Legs" },
    { name: "Barbell Bulgarian Split Squats", category: "Legs" },
    { name: "Cable Leg Flies", category: "Legs" },
    { name: "Machine Calf Raises", category: "Legs" },
    { name: "Dumbbell Calf Raises", category: "Legs" },
    { name: "Farmer Walks", category: "Legs" },
    { name: "Sled leg press", category: "Legs" },
    { name: "Machine hip thrust", category: "Legs" },
    { name: "Deadlift Assist", category: "Legs" },
  ],
};
