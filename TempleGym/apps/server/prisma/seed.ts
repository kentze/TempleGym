import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PUSH = 'PUSH' as const;
const PULL = 'PULL' as const;

async function main() {
  console.log('Seeding exercises...');

  const exercises = [
    // PUSH
    { name: 'Bench Press',     category: PUSH, subCategory: null,              muscleGroups: ['Chest', 'Triceps'],       emoji: '🏋️' },
    { name: 'Overhead Press',  category: PUSH, subCategory: null,              muscleGroups: ['Shoulders', 'Triceps'],   emoji: '🤲' },
    { name: 'Chest Fly',       category: PUSH, subCategory: null,              muscleGroups: ['Chest'],                  emoji: '💪' },
    { name: 'Tricep Pushdown', category: PUSH, subCategory: null,              muscleGroups: ['Triceps'],                emoji: '🦾' },
    { name: 'Lateral Raise',   category: PUSH, subCategory: null,              muscleGroups: ['Shoulders'],              emoji: '🔗' },
    { name: 'Incline Press',   category: PUSH, subCategory: null,              muscleGroups: ['Chest', 'Shoulders'],     emoji: '⬆️' },
    // PULL
    { name: 'Seated Cable Row',category: PULL, subCategory: 'Horizontal Pull', muscleGroups: ['Back', 'Biceps'],         emoji: '🔗' },
    { name: 'Renegade Row',    category: PULL, subCategory: 'Horizontal Pull', muscleGroups: ['Back', 'Core'],           emoji: '🏋️' },
    { name: 'Lat Pulldown',    category: PULL, subCategory: 'Vertical Pull',   muscleGroups: ['Lats', 'Biceps'],         emoji: '🦅' },
    { name: 'Barbell Curl',    category: PULL, subCategory: null,              muscleGroups: ['Biceps'],                 emoji: '💪' },
    { name: 'Face Pull',       category: PULL, subCategory: 'Horizontal Pull', muscleGroups: ['Rear Delts', 'Traps'],    emoji: '🔻' },
    { name: 'Pull-Up',         category: PULL, subCategory: 'Vertical Pull',   muscleGroups: ['Lats', 'Biceps'],         emoji: '🔺' },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where:  { name: ex.name },
      update: {},
      create: ex,
    });
  }

  console.log('Seeding shop items...');

  const shopItems = [
    { name: 'TempleGym Tee',   description: 'Official TempleGym tee with the Owl emblem.',               pointCost: 10000, emoji: '👕', sizes: ['S', 'M', 'XL', 'XXL'] },
    { name: 'Training Shorts', description: 'Lightweight training shorts with the TempleGym logo.',      pointCost: 8000,  emoji: '🩳', sizes: ['S', 'M', 'L', 'XL'] },
    { name: 'Gym Jacket',      description: 'Zip-up jacket with reflective Owl Center branding.',        pointCost: 15000, emoji: '🧥', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
    { name: 'Hoodie',          description: 'Pullover hoodie with embroidered TUJ crest on the chest.',  pointCost: 12000, emoji: '🦺', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where:  { id: item.name },
      update: {},
      create: item,
    });
  }

  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
