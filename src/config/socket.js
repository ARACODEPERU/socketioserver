const socketIO = require('socket.io');

function setupSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: "*",  // Asegúrate de que esté configurado para aceptar cualquier origen, o especifica tu dominio
            methods: ["GET", "POST", "PUT"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        }
    });

    io.on('connection', (socket) => {
        console.log('Cliente conectado');
        
        socket.on('disconnect', () => {
            console.log('Cliente desconectado');
        });
    });

    global.io = io; // Hacerlo accesible en otras partes del código

    console.log('Socket.io funcionando');
}

module.exports = { setupSocket };
