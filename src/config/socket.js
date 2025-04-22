// const socketIO = require('socket.io');

// function setupSocket(server) {
//     const io = socketIO(server, {
//         cors: {
//             origin: "*", // En producción, especifica el dominio permitido
//             methods: ["GET", "POST","PUT"],
//             allowedHeaders: ["Access-Control-Allow-Origin", "Content-Type"],
//             credentials: true
//         }
//     });

//     io.on('connection', (socket) => {
//         socket.on('disconnect', () => {
//             console.log('Cliente desconectado ARACODE');
//         });
//     });

//     global.io = io; // Hacerlo accesible en otras partes del código

//     console.log('socket.io: ACTIVO')
// }

// module.exports = { setupSocket };

const socketIO = require('socket.io');

function setupSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: "*", // Esto permite cualquier origen. Reemplaza con tu dominio en producción
            methods: ["GET", "POST","PUT","DELETE"],
            allowedHeaders: ["Content-Type"],
            credentials: false
        }
    });

    io.on('connection', (socket) => {
        console.log('Cliente conectado');

        socket.on('disconnect', () => {
            console.log('Cliente desconectado ARACODE');
        });
    });

    global.io = io;
    console.log('socket.io: ACTIVO')
}

module.exports = { setupSocket };
