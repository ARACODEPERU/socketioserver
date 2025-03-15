const express = require('express');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser'); // Asegúrate de que body-parser esté importado
const cors = require('cors');
const { setupSocket } = require('./src/config/socket'); // Configuración de Socket.IO

const app = express();

// Usar body-parser para procesar JSON
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true })); // Necesario para recibir archivos
// Configurar CORS
app.use(cors());



// Leer certificados SSL
const privateKey = fs.readFileSync('D:/laragon/etc/ssl/laragon.key', 'utf8');
const certificate = fs.readFileSync('D:/laragon/etc/ssl/laragon.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Crear servidor HTTPS
const server = https.createServer(credentials, app);

// Configurar Socket.IO con CORS habilitado

setupSocket(server);

app.use('/api/academic', require('./src/routes/academic'));
app.use('/api/onlineshop', require('./src/routes/onlineshop'));
app.use('/api/crm', require('./src/routes/crm'));

// Iniciar servidor HTTPS
server.listen(3000, () => {
    console.log('HTTPS server running on port 3000');
});
