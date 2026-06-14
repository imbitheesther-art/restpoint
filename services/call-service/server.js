const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 8120;

app.use(cors());
app.use(helmet());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Room mapping: tenantSlug -> { activeUsers: Set<socketId>, roomId: string, branchName: string }
const rooms = new Map();

// Map socket.id -> { tenantSlug, userId, userName, branchId, department }
const socketUsers = new Map();

// Track which users are in which rooms for cross-branch calling
const userDirectory = new Map(); // tenantSlug -> [{ userId, userName, online: bool }]

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    service: 'call-service', 
    rooms: rooms.size, 
    connections: socketUsers.size,
    directorySize: userDirectory.size 
  });
});

// API: Get or create a room for a tenant (each mortuary gets their own room)
app.get('/api/v2/restpoint/call/room/:tenantSlug', (req, res) => {
  const { tenantSlug } = req.params;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!rooms.has(tenantSlug)) {
      rooms.set(tenantSlug, {
        roomId: `call-${tenantSlug}`,
        activeUsers: new Set(),
        created: Date.now()
      });
    }
    
    const room = rooms.get(tenantSlug);
    return res.json({
      success: true,
      data: {
        roomId: room.roomId,
        tenantSlug,
        activeUsers: room.activeUsers.size,
        users: Array.from(room.activeUsers).map(sid => {
          const user = socketUsers.get(sid);
          return user ? { 
            userId: user.userId, 
            userName: user.userName,
            branchId: user.branchId,
            department: user.department
          } : null;
        }).filter(Boolean)
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// API: List all active call rooms with online users directory
app.get('/api/v2/restpoint/call/rooms', (req, res) => {
  const roomsList = [];
  for (const [tenantSlug, room] of rooms.entries()) {
    roomsList.push({
      tenantSlug,
      roomId: room.roomId,
      activeUsers: room.activeUsers.size,
      onlineUsers: userDirectory.get(tenantSlug) || [],
      users: Array.from(room.activeUsers).map(sid => {
        const user = socketUsers.get(sid);
        return user ? { 
          userId: user.userId, 
          userName: user.userName,
          branchId: user.branchId,
          department: user.department
        } : null;
      }).filter(Boolean)
    });
  }
  return res.json({ success: true, data: roomsList });
});

// API: Get online user directory for all tenants (cross-branch directory)
app.get('/api/v2/restpoint/call/directory', (req, res) => {
  const directory = [];
  for (const [tenantSlug, users] of userDirectory.entries()) {
    directory.push({
      tenantSlug,
      onlineCount: users.filter(u => u.online).length,
      users: users.filter(u => u.online)
    });
  }
  return res.json({ success: true, data: directory });
});

// API: Initiate a call to another tenant/user (cross-mortuary calling)
app.post('/api/v2/restpoint/call/call-tenant', (req, res) => {
  const { targetTenantSlug, callerTenantSlug, targetUserId } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find the target room
    const targetRoom = rooms.get(targetTenantSlug);
    if (!targetRoom || targetRoom.activeUsers.size === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Target mortuary has no active users' 
      });
    }
    
    // Generate a call session
    const callSessionId = `call-${callerTenantSlug}-${targetTenantSlug}-${Date.now()}`;
    
    // Emit incoming call event to target room
    const callerInfo = Array.from(rooms.get(callerTenantSlug)?.activeUsers || [])
      .map(sid => socketUsers.get(sid))
      .filter(Boolean)[0] || { userName: 'Unknown', tenantSlug: callerTenantSlug };
    
    // Send to specific user if targetUserId provided, otherwise broadcast
    if (targetUserId) {
      for (const [sid, user] of socketUsers.entries()) {
        if (user.userId === targetUserId) {
          io.to(sid).emit('incoming-call', {
            callSessionId,
            from: callerTenantSlug,
            fromUserName: callerInfo.userName,
            timestamp: Date.now()
          });
          break;
        }
      }
    } else {
      io.to(targetRoom.roomId).emit('incoming-call', {
        callSessionId,
        from: callerTenantSlug,
        fromUserName: callerInfo.userName,
        timestamp: Date.now()
      });
    }
    
    return res.json({
      success: true,
      data: {
        callSessionId,
        targetTenantSlug,
        targetOnlineUsers: targetRoom.activeUsers.size
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[CallSocket] New connection: ${socket.id}`);
  
  // Join a call room
  socket.on('join-call-room', (data) => {
    const { tenantSlug, userId, userName, token, branchId, department } = data;
    
    try {
      if (token) {
        jwt.verify(token, JWT_SECRET);
      }
      
      const roomId = `call-${tenantSlug}`;
      
      // Create room if it doesn't exist
      if (!rooms.has(tenantSlug)) {
        rooms.set(tenantSlug, {
          roomId,
          activeUsers: new Set(),
          created: Date.now()
        });
      }
      
      const room = rooms.get(tenantSlug);
      room.activeUsers.add(socket.id);
      
      // Store user info
      socketUsers.set(socket.id, { 
        tenantSlug, 
        userId, 
        userName, 
        branchId: branchId || null,
        department: department || null
      });
      
      // Update user directory
      if (!userDirectory.has(tenantSlug)) {
        userDirectory.set(tenantSlug, []);
      }
      const dir = userDirectory.get(tenantSlug);
      const existing = dir.findIndex(u => u.userId === userId);
      if (existing >= 0) {
        dir[existing].online = true;
        dir[existing].userName = userName;
      } else {
        dir.push({ userId, userName, online: true, tenantSlug });
      }
      
      socket.join(roomId);
      
      // Notify all users in the room
      io.to(roomId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
        branchId: branchId || null,
        department: department || null
      });
      
      // Broadcast updated user list
      io.to(roomId).emit('room-users', {
        users: Array.from(room.activeUsers).map(sid => {
          const u = socketUsers.get(sid);
          return u ? { userId: u.userId, userName: u.userName, branchId: u.branchId } : null;
        }).filter(Boolean)
      });
      
      console.log(`[CallSocket] ${userName} joined room ${tenantSlug} (${room.activeUsers.size} active)`);
    } catch (err) {
      socket.emit('error-message', { message: 'Invalid authentication' });
    }
  });
  
  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(data.targetRoom || data.targetSocket).emit('offer', {
      offer: data.offer,
      from: socket.id,
      userName: socketUsers.get(socket.id)?.userName
    });
  });
  
  socket.on('answer', (data) => {
    socket.to(data.targetSocket).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });
  
  socket.on('ice-candidate', (data) => {
    socket.to(data.targetSocket).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });
  
  // Direct user-to-user call
  socket.on('call-user', (data) => {
    const { targetUserId, offer } = data;
    const caller = socketUsers.get(socket.id);
    
    for (const [sid, user] of socketUsers.entries()) {
      if (user.userId === targetUserId) {
        io.to(sid).emit('incoming-call', {
          offer,
          from: socket.id,
          callerInfo: caller
        });
        break;
      }
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const userInfo = socketUsers.get(socket.id);
    
    if (userInfo) {
      const { tenantSlug, userId, userName } = userInfo;
      const room = rooms.get(tenantSlug);
      
      if (room) {
        room.activeUsers.delete(socket.id);
        
        // Notify room
        io.to(room.roomId).emit('user-left', {
          socketId: socket.id,
          userId,
          userName
        });
        
        // Update user directory
        const dir = userDirectory.get(tenantSlug);
        if (dir) {
          const userIdx = dir.findIndex(u => u.userId === userId);
          if (userIdx >= 0) {
            dir[userIdx].online = false;
          }
        }
        
        // Clean up empty rooms
        if (room.activeUsers.size === 0) {
          rooms.delete(tenantSlug);
        }
      }
      
      socketUsers.delete(socket.id);
      console.log(`[CallSocket] ${userName} disconnected from ${tenantSlug}`);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`📞 Call Service running on port ${PORT}`);
  console.log(`   WebSocket: ws://0.0.0.0:${PORT}`);
  console.log(`   REST API:  http://0.0.0.0:${PORT}/api/v2/restpoint/call`);
});