/*
  Warnings:

  - The `postedAt` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "postedAt",
ADD COLUMN     "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
