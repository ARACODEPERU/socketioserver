const socketIO = require('socket.io');

function setupSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: "*", // En producción, especifica el dominio permitido
            methods: ["GET", "POST","PUT"],
            allowedHeaders: ["Access-Control-Allow-Origin", "Content-Type"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado ARACODE');
        socket.on('disconnect', () => {
            console.log('Cliente desconectado ARACODE');
        });
    });

    global.io = io; // Hacerlo accesible en otras partes del código

}

module.exports = { setupSocket };