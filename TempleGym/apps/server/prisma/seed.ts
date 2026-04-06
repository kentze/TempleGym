import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PUSH      = 'PUSH'      as const;
const PULL      = 'PULL'      as const;
const LEGS      = 'LEGS'      as const;
const CARDIO    = 'CARDIO'    as const;
const FULL_BODY = 'FULL_BODY' as const;

async function main() {
  console.log('Seeding exercises...');

  const exercises = [
    // PUSH
    { name: 'Bench Press',        category: PUSH,      subCategory: null,              muscleGroups: ['Chest', 'Triceps'] },
    { name: 'Overhead Press',     category: PUSH,      subCategory: null,              muscleGroups: ['Shoulders', 'Triceps'] },
    { name: 'Chest Fly',          category: PUSH,      subCategory: null,              muscleGroups: ['Chest'] },
    { name: 'Tricep Pushdown',    category: PUSH,      subCategory: null,              muscleGroups: ['Triceps'] },
    { name: 'Lateral Raise',      category: PUSH,      subCategory: null,              muscleGroups: ['Shoulders'] },
    { name: 'Incline Press',      category: PUSH,      subCategory: null,              muscleGroups: ['Chest', 'Shoulders'] },
    // PULL
    { name: 'Seated Cable Row',   category: PULL,      subCategory: 'Horizontal Pull', muscleGroups: ['Back', 'Biceps'] },
    { name: 'Renegade Row',       category: PULL,      subCategory: 'Horizontal Pull', muscleGroups: ['Back', 'Core'] },
    { name: 'Lat Pulldown',       category: PULL,      subCategory: 'Vertical Pull',   muscleGroups: ['Lats', 'Biceps'] },
    { name: 'Barbell Curl',       category: PULL,      subCategory: null,              muscleGroups: ['Biceps'] },
    { name: 'Face Pull',          category: PULL,      subCategory: 'Horizontal Pull', muscleGroups: ['Rear Delts', 'Traps'] },
    { name: 'Pull-Up',            category: PULL,      subCategory: 'Vertical Pull',   muscleGroups: ['Lats', 'Biceps'] },
    { name: 'Deadlift',           category: PULL,      subCategory: null,              muscleGroups: ['Back', 'Glutes', 'Hamstrings'] },
    // LEGS
    { name: 'Squat',              category: LEGS,      subCategory: null,              muscleGroups: ['Quads', 'Glutes', 'Hamstrings'] },
    { name: 'Leg Press',          category: LEGS,      subCategory: null,              muscleGroups: ['Quads', 'Glutes'] },
    { name: 'Romanian Deadlift',  category: LEGS,      subCategory: null,              muscleGroups: ['Hamstrings', 'Glutes'] },
    { name: 'Leg Curl',           category: LEGS,      subCategory: null,              muscleGroups: ['Hamstrings'] },
    { name: 'Leg Extension',      category: LEGS,      subCategory: null,              muscleGroups: ['Quads'] },
    { name: 'Calf Raise',         category: LEGS,      subCategory: null,              muscleGroups: ['Calves'] },
    // CARDIO
    { name: 'Treadmill Run',      category: CARDIO,    subCategory: null,              muscleGroups: ['Full Body'] },
    { name: 'Stationary Bike',    category: CARDIO,    subCategory: null,              muscleGroups: ['Full Body'] },
    { name: 'Rowing Machine',     category: CARDIO,    subCategory: null,              muscleGroups: ['Full Body'] },
    { name: 'Jump Rope',          category: CARDIO,    subCategory: null,              muscleGroups: ['Full Body'] },
    // FULL BODY
    { name: 'Power Clean',        category: FULL_BODY, subCategory: null,              muscleGroups: ['Full Body'] },
    { name: 'Kettlebell Swing',   category: FULL_BODY, subCategory: null,              muscleGroups: ['Glutes', 'Hamstrings', 'Core'] },
    { name: 'Burpees',            category: FULL_BODY, subCategory: null,              muscleGroups: ['Full Body'] },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where:  { name: ex.name },
      update: {},
      create: ex,
    });
  }

  // Remove any exercises no longer in the list (that have no workout history)
  const names = exercises.map((e) => e.name);
  await prisma.exercise.deleteMany({
    where: {
      name:            { notIn: names },
      workoutExercises: { none: {} },
    },
  });

  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
