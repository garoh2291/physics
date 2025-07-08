-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "hintImage1" TEXT,
ADD COLUMN     "hintImage2" TEXT,
ADD COLUMN     "hintImage3" TEXT,
ADD COLUMN     "hintText1" TEXT,
ADD COLUMN     "hintText2" TEXT,
ADD COLUMN     "hintText3" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "HintUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "hintLevel" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HintUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExerciseCourses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExerciseCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "HintUsage_userId_exerciseId_hintLevel_key" ON "HintUsage"("userId", "exerciseId", "hintLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");

-- CreateIndex
CREATE INDEX "_ExerciseCourses_B_index" ON "_ExerciseCourses"("B");

-- AddForeignKey
ALTER TABLE "HintUsage" ADD CONSTRAINT "HintUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HintUsage" ADD CONSTRAINT "HintUsage_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseCourses" ADD CONSTRAINT "_ExerciseCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseCourses" ADD CONSTRAINT "_ExerciseCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
