import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function parseExp(expStr) {
  if (!expStr || expStr.toLowerCase().includes("not")) return [null, null];

  // Normalize input: replace en-dash, em-dash, weird spacing
  const cleaned = expStr.replace(/–|—/g, "-").replace(/\s+/g, " ").trim();

  // Match ranges like "4-8 Yrs" or "4 - 8 Yrs"
  const rangeMatch = cleaned.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
  }

  // Match single value like "4 Yrs" or "4Yrs"
  const singleMatch = cleaned.match(/(\d+)\s*Yrs?/i);
  if (singleMatch) {
    const val = parseInt(singleMatch[1]);
    return [val, val];
  }

  return [null, null];
}

async function convert() {
  console.log("🔄 Fetching all jobs...");
  const jobs = await prisma.job.findMany();
  console.log(`✅ Total jobs fetched: ${jobs.length}`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const job of jobs) {
    const [minExp, maxExp] = parseExp(job.experience);

    if (minExp === null && maxExp === null) {
      console.log(
        `⏭️ Skipping job ${job.id} - invalid experience: ${job.experience}`
      );
      skippedCount++;
      continue;
    }

    await prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        minExperience: minExp,
        maxExperience: maxExp,
      },
    });

    console.log(`✅ Updated job ${job.id} -> ${minExp}-${maxExp}`);
    updatedCount++;
  }

  console.log("\n🚀 Conversion complete!");
  console.log(`Total updated: ${updatedCount}`);
  console.log(`Total skipped : ${skippedCount}`);

  await prisma.$disconnect();
}

convert().catch(console.error);
