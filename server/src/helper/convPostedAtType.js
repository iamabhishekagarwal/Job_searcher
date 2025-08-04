import { PrismaClient } from "@prisma/client";
const prisma=new PrismaClient();
function parsePostedAtToDate(str) {
  if (!str) return null;

  const now = new Date();
  str = str.trim().toLowerCase();

  if (str.includes("just now") || str.includes("few hours ago") || str.includes("today")) {
    return now;
  }

  const relativeMatch = str.match(/(\d+)\s*\+?\s*(week|day)/i);
  if (relativeMatch) {
    const number = parseInt(relativeMatch[1]);
    const unit = relativeMatch[2];
    const offsetDays = unit.startsWith("week") ? number * 7 : number;
    return new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000);
  }

  const startInMonthsMatch = str.match(/starts in (\d+)-(\d+) months/);
  if (startInMonthsMatch) {
    const minMonths = parseInt(startInMonthsMatch[1]);
    const estimatedStart = new Date(now);
    estimatedStart.setMonth(estimatedStart.getMonth() + minMonths);
    return estimatedStart;
  }

  const startsWithinMatch = str.match(/starts within (\d+) month/);
  if (startsWithinMatch) {
    const estimatedStart = new Date(now);
    estimatedStart.setMonth(estimatedStart.getMonth() + parseInt(startsWithinMatch[1]));
    return estimatedStart;
  }

  const startsOnMatch = str.match(/starts\s*:\s*(\d{1,2})(st|nd|rd|th)?\s*([a-z]+)'?\s*(\d{2})/i);
  if (startsOnMatch) {
    const day = parseInt(startsOnMatch[1]);
    const monthStr = startsOnMatch[3].toLowerCase();
    const yearSuffix = parseInt(startsOnMatch[4]);
    const monthMap = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const month = monthMap[monthStr.slice(0, 3)];
    const year = 2000 + yearSuffix;
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  return null;
}

async function updateAllJobs() {
  const jobs = await prisma.job.findMany();

  for (const job of jobs) {
    const parsedDate = parsePostedAtToDate(job.postedAt); // your own function

    if (!parsedDate) continue; // skip if unable to parse

    await prisma.job.update({
      where: { id: job.id },
      data: {
        postedAtDt: parsedDate,
      },
    });

    console.log(`Updated job ${job.id} with date ${parsedDate}`);
  }
}

updateAllJobs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
