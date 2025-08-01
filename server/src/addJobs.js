import { prisma } from "../src/helper/pooler.js";
import fs from "fs";
let timeelapsed = 0;
let skipped = 0;
let failed = 0;
let inserted = 0;
let currentCategory = ""
const timer = setInterval(() => {
  process.stdout.write(`Time elapsed - ${timeelapsed++}s Category: ${currentCategory} | Inserted: ${inserted} | Skipped: ${skipped} | Failed: ${failed}\r`);
}, 1000);
async function main() {
  const rawData = fs.readFileSync("./grouped_jobs.json", "utf8");
  const parsedData = JSON.parse(rawData);
  const allJobs = Object.values(parsedData).flat();
  let total = allJobs.length;
  for (const [key, jobs] of Object.entries(parsedData)) {
    const category = key.replace(/__$/, ""); // e.g., "dartist" from "dartist__"
    currentCategory = category
    for (const job of jobs) {
      try {

        const existingJob = await prisma.job.findFirst({
          where: {
            jobUrl: job.job_url,//empty url leads to PAGE NOT FOUND(create)
          },
        });

        if (existingJob) {
          skipped++;
          continue;
        }
        await prisma.job.create({
          data: {
            title: job.title,
            category: category,
            companyName: job.company,
            location: job.location || "null",
            jobType: "Full Time", // default or derive if available
            description: job.description || "",
            salaryRange: null,
            jobUrl: job.job_url || "",
            companyUrl: job.company_url || "",
            rating: parseFloat(job.rating) || 0.0,
            postedAt: job.posted || new Date(), // or parse if available
            deadline: new Date(),
            tags:job.tags || [],
            experience: job.experience || "Not mentioned",
            isActive: true,
            companyLogo: job.logo || "",
            via: job.via || "N/A",
            employer: {
              connect: { id: 1 }, // connect to default User (Admin or Company)
            },
          },
        });
        inserted++;
            } catch (error) {
        failed++;
        console.error(`Failed to insert job: ${job.title}`, error);
      }
    }
    console.log(
      " Failed = " +
        failed +
        " inserted = " +
        inserted +
        " skipped = " +
        skipped
    );
  }
  clearInterval(timer);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
