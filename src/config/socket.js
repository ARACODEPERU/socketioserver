const socketIO = require('socket.io');

function setupSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    console.log('Socket.IO inicializado');

    io.on('connection', (socket) => {
        console.log('Cliente conectado a Socket.IO');
        socket.on('disconnect', () => {
            console.log('Cliente desconectado');
        });
    });

    global.io = io;
}

module.exports = { setupSocket };