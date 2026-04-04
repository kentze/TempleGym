import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PUSH = "PUSH" as const;
const PULL = "PULL" as const;

async function main() {
  console.log("Seeding exercises...");

  const exercises = [
    // PUSH
    {
      name: "Bench Press",
      category: PUSH,
      subCategory: null,
      muscleGroups: ["Chest", "Triceps"],
    },
    {
      name: "Overhead Press",
      category: PUSH,
      subCategory: null,
      muscleGroups: ["Shoulders", "Triceps"],
    },
    {
      name: "Chest Fly",
      category: PUSH,
      subCategory: null,
      muscleGroups: ["Chest"],
    },
    {
      name: "Tricep Pushdown",
      category: PUSH,
      subCategory: null,
      muscleGroups: ["Triceps"],
    },
    {
      name: "Lateral Raise",
      category: PUSH,
      subCategory: null,
      muscleGroups: ["Shoulders"],
    },
    {
      name: "Incline Press",
      category: PUSH,
      subCategory: null,
      muscleGroups: ["Chest", "Shoulders"],
    },
    {
      name: "Dips",
      category: PUSH,
      subCategory: null,
      muscleGroups: ["Chest", "Triceps"],
    },
    {
      name: "Push-Up",
      category: PUSH,
      subCategory: null,
      muscleGroups: ["Chest", "Triceps", "Shoulders"],
    },
    {
      name: "Overhead Tricep Extension",
      category: PUSH,
      subCategory: null,
      muscleGroups: ["Triceps"],
    },

    // PULL
    {
      name: "Seated Cable Row",
      category: PULL,
      subCategory: "Horizontal Pull",
      muscleGroups: ["Back", "Biceps"],
    },
    {
      name: "Renegade Row",
      category: PULL,
      subCategory: "Horizontal Pull",
      muscleGroups: ["Back", "Core"],
    },
    {
      name: "Lat Pulldown",
      category: PULL,
      subCategory: "Vertical Pull",
      muscleGroups: ["Lats", "Biceps"],
    },
    {
      name: "Barbell Curl",
      category: PULL,
      subCategory: null,
      muscleGroups: ["Biceps"],
    },
    {
      name: "Face Pull",
      category: PULL,
      subCategory: "Horizontal Pull",
      muscleGroups: ["Rear Delts", "Traps"],
    },
    {
      name: "Pull-Up",
      category: PULL,
      subCategory: "Vertical Pull",
      muscleGroups: ["Lats", "Biceps"],
    },
    {
      name: "Dumbell Curl",
      category: PULL,
      subCategory: null,
      muscleGroups: ["Biceps"],
    },
    {
      name: "Hammer Curl",
      category: PULL,
      subCategory: null,
      muscleGroups: ["Biceps", "Forearms"],
    },
    {
      name: "Back Extension",
      category: PULL,
      subCategory: null,
      muscleGroups: ["Lower Back"],
    },
    {
      name: "Rear Delt Fly",
      category: PULL,
      subCategory: "Horizontal Pull",
      muscleGroups: ["Rear Delts"],
    },
    //LEGS
    {
      name: "Squat",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    {
      name: "Deadlift",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    },
    {
      name: "Leg Press",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Quads", "Glutes"],
    },
    {
      name: "Lunges",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    {
      name: "Leg Curl",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Hamstrings"],
    },
    {
      name: "Calf Raise",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Calves"],
    },
    {
      name: "Hip Thrust",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Glutes"],
    },
    {
      name: "Bulgarian Split Squat",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    {
      name: "Hip Abduction",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Glute Medius"],
    },
    {
      name: "Hip Adduction",
      category: "LEGS",
      subCategory: null,
      muscleGroups: ["Adductors"],
    },

    //CARDIO
    {
      name: "Running",
      category: "CARDIO",
      subCategory: null,
      muscleGroups: ["Cardio"],
    },
    {
      name: "Cycling",
      category: "CARDIO",
      subCategory: null,
      muscleGroups: ["Cardio"],
    },
    {
      name: "Stair Climber",
      category: "CARDIO",
      subCategory: null,
      muscleGroups: ["Cardio"],
    },
    {
      name: "Rowing Machine",
      category: "CARDIO",
      subCategory: null,
      muscleGroups: ["Cardio"],
    },
    {
      name: "Jump Rope",
      category: "CARDIO",
      subCategory: null,
      muscleGroups: ["Cardio"],
    },
    {
      name: "Elliptical",
      category: "CARDIO",
      subCategory: null,
      muscleGroups: ["Cardio"],
    },
    {
      name: "Swimming",
      category: "CARDIO",
      subCategory: null,
      muscleGroups: ["Cardio"],
    },
    {
      name: "High Knees",
      category: "CARDIO",
      subCategory: null,
      muscleGroups: ["Cardio"],
    },
    {
      name: "Burpees",
      category: "CARDIO",
      subCategory: null,
      muscleGroups: ["Cardio", "Full Body"],
    },

    //CORE
    {
      name: "Plank",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core"],
    },
    {
      name: "Russian Twist",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core"],
    },
    {
      name: "Leg Raises",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core"],
    },
    {
      name: "Bicycle Crunches",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core"],
    },
    {
      name: "Mountain Climbers",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core", "Cardio"],
    },
    {
      name: "Woodchoppers",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core"],
    },
    {
      name: "Crunches",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core"],
    },
    {
      name: "Hanging Leg Raises",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core"],
    },
    {
      name: "Ab Wheel Rollout",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core"],
    },
    {
      name: "Hollow Body Hold",
      category: "CORE",
      subCategory: null,
      muscleGroups: ["Core"],
    },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    });
  }

  // Remove any exercises no longer in the list (that have no workout history)
  const names = exercises.map((e) => e.name);
  await prisma.exercise.deleteMany({
    where: {
      name: { notIn: names },
      workoutExercises: { none: {} },
    },
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
