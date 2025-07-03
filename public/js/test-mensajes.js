// Script para probar el envío de mensajes en tiempo real
// Ejecutar en la consola del navegador

// Función para enviar un mensaje de prueba
async function enviarMensajePrueba(conversacionId, autorId, contenido) {
    try {
        const response = await fetch('/api/chat/mensajes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversacionId: conversacionId,
                autorId: autorId,
                contenido: contenido
            })
        });
        
        const result = await response.json();
        console.log('Mensaje enviado:', result);
        return result;
    } catch (error) {
        console.error('Error enviando mensaje:', error);
    }
}

// Función para simular una conversación en tiempo real
async function simularConversacion() {
    console.log('🚀 Iniciando simulación de conversación...');
    
    // Enviar mensaje de Mario a Paula (conversación 1)
    await enviarMensajePrueba(1, 1, "¿Podrías decirme más sobre las especificaciones de la laptop?");
    
    setTimeout(async () => {
        // Respuesta de Paula a Mario
        await enviarMensajePrueba(1, 2, "Por supuesto! Es una HP Pavilion 15, Intel Core i5 de 11va generación, 8GB RAM DDR4, SSD de 256GB NVMe.");
    }, 3000);
    
    setTimeout(async () => {
        // Mario pregunta sobre garantía
        await enviarMensajePrueba(1, 1, "¿Tiene algún tipo de garantía o factura de compra?");
    }, 8000);
    
    setTimeout(async () => {
        // Paula responde sobre garantía
        await enviarMensajePrueba(1, 2, "Sí, conservo la factura de compra. La garantía del fabricante vence en 6 meses más.");
    }, 13000);
}

// Instrucciones de uso
console.log('📋 INSTRUCCIONES DE PRUEBA:');
console.log('1. Ejecuta: simularConversacion() para ver mensajes en tiempo real');
console.log('2. Ejecuta: enviarMensajePrueba(conversacionId, autorId, "mensaje") para enviar mensajes manuales');
console.log('3. Conversaciones disponibles: 1, 2, 3');
console.log('4. Usuarios: Mario (ID: 1), Paula (ID: 2)');
console.log('5. Abre múltiples pestañas para ver el long polling funcionando');

// Exportar funciones globalmente
window.enviarMensajePrueba = enviarMensajePrueba;
window.simularConversacion = simularConversacion;
