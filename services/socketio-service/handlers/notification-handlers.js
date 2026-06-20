module.exports = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    const tenantId = socket.handshake.auth.tenantId;

    socket.join('notifications-' + userId);
    socket.join('tenant-' + tenantId);

    socket.on('send-notification', (data) => {
      io.to('notifications-' + data.targetUserId).emit('notification', {
        id: Date.now(),
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        createdAt: new Date(),
        read: false
      });
    });

    socket.on('broadcast-notification', (data) => {
      io.to('tenant-' + tenantId).emit('notification', {
        id: Date.now(),
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        createdAt: new Date(),
        read: false
      });
    });
  });
};
