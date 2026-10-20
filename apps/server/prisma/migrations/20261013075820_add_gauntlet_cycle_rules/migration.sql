-- AlterTable
ALTER TABLE "GauntletCycle" ADD COLUMN     "minReps" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "requiresWeight" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "GauntletEntry" ALTER COLUMN "weightKg" DROP NOT NULL;
