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

import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const TASK_EXCHANGE = 'restpoint.tasks';
const NOTIFICATION_EXCHANGE = 'restpoint.notifications';
const DOCUMENT_QUEUE = 'restpoint.documents';
const BILLING_QUEUE = 'restpoint.billing';
const EXPORT_QUEUE = 'restpoint.exports';
const EMAIL_QUEUE = 'restpoint.emails';
const API_LOGS_QUEUE = 'restpoint.api.logs';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TaskPayload {
  taskId: string;
  tenantSlug: string;
  type: string;
  data: any;
  createdAt: string;
  priority?: 'high' | 'normal' | 'low';
}

export type TaskHandler = (payload: TaskPayload, ack: () => void, nack: () => void) => Promise<void>;

// ─── Connection State ──────────────────────────────────────────────────────

let connection: Connection | null = null;
let channel: Channel | null = null;
let isConnecting = false;
let connectionFailed = false;
let reconnectTimer: NodeJS.Timeout | null = null;
const taskHandlers = new Map<string, TaskHandler>();

// ─── Connection Management ─────────────────────────────────────────────────

/**
 * Get or create the RabbitMQ connection
 */
export async function getChannel(): Promise<Channel | null> {
  if (channel) return channel;
  if (connectionFailed && !isConnecting) return null;

  try {
    if (!connection) {
      isConnecting = true;
      connection = await amqp.connect(RABBITMQ_URL);

      connection.on('error', (err) => {
        console.error('[RabbitMQ] ❌ Connection error:', err.message);
        connection = null;
        channel = null;
        connectionFailed = true;
        scheduleReconnect();
      });

      connection.on('close', () => {
        console.log('[RabbitMQ] 🔌 Connection closed');
        channel = null;
        scheduleReconnect();
      });

      console.log('[RabbitMQ] ✅ Connected');
    }

    channel = await connection.createChannel();
    connectionFailed = false;
    isConnecting = false;

    // Assert exchanges and queues
    await channel.assertExchange(TASK_EXCHANGE, 'topic', { durable: true });
    await channel.assertExchange(NOTIFICATION_EXCHANGE, 'fanout', { durable: false });

    // Document processing queue
    await channel.assertQueue(DOCUMENT_QUEUE, {
      durable: true,
      arguments: { 'x-queue-type': 'quorum' }, // High availability for critical docs
    });
    await channel.bindQueue(DOCUMENT_QUEUE, TASK_EXCHANGE, 'document.*');

    // Billing computation queue
    await channel.assertQueue(BILLING_QUEUE, {
      durable: true,
      arguments: { 'x-queue-type': 'quorum' },
    });
    await channel.bindQueue(BILLING_QUEUE, TASK_EXCHANGE, 'billing.*');

    // Export queue
    await channel.assertQueue(EXPORT_QUEUE, { durable: true });
    await channel.bindQueue(EXPORT_QUEUE, TASK_EXCHANGE, 'export.*');

    // Email queue
    await channel.assertQueue(EMAIL_QUEUE, { durable: true });
    await channel.bindQueue(EMAIL_QUEUE, TASK_EXCHANGE, 'email.*');

    // Centralized API logs queue
    await channel.assertQueue(API_LOGS_QUEUE, { durable: true });
    await channel.bindQueue(API_LOGS_QUEUE, TASK_EXCHANGE, 'api.*');

    // Set prefetch to 1 for fair dispatch
    await channel.prefetch(1);

    console.log('[RabbitMQ] ✅ Exchanges and queues configured');
    return channel;
  } catch (error: any) {
    console.error(`[RabbitMQ] ❌ Connection failed: ${error.message}`);
    connection = null;
    channel = null;
    connectionFailed = true;
    isConnecting = false;
    scheduleReconnect();
    return null;
  }
}

function scheduleReconnect(): void {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectionFailed = false;
    getChannel().catch(() => { });
  }, 10000); // Retry every 10 seconds
}

// ─── Task Publishing ──────────────────────────────────────────────────────

/**
 * Publish a high-compute task to RabbitMQ
 * Falls back to inline execution if RabbitMQ is unavailable
 */
export async function publishTask(
  tenantSlug: string,
  taskType: string,
  data: any,
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<{ queued: boolean; taskId: string }> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payload: TaskPayload = {
    taskId,
    tenantSlug,
    type: taskType,
    data,
    createdAt: new Date().toISOString(),
    priority,
  };

  try {
    const ch = await getChannel();
    if (!ch) {
      console.warn(`[RabbitMQ] ⚠️ Not available - executing task "${taskType}" inline`);
      return { queued: false, taskId };
    }

    const routingKey = taskType.replace(/^restpoint\./, '');
    ch.publish(TASK_EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      priority: priority === 'high' ? 10 : priority === 'normal' ? 5 : 1,
      headers: {
        'x-tenant-slug': tenantSlug,
        'x-task-type': taskType,
      },
    });

    console.log(`[RabbitMQ] 📤 Published task "${taskType}" for tenant "${tenantSlug}"`);
    return { queued: true, taskId };
  } catch (error: any) {
    console.error(`[RabbitMQ] ❌ Failed to publish task: ${error.message}`);
    return { queued: false, taskId };
  }
}

// ─── Document Processing ──────────────────────────────────────────────────

/**
 * Queue a document generation task
 */
export async function queueDocumentGeneration(
  tenantSlug: string,
  documentType: string,
  documentData: any
): Promise<{ queued: boolean; taskId: string }> {
  return publishTask(tenantSlug, `document.generate.${documentType}`, documentData, 'high');
}

/**
 * Queue a billing computation task
 */
