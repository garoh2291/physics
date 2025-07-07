/*
  Warnings:

  - You are about to drop the column `attemptNumber` on the `Solution` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,exerciseId]` on the table `Solution` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Solution_userId_exerciseId_attemptNumber_key";

-- AlterTable
ALTER TABLE "Solution" DROP COLUMN "attemptNumber";

-- CreateIndex
CREATE UNIQUE INDEX "Solution_userId_exerciseId_key" ON "Solution"("userId", "exerciseId");
