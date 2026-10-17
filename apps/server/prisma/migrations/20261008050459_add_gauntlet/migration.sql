-- CreateTable
CREATE TABLE "GauntletCycle" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GauntletCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GauntletEntry" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GauntletEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GauntletEntry_cycleId_userId_idx" ON "GauntletEntry"("cycleId", "userId");

-- AddForeignKey
ALTER TABLE "GauntletCycle" ADD CONSTRAINT "GauntletCycle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GauntletCycle" ADD CONSTRAINT "GauntletCycle_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GauntletEntry" ADD CONSTRAINT "GauntletEntry_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "GauntletCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GauntletEntry" ADD CONSTRAINT "GauntletEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
