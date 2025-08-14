import { jobQueue } from '../queues/jobQueue.js';
import { prisma } from '../helper/pooler.js';

export async function enqueueJobsForCleanup() {
    const now = new Date()
    const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  try {
    const jobs = await prisma.job.findMany({
        where:{
            deadline:{
              lt:endOfDay,
              gte:startDay
            },
            isActive:true
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
        date:now
      },{
        delay:1000,
        attempts:3,
        backoff:{
          type:"exponential",
          delay:10000
        },
      });
    }

    console.log(`Enqueued ${jobs.length} jobs for cleanup`);
  } catch (err) {
    console.error('Failed to enqueue jobs:', err);
  }
}
