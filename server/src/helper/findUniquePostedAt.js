import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUniquePostedAtStrings() {
  const jobs = await prisma.job.findMany({
    select: {
      postedAt: true,
    },
  });

  const uniquePostedAt = new Set    ();

  for (const job of jobs) {
    if (job.postedAt) {
      uniquePostedAt.add(job.postedAt);
    }
  }

  console.log("Unique postedAt strings:");
  for (const value of uniquePostedAt) {
    console.log(value);
  }
}

getUniquePostedAtStrings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
