const { basicQuestionService } = require('../services/openAiService');

exports.basicQuestion = async (req, res) => {
    try {
        const response = await basicQuestionService(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error en Google Gemini', details: error.message });
    }
};