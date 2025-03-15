const express = require('express');
const router = express.Router();

const { sendMessageChat } = require('../controllers/crmController');

router.post('/broadcast', sendMessageChat);

module.exports = router