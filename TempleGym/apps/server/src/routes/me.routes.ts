import { Router, Request, Response } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";

const router = Router();

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(30).optional(),
  heightCm: z.number().int().min(100).max(250).optional(),
  weightKg: z.number().min(20).max(300).optional(),
  weeklyGoal: z.number().int().min(1).max(7).optional(),
  gpsEnabled: z.boolean().optional(),
  preferMetric: z.boolean().optional(),
  leaderboardAnonymous: z.boolean().optional(),
});

// GET /me
router.get("/", requireAuth, async (req: Request, res: Response) => {
  console.log("GET /me called for user:", req.user!.id);
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: "User not found" });

  // --- daysThisWeek: distinct days worked out Mon–Sun this week ---
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const daysSinceMonday = (dayOfWeek + 6) % 7; // Mon=0 ... Sun=6
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - daysSinceMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  const sessionsThisWeek = await prisma.workoutSession.findMany({
    where: {
      userId: user.id,
      startedAt: { gte: monday, lt: sunday },
    },
    select: { startedAt: true },
  });

  const uniqueDays = new Set(
    sessionsThisWeek.map((s) => s.startedAt.toISOString().slice(0, 10)),
  );
  const daysThisWeek = uniqueDays.size;

  // --- weekStreak: consecutive weeks ending last week where goal was hit ---
  const weeklyGoal = (user as any).weeklyGoal ?? 3;

  const allSessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, startedAt: { lt: monday } },
    select: { startedAt: true },
    orderBy: { startedAt: "desc" },
  });

  // Group past sessions by Mon–Sun week key
  function getWeekMonday(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - diff);
    return d.toISOString().slice(0, 10); // e.g. "2025-03-31"
  }

  const weekMap = new Map<string, Set<string>>();
  for (const s of allSessions) {
    const wk = getWeekMonday(s.startedAt);
    if (!weekMap.has(wk)) weekMap.set(wk, new Set());
    weekMap.get(wk)!.add(s.startedAt.toISOString().slice(0, 10));
  }

  // Walk backwards week by week from last week, count streak
  let weekStreak = 0;
  const cursor = new Date(monday);
  cursor.setDate(cursor.getDate() - 7); // start at last Monday

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    const days = weekMap.get(key);
    if (days && days.size >= weeklyGoal) {
      weekStreak++;
      cursor.setDate(cursor.getDate() - 7);
    } else {
      break;
    }
  }

  return res.json({ ...user, daysThisWeek, weekStreak, weeklyGoal });
});

// PATCH /me/profile
router.patch("/profile", requireAuth, async (req: Request, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: parsed.data,
  });
  return res.json(user);
});

// GET /me/workouts
router.get("/workouts", requireAuth, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;
  const [sessions, total] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: { exercises: { include: { exercise: true } } },
    }),
    prisma.workoutSession.count({ where: { userId: req.user!.id } }),
  ]);
  return res.json({ sessions, total });
});

// GET /me/workouts/week-count
router.get(
  "/workouts/week-count",
  requireAuth,
  async (req: Request, res: Response) => {
    const { getWeekLabel } = await import("../utils/weekLabel");
    const weekLabel = getWeekLabel();
    const count = await prisma.workoutSession.count({
      where: { userId: req.user!.id, weekLabel },
    });
    return res.json({ count });
  },
);

// GET /me/stats — best set per exercise across all time
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  const rows = await prisma.workoutExercise.findMany({
    where: { session: { userId: req.user!.id } },
    include: { exercise: true, session: { select: { startedAt: true } } },
  });

  const best = new Map<
    string,
    {
      exercise: unknown;
      bestWeightKg: number;
      bestReps: number;
      achievedAt: Date;
    }
  >();

  for (const row of rows) {
    const sets = row.sets as {
      setNumber: number;
      weightKg: number;
      reps: number;
    }[];
    for (const s of sets) {
      const existing = best.get(row.exerciseId);
      if (!existing || s.weightKg > existing.bestWeightKg) {
        best.set(row.exerciseId, {
          exercise: row.exercise,
          bestWeightKg: s.weightKg,
          bestReps: s.reps,
          achievedAt: row.session.startedAt,
        });
      }
    }
  }

  return res.json(Array.from(best.values()));
});

export default router;
