"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannel = getChannel;
exports.publishTask = publishTask;
exports.queueDocumentGeneration = queueDocumentGeneration;
exports.queueBillingComputation = queueBillingComputation;
exports.queueExport = queueExport;
exports.queueEmail = queueEmail;
exports.publishApiLog = publishApiLog;
exports.registerTaskHandler = registerTaskHandler;
exports.startConsuming = startConsuming;
exports.startAllConsumers = startAllConsumers;
exports.rabbitHealth = rabbitHealth;
exports.closeRabbitMQ = closeRabbitMQ;
const amqplib_1 = __importDefault(require("amqplib"));
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const TASK_EXCHANGE = 'restpoint.tasks';
const NOTIFICATION_EXCHANGE = 'restpoint.notifications';
const DOCUMENT_QUEUE = 'restpoint.documents';
const BILLING_QUEUE = 'restpoint.billing';
const EXPORT_QUEUE = 'restpoint.exports';
const EMAIL_QUEUE = 'restpoint.emails';
const API_LOGS_QUEUE = 'restpoint.api.logs';
// ─── Connection State ──────────────────────────────────────────────────────
let connection = null;
let channel = null;
let isConnecting = false;
let connectionFailed = false;
let reconnectTimer = null;
const taskHandlers = new Map();
// ─── Connection Management ─────────────────────────────────────────────────
/**
 * Get or create the RabbitMQ connection
 */
async function getChannel() {
    if (channel)
        return channel;
    if (connectionFailed && !isConnecting)
        return null;
    try {
        if (!connection) {
            isConnecting = true;
            connection = await amqplib_1.default.connect(RABBITMQ_URL);
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
    }
    catch (error) {
        console.error(`[RabbitMQ] ❌ Connection failed: ${error.message}`);
        connection = null;
        channel = null;
        connectionFailed = true;
        isConnecting = false;
        scheduleReconnect();
        return null;
    }
}
function scheduleReconnect() {
    if (reconnectTimer)
        return;
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
async function publishTask(tenantSlug, taskType, data, priority = 'normal') {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payload = {
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
    }
    catch (error) {
        console.error(`[RabbitMQ] ❌ Failed to publish task: ${error.message}`);
        return { queued: false, taskId };
    }
}
// ─── Document Processing ──────────────────────────────────────────────────
/**
 * Queue a document generation task
 */
async function queueDocumentGeneration(tenantSlug, documentType, documentData) {
    return publishTask(tenantSlug, `document.generate.${documentType}`, documentData, 'high');
}
/**
 * Queue a billing computation task
 */
async function queueBillingComputation(tenantSlug, billingData) {
    return publishTask(tenantSlug, 'billing.compute', billingData, 'high');
}
/**
 * Queue a bulk export task
 */
async function queueExport(tenantSlug, exportType, exportData) {
    return publishTask(tenantSlug, `export.${exportType}`, exportData, 'normal');
}
/**
 * Queue an email sending task
 */
async function queueEmail(tenantSlug, emailData) {
    return publishTask(tenantSlug, 'email.send', emailData, 'normal');
}
/**
 * Publish an API activity/error log entry for centralized logging
 */
async function publishApiLog(tenantSlug, level, message, context) {
    const taskId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payload = {
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
    }
    catch (error) {
        console.error(`[RabbitMQ] ❌ Failed to publish API log: ${error.message}`);
        return { queued: false, taskId };
    }
}
// ─── Task Consumption ────────────────────────────────────────────────────
/**
 * Register a handler for a specific task type
 */
function registerTaskHandler(taskType, handler) {
    taskHandlers.set(taskType, handler);
    console.log(`[RabbitMQ] 📍 Registered handler for "${taskType}"`);
}
/**
 * Start consuming from a specific queue
 */
async function startConsuming(queueName) {
    try {
        const ch = await getChannel();
        if (!ch) {
            console.warn(`[RabbitMQ] ⚠️ Cannot start consumer - not connected`);
            return;
        }
        await ch.consume(queueName, async (msg) => {
            if (!msg)
                return;
            const content = msg.content.toString();
            let payload;
            try {
                payload = JSON.parse(content);
            }
            catch {
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
            }
            catch (error) {
                console.error(`[RabbitMQ] ❌ Handler error: ${error.message}`);
                ch.nack(msg, false, true); // Re-queue
            }
        });
        console.log(`[RabbitMQ] 👂 Started consuming from "${queueName}"`);
    }
    catch (error) {
        console.error(`[RabbitMQ] ❌ Failed to start consumer: ${error.message}`);
    }
}
/**
 * Start all consumers (call this at service startup)
 */
async function startAllConsumers() {
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
async function rabbitHealth() {
    try {
        const ch = await getChannel();
        if (!ch)
            return { status: 'DISCONNECTED', queues: {} };
        const docInfo = await ch.checkQueue(DOCUMENT_QUEUE);
        const billInfo = await ch.checkQueue(BILLING_QUEUE);
        return {
            status: 'UP',
            queues: {
                documents: { messages: docInfo.messageCount, consumers: docInfo.consumerCount },
                billing: { messages: billInfo.messageCount, consumers: billInfo.consumerCount },
            },
        };
    }
    catch {
        return { status: 'DOWN', queues: {} };
    }
}
// ─── Connection Cleanup ──────────────────────────────────────────────────
/**
 * Gracefully close RabbitMQ connection
 */
async function closeRabbitMQ() {
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
    }
    catch (error) {
        console.error('[RabbitMQ] ❌ Error closing:', error.message);
    }
    finally {
        connectionFailed = false;
        isConnecting = false;
    }
}
exports.default = {
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
//# sourceMappingURL=rabbitmqService.js.map