const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        // Aquí puedes manejar los mensajes recibidos
        console.log('Mensaje recibido: %s', message);

        // Reenviar el mensaje a todos los clientes conectados
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Enviar un mensaje cuando un nuevo cliente se conecta
    ws.send('¡Bienvenido al chat!');
});

console.log('Servidor WebSocket corriendo en ws://localhost:8080/');




// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const { setupSocket } = require('./src/config/socket'); 
// const { PORT } = require("./src/config/environment");// Configuración de Socket.IO
// const app = express();

// // Usar body-parser para procesar JSON
// app.use(bodyParser.json());

// // Configurar CORS
// app.use(cors());

// // Crear servidor HTTP (en lugar de HTTPS)
// const server = require('http').createServer(app);

// // Configurar Socket.IO con CORS habilitado

// setupSocket(server);

// app.use('/api/academic', require('./src/routes/academic'));
// app.use('/api/onlineshop', require('./src/routes/onlineshop'));
// app.use('/api/crm', require('./src/routes/crm'));
// app.use('/api/ai', require('./src/routes/geminiAI'));

// const os = require('os'); // Requerir el módulo 'os' para obtener el nombre del host

// server.listen(PORT, () => {
//     const hostName = os.hostname();
//     const port = server.address().port;
//     console.log(`Servidor HTTP corriendo en el host ${hostName} y en el puerto ${port}`);
// });