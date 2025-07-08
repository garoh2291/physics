/*
  Warnings:

  - You are about to drop the column `problemImage` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `problemText` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `adminFeedback` on the `Solution` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Solution` table. All the data in the column will be lost.
  - You are about to drop the `ExerciseAnswer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `correctAnswer` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExerciseAnswer" DROP CONSTRAINT "ExerciseAnswer_exerciseId_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "problemImage",
DROP COLUMN "problemText",
ADD COLUMN     "correctAnswer" TEXT NOT NULL,
ADD COLUMN     "givenImage" TEXT,
ADD COLUMN     "givenText" TEXT,
ADD COLUMN     "solutionImage" TEXT,
ADD COLUMN     "solutionText" TEXT;

-- AlterTable
ALTER TABLE "Solution" DROP COLUMN "adminFeedback",
DROP COLUMN "status";

-- DropTable
DROP TABLE "ExerciseAnswer";

-- DropEnum
DROP TYPE "SolutionStatus";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExerciseTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExerciseTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_ExerciseTags_B_index" ON "_ExerciseTags"("B");

-- AddForeignKey
ALTER TABLE "_ExerciseTags" ADD CONSTRAINT "_ExerciseTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseTags" ADD CONSTRAINT "_ExerciseTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
