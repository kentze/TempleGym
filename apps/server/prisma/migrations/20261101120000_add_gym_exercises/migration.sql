-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gymId" TEXT NOT NULL DEFAULT 'city';

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "gyms" TEXT[] DEFAULT ARRAY['city', 'hillside']::TEXT[];

