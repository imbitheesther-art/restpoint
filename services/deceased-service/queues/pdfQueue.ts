import { Queue, Worker } from 'bullmq';
import { resolveDatabase, safeTenantQuery, safeTenantExecute } from '../../../shared/dbConfig';
import redisService, { NotificationType, NotificationPriority } from '../../../packages/shared-services/src/redisService';

export const PDF_QUEUE_NAME = 'postmortem-pdf-generation';

export interface PDFGenerationJob {
  deceasedId: string;
  tenantSlug: string;
  postmortemId: number;
  requestedBy: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const pdfQueue = new Queue<PDFGenerationJob>(PDF_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100, age: 24 * 3600 },
    removeOnFail: { age: 7 * 24 * 3600 },
  },
});

export async function queuePDFGeneration(jobData: PDFGenerationJob): Promise<string> {
  const job = await pdfQueue.add('generate-postmortem-pdf', jobData, {
    priority: jobData.priority === 'urgent' ? 1 : jobData.priority === 'high' ? 2 : jobData.priority === 'low' ? 4 : 3,
  });
  return job.id || '';
}

async function processPDFGeneration(job: any): Promise<void> {
  const { deceasedId, tenantSlug } = job.data;
  console.log(`Processing PDF for: ${deceasedId}`);
}

export function startPDFWorker(): void {
  const worker = new Worker<PDFGenerationJob>(PDF_QUEUE_NAME, processPDFGeneration, {
    connection,
    concurrency: 2,
  });
  console.log('PDF Worker started');
}

export default pdfQueue;