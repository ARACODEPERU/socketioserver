const { 
    sendMessageChatService
} = require('../services/crmService');

exports.sendMessageChat = async (req, res) => {
    try {
        const response = await sendMessageChatService(req.body);
        res.status(response.status).json(response);
    } catch (error) {
        res.status(response.status).json({ error: 'Error sending emails', details: error.message });
    }
};

