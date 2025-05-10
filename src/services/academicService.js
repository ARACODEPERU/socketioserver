const axios = require('axios');
const https = require('https');
const xlsx = require('xlsx');
//const pLimit = require('p-limit');
const getPLimit = async () => (await import('p-limit')).default;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const CONCURRENCY_LIMIT = 5; // Ajustar según la capacidad del servidor

exports.sendEmailService = async (data) => {
    const pLimit = await getPLimit();
    const limit = pLimit(CONCURRENCY_LIMIT);
    let results = [];

    await Promise.all(data.para.map(contact => limit(async () => {
        let correo = {
            title: data.asunto,
            type: data.correoDefault,
            contact: contact,
            message: data.mensaje
        };
        try {
            //console.log('Enviando correo a:', contact.email);
            const response = await axios.post(data.urlBacken, { correo }, {
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
    })));

    return { message: "Proceso completado", results };
};

exports.importStudentsExcelService = async (datos) => {
    const file = datos.file;
    const { course_id, csrfToken, urlBacken, channelListen, modality_id } = datos.body;
    
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    const pLimit = await getPLimit();
    const limit = pLimit(CONCURRENCY_LIMIT);
    let results = [];

    await Promise.all(data.map((row, index) => limit(async () => {
        let rowData = Object.values(row);
        if (!isNaN(rowData[2])) {
            const excelDate = new Date((rowData[2] - 25569) * 86400 * 1000);
            rowData[2] = excelDate.toISOString().split('T')[0];
        }

        if (rowData.every(cell => cell === "" || cell === null || cell === undefined)) {
            return;
        }

        try {
            const response = await axios.post(urlBacken, { student: rowData, course_id, index, modality_id }, {
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
    })));

    return { message: "Proceso completado", results };
};

exports.generateAndSendInvoicesService = async (data) => {
    const pLimit = await getPLimit();
    const limit = pLimit(CONCURRENCY_LIMIT);
    let results = [];
    // console.log(JSON.stringify(data, null, 2));
    await Promise.all(data.registrations.map(registration => limit(async () => {
        try {
            let formRegistration = {
                registration: registration,
                userId: data.userId
            }
            const response = await axios.post(data.urlBacken, formRegistration , {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": data.csrfToken
                },
                httpsAgent,
            });
            
            global.io.emit(data.channelListen, {
                success: response.data.success,
                name: registration.student.person.full_name,
                email: registration.student.person.email,
                result: response.data,
            });
            results.push({ registration, status: 'Enviado correctamente' });
        } catch (error) {
            global.io.emit(data.channelListen, {
                success: false,
                name: registration.student.person.full_name,
                email: registration.student.person.email,
                status: 'Error al enviar',
                error: error.message
            });
            results.push({ registration, status: 'Error al enviar', error: error.message });
        }
    })));

    return { message: "Proceso completado", results };
};
