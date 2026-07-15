import { Queue } from 'bullmq';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');
const redisPassword = process.env.REDIS_PASSWORD || undefined;

const connection = {
  host: redisHost,
  port: redisPort,
  ...(redisPassword ? { password: redisPassword } : {})
};

const provisionQueue = new Queue('provision-tenant', { connection });

export default provisionQueue;
