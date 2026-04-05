import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PUSH = 'PUSH' as const;
const PULL = 'PULL' as const;
const LEGS = 'LEGS' as const;
const CORE = 'CORE' as const;

async function main() {
  console.log('Seeding exercises...');

  const exercises = [
  // PUSH
  { name: 'Bench Press',           category: PUSH, subCategory: null,               muscleGroups: ['Chest', 'Triceps'] },
  { name: 'Incline Bench Press',   category: PUSH, subCategory: null,               muscleGroups: ['Upper Chest', 'Shoulders', 'Triceps'] },
  { name: 'Decline Bench Press',   category: PUSH, subCategory: null,               muscleGroups: ['Lower Chest', 'Triceps'] },
  { name: 'Dumbbell Bench Press',  category: PUSH, subCategory: null,               muscleGroups: ['Chest', 'Shoulders', 'Triceps'] },
  { name: 'Incline Dumbbell Press',category: PUSH, subCategory: null,               muscleGroups: ['Upper Chest', 'Shoulders', 'Triceps'] },
  { name: 'Chest Fly',             category: PUSH, subCategory: null,               muscleGroups: ['Chest'] },
  { name: 'Cable Fly',             category: PUSH, subCategory: null,               muscleGroups: ['Chest'] },
  { name: 'Pec Deck',              category: PUSH, subCategory: null,               muscleGroups: ['Chest'] },
  { name: 'Push-Up',               category: PUSH, subCategory: null,               muscleGroups: ['Chest', 'Shoulders', 'Triceps'] },
  { name: 'Dips',                  category: PUSH, subCategory: null,               muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },

  { name: 'Overhead Press',        category: PUSH, subCategory: 'Vertical Press',   muscleGroups: ['Shoulders', 'Triceps'] },
  { name: 'Seated Dumbbell Press', category: PUSH, subCategory: 'Vertical Press',   muscleGroups: ['Shoulders', 'Triceps'] },
  { name: 'Arnold Press',          category: PUSH, subCategory: 'Vertical Press',   muscleGroups: ['Shoulders', 'Triceps'] },
  { name: 'Machine Shoulder Press',category: PUSH, subCategory: 'Vertical Press',   muscleGroups: ['Shoulders', 'Triceps'] },

  { name: 'Lateral Raise',         category: PUSH, subCategory: 'Shoulder Isolation', muscleGroups: ['Side Delts'] },
  { name: 'Front Raise',           category: PUSH, subCategory: 'Shoulder Isolation', muscleGroups: ['Front Delts'] },
  { name: 'Upright Row',           category: PUSH, subCategory: 'Shoulder Isolation', muscleGroups: ['Shoulders', 'Traps'] },

  { name: 'Tricep Pushdown',       category: PUSH, subCategory: 'Triceps Isolation', muscleGroups: ['Triceps'] },
  { name: 'Overhead Tricep Extension', category: PUSH, subCategory: 'Triceps Isolation', muscleGroups: ['Triceps'] },
  { name: 'Skull Crusher',         category: PUSH, subCategory: 'Triceps Isolation', muscleGroups: ['Triceps'] },
  { name: 'Close-Grip Bench Press',category: PUSH, subCategory: 'Triceps Compound', muscleGroups: ['Triceps', 'Chest'] },

  // PULL
  { name: 'Seated Cable Row',      category: PULL, subCategory: 'Horizontal Pull',  muscleGroups: ['Back', 'Biceps'] },
  { name: 'Barbell Row',           category: PULL, subCategory: 'Horizontal Pull',  muscleGroups: ['Back', 'Lats', 'Biceps'] },
  { name: 'Dumbbell Row',          category: PULL, subCategory: 'Horizontal Pull',  muscleGroups: ['Back', 'Lats', 'Biceps'] },
  { name: 'T-Bar Row',             category: PULL, subCategory: 'Horizontal Pull',  muscleGroups: ['Back', 'Lats', 'Biceps'] },
  { name: 'Chest Supported Row',   category: PULL, subCategory: 'Horizontal Pull',  muscleGroups: ['Back', 'Rear Delts', 'Biceps'] },
  { name: 'Renegade Row',          category: PULL, subCategory: 'Horizontal Pull',  muscleGroups: ['Back', 'Core'] },
  { name: 'Face Pull',             category: PULL, subCategory: 'Horizontal Pull',  muscleGroups: ['Rear Delts', 'Traps'] },
  { name: 'Reverse Fly',           category: PULL, subCategory: 'Horizontal Pull',  muscleGroups: ['Rear Delts', 'Upper Back'] },

  { name: 'Lat Pulldown',          category: PULL, subCategory: 'Vertical Pull',    muscleGroups: ['Lats', 'Biceps'] },
  { name: 'Wide-Grip Lat Pulldown',category: PULL, subCategory: 'Vertical Pull',    muscleGroups: ['Lats', 'Upper Back', 'Biceps'] },
  { name: 'Close-Grip Lat Pulldown', category: PULL, subCategory: 'Vertical Pull',  muscleGroups: ['Lats', 'Biceps'] },
  { name: 'Pull-Up',               category: PULL, subCategory: 'Vertical Pull',    muscleGroups: ['Lats', 'Biceps'] },
  { name: 'Chin-Up',               category: PULL, subCategory: 'Vertical Pull',    muscleGroups: ['Lats', 'Biceps'] },
  { name: 'Assisted Pull-Up',      category: PULL, subCategory: 'Vertical Pull',    muscleGroups: ['Lats', 'Biceps'] },

  { name: 'Barbell Curl',          category: PULL, subCategory: 'Biceps Isolation', muscleGroups: ['Biceps'] },
  { name: 'Dumbbell Curl',         category: PULL, subCategory: 'Biceps Isolation', muscleGroups: ['Biceps'] },
  { name: 'Hammer Curl',           category: PULL, subCategory: 'Biceps Isolation', muscleGroups: ['Biceps', 'Forearms'] },
  { name: 'Preacher Curl',         category: PULL, subCategory: 'Biceps Isolation', muscleGroups: ['Biceps'] },
  { name: 'Cable Curl',            category: PULL, subCategory: 'Biceps Isolation', muscleGroups: ['Biceps'] },
  { name: 'Concentration Curl',    category: PULL, subCategory: 'Biceps Isolation', muscleGroups: ['Biceps'] },

  { name: 'Shrug',                 category: PULL, subCategory: 'Upper Back / Traps', muscleGroups: ['Traps'] },
  { name: 'Rear Delt Fly',         category: PULL, subCategory: 'Upper Back / Rear Delts', muscleGroups: ['Rear Delts'] },

  // LEGS
  { name: 'Squat',                 category: LEGS, subCategory: 'Squat',            muscleGroups: ['Quads', 'Glutes', 'Core'] },
  { name: 'Front Squat',           category: LEGS, subCategory: 'Squat',            muscleGroups: ['Quads', 'Core'] },
  { name: 'Leg Press',             category: LEGS, subCategory: 'Squat',            muscleGroups: ['Quads', 'Glutes'] },
  { name: 'Hack Squat',            category: LEGS, subCategory: 'Squat',            muscleGroups: ['Quads', 'Glutes'] },
  { name: 'Goblet Squat',          category: LEGS, subCategory: 'Squat',            muscleGroups: ['Quads', 'Glutes', 'Core'] },

  { name: 'Deadlift',              category: LEGS, subCategory: 'Hinge',            muscleGroups: ['Hamstrings', 'Glutes', 'Back'] },
  { name: 'Romanian Deadlift',     category: LEGS, subCategory: 'Hinge',            muscleGroups: ['Hamstrings', 'Glutes'] },
  { name: 'Stiff-Leg Deadlift',    category: LEGS, subCategory: 'Hinge',            muscleGroups: ['Hamstrings', 'Glutes'] },
  { name: 'Hip Thrust',            category: LEGS, subCategory: 'Hinge',            muscleGroups: ['Glutes', 'Hamstrings'] },

  { name: 'Walking Lunge',         category: LEGS, subCategory: 'Single Leg',       muscleGroups: ['Quads', 'Glutes', 'Hamstrings'] },
  { name: 'Bulgarian Split Squat', category: LEGS, subCategory: 'Single Leg',       muscleGroups: ['Quads', 'Glutes'] },
  { name: 'Step-Up',               category: LEGS, subCategory: 'Single Leg',       muscleGroups: ['Quads', 'Glutes'] },

  { name: 'Leg Extension',         category: LEGS, subCategory: 'Quad Isolation',   muscleGroups: ['Quads'] },
  { name: 'Leg Curl',              category: LEGS, subCategory: 'Hamstring Isolation', muscleGroups: ['Hamstrings'] },
  { name: 'Seated Leg Curl',       category: LEGS, subCategory: 'Hamstring Isolation', muscleGroups: ['Hamstrings'] },
  { name: 'Standing Calf Raise',   category: LEGS, subCategory: 'Calves',           muscleGroups: ['Calves'] },
  { name: 'Seated Calf Raise',     category: LEGS, subCategory: 'Calves',           muscleGroups: ['Calves'] },

  // CORE
  { name: 'Plank',                 category: CORE, subCategory: null,               muscleGroups: ['Core'] },
  { name: 'Side Plank',            category: CORE, subCategory: null,               muscleGroups: ['Obliques', 'Core'] },
  { name: 'Hanging Leg Raise',     category: CORE, subCategory: null,               muscleGroups: ['Abs', 'Hip Flexors'] },
  { name: 'Cable Crunch',          category: CORE, subCategory: null,               muscleGroups: ['Abs'] },
  { name: 'Russian Twist',         category: CORE, subCategory: null,               muscleGroups: ['Obliques', 'Core'] },
  { name: 'Ab Wheel Rollout',      category: CORE, subCategory: null,               muscleGroups: ['Abs', 'Core'] },
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
