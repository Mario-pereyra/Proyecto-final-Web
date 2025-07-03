// Script para crear datos de prueba del chat
const express = require('express');
const mensajeRepository = require('./repositories/mensajeRepository');

const app = express();
app.use(express.json());

// Endpoint temporal para crear datos de prueba
app.post('/crear-datos-prueba', async (req, res) => {
    try {
        console.log('Creando datos de prueba...');
        
        // Datos de prueba (usando los IDs que vimos en el test)
        const usuarioComprador = 1; // Usuario de prueba
        const usuarioVendedor = 1;  // Mario Pereyra (dueño de los anuncios)
        const anuncioId = 3; // Samsung Galaxy S24
        
        // 1. Crear conversación
        console.log('Creando conversación...');
        const conversacionId = await mensajeRepository.encontrarOCrearConversacion(
            anuncioId, 
            usuarioComprador, 
            usuarioVendedor
        );
        console.log(`Conversación creada/encontrada: ${conversacionId}`);
        
        // 2. Crear mensajes de prueba
        const mensajesPrueba = [
            'Hola, me interesa tu Samsung Galaxy S24. ¿Aún está disponible?',
            'Hola! Sí, está disponible. Es completamente nuevo.',
            '¿Podrías enviarme más fotos del dispositivo?',
            'Por supuesto, te envío fotos adicionales por este chat.',
            '¿Cuál es el precio final? ¿Hay espacio para negociar?',
            'El precio es $850, pero podríamos ver algo en $800 si estás realmente interesado.'
        ];
        
        console.log('Creando mensajes...');
        for (let i = 0; i < mensajesPrueba.length; i++) {
            const emisorId = i % 2 === 0 ? usuarioComprador : usuarioVendedor;
            const resultado = await mensajeRepository.crearMensaje(
                conversacionId,
                emisorId,
                mensajesPrueba[i]
            );
            console.log(`Mensaje ${i + 1} creado: ${resultado.insertId}`);
            
            // Pequeña pausa para que las fechas sean diferentes
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 3. Crear otra conversación para otro anuncio
        const anuncioId2 = 4; // iPhone 13 Pro Max
        const conversacionId2 = await mensajeRepository.encontrarOCrearConversacion(
            anuncioId2, 
            usuarioComprador, 
            usuarioVendedor
        );
        
        const mensajesPrueba2 = [
            'Hola, ¿el iPhone 13 Pro Max incluye la caja original?',
            'Sí, incluye caja, cable y cargador originales.',
            'Perfecto, ¿dónde podríamos encontrarnos para verlo?'
        ];
        
        for (let i = 0; i < mensajesPrueba2.length; i++) {
            const emisorId = i % 2 === 0 ? usuarioComprador : usuarioVendedor;
            await mensajeRepository.crearMensaje(
                conversacionId2,
                emisorId,
                mensajesPrueba2[i]
            );
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('¡Datos de prueba creados exitosamente!');
        res.json({
            success: true,
            message: 'Datos de prueba creados',
            conversaciones: [conversacionId, conversacionId2]
        });
        
    } catch (error) {
        console.error('Error creando datos:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor de datos de prueba corriendo en puerto ${PORT}`);
    console.log(`Ve a http://localhost:${PORT}/crear-datos-prueba (método POST) para crear datos`);
});
