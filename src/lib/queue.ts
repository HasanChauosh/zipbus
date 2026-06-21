import { Queue } from "bullmq"

const connection = ({ url: process.env.REDIS_URL! } as any)

export const reminderQueue = new Queue("reminders", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
})

export { connection }
export const queue = null;