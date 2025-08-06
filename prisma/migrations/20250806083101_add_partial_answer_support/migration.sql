-- AlterTable
ALTER TABLE "Solution" ADD COLUMN     "correctAnswersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "submittedAnswers" JSONB[];
