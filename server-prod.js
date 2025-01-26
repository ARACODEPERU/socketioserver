const express = require('express');
const https = require('https');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Usar body-parser para procesar JSON
app.use(bodyParser.json());

// Configurar CORS
app.use(cors());

// Crear servidor HTTP (en lugar de HTTPS)
const server = require('http').createServer(app);

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
    console.log('New client connected via HTTP');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente");
});


app.post('/broadcast', (req, res) => {
    const { channel, event, data } = req.body;

    if (!channel || !event || !data) {
        return res.status(400).send('Invalid payload');
    }

    try {
        const channelName = channel.name;
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
        io.sockets.emit(channelName, { event, data });
        res.status(200).send('Event broadcasted');
    } catch (error) {
        console.error('Error al emitir el evento:', error);
        res.status(500).send('Error broadcasting event');
    }
});


app.post("/send-emails", async (req, res) => {
    const correos = req.body;
    res.setHeader("Content-Type", "application/json");

    // Crear un agente HTTPS que ignore certificados autofirmados
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });
    //console.log('api',correos.urlBacken);
    for (const contact of correos.para) {
        let correo = {
            title: correos.asunto,
            type: correos.correoDefault,
            contact: contact,
            message: correos.mensaje
        };

        try {
            // Enviar solicitud con Axios
            const response = await axios.post(correos.urlBacken, { 'correo': correo }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": correos.csrfToken // Agregar el token CSRF aquí
                },
                httpsAgent, // Pasar el agente personalizado
            });

            // Manejar el resultado exitoso

            // Emitir el resultado del contacto al cliente en tiempo real
            io.emit('email-status', {
                name: contact.name,
                email: contact.email,
                status: response.data.success ? 'Enviado correctamente' : 'Error al enviar',
                result: response.data
            });

        } catch (error) {
            // Manejar errores al enviar la solicitud
            console.error(`Error al enviar correo a ${contact.email}:`, error.message);

            // Emitir el resultado de error al cliente en tiempo real
            io.emit('email-status', {
                name: contact.name,
                email: contact.email,
                status: 'error al enviar',
                error: error.message
            });
        }
    }

    res.end();
});

const os = require('os'); // Requerir el módulo 'os' para obtener el nombre del host

server.listen(3000, () => {
    const hostName = os.hostname();
    const port = server.address().port;
    console.log(`Servidor HTTP corriendo en el host ${hostName} y en el puerto ${port}`);
});