const { sendEmailTicketService } = require('../services/onlineshopService');

exports.sendEmailTickets = async (req, res) => {
    try {
        const response = await sendEmailTicketService(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error sending emails', details: error.message });
    }
};