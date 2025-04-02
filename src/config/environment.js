const dotenv = require("dotenv");

// Cargar las variables de entorno
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 3000,
    API_KEY_GEMINI: process.env.API_KEY_GEMINI,
    DATABASE_URL: process.env.DATABASE_URL,
};