module.exports = (io) => {
  io.on('connection', (socket) => {
    const tenantId = socket.handshake.auth.tenantId;
    
    socket.join('tenant-' + tenantId);

    socket.on('task-status-change', (task) => {
      io.to('tenant-' + tenantId).emit('task-updated', task);
    });

    socket.on('new-task', (task) => {
      io.to('tenant-' + tenantId).emit('task-created', task);
    });
  });
};