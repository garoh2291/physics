/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ExerciseCourses` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'SCHOOL', 'UNIVERSITY', 'SIMPLE_PERSON');

-- DropForeignKey
ALTER TABLE "_ExerciseCourses" DROP CONSTRAINT "_ExerciseCourses_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExerciseCourses" DROP CONSTRAINT "_ExerciseCourses_B_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "correctAnswer",
ADD COLUMN     "class" INTEGER,
ADD COLUMN     "correctAnswers" TEXT[],
ADD COLUMN     "exerciseNumber" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "class" INTEGER,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "course" INTEGER,
ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredLevel" INTEGER,
ADD COLUMN     "schoolName" TEXT,
ADD COLUMN     "userType" "UserType";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "_ExerciseCourses";

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExerciseSources" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExerciseSources_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ExerciseThemes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExerciseThemes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE INDEX "_ExerciseSources_B_index" ON "_ExerciseSources"("B");

-- CreateIndex
CREATE INDEX "_ExerciseThemes_B_index" ON "_ExerciseThemes"("B");

-- AddForeignKey
ALTER TABLE "_ExerciseSources" ADD CONSTRAINT "_ExerciseSources_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseSources" ADD CONSTRAINT "_ExerciseSources_B_fkey" FOREIGN KEY ("B") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseThemes" ADD CONSTRAINT "_ExerciseThemes_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseThemes" ADD CONSTRAINT "_ExerciseThemes_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
