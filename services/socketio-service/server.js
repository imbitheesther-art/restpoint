const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { tenantMiddleware } = require("../../services/app-global/middlewares/tenant-validation");

dotenv.config();

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.isOperational ? err.message : "Internal server error",
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};

// ============================================
// EXPRESS APP SETUP WITH SECURITY HEADERS
// ============================================

const app = express();
const server = http.createServer(app);

// Security Headers - Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

// CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(",") : 
    ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health" // Skip health checks
});
app.use("/emit", limiter);

// Body Parser with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ============================================
// SOCKET.IO SETUP WITH ERROR HANDLING
// ============================================

const PORT = process.env.PORT || process.env.SOCKET_PORT || 8010;

// Redis URL construction with error handling
const getRedisUrl = () => {
  try {
    if (process.env.REDIS_URL) {
      return process.env.REDIS_URL;
    }
    if (process.env.REDIS_HOST) {
      const password = process.env.REDIS_PASSWORD 
        ? `:${encodeURIComponent(process.env.REDIS_PASSWORD)}@` 
        : '';
      const port = process.env.REDIS_PORT || 6379;
      return `redis://${password}${process.env.REDIS_HOST}:${port}`;
    }
    return "redis://redis:6379";
  } catch (error) {
    console.error("Redis URL construction error:", error);
    return "redis://redis:6379"; // Fallback
  }
};

const REDIS_URL = getRedisUrl();

const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
  serveClient: false // Disable serving socket.io client
});

// ============================================
// REDIS ADAPTER WITH GRACEFUL FALLBACK
// ============================================

let redisConnected = false;
let pubClient = null;
let subClient = null;

const initializeRedis = async () => {
  try {
    pubClient = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("Redis max reconnection attempts reached");
            return new Error("Redis connection failed");
          }
          return Math.min(retries * 100, 3000);
        },
        timeout: 10000
      },
      retry_strategy: function(options) {
        if (options.error && options.error.code === "ECONNREFUSED") {
          return new Error("Redis server refused connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error("Redis retry time exhausted");
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    subClient = pubClient.duplicate();

    pubClient.on("error", (err) => {
      console.error("Redis Pub Client Error:", err.message);
      redisConnected = false;
    });

    subClient.on("error", (err) => {
      console.error("Redis Sub Client Error:", err.message);
      redisConnected = false;
    });

    pubClient.on("connect", () => {
      console.log("Redis Pub Client connected");
    });

    subClient.on("connect", () => {
      console.log("Redis Sub Client connected");
    });

    await Promise.all([
      pubClient.connect(),
      subClient.connect()
    ]);

    redisConnected = true;
    io.adapter(createAdapter(pubClient, subClient));
    console.log(" Socket.IO Redis Adapter connected successfully");
    
  } catch (error) {
    console.warn(" Redis connection failed, falling back to in-memory adapter:", error.message);
    redisConnected = false;
    
    // Clean up failed clients
    try {
      if (pubClient) await pubClient.disconnect();
      if (subClient) await subClient.disconnect();
    } catch (cleanupError) {
      console.error("Redis cleanup error:", cleanupError.message);
    }
    
    console.warn(" Socket.IO running in-memory mode - horizontal scaling unavailable");
  }
};

// Initialize Redis
initializeRedis().catch(console.error);

// ============================================
// SOCKET.IO MIDDLEWARE - TENANT VALIDATION
// ============================================

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      const err = new AppError("Authentication required", 401);
      return next(err);
    }

    // Validate JWT token - implement your JWT validation here
    // Example: socket.data.user = jwt.verify(token, process.env.JWT_SECRET);
    // For now, we'll pass through with basic validation
    socket.data.authenticated = true;
    next();
  } catch (error) {
    next(new AppError("Invalid authentication token", 401));
  }
});

// ============================================
// SOCKET.IO EVENT HANDLERS WITH COMPREHENSIVE ERROR HANDLING
// ============================================

