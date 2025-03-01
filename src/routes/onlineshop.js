const express = require('express');
const router = express.Router();
const { sendEmailTickets } = require('../controllers/onlineshopController');

router.post('/send-mails-tickets', sendEmailTickets);

module.exports = router