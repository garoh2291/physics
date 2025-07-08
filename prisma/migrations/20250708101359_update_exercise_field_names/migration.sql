/*
  Warnings:

  - You are about to drop the column `givenImage` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `givenText` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `solutionText` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `givenData` on the `Solution` table. All the data in the column will be lost.
  - You are about to drop the column `solutionImage` on the `Solution` table. All the data in the column will be lost.
  - You are about to drop the column `solutionSteps` on the `Solution` table. All the data in the column will be lost.
  - Made the column `finalAnswer` on table `Solution` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "givenImage",
DROP COLUMN "givenText",
DROP COLUMN "solutionText",
ADD COLUMN     "problemImage" TEXT,
ADD COLUMN     "problemText" TEXT,
ADD COLUMN     "solutionSteps" TEXT;

-- AlterTable
ALTER TABLE "Solution" DROP COLUMN "givenData",
DROP COLUMN "solutionImage",
DROP COLUMN "solutionSteps",
ALTER COLUMN "finalAnswer" SET NOT NULL;
