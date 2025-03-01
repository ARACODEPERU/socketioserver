const express = require('express');
const router = express.Router();
const upload = require("../config/multer"); // Configuración de multer

const { sendEmails, importStudentsExcel } = require('../controllers/academicController');

router.post('/send-mails', sendEmails);
router.post("/import-students-excel", upload.single("file"), importStudentsExcel);

module.exports = router