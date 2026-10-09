/*
  Warnings:

  - You are about to drop the column `totalPoints` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyPoints` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "totalPoints",
DROP COLUMN "weeklyPoints";
