const axios = require('axios');
const https = require('https');
const xlsx = require('xlsx');

exports.sendEmailService = async (data) => {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    let results = [];
    
    for (const contact of data.para) {
        let correo = {
            title: data.asunto,
            type: data.correoDefault,
            contact: contact,
            message: data.mensaje
        };
        try {
            console.log('Academico Servicio');
            const response = await axios.post(data.urlBacken, { 'correo': correo }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": data.csrfToken
                },
                httpsAgent,
            });

            global.io.emit(data.channelListen, {
                success: response.data.success,
                name: contact.name,
                email: contact.email,
                status: response.data.success ? 'Enviado correctamente' : 'Error al enviar',
                result: response.data,
            });

            results.push({ contact, status: 'Enviado correctamente' });
        } catch (error) {
            global.io.emit(data.channelListen, {
                success: false,
                name: contact.name,
                email: contact.email,
                status: 'Error al enviar',
                error: error.message
            });

            results.push({ contact, status: 'Error al enviar', error: error.message });
        }
    }

    return { message: "Proceso completado", results };
};

exports.importStudentsExcelService = async (datos) => {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const file = datos.file;
    const course_id = datos.body.course_id;
    const csrfToken = datos.body.csrfToken;
    const urlBacken = datos.body.urlBacken;
    const channelListen = datos.body.channelListen;
    const modality_id = datos.body.modality_id;

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet); // Convierte a un array de objetos
    let results = [];

    for (const [index, row] of data.entries()) {
        
        // if (index === 0) {
        //     continue; // Saltar la primera fila (encabezado)
        // }

        // Convertir el objeto en un array de valores
        let rowData = Object.values(row);

        // Convertir la fecha (suponiendo que la fecha está en la tercera posición, índice 2)
        if (!isNaN(rowData[2])) { // Verificar si es un número (Excel usa números de serie para fechas)
            const excelDate = new Date((rowData[2] - 25569) * 86400 * 1000); // Convertir número a fecha
            rowData[2] = excelDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        }

        // Ignorar filas completamente vacías
        if (rowData.every(cell => cell === "" || cell === null || cell === undefined)) {
            continue;
        }

        try {
            const response = await axios.post(urlBacken, { 'student': rowData,'course_id': course_id, 'index': index,'modality_id': modality_id }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken
                },
                httpsAgent,
            });
            
            global.io.emit(channelListen, {
                success: response.data.success,
                dni: rowData[1],
                name: rowData[0],
                email: rowData[4],
                message: response.data.message
            });

            results.push({ row, status: "success", response: response.data });
        } catch (error) {
            console.log(error.message)
            global.io.emit(channelListen, {
                success: false,
                dni: rowData[1],
                name: rowData[0],
                email: rowData[4],
                message: 'Error al registrar',
                error: error.message
            });
            results.push({ row, status: "error", error: error.message });
        }
    }


    return { message: "Proceso completado", results };
};