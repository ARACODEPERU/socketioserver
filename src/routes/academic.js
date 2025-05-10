const express = require('express');
const router = express.Router();
const upload = require("../config/multer"); // Configuración de multer

const { sendEmails, importStudentsExcel, generateAndSendInvoices } = require('../controllers/academicController');

router.post('/send-mails', sendEmails);
router.post("/import-students-excel", upload.single("file"), importStudentsExcel);
router.post('/send-invoice-email', generateAndSendInvoices);

module.exports = router