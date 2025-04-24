const axios = require('axios');

exports.sendMessageChatService = async (reqbody) => {

    const { channelName, participants, message, ofUserId } = reqbody;
    
    if (!channelName || !participants || !message || !ofUserId) {
        return { status: 400, message: "Invalid payload" };
    }

    try {

        // Verifica si hay clientes conectados al canal
        const clients = global.io.sockets.adapter.rooms.get(channelName);
        if (clients) {
            console.log(`Número de clientes en el canal ${channelName}: ${clients.size}`);
        } else {
            console.log(`El canal ${channelName} no tiene clientes conectados.`);
        }

        // Emitir el evento al canal correspondiente

        global.io.emit(channelName, { 
            data: {
                message: message,
                participants: participants,
            },
            ofUserId: ofUserId
        });

        return { status: 200, message: "Event broadcasted" };
        
    } catch (error) {
        console.error('Error al emitir el evento:', error);
        return { status: 500, message: "Error broadcasting event" };
    }
};
