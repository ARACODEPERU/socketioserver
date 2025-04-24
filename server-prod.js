const express = require('express');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser'); // Asegúrate de que body-parser esté importado
const cors = require('cors');
const { setupSocket } = require('./src/config/socket'); // Configuración de Socket.IO
const { PORT } = require("./src/config/environment");

const app = express();

// Usar body-parser para procesar JSON
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true })); // Necesario para recibir archivos
// Configurar CORS
app.use(cors());



// Leer certificados SSL
const privateKey = fs.readFileSync('/etc/letsencrypt/live/sv-nxpjlr3ztb.cloud.elastika.pe/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/sv-nxpjlr3ztb.cloud.elastika.pe/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Crear servidor HTTPS
const server = https.createServer(credentials, app);

// Configurar Socket.IO con CORS habilitado

setupSocket(server);

app.use('/api/academic', require('./src/routes/academic'));
app.use('/api/onlineshop', require('./src/routes/onlineshop'));
app.use('/api/crm', require('./src/routes/crm'));
app.use('/api/ai', require('./src/routes/geminiAI'));
// Iniciar servidor HTTPS
const os = require('os'); // Requerir el módulo 'os' para obtener el nombre del host

server.listen(PORT, () => {
    const hostName = os.hostname();
    const port = server.address().port;
    console.log(`Servidor HTTP corriendo en el host ${hostName} y en el puerto ${port}`);
});