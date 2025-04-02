const express = require('express');
const router = express.Router();

const { basicQuestion } = require('../controllers/openAiController');

router.post('/basicquestion', basicQuestion);

module.exports = router