export async function queueBillingComputation(
  tenantSlug: string,
  billingData: any
): Promise<{ queued: boolean; taskId: string }> {
  return publishTask(tenantSlug, 'billing.compute', billingData, 'high');
}

/**
 * Queue a bulk export task
 */
export async function queueExport(
  tenantSlug: string,
  exportType: string,
  exportData: any
): Promise<{ queued: boolean; taskId: string }> {
  return publishTask(tenantSlug, `export.${exportType}`, exportData, 'normal');
}

/**
 * Queue an email sending task
 */
export async function queueEmail(
  tenantSlug: string,
  emailData: { to: string; subject: string; body: string }
): Promise<{ queued: boolean; taskId: string }> {
  return publishTask(tenantSlug, 'email.send', emailData, 'normal');
}

/**
 * Publish an API activity/error log entry for centralized logging
 */
export async function publishApiLog(
  tenantSlug: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  context?: { service?: string; route?: string; method?: string; userId?: string;[key: string]: any }
): Promise<{ queued: boolean; taskId: string }> {
  const taskId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payload: TaskPayload & { level: string; message: string; context?: any } = {
    taskId,
    tenantSlug,
    type: 'api.log',
    data: {},
    createdAt: new Date().toISOString(),
    priority: level === 'error' ? 'high' : 'normal',
    level,
    message,
    context,
  };

  try {
    const ch = await getChannel();
    if (!ch) {
      console.warn(`[RabbitMQ] ⚠️ Not available - logging API event inline: ${message}`);
      return { queued: false, taskId };
    }

    ch.publish(TASK_EXCHANGE, 'api.log', Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      priority: level === 'error' ? 10 : level === 'warn' ? 5 : 1,
      headers: {
        'x-tenant-slug': tenantSlug,
        'x-log-level': level,
        'x-service': context?.service || 'unknown',
      },
    });

    return { queued: true, taskId };
  } catch (error: any) {
    console.error(`[RabbitMQ] ❌ Failed to publish API log: ${error.message}`);
    return { queued: false, taskId };
  }
}

// ─── Task Consumption ────────────────────────────────────────────────────

/**
 * Register a handler for a specific task type
 */
export function registerTaskHandler(taskType: string, handler: TaskHandler): void {
  taskHandlers.set(taskType, handler);
  console.log(`[RabbitMQ] 📍 Registered handler for "${taskType}"`);
}

/**
 * Start consuming from a specific queue
 */
export async function startConsuming(queueName: string): Promise<void> {
  try {
    const ch = await getChannel();
    if (!ch) {
      console.warn(`[RabbitMQ] ⚠️ Cannot start consumer - not connected`);
      return;
    }

    await ch.consume(queueName, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      const content = msg.content.toString();
      let payload: TaskPayload;

      try {
        payload = JSON.parse(content) as TaskPayload;
      } catch {
        console.error('[RabbitMQ] ❌ Invalid message format');
        ch.nack(msg, false, false); // Discard invalid messages
        return;
      }

      const handler = taskHandlers.get(payload.type);
      if (!handler) {
        console.warn(`[RabbitMQ] ⚠️ No handler for "${payload.type}" - discarding`);
        ch.nack(msg, false, false); // No handler, discard
        return;
      }

      const ack = () => ch.ack(msg);
      const nack = () => ch.nack(msg, false, true); // Re-queue on failure

      try {
        await handler(payload, ack, nack);
      } catch (error: any) {
        console.error(`[RabbitMQ] ❌ Handler error: ${error.message}`);
        ch.nack(msg, false, true); // Re-queue
      }
    });

    console.log(`[RabbitMQ] 👂 Started consuming from "${queueName}"`);
  } catch (error: any) {
    console.error(`[RabbitMQ] ❌ Failed to start consumer: ${error.message}`);
  }
}

/**
 * Start all consumers (call this at service startup)
 */
export async function startAllConsumers(): Promise<void> {
  await Promise.all([
    startConsuming(DOCUMENT_QUEUE),
    startConsuming(BILLING_QUEUE),
    startConsuming(EXPORT_QUEUE),
    startConsuming(EMAIL_QUEUE),
    startConsuming(API_LOGS_QUEUE),
  ]);
}

// ─── Health Check ────────────────────────────────────────────────────────

/**
 * Check RabbitMQ connection health
 */
export async function rabbitHealth(): Promise<{ status: string; queues: any }> {
  try {
    const ch = await getChannel();
    if (!ch) return { status: 'DISCONNECTED', queues: {} };

    const docInfo = await ch.checkQueue(DOCUMENT_QUEUE);
    const billInfo = await ch.checkQueue(BILLING_QUEUE);

    return {
      status: 'UP',
      queues: {
        documents: { messages: docInfo.messageCount, consumers: docInfo.consumerCount },
        billing: { messages: billInfo.messageCount, consumers: billInfo.consumerCount },
      },
    };
  } catch {
    return { status: 'DOWN', queues: {} };
  }
}

// ─── Connection Cleanup ──────────────────────────────────────────────────

/**
 * Gracefully close RabbitMQ connection
 */
export async function closeRabbitMQ(): Promise<void> {
  try {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (channel) {
      await channel.close();
      channel = null;
    }

    if (connection) {
      await connection.close();
      connection = null;
    }

    console.log('[RabbitMQ] 🔌 Connection closed gracefully');
  } catch (error: any) {
    console.error('[RabbitMQ] ❌ Error closing:', error.message);
  } finally {
    connectionFailed = false;
    isConnecting = false;
  }
}

export default {
  getChannel,
  publishTask,
  queueDocumentGeneration,
  queueBillingComputation,
  queueExport,
  queueEmail,
  publishApiLog,
  registerTaskHandler,
  startConsuming,
  startAllConsumers,
  rabbitHealth,
  closeRabbitMQ,
};