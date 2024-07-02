// socketInitializer.js

const socketIO = require('socket.io');
let io;
function initialize(server) {
    io = socketIO(server);
    // Socket.IO logic
    io.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
}
function getSocketServer() {
    return io;
}


module.exports = {initialize,getSocketServer};