// Store active user rooms
const userRooms = new Map();
const socketIdMap = new Map(); // Track socket IDs by user

io.on("connection", (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Welcome message
  socket.emit("connected", {
    socketId: socket.id,
    message: "Connected to Socket.IO server",
    timestamp: new Date().toISOString()
  });

  // ============================================
  // TENANT & USER ROOM MANAGEMENT
  // ============================================

  socket.on("join-tenant", (data, callback) => {
    try {
      // Validate input
      if (!data || typeof data !== 'object') {
        throw new AppError("Invalid data format", 400);
      }

      const { tenantSlug, userId, userRole } = data;

      if (!tenantSlug) {
        throw new AppError("Tenant slug is required", 400);
      }

      if (!userId) {
        throw new AppError("User ID is required", 400);
      }

      // Validate tenant slug format
      if (!/^[a-z0-9-]+$/.test(tenantSlug)) {
        throw new AppError("Invalid tenant slug format", 400);
      }

      const tenantRoom = `tenant_${tenantSlug}`;
      const userRoom = `user_${userId}`;

      // Leave existing rooms
      const existing = userRooms.get(socket.id);
      if (existing) {
        socket.leave(`tenant_${existing.tenantSlug}`);
        socket.leave(`user_${existing.userId}`);
      }

      // Join new rooms
      socket.join(tenantRoom);
      socket.join(userRoom);

      // Store user data
      userRooms.set(socket.id, { 
        tenantSlug, 
        userId, 
        userRole: userRole || 'user',
        connectedAt: new Date()
      });

      // Map socket to user for tracking
      if (!socketIdMap.has(userId)) {
        socketIdMap.set(userId, new Set());
      }
      socketIdMap.get(userId).add(socket.id);

      console.log(`📎 Socket ${socket.id} joined tenant_${tenantSlug} as ${userRole || 'user'}`);

      // Send success response
      if (typeof callback === 'function') {
        callback({
          success: true,
          room: tenantRoom,
          userId,
          role: userRole || 'user',
          timestamp: new Date().toISOString()
        });
      }

      socket.emit("joined", {
        room: tenantRoom,
        userId,
        role: userRole || 'user',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Join tenant error:", error);
      if (typeof callback === 'function') {
        callback({
          success: false,
          error: error.message || "Failed to join tenant room"
        });
      }
      socket.emit("error", { 
        message: error.message || "Failed to join tenant room",
        code: error.statusCode || 400
      });
    }
  });

  /**
   * Join deceased record room
   */
  socket.on("join-deceased", (data, callback) => {
    try {
      const { tenantSlug, deceasedId } = data;

      if (!tenantSlug || !deceasedId) {
        throw new AppError("Tenant slug and deceased ID are required", 400);
      }

      // Validate input
      if (!/^[a-z0-9-]+$/.test(tenantSlug)) {
        throw new AppError("Invalid tenant slug format", 400);
      }

      const deceasedRoom = `deceased_${tenantSlug}_${deceasedId}`;
      socket.join(deceasedRoom);

      console.log(`📎 Socket ${socket.id} joined ${deceasedRoom}`);

      if (typeof callback === 'function') {
        callback({
          success: true,
          room: deceasedRoom,
          deceasedId
        });
      }

      socket.emit("joined-deceased", { 
        room: deceasedRoom, 
        deceasedId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Join deceased error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
      socket.emit("error", { message: error.message });
    }
  });

  // ============================================
  // EVENT HANDLERS WITH VALIDATION
  // ============================================

  /**
   * New deceased admission
   */
  socket.on("deceased-admitted", (data, callback) => {
    try {
      const { tenantSlug, deceasedId, fullName, admissionNumber, dateOfAdmission } = data;

      if (!tenantSlug || !deceasedId || !fullName) {
        throw new AppError("Missing required fields: tenantSlug, deceasedId, fullName", 400);
      }

      const payload = {
        deceasedId,
        fullName,
        admissionNumber,
        dateOfAdmission: dateOfAdmission || new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      io.to(`tenant_${tenantSlug}`).emit("notification:deceased-admitted", payload);
      console.log(`📨 New admission: ${fullName} (${deceasedId})`);

      if (typeof callback === 'function') {
        callback({ success: true, event: "deceased-admitted" });
      }

    } catch (error) {
      console.error("Deceased admitted error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  /**
   * Embalming status update
   */
  socket.on("deceased-embalmed", (data, callback) => {
    try {
      const { tenantSlug, deceasedId, deceasedName, embalmerName } = data;

      if (!tenantSlug || !deceasedId) {
        throw new AppError("Missing required fields: tenantSlug, deceasedId", 400);
      }

      const payload = {
        deceasedId,
        deceasedName,
        embalmerName,
        status: "embalmed",
        timestamp: new Date().toISOString()
      };

      io.to(`deceased_${tenantSlug}_${deceasedId}`).emit("status:embalmed", payload);
      io.to(`tenant_${tenantSlug}`).emit("notification:status-change", payload);

      if (typeof callback === 'function') {
        callback({ success: true, event: "deceased-embalmed" });
      }

    } catch (error) {
      console.error("Deceased embalmed error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  /**
   * Release approval request
   */
  socket.on("release-requested", (data, callback) => {
    try {
      const { tenantSlug, deceasedId, deceasedName, requestedBy } = data;

      if (!tenantSlug || !deceasedId) {
        throw new AppError("Missing required fields: tenantSlug, deceasedId", 400);
      }

      const payload = {
        deceasedId,
        deceasedName,
        requestedBy,
        timestamp: new Date().toISOString()
      };

      io.to(`tenant_${tenantSlug}`).emit("notification:release-requested", payload);
      console.log(`📨 Release requested for: ${deceasedName}`);

      if (typeof callback === 'function') {
        callback({ success: true, event: "release-requested" });
      }

    } catch (error) {
      console.error("Release requested error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  /**
   * Release approved
   */
  socket.on("release-approved", (data, callback) => {
    try {
      const { tenantSlug, deceasedId, deceasedName, approvedBy } = data;

      if (!tenantSlug || !deceasedId) {
        throw new AppError("Missing required fields: tenantSlug, deceasedId", 400);
      }

      const payload = {
        deceasedId,
        deceasedName,
        approvedBy,
        timestamp: new Date().toISOString()
      };

      io.to(`deceased_${tenantSlug}_${deceasedId}`).emit("status:release-approved", payload);
      io.to(`tenant_${tenantSlug}`).emit("notification:release-approved", payload);

      if (typeof callback === 'function') {
        callback({ success: true, event: "release-approved" });
      }

    } catch (error) {
      console.error("Release approved error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  /**
   * Deceased released
   */
  socket.on("deceased-released", (data, callback) => {
    try {
      const { tenantSlug, deceasedId, deceasedName, releasedBy, releaseDate } = data;

      if (!tenantSlug || !deceasedId) {
        throw new AppError("Missing required fields: tenantSlug, deceasedId", 400);
      }

      const payload = {
        deceasedId,
        deceasedName,
        releasedBy,
        releaseDate: releaseDate || new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      io.to(`deceased_${tenantSlug}_${deceasedId}`).emit("status:released", payload);
      
      // Remove sockets from deceased room after release
      const room = io.sockets.adapter.rooms.get(`deceased_${tenantSlug}_${deceasedId}`);
      if (room) {
        room.forEach(socketId => {
          io.sockets.sockets.get(socketId)?.leave(`deceased_${tenantSlug}_${deceasedId}`);
        });
      }

      if (typeof callback === 'function') {
        callback({ success: true, event: "deceased-released" });
      }

    } catch (error) {
      console.error("Deceased released error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  // ============================================
  // INVOICE & PAYMENT NOTIFICATIONS
  // ============================================

  socket.on("invoice-created", (data, callback) => {
    try {
      const { tenantSlug, deceasedId, invoiceNumber, total, createdBy } = data;

      if (!tenantSlug || !deceasedId || !invoiceNumber) {
        throw new AppError("Missing required fields: tenantSlug, deceasedId, invoiceNumber", 400);
      }

      const payload = {
        invoiceNumber,
        total: parseFloat(total) || 0,
        createdBy,
        timestamp: new Date().toISOString()
      };

      io.to(`deceased_${tenantSlug}_${deceasedId}`).emit("notification:invoice-created", payload);
      io.to(`tenant_${tenantSlug}`).emit("notification:invoice-created", {
        ...payload,
        deceasedId
      });

      if (typeof callback === 'function') {
        callback({ success: true, event: "invoice-created" });
      }

    } catch (error) {
      console.error("Invoice created error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  socket.on("payment-received", (data, callback) => {
    try {
      const { tenantSlug, invoiceId, invoiceNumber, amount, paymentMethod, receivedBy } = data;

      if (!tenantSlug || !invoiceId) {
        throw new AppError("Missing required fields: tenantSlug, invoiceId", 400);
      }

      const payload = {
        invoiceId,
        invoiceNumber,
        amount: parseFloat(amount) || 0,
        paymentMethod,
        receivedBy,
        timestamp: new Date().toISOString()
      };

      io.to(`tenant_${tenantSlug}`).emit("notification:payment-received", payload);
      console.log(`💳 Payment received: ${invoiceNumber} - ${amount}`);

      if (typeof callback === 'function') {
        callback({ success: true, event: "payment-received" });
      }

    } catch (error) {
      console.error("Payment received error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  socket.on("invoice-overdue", (data, callback) => {
    try {
      const { tenantSlug, invoiceNumber, daysOverdue, outstandingAmount } = data;

      if (!tenantSlug || !invoiceNumber) {
        throw new AppError("Missing required fields: tenantSlug, invoiceNumber", 400);
      }

      const payload = {
        invoiceNumber,
        daysOverdue: parseInt(daysOverdue) || 0,
        outstandingAmount: parseFloat(outstandingAmount) || 0,
        timestamp: new Date().toISOString()
      };

      io.to(`tenant_${tenantSlug}`).emit("alert:invoice-overdue", payload);

      if (typeof callback === 'function') {
        callback({ success: true, event: "invoice-overdue" });
      }

    } catch (error) {
      console.error("Invoice overdue error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  // ============================================
  // INVENTORY & STOCK NOTIFICATIONS
  // ============================================

  socket.on("stock-alert", (data, callback) => {
    try {
      const { tenantSlug, itemType, itemName, currentStock, minimumStock } = data;

      if (!tenantSlug || !itemName) {
        throw new AppError("Missing required fields: tenantSlug, itemName", 400);
      }

      const payload = {
        itemType,
        itemName,
        currentStock: parseInt(currentStock) || 0,
        minimumStock: parseInt(minimumStock) || 0,
        timestamp: new Date().toISOString()
      };

      io.to(`tenant_${tenantSlug}`).emit("alert:low-stock", payload);
     

      if (typeof callback === 'function') {
        callback({ success: true, event: "stock-alert" });
      }

    } catch (error) {
      console.error("Stock alert error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  socket.on("coffin-used", (data, callback) => {
    try {
      const { tenantSlug, coffinType, deceasedName, usedBy } = data;

      if (!tenantSlug || !coffinType) {
        throw new AppError("Missing required fields: tenantSlug, coffinType", 400);
      }

      const payload = {
        coffinType,
        deceasedName,
        usedBy,
        timestamp: new Date().toISOString()
      };

      io.to(`tenant_${tenantSlug}`).emit("notification:coffin-used", payload);

      if (typeof callback === 'function') {
        callback({ success: true, event: "coffin-used" });
      }

    } catch (error) {
      console.error("Coffin used error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  // ============================================
  // DOCUMENT & PROCESS NOTIFICATIONS
  // ============================================

  socket.on("document-generated", (data, callback) => {
    try {
      const { tenantSlug, deceasedId, documentType, documentName, generatedBy } = data;

      if (!tenantSlug || !documentType) {
        throw new AppError("Missing required fields: tenantSlug, documentType", 400);
      }

      const payload = {
        documentType,
        documentName,
        generatedBy,
        timestamp: new Date().toISOString()
      };

      if (deceasedId) {
        io.to(`deceased_${tenantSlug}_${deceasedId}`).emit("notification:document-generated", payload);
      }
      io.to(`tenant_${tenantSlug}`).emit("notification:document-generated", {
        ...payload,
        ...(deceasedId && { deceasedId })
      });

      if (typeof callback === 'function') {
        callback({ success: true, event: "document-generated" });
      }

    } catch (error) {
      console.error("Document generated error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  socket.on("task-completed", (data, callback) => {
    try {
      const { tenantSlug, taskType, deceasedId, deceasedName, completedBy } = data;

      if (!tenantSlug || !taskType) {
        throw new AppError("Missing required fields: tenantSlug, taskType", 400);
      }

      const payload = {
        taskType,
        deceasedId,
        deceasedName,
        completedBy,
        timestamp: new Date().toISOString()
      };

      io.to(`tenant_${tenantSlug}`).emit("notification:task-completed", payload);

      if (typeof callback === 'function') {
        callback({ success: true, event: "task-completed" });
      }

    } catch (error) {
      console.error("Task completed error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  // ============================================
  // DASHBOARD & ANALYTICS
  // ============================================

  socket.on("request-stats", (data, callback) => {
    try {
      const { tenantSlug } = data;
      const userRoom = userRooms.get(socket.id);

      if (!userRoom || userRoom.tenantSlug !== tenantSlug) {
        throw new AppError("Unauthorized to request stats for this tenant", 403);
      }

      // Forward to stats service
      io.emit("stats-request", { 
        tenantSlug, 
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });

      if (typeof callback === 'function') {
        callback({ success: true, message: "Stats request forwarded" });
      }

    } catch (error) {
      console.error("Request stats error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  socket.on("broadcast-stats", (data, callback) => {
    try {
      const { tenantSlug, stats } = data;

      if (!tenantSlug || !stats || typeof stats !== 'object') {
        throw new AppError("Invalid stats data", 400);
      }

      const payload = {
        stats,
        timestamp: new Date().toISOString()
      };

      io.to(`tenant_${tenantSlug}`).emit("stats-update", payload);

      if (typeof callback === 'function') {
        callback({ success: true, event: "broadcast-stats" });
      }

    } catch (error) {
      console.error("Broadcast stats error:", error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  // ============================================
  // DISCONNECT HANDLING
  // ============================================

  socket.on("disconnect", () => {
    const userData = userRooms.get(socket.id);
    if (userData) {
      const { userId } = userData;
      const sockets = socketIdMap.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          socketIdMap.delete(userId);
        }
      }
    }
    userRooms.delete(socket.id);
    console.log(`👋 User disconnected: ${socket.id}`);
  });

  // Global error handler for socket
  socket.on("error", (error) => {
    console.error(`❌ Socket error (${socket.id}):`, error);
    socket.emit("error", {
      message: "An unexpected error occurred",
      code: "INTERNAL_ERROR"
    });
  });

  // Handle uncaught exceptions in socket handlers
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    // Don't crash the server - log and continue
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Don't crash the server - log and continue
  });

});

// ============================================
// REST ENDPOINTS WITH COMPREHENSIVE ERROR HANDLING
// ============================================

/**
 * Emit events via REST API
 */
app.post("/emit/:event", async (req, res, next) => {
  try {
    const { event } = req.params;
    const { tenantSlug, data, target } = req.body;

    if (!event || typeof event !== 'string') {
      throw new AppError("Invalid event name", 400);
    }

    if (!tenantSlug) {
      throw new AppError("tenantSlug is required", 400);
    }

    if (!data || typeof data !== 'object') {
      throw new AppError("Data must be a valid object", 400);
    }

    // Security: Validate event name (alphanumeric, dash, underscore only)
    if (!/^[a-zA-Z0-9\-_]+$/.test(event)) {
      throw new AppError("Invalid event name format", 400);
    }

    // Security: Validate tenant slug
    if (!/^[a-z0-9-]+$/.test(tenantSlug)) {
      throw new AppError("Invalid tenant slug format", 400);
    }

    const payload = {
      ...data,
      timestamp: new Date().toISOString()
    };

    // Special events that don't get prefix
    const noPrefixEvents = ['ticket_response', 'ticket_updated', 'onboarding-progress'];
    const eventName = noPrefixEvents.includes(event) ? event : `notification:${event}`;

    // Emit to specific target if provided
    if (target) {
      if (typeof target === 'string') {
        io.to(target).emit(eventName, payload);
      } else if (Array.isArray(target)) {
        target.forEach(room => io.to(room).emit(eventName, payload));
      } else {
        throw new AppError("Target must be a string or array of strings", 400);
      }
    } else {
      // Emit to tenant room
      io.to(`tenant_${tenantSlug}`).emit(eventName, payload);
    }

    console.log(`📨 Emitted ${eventName} to tenant_${tenantSlug}`);

    res.json({
      success: true,
      event: eventName,
      tenantSlug,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  try {
    const health = {
      status: "UP",
      service: "socketio-service",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      connections: {
        active: io.engine.clientsCount,
        userRooms: userRooms.size,
        socketIdMap: socketIdMap.size
      },
      redis: {
        connected: redisConnected
      },
      environment: process.env.NODE_ENV || "development"
    };

    const statusCode = redisConnected ? 200 : 200; // Still healthy, just degraded
    res.status(statusCode).json(health);

  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Detailed stats endpoint (admin only)
 */
app.get("/stats", (req, res, next) => {
  try {
    // In production, add auth middleware here
    const stats = {
      activeConnections: io.engine.clientsCount,
      userRooms: userRooms.size,
      socketIdMap: socketIdMap.size,
      redisConnected,
      rooms: Array.from(io.sockets.adapter.rooms.keys()).filter(r => r.startsWith('tenant_')),
      timestamp: new Date().toISOString()
    };

    res.json(stats);

  } catch (error) {
    next(error);
  }
});

/**
 * Room members endpoint
 */
app.get("/rooms/:room/members", (req, res, next) => {
  try {
    const { room } = req.params;

    if (!room || typeof room !== 'string') {
      throw new AppError("Invalid room name", 400);
    }

    const roomData = io.sockets.adapter.rooms.get(room);
    
    res.json({
      room,
      members: roomData ? Array.from(roomData) : [],
      count: roomData ? roomData.size : 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// ============================================
// GLOBAL ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// PROCESS LEVEL ERROR HANDLING
// ============================================

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n Received ${signal}, starting graceful shutdown...`);

  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close Redis connections
  if (redisConnected) {
    try {
      await pubClient?.quit();
      await subClient?.quit();
      console.log('Redis connections closed');
    } catch (error) {
      console.error('Redis shutdown error:', error);
    }
  }

  // Close socket connections
  io.close(() => {
    console.log('Socket.IO closed');
  });

  // Force exit after timeout
  setTimeout(() => {
    console.log('Graceful shutdown timeout, forcing exit...');
    process.exit(1);
  }, 10000);

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
 

});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log and continue
});

// ============================================
// START SERVER
// ============================================

server.listen(PORT, "0.0.0.0", () => {
  console.log(` Socket.IO Server running on port ${PORT}`);
  console.log(`Redis: ${redisConnected ? ' Connected' : ' Fallback mode'}`);
  console.log(` Security: Helmet + CORS + Rate Limiting enabled`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health: http://localhost:${PORT}/health`);
});