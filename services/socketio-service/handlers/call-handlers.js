module.exports = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    const tenantId = socket.handshake.auth.tenantId;
    
    socket.join('tenant-' + tenantId);

    socket.on('get-users', () => {
      const users = Array.from(io.sockets.sockets.values())
        .filter(s => s.handshake.auth.tenantId === tenantId)
        .map(s => ({
          userId: s.handshake.auth.userId,
          name: s.handshake.auth.userName,
          role: s.handshake.auth.userRole,
          online: true
        }));
      
      io.to('tenant-' + tenantId).emit('users-in-mortuary', users);
    });

    socket.on('call-user', (data) => {
      const targetSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.handshake.auth.userId === data.targetUserId);
      
      if (targetSocket) {
        targetSocket.emit('incoming-call', {
          fromUserId: userId,
          userName: data.userName
        });
      }
    });

    socket.on('call-accepted', (data) => {
      const callerSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.handshake.auth.userId === data.targetUserId);
      
      if (callerSocket) {
        callerSocket.emit('call-accepted', {});
      }
    });

    socket.on('call-rejected', (data) => {
      const callerSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.handshake.auth.userId === data.targetUserId);
      
      if (callerSocket) {
        callerSocket.emit('call-rejected', {
          userName: socket.handshake.auth.userName
        });
      }
    });

    socket.on('call-ended', (data) => {
      const otherSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.handshake.auth.userId === data.targetUserId);
      
      if (otherSocket) {
        otherSocket.emit('call-ended');
      }
    });
  });
};