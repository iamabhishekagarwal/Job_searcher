import { jobQueue } from '../queues/jobQueue.js';
import { prisma } from '../helper/pooler.js';

export async function enqueueJobsForCleanup() {
  try {
    const now = new Date();

    // Fetch expired active jobs
    const jobs = await prisma.job.findMany({
      where: {
        deadline: {
          lte: now,     // deadline has passed
        },
        isActive: true,
      },
      select: {
        id: true,
        jobUrl: true,
      },
    });

    if (jobs.length === 0) {
      console.log('No expired jobs found');
      return;
    }

    for (const job of jobs) {
      await jobQueue.add(
        {
          jobId: job.id,
          jobUrl: job.jobUrl,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
    }

    console.log(`Enqueued ${jobs.length} expired jobs for cleanup`);
  } catch (err) {
    console.error('Failed to enqueue jobs:', err);
  }
}