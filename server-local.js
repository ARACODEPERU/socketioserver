const express = require('express');
const fs = require('fs');
const https = require('https');
const socketIO = require('socket.io');
const bodyParser = require('body-parser'); // Asegúrate de que body-parser esté importado
const cors = require('cors');
const axios = require('axios');
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

app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente");
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

app.post("/send-emails", async (req, res) => {
    const correos = req.body;
    res.setHeader("Content-Type", "application/json");

    // Crear un agente HTTPS que ignore certificados autofirmados
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    let channelListen = correos.channelListen;
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
            io.emit(channelListen, {
                name: contact.name,
                email: contact.email,
                status: response.data.success ? 'Enviado correctamente' : 'Error al enviar',
                result: response.data
            });

        } catch (error) {
            // Manejar errores al enviar la solicitud
            console.error(`Error al enviar correo a ${contact.email}:`, error.message);

            // Emitir el resultado de error al cliente en tiempo real
            io.emit(channelListen, {
                name: contact.name,
                email: contact.email,
                status: 'error al enviar',
                error: error.message
            });
        }
    }

    res.end();
});

app.post("/onli-send-emails", async (req, res) => {
    const datos = req.body;
    res.setHeader("Content-Type", "application/json");

    // Crear un agente HTTPS que ignore certificados autofirmados
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    let channelListen = datos.channelListen;
    //console.log('channelListen:', channelListen);
    for (const venta of datos.ventas) {
		let pedido = {
			documenttypeId: datos.documenttypeId,
			venta: {
                nota_sale_id: venta.nota_sale_id,
                id: venta.id,
                details: venta.details,
            },
			serie: datos.serie,
			enline: datos.enline,
			local: datos.local,
			userId: datos.userId
		}

        try {
            // 1. Enviar solicitud para generar la boleta
            const response = await axios.post(datos.apiBackenStepOne, { 'pedido': pedido }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": datos.csrfToken
                },
                httpsAgent, // Pasar el agente personalizado
            });
            console.log(response.data)
            // Extraer datos de la respuesta
            const { success, document,onlisaleId, message } = response.data;
        
            // 2. Emitir resultado al usuario en tiempo real
            io.emit(channelListen, {
                status: success,
                step: 1,
                data: { document, message }
            });
        
            // Si la boleta se generó correctamente, proceder con el envío del correo
            if (success) {
                const emailData = {
                    person_email: document.client_email,
                    person_name: document.client_rzn_social,
                    document_id: document.id,
                    onlisaleId: onlisaleId
                };
        
                // 3. Enviar solicitud para el envío del correo
                const emailResponse = await axios.post(datos.apiBackenStepTwo, emailData, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": datos.csrfToken
                    },
                    httpsAgent,
                });
                console.log(emailResponse.data)
                // 4. Emitir confirmación de envío de correo
                io.emit(channelListen, {
                    status: emailResponse.data.success,
                    step: 2,
                    data: emailResponse.data.correosMessage
                });
            }
        } catch (error) {
            console.error("Error en el proceso:", error.message);
            
            // Emitir error al usuario
            io.emit(channelListen, {
                status: "error",
                error: error.message
            });
        }
    }

    res.end();
});

// Iniciar servidor HTTPS
server.listen(3000, () => {
    console.log('HTTPS server running on port 3000');
});
