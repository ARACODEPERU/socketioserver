const axios = require('axios');
const https = require('https');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { API_KEY_GEMINI } = require("../config/environment");

exports.basicQuestionService = async (data) => {
    const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Usando el modelo que mencionaste
    const prompt = 'Por favor, responde a la siguiente pregunta utilizando únicamente etiquetas HTML para el formato. No incluyas explicaciones ni etiquetas HTML de documento completo (<html>, <head>, <body>). tampoco cosas como ```html, ni tampoco este tipo de cosas Aquí tienes la respuesta formateada usando solo etiquetas HTML con estilos en línea. Solo el fragmento de HTML relevante para la respuesta y para darle mejor apariensia puedes usar style en linea: ' + data.instructions;
    
    //global.io.emit(data.channelListen, { success: true, message: 'En un momento...' });
    try {
        const result = await model.generateContent([prompt]);
         // Envía letra por letra
        return { success: true, responseText: result.response.text() };
      } catch (error) {
        console.error("Error en Google Gemini:", error);
        //global.io.emit("error_chat", { error: "Error al procesar la solicitud con Gemini" });
      }
};