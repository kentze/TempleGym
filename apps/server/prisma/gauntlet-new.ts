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

async function main() {
    const exerciseName = getArg('exercise');
    const startDate = new Date(getArg('start'));
    const endDate = new Date(getArg('end'));

    const exercise = await prisma.exercise.findUnique({
        where: { name: exerciseName }
    });

    if (!exercise)
        throw new Error(`No exercise found named "${exerciseName}"`);

    const label = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

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
            status: 'active',
        },
    });

    console.log(`Created Gauntlet cycle "${cycle.label}" for ${exercise.name} (${cycle.id})`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
}).finally(() => prisma.$disconnect());