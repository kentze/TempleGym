import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { rankGauntletEntries, formatGauntletUsername, validateGauntletEntry, splitTopEntries } from '../services/gauntlet.service';

const router = Router();

const MAX_ENTRIES_PER_CYCLE = 5;
const TOP_ENTRIES_SHOWN = 8;

// Only checks the types of the fields. The rules for this month's lift are
// checked afterwards against the active cycle.
const submitEntrySchema = z.object({
    weightKg: z.number().optional(),
    reps: z.number(),
});

// Keyed on the signed-in user, so it must run after requireAuth. Keying on the
// IP would make everyone on the same campus Wi-Fi share one budget.
const submitEntryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => req.user!.id,
    message: { error: 'Too many submission attempts. Try again later.' },
});

// GET /gauntlet/current
router.get('/current', requireAuth, async (req: Request, res: Response) => {
    const cycle = await prisma.gauntletCycle.findFirst({
        where: { status: 'active' },
        include: { exercise: true },
    });

    if (!cycle) 
        return res.json({ cycle: null, entries: [], myRank: null, myEntryCount: 0, maxEntries: MAX_ENTRIES_PER_CYCLE });

    const entries = await prisma.gauntletEntry.findMany({
        where: { cycleId: cycle.id },
        include: { user: true },
    });

    const ranked = rankGauntletEntries(
        entries.map((e) => ({
            userId: e.userId,
            username: formatGauntletUsername(e.user),
            weightKg: e.weightKg,
            reps: e.reps,
            submittedAt: e.submittedAt,
        }))
    );

    // Show the top of the board, plus the student's own row if they are ranked below it.
    const { top, myRank } = splitTopEntries(ranked, req.user!.id, TOP_ENTRIES_SHOWN);

    // The ranking only keeps each student's best entry, so count their attempts separately.
    const myEntryCount = await prisma.gauntletEntry.count({
        where: {
            cycleId: cycle.id,
            userId: req.user!.id
        },
    });

    res.json({
        cycle: {
            id: cycle.id,
            label: cycle.label,
            exercise: cycle.exercise.name,
            startDate: cycle.startDate,
            endDate: cycle.endDate,
            minReps: cycle.minReps,
            requiresWeight: cycle.requiresWeight,
        },
        entries: top,
        myRank,
        myEntryCount,
        maxEntries: MAX_ENTRIES_PER_CYCLE,
    });
});

// POST /gauntlet/entries
router.post('/entries', requireAuth, submitEntryLimiter, async (req: Request, res: Response) => {
    const parsed = submitEntrySchema.safeParse(req.body);

    if (!parsed.success)
        return res.status(400).json({ error: 'Enter a valid weight and reps.' });

    const cycle = await prisma.gauntletCycle.findFirst({
        where: { status: 'active' } });

    if (!cycle)
        return res.status(400).json({ error: 'No active Gauntlet right now.'});

    const ruleError = validateGauntletEntry(
        { minReps: cycle.minReps, requiresWeight: cycle.requiresWeight },
        parsed.data.weightKg,
        parsed.data.reps
    );

    if (ruleError)
        return res.status(400).json({ error: ruleError });

    const existingCount = await prisma.gauntletEntry.count({
        where: { 
            cycleId: cycle.id,
            userId: req.user!.id
        },
    });

    if (existingCount >= MAX_ENTRIES_PER_CYCLE) {
        return res.status(400).json({ error: `You have already submitted ${MAX_ENTRIES_PER_CYCLE} entries this cycle.`});
    }

    // A reps-only cycle never stores a weight, even if an older app sent one.
    let weightKg: number | null = null;

    if (cycle.requiresWeight)
        weightKg = parsed.data.weightKg ?? null;

    const entry = await prisma.gauntletEntry.create({
        data: {
            cycleId: cycle.id,
            userId: req.user!.id,
            weightKg: weightKg,
            reps: parsed.data.reps,
        },
    });

    res.status(201).json(entry);
})

export default router;