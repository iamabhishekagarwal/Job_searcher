import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Convert scraped job → Prisma Job model
 */
function mapToJobModel(job, employerId = 1) {
  return {
    title: job.title || "Untitled",
    category: "Software", // you can improve later with NLP
    companyName: job.company || "Unknown",
    location: job.location || "Not specified",
    jobType: job.jobType || "Not Mentioned",
    description: job.description || "",
    salaryRange: job.salaryRange || null,
    postedAt: job.postedAt || null,
    deadline: null,
    isActive: job.isActive ?? true,
    employerId,

    companyLogo: job.logo || "",
    companyUrl: job.company_url || null,
    experience: job.experience || "Not specified",
    jobUrl: job.job_url || null,

    rating: job.rating ? Number(job.rating) : null,
    via: job.via || null,
    tags: job.tags || [],

    lastVerified: new Date(),
    postedAtDt: job.postedAt ? new Date(job.postedAt) : new Date(),

    minExperience: null,
    maxExperience: null,
  };
}

/**
 * Bulk insert jobs
 */

export async function addJobs(jobsArray, employerId = 1) {
  try {
    const mappedJobs = jobsArray.map(job =>
      mapToJobModel(job, employerId)
    );

    const result = await prisma.job.createMany({
      data: mappedJobs,
      skipDuplicates: true, // 🔥 avoids crash on same jobUrl
    });

    console.log(`✅ Inserted ${result.count} jobs`);
  } catch (err) {
    console.error("❌ Error inserting jobs:", err);
  } finally {
    await prisma.$disconnect();
  }
}