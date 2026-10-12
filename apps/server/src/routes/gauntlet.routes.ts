import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { rankGauntletEntries } from '../services/gauntlet.service';

const router = Router();

const MAX_ENTRIES_PER_CYCLE = 5;

const submitEntrySchema = z.object({
    weightKg: z.number().positive().max(500),
    reps: z.number().int().positive().max(100),
});

const submitEntryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Too many submission attemps. Try again later.'},
});

// GET /gauntlet/current
router.get('/current', requireAuth, async (_req: Request, res: Response) => {
    const cycle = await prisma.gauntletCycle.findFirst({
        where: { status: 'active' },
        include: { exercise: true },
    });

    if (!cycle) 
        return res.json({ cycle: null, entries: [] });

    const entries = await prisma.gauntletEntry.findMany({
        where: { cycleId: cycle.id },
        include: { user: true },
    });

    const ranked = rankGauntletEntries(
        entries.map((e) => ({
            userId: e.userId,
            username: e.user.displayName ?? e.user.email,
            weightKg: e.weightKg,
            reps: e.reps,
        }))
    );

    res.json({
        cycle: {
            id: cycle.id,
            label: cycle.label,
            exercise: cycle.exercise.name,
            startDate: cycle.startDate,
            endDate: cycle.endDate,
        },
        entries: ranked,
    });
});

// POST /gauntlet/entries
router.post('/entries', submitEntryLimiter, requireAuth, async (req: Request, res: Response) => {
    const parsed = submitEntrySchema.safeParse(req.body);

    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });

    const cycle = await prisma.gauntletCycle.findFirst({
        where: { status: 'active' } });

    if (!cycle)
        return res.status(400).json({ error: 'No active Gauntlet right now.'});

    const existingCount = await prisma.gauntletEntry.count({
        where: { 
            cycleId: cycle.id,
            userId: req.user!.id
        },
    });

    if (existingCount >= MAX_ENTRIES_PER_CYCLE) {
        return res.status(400).json({ error: `You have already submmitted ${MAX_ENTRIES_PER_CYCLE} entries this cycle.`});
    }

    const entry = await prisma.gauntletEntry.create({
        data: {
            cycleId: cycle.id,
            userId: req.user!.id,
            weightKg: parsed.data.weightKg,
            reps: parsed.data.reps,
        },
    });

    res.status(201).json(entry);
})

export default router;