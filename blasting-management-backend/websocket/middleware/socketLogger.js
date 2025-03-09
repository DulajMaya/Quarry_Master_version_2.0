const socketLogger = (socket, next) => {
    // Log connection
    console.log(`Socket Connected - ID: ${socket.id}`);

    // Log all incoming events
    const onevent = socket.onevent;
    socket.onevent = function(packet) {
        const args = packet.data || [];
        console.log('Socket Event:', {
            id: socket.id,
            userId: socket.user?.id,
            event: args[0],
            timestamp: new Date().toISOString(),
            data: args.slice(1)
        });
        onevent.call(this, packet);
    };

    // Log disconnection
    socket.on('disconnect', (reason) => {
        console.log('Socket Disconnected:', {
            id: socket.id,
            userId: socket.user?.id,
            reason,
            timestamp: new Date().toISOString()
        });
    });

    // Log errors
    socket.on('error', (error) => {
        console.error('Socket Error:', {
            id: socket.id,
            userId: socket.user?.id,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    });

    next();
};

module.exports = socketLogger;