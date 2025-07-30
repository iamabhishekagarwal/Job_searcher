/*
  Warnings:

  - You are about to drop the column `isRemote` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `webLink` on the `Job` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobUrl]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyLogo` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "isRemote",
DROP COLUMN "webLink",
ADD COLUMN     "companyLogo" TEXT NOT NULL,
ADD COLUMN     "companyUrl" TEXT,
ADD COLUMN     "experience" TEXT NOT NULL,
ADD COLUMN     "jobUrl" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "via" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobUrl_key" ON "Job"("jobUrl");
