-- DropForeignKey
ALTER TABLE "Solution" DROP CONSTRAINT "Solution_exerciseId_fkey";

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
