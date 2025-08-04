import { prisma } from "../helper/pooler.js";

const deleteJobs = async () => {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const jobIds = await prisma.job.findMany({
      where: {
        isActive: false,
        lastVerified:{
            lt:fourteenDaysAgo
        }
      },
    });
    for (const job of jobIds) {
      console.log("Deleting job ID - ", job.id);
      await prisma.savedJobs.deleteMany({
        where: {
          jobId: job.id,
        },
      });

      await prisma.appliedJobs.deleteMany({
        where: { jobId: job.id },
      });

      await prisma.job.delete({
        where: { id: job.id },
      });
    }
  } catch (e) {
    console.error("Something went wrong with saved jobs:",e);
  }
};

export default deleteJobs;
