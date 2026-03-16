import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PUSH = 'PUSH' as const;
const PULL = 'PULL' as const;

async function main() {
  console.log('Seeding exercises...');

  const exercises = [
    // PUSH
    { name: 'Bench Press',     category: PUSH, subCategory: null,              muscleGroups: ['Chest', 'Triceps'] },
    { name: 'Overhead Press',  category: PUSH, subCategory: null,              muscleGroups: ['Shoulders', 'Triceps'] },
    { name: 'Chest Fly',       category: PUSH, subCategory: null,              muscleGroups: ['Chest'] },
    { name: 'Tricep Pushdown', category: PUSH, subCategory: null,              muscleGroups: ['Triceps'] },
    { name: 'Lateral Raise',   category: PUSH, subCategory: null,              muscleGroups: ['Shoulders'] },
    { name: 'Incline Press',   category: PUSH, subCategory: null,              muscleGroups: ['Chest', 'Shoulders'] },
    // PULL
    { name: 'Seated Cable Row',category: PULL, subCategory: 'Horizontal Pull', muscleGroups: ['Back', 'Biceps'] },
    { name: 'Renegade Row',    category: PULL, subCategory: 'Horizontal Pull', muscleGroups: ['Back', 'Core'] },
    { name: 'Lat Pulldown',    category: PULL, subCategory: 'Vertical Pull',   muscleGroups: ['Lats', 'Biceps'] },
    { name: 'Barbell Curl',    category: PULL, subCategory: null,              muscleGroups: ['Biceps'] },
    { name: 'Face Pull',       category: PULL, subCategory: 'Horizontal Pull', muscleGroups: ['Rear Delts', 'Traps'] },
    { name: 'Pull-Up',         category: PULL, subCategory: 'Vertical Pull',   muscleGroups: ['Lats', 'Biceps'] },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where:  { name: ex.name },
      update: {},
      create: ex,
    });
  }

  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
