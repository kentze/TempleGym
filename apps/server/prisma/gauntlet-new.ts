import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getArg(name: string): string {
    const prefix = `--${name}=`;
    const arg = process.argv.find((a) => 
    a.startsWith(prefix));

    if (!arg)
        throw new Error(`Missing required argument: --${name}`);
    
    return arg.slice(prefix.length);
}

function hasFlag(name: string): boolean {
    return process.argv.includes(`--${name}`);
}

async function main() {
    const exerciseName = getArg('exercise');
    const startDate = new Date(getArg('start'));
    const endDate = new Date(getArg('end'));
    const minReps = Number(getArg('min-reps'));
    const requiresWeight = !hasFlag('no-weight');

    if (!Number.isInteger(minReps) || minReps <= 0)
        throw new Error('--min-reps must be a whole number of 1 or more');

    const exercise = await prisma.exercise.findUnique({
        where: { name: exerciseName }
    });

    if (!exercise)
        throw new Error(`No exercise found named "${exerciseName}"`);

    // The date is read as UTC, so the label must use UTC too, whatever timezone this runs in.
    const label = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}`;

    await prisma.gauntletCycle.updateMany({ 
        where: { status: 'active' },
        data: { status: 'closed' },
    });

    const cycle = await prisma.gauntletCycle.create({
        data: {
            label,
            exerciseId: exercise.id,
            startDate,
            endDate,
            minReps,
            requiresWeight,
            status: 'active',
        },
    });

    console.log(`Created Gauntlet cycle "${cycle.label}" for ${exercise.name} (${cycle.id})`);
    console.log(`Rules: at least ${cycle.minReps} reps, weight ${cycle.requiresWeight ? 'required' : 'not used'}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
}).finally(() => prisma.$disconnect());