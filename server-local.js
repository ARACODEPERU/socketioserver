const express = require('express');
const fs = require('fs');
const https = require('https');
const socketIO = require('socket.io');
const bodyParser = require('body-parser'); // Asegúrate de que body-parser esté importado
const cors = require('cors');

const app = express();

// Usar body-parser para procesar JSON
app.use(bodyParser.json());

// Configurar CORS
app.use(cors());

// Leer certificados SSL
const privateKey = fs.readFileSync('D:/laragon/etc/ssl/laragon.key', 'utf8');
const certificate = fs.readFileSync('D:/laragon/etc/ssl/laragon.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Crear servidor HTTPS
const server = https.createServer(credentials, app);

// Configurar Socket.IO con CORS habilitado
const io = socketIO(server, {
    cors: {
        origin: "*", // En producción, especifica el dominio permitido
        methods: ["GET", "POST"],
        allowedHeaders: ["Access-Control-Allow-Origin", "Content-Type"],
        credentials: true
    }
});
// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('New client connected via HTTPS');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.post('/broadcast', (req, res) => {
    const { channel, event, data } = req.body;

    if (!channel || !event || !data) {
        return res.status(400).send('Invalid payload');
    }

    try {
        const channelName = channel.name; // Obtener el nombre del canal
        console.log('Emit event to channel:', channelName);
        console.log('Datos recibidos:', { channel, event, data });

        // Verifica si hay clientes conectados al canal
        const clients = io.sockets.adapter.rooms.get('channel-message.1');
        if (clients) {
            console.log(`Número de clientes en el canal ${channelName}: ${clients.size}`);
        } else {
            console.log(`El canal ${channelName} no tiene clientes conectados.`);
        }

        // Emitir el evento al canal correspondiente
        //io.to('channel-message.1').emit(event, data);
        io.sockets.emit(channelName, { event, data});
        res.status(200).send('Event broadcasted');
    } catch (error) {
        console.error('Error al emitir el evento:', error);
        res.status(500).send('Error broadcasting event');
    }
});

// Iniciar servidor HTTPS
server.listen(3000, () => {
    console.log('HTTPS server running on port 3000');
});
