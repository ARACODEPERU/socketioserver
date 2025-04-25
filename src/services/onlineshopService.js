const axios = require('axios');
const https = require('https');

exports.sendEmailTicketService = async (datos) => {

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    let results = [];

    for (const venta of datos.ventas) {
        let pedido = {
            documenttypeId: datos.documenttypeId,
            venta: {
                nota_sale_id: venta.nota_sale_id,
                id: venta.id,
                details: venta.details,
            },
            serie: datos.serie,
            enline: datos.enline,
            local: datos.local,
            userId: datos.userId
        }

        try {
            // 1. Enviar solicitud para generar la boleta
            const response = await axios.post(datos.apiBackenStepOne, { 'pedido': pedido }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": datos.csrfToken
                },
                httpsAgent, // Pasar el agente personalizado
            });
            console.log('OnlineShop Servicio');
            // Extraer datos de la respuesta
            const { success, document,onlisaleId, message } = response.data;
        
            // 2. Emitir resultado al usuario en tiempo real
            global.io.emit(datos.channelListen, {
                status: success,
                step: 1,
                data: { document, message }
            });
            console.log('success 1', response.data);
            // Si la boleta se generó correctamente, proceder con el envío del correo
            if (success) {
                const emailData = {
                    person_email: document.client_email,
                    person_name: document.client_rzn_social,
                    document_id: document.id,
                    onlisaleId: onlisaleId
                };
                console.log('emailData 1', emailData);
                // 3. Enviar solicitud para el envío del correo
                const emailResponse = await axios.post(datos.apiBackenStepTwo, emailData, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": datos.csrfToken
                    },
                    httpsAgent,
                });
                console.log('emailResponse 2', emailResponse);
                // 4. Emitir confirmación de envío de correo
                global.io.emit(datos.channelListen, {
                    status: emailResponse.data.success,
                    step: 2,
                    data: emailResponse.data.correosMessage
                });
            }
        } catch (error) {
            console.error("Error en el proceso:", error.message);
            
            // Emitir error al usuario
            global.io.emit(datos.channelListen, {
                status: "error",
                error: error.message
            });
        }
    }

    return { message: "Proceso completado", results };
};
