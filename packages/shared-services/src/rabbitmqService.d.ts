/**
 * @file packages/shared-services/src/rabbitmqService.ts
 * CENTRALIZED: RabbitMQ Service for high-compute tasks
 *
 * Tasks routed to RabbitMQ (high compute):
 * - Document generation (PDF/Excel) - critical for many tenants
 * - Bulk invoice/billing computation
 * - Email/SMS sending
 * - Data export operations
 * - Report generation
 * - Batch deceased processing
 * - Centralized API logging
 *
 * Graceful fallback: If RabbitMQ is unavailable, tasks are logged/queued in-memory
 */
import { Channel } from 'amqplib';
export interface TaskPayload {
    taskId: string;
    tenantSlug: string;
    type: string;
    data: any;
    createdAt: string;
    priority?: 'high' | 'normal' | 'low';
}
export type TaskHandler = (payload: TaskPayload, ack: () => void, nack: () => void) => Promise<void>;
/**
 * Get or create the RabbitMQ connection
 */
export declare function getChannel(): Promise<Channel | null>;
/**
 * Publish a high-compute task to RabbitMQ
 * Falls back to inline execution if RabbitMQ is unavailable
 */
export declare function publishTask(tenantSlug: string, taskType: string, data: any, priority?: 'high' | 'normal' | 'low'): Promise<{
    queued: boolean;
    taskId: string;
}>;
/**
 * Queue a document generation task
 */
export declare function queueDocumentGeneration(tenantSlug: string, documentType: string, documentData: any): Promise<{
    queued: boolean;
    taskId: string;
}>;
/**
 * Queue a billing computation task
 */
export declare function queueBillingComputation(tenantSlug: string, billingData: any): Promise<{
    queued: boolean;
    taskId: string;
}>;
/**
 * Queue a bulk export task
 */
export declare function queueExport(tenantSlug: string, exportType: string, exportData: any): Promise<{
    queued: boolean;
    taskId: string;
}>;
/**
 * Queue an email sending task
 */
export declare function queueEmail(tenantSlug: string, emailData: {
    to: string;
    subject: string;
    body: string;
}): Promise<{
    queued: boolean;
    taskId: string;
}>;
/**
 * Publish an API activity/error log entry for centralized logging
 */
export declare function publishApiLog(tenantSlug: string, level: 'info' | 'warn' | 'error', message: string, context?: {
    service?: string;
    route?: string;
    method?: string;
    userId?: string;
    [key: string]: any;
}): Promise<{
    queued: boolean;
    taskId: string;
}>;
/**
 * Register a handler for a specific task type
 */
export declare function registerTaskHandler(taskType: string, handler: TaskHandler): void;
/**
 * Start consuming from a specific queue
 */
export declare function startConsuming(queueName: string): Promise<void>;
/**
 * Start all consumers (call this at service startup)
 */
export declare function startAllConsumers(): Promise<void>;
/**
 * Check RabbitMQ connection health
 */
export declare function rabbitHealth(): Promise<{
    status: string;
    queues: any;
}>;
/**
 * Gracefully close RabbitMQ connection
 */
export declare function closeRabbitMQ(): Promise<void>;
declare const _default: {
    getChannel: typeof getChannel;
    publishTask: typeof publishTask;
    queueDocumentGeneration: typeof queueDocumentGeneration;
    queueBillingComputation: typeof queueBillingComputation;
    queueExport: typeof queueExport;
    queueEmail: typeof queueEmail;
    publishApiLog: typeof publishApiLog;
    registerTaskHandler: typeof registerTaskHandler;
    startConsuming: typeof startConsuming;
    startAllConsumers: typeof startAllConsumers;
    rabbitHealth: typeof rabbitHealth;
    closeRabbitMQ: typeof closeRabbitMQ;
};
export default _default;
//# sourceMappingURL=rabbitmqService.d.ts.map