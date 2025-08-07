-- CreateTable
CREATE TABLE "public"."AppliedJobs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,

    CONSTRAINT "AppliedJobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppliedJobs_userId_jobId_key" ON "public"."AppliedJobs"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "public"."AppliedJobs" ADD CONSTRAINT "AppliedJobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AppliedJobs" ADD CONSTRAINT "AppliedJobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
