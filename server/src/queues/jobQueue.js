import Queue from 'bull'
import dotenv from 'dotenv'
dotenv.config()

export const jobQueue = new Queue('check-jobs', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
});