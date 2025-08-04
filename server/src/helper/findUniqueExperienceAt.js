import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function findUnique() {
  const jobs = await prisma.job.findMany();
  let set = new Set();
  for (const job of jobs) {
    set.add(job.experience);
  }
  set.forEach((ex) => {
    console.log(ex);
  });
  prisma.$disconnect();
}
findUnique().catch(console.error)