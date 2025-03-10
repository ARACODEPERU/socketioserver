const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { setupSocket } = require('./src/config/socket'); // Configuración de Socket.IO
const app = express();

// Usar body-parser para procesar JSON
app.use(bodyParser.json());

// Configurar CORS
app.use(cors());

// Crear servidor HTTP (en lugar de HTTPS)
const server = require('http').createServer(app);

// Configurar Socket.IO con CORS habilitado

setupSocket(server);

app.use('/api/academic', require('./src/routes/academic'));
app.use('/api/onlineshop', require('./src/routes/onlineshop'));

const os = require('os'); // Requerir el módulo 'os' para obtener el nombre del host

server.listen(3000, () => {
    const hostName = os.hostname();
    const port = server.address().port;
    console.log(`Servidor HTTP corriendo en el host ${hostName} y en el puerto ${port}`);
});