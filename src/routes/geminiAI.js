const express = require('express');
const router = express.Router();

const { 
    basicQuestion, 
    basicCensorText 
} = require('../controllers/geminiAiController');

router.post('/basicquestion', basicQuestion);
router.post('/basiccensortext', basicCensorText);

module.exports = router