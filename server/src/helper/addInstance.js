import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isWithin24Hours(dateString) {
  if (!dateString) return false;

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return false;

  const diffHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);

  return diffHours <= 24;
}
/**
 * Convert scraped job → Prisma Job model
 */
function mapToJobModel(job, employerId = 1) {
  return {
    title: job.title || "Untitled",
    category: "Software",
    companyName: job.company || "Unknown",
    location: job.location || "Not specified",
    jobType: job.jobType || "Not Mentioned",
    description: job.description || "",
    salaryRange: job.salaryRange || null,
    postedAt: job.postedAt
  ? new Date(job.postedAt + "T00:00:00Z")
  : null,
    deadline: null,
    isActive: true,
    employerId,

    companyLogo: job.logo || "",
    companyUrl: job.company_url || null,
    experience: job.experience || "Not specified",
    jobUrl: job.job_url || null,

    rating: job.rating ? Number(job.rating) : null,
    via: job.via || null,
    tags: job.tags || [],

    lastVerified: new Date(),

    // 🔥 DO NOT default to new Date()
    postedAtDt: null,

    minExperience: null,
    maxExperience: null,
  };
}

/**
 * Bulk insert jobs (ONLY last 24 hours)
 */
export async function addJobs(jobsArray, employerId = 1) {
  try {
    // 🔥 FILTER HERE
console.log("Filtering jobs posted within the last 24 hours..."); 
    const filteredJobs = jobsArray.filter(job =>
      isWithin24Hours(job.postedAt)
    );

    if (filteredJobs.length === 0) {
      console.log("⛔ No jobs within 24 hours. Nothing inserted.");
      return;
    }

    const mappedJobs = filteredJobs.map(job =>
      mapToJobModel(job, employerId)
    );

    const result = await prisma.job.createMany({
      data: mappedJobs,
      skipDuplicates: true, // prevents duplicate jobUrl crash
    });

    console.log(`✅ Inserted ${result.count} jobs`);
  } catch (err) {
    console.error("❌ Error inserting jobs:", err);
  } finally {
    await prisma.$disconnect();
  }
}