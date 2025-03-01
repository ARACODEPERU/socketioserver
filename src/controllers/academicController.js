const { 
    sendEmailService,
    importStudentsExcelService
} = require('../services/academicService');

exports.sendEmails = async (req, res) => {
    try {
        const response = await sendEmailService(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error sending emails', details: error.message });
    }
};

exports.importStudentsExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se envió ningún archivo" });
        }

        const result = await importStudentsExcelService(req);

        res.json({ message: "Archivo procesado", result });
    } catch (error) {
        console.error("Error procesando el archivo:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};