-- AlterTable
ALTER TABLE "User" ADD COLUMN     "leaderboardAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weeklyGoal" INTEGER NOT NULL DEFAULT 3;
