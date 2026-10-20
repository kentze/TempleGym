import { Router, Request, Response } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";

const router = Router();

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(30).optional(),
  heightCm: z.number().int().min(100).max(250).optional(),
  weightKg: z.number().min(20).max(300).optional(),
  gpsEnabled: z.boolean().optional(),
  preferMetric: z.boolean().optional(),
  leaderboardAnonymous: z.boolean().optional(),
  profilePicture: z.string().optional().or(z.literal("")),
  gymId: z.enum(["city", "hillside"]).optional(),
});

// GET /me
router.get("/", requireAuth, async (req: Request, res: Response) => {
  console.log("Connected DB URL:", process.env.DATABASE_URL);
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  console.log("RAW PRISMA USER RESULT:", user);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

// PATCH /me/profile
router.patch("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.flatten() });

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: parsed.data,
    });
    return res.json(user);
  } catch (error: any) {
    console.error("DETAILED PROFILE UPDATE ERROR:", error);
    // Send the actual error message back to the app so you can see it on your phone screen
    return res.status(500).json({
      error: "Internal server error",
      details: error.message || String(error),
    });
  }
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
