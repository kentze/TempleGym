import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";
import {
  GYM_WORKOUT_CATALOG,
  ExerciseItem,
  MuscleGroup,
} from "../data/gymWorkouts";

const router = Router();

const VALID_MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Tricep",
  "Legs",
];

// GET /exercises?muscleGroup=Chest|Back|Shoulders|Tricep|Legs
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    // 1. Fetch the user's saved gym preference ('city' or 'hillside') from PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { gymId: true },
    });

    const activeGym = user?.gymId || "city"; // Fallback to 'city' if not set

    // 2. Pull the correct static workout catalog for that gym
    let exercises: ExerciseItem[] =
      GYM_WORKOUT_CATALOG[activeGym] || GYM_WORKOUT_CATALOG["city"];

    // 3. Filter by muscleGroup query parameter if supplied
    const { muscleGroup } = req.query;
    if (
      muscleGroup &&
      VALID_MUSCLE_GROUPS.includes(muscleGroup as MuscleGroup)
    ) {
      exercises = exercises.filter((e) => e.category === muscleGroup);
    }

    // 4. Sort alphabetically by name
    exercises.sort((a, b) => a.name.localeCompare(b.name));

    return res.json({
      gymId: activeGym,
      exercises,
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
