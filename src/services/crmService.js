const axios = require('axios');
const https = require('https');

exports.sendMessageChatService = async (reqbody) => {
    
    const { channel, event, data } = reqbody;

    if (!channel || !event || !data) {
        return { status: 400, message: "Invalid payload" };
    }

    try {
        const channelName = channel.name; // Obtener el nombre del canal
        console.log('Emit event to channel:', channelName);
        console.log('Datos recibidos:', { channel, event, data });

        // Verifica si hay clientes conectados al canal
        const clients = global.io.sockets.adapter.rooms.get(channelName);
        if (clients) {
            console.log(`Número de clientes en el canal ${channelName}: ${clients.size}`);
        } else {
            console.log(`El canal ${channelName} no tiene clientes conectados.`);
        }

        // Emitir el evento al canal correspondiente

        global.io.sockets.emit(channelName, { event, data});
        return { status: 200, message: "Event broadcasted" };
    } catch (error) {
        console.error('Error al emitir el evento:', error);
        return { status: 500, message: "Error broadcasting event" };
    }
};
