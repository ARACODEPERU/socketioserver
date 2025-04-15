const axios = require('axios');
const https = require('https');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { API_KEY_GEMINI } = require("../config/environment");

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

exports.basicQuestionService = async (data) => {
    const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Usando el modelo que mencionaste
    const prompt = 'Por favor, responde a la siguiente pregunta utilizando únicamente etiquetas HTML para el formato. No incluyas explicaciones ni etiquetas HTML de documento completo (<html>, <head>, <body>). no incluyas en la respuesta delimitadores Html como:  ```html ó ```,tampoco este tipo de cosas: Aquí tienes la respuesta formateada usando solo etiquetas HTML con estilos en línea. Solo responder con el fragmento de HTML relevante para la respuesta y para darle mejor apariensia puedes usar style en linea: ' + data.instructions;
    
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

exports.basicCensorTextService = async (data) => {
  const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const basePromptQuestion = 
    'Dado el siguiente texto, elimina cualquier saludo, nombres de personas y nombres de empresas privadas. ' +
    'Conserva únicamente la parte central del texto que representa una pregunta o solicitud de información. ' +
    'No incluyas saludos ni explicaciones en tu respuesta. Devuelve solo la pregunta limpia.';

  const basePromptRespond = 
    'Por favor, responde a la siguiente pregunta utilizando únicamente etiquetas HTML para el formato.' +
    'No incluyas cualquier saludo, nombres de personas y nombres de empresas privadas. ' +
    'No incluyas explicaciones ni etiquetas HTML de documento completo (<html>, <head>, <body>).' +
    'No incluyas en la respuesta delimitadores Html como:  ```html ó ```,tampoco este tipo de cosas: Aquí tienes la respuesta formateada usando solo etiquetas HTML con estilos en línea. ' +
    'Solo responder con el fragmento de HTML relevante para la respuesta y para darle mejor apariensia puedes usar style en linea: ';

  // Genera texto con Gemini a partir del prompt y contenido
  const generateCleanTextQuestion = async (inputText) => {
    const fullPrompt = `${basePromptQuestion} ${inputText}`;
    const result = await model.generateContent([fullPrompt]);
    return result?.response?.text?.().trim();
  };
  const generateCleanTextRespond = async (inputText) => {
    const fullPrompt = `${basePromptRespond} ${inputText}`;
    const result = await model.generateContent([fullPrompt]);
    return result?.response?.text?.().trim();
  };

  try {
    const [questionText, responseText] = await Promise.all([
      generateCleanTextQuestion(data.instructions),
      generateCleanTextRespond(data.respond),
    ]);

    if (!questionText || !responseText) {
      return { success: false, error: "Una de las respuestas está vacía." };
    }

    const payload = {
      question_text: questionText,
      response_text: responseText,
      user_id: data.userId,
    };

    const response = await axios.post(data.routeBackend, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": data.csrfToken,
      },
      httpsAgent,
    });

    return { success: true, responseText: response.data };

  } catch (error) {
    console.error("Error al procesar con Gemini:", error);
    return { success: false, error: "Ocurrió un error al procesar el texto con Gemini." };
  }
};
