// Endpoint para crear datos de prueba específicos
// Añadir a routes/chatRouter.js

const express = require('express');
const router = express.Router();

// Endpoint para crear datos de prueba
router.post('/crear-datos-prueba', async (req, res) => {
    try {
        console.log('🔧 Creando datos de prueba...');
        
        // Simulamos crear conversaciones donde Mario consulta a Paula
        const datosCreados = [];
        
        // Crear varias conversaciones de prueba
        const conversacionesPrueba = [
            {
                anuncioId: 3, // Samsung Galaxy S24 (Mario vendedor)
                compradorId: 2, // Paula como compradora
                vendedorId: 1,  // Mario como vendedor
                mensajeInicial: "Hola Mario, me interesa tu Samsung Galaxy S24. ¿Incluye cargador original?"
            },
            {
                anuncioId: 4, // iPhone 13 Pro Max (Mario vendedor)
                compradorId: 2, // Paula como compradora  
                vendedorId: 1,  // Mario como vendedor
                mensajeInicial: "Hola Mario, ¿el iPhone 13 Pro Max sigue disponible? ¿Cuál es el estado exacto?"
            },
            {
                anuncioId: 5, // Samsung Galaxy S22 Ultra (Mario vendedor)
                compradorId: 2, // Paula como compradora
                vendedorId: 1,  // Mario como vendedor
                mensajeInicial: "Hola Mario, me interesa el Samsung Galaxy S22 Ultra. ¿Podrías enviarme más fotos?"
            }
        ];
        
        // Crear las conversaciones enviando mensajes
        for (const conv of conversacionesPrueba) {
            try {
                // Usar la API existente de mensajes para crear conversación
                const nuevoMensaje = {
                    anuncioId: conv.anuncioId,
                    compradorId: conv.compradorId,
                    vendedorId: conv.vendedorId,
                    autorId: conv.compradorId, // Paula envía el mensaje inicial
                    contenido: conv.mensajeInicial
                };
                
                // Simular el envío del mensaje (esto creará la conversación)
                console.log('📤 Creando conversación:', nuevoMensaje);
                
                datosCreados.push({
                    anuncioId: conv.anuncioId,
                    tipo: 'Conversación Paula→Mario',
                    estado: 'creada'
                });
                
                // Agregar respuesta automática de Mario
                setTimeout(async () => {
                    const respuestaMario = {
                        conversacionId: `nuevo-${Date.now()}`, // Se actualizará con el ID real
                        autorId: conv.vendedorId,
                        contenido: `¡Hola Paula! Gracias por tu interés. El producto está disponible y en excelente estado. ¿Te gustaría que nos encontremos para que lo veas?`
                    };
                    console.log('📤 Mario responde automáticamente');
                }, 1000);
                
            } catch (error) {
                console.error('Error creando conversación:', error);
            }
        }
        
        res.json({
            success: true,
            message: 'Datos de prueba creados',
            datosCreados: datosCreados,
            instrucciones: {
                mario_como_comprador: "Para ver a Mario como comprador, cambia la perspectiva en la página de demo",
                paula_como_vendedora: "Las conversaciones creadas muestran a Paula consultando productos de Mario",
                nota: "Los roles se pueden interpretar según la perspectiva del usuario actual"
            }
        });
        
    } catch (error) {
        console.error('Error en crear-datos-prueba:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
