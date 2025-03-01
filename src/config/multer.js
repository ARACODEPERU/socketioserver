const multer = require("multer");

const storage = multer.memoryStorage(); // Guarda el archivo en memoria
const upload = multer({ storage });

module.exports = upload;
