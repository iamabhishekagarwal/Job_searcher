import { jobQueue } from '../queues/jobQueue.js';
import { prisma } from '../helper/pooler.js';

export async function enqueueJobsForCleanup() {
    const today = Date.now()
  try {
    const jobs = await prisma.job.findMany({
        where:{
            deadline:today
        },
      select: {
        id: true,
        jobUrl: true,
      },
    });

    for (const job of jobs) {
      await jobQueue.add({
        jobId: job.id,
        jobUrl: job.jobUrl,
        date:today
      });
    }

    console.log(`Enqueued ${jobs.length} jobs for cleanup`);
  } catch (err) {
    console.error('Failed to enqueue jobs:', err);
  }
}
