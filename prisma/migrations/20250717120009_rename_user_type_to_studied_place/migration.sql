/*
  Warnings:

  - You are about to drop the column `userType` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StudiedPlace" AS ENUM ('SCHOOL', 'UNIVERSITY', 'NOT_STUDYING');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userType",
ADD COLUMN     "studiedPlace" "StudiedPlace";

-- DropEnum
DROP TYPE "UserType";
