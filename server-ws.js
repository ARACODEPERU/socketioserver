const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('WebSocket server');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    console.log('New WebSocket connection');
    // Aquí puedes manejar las conexiones WebSocket
});

server.listen(3000, 'localhost', () => {
    console.log('Server running at http://localhost:3000/');
});




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