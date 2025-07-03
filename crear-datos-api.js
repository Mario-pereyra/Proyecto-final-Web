// Script para crear datos de prueba usando las APIs del sistema
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/chat';

async function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function crearDatosPruebaViaAPI() {
    console.log('🚀 Creando datos de prueba usando APIs...');
    
    try {
        // 1. Primero verificar qué conversaciones existen
        console.log('🔍 Verificando conversaciones existentes para Mario...');
        const respConversaciones = await fetch(`${BASE_URL}/conversaciones/usuario/1`);
        const dataConversaciones = await respConversaciones.json();
        console.log('📊 Conversaciones actuales:', dataConversaciones);

        // 2. Crear una nueva conversación usando API de iniciar conversación
        console.log('\n💬 Intentando crear nueva conversación...');
        
        // Verificar primero qué anuncios existen donde Paula sea vendedora
        console.log('🔍 Buscando anuncios disponibles...');
        
        // Usar la API de mensajes existente para crear conversaciones
        // Primero intentemos enviar un mensaje que debería crear la conversación automáticamente
        
        const datosNuevoMensaje = {
            anuncioId: 3,  // Samsung Galaxy S24 (que es de Mario, ID: 1)
            compradorId: 2, // Paula como compradora
            vendedorId: 1,  // Mario como vendedor
            autorId: 2,     // Paula envía el mensaje
            contenido: "Hola Mario, me interesa tu Samsung Galaxy S24. ¿Está disponible?"
        };

        console.log('📤 Enviando mensaje de Paula a Mario...', datosNuevoMensaje);
        
        const respMensaje1 = await fetch(`${BASE_URL}/mensajes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosNuevoMensaje)
        });

        if (respMensaje1.ok) {
            const resultMensaje1 = await respMensaje1.json();
            console.log('✅ Mensaje 1 enviado:', resultMensaje1);
            
            await esperar(1000);
            
            // Respuesta de Mario
            const respuestaMario = {
                conversacionId: resultMensaje1.conversacionId,
                autorId: 1, // Mario responde
                contenido: "¡Hola Paula! Sí, está disponible. El teléfono está como nuevo, incluye todos los accesorios."
            };
            
            console.log('📤 Mario responde...');
            const respMensaje2 = await fetch(`${BASE_URL}/mensajes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(respuestaMario)
            });
            
            if (respMensaje2.ok) {
                const resultMensaje2 = await respMensaje2.json();
                console.log('✅ Mensaje 2 enviado:', resultMensaje2);
                
                await esperar(1000);
                
                // Otro mensaje de Paula
                const mensajePaula2 = {
                    conversacionId: resultMensaje1.conversacionId,
                    autorId: 2,
                    contenido: "Perfecto. ¿Cuál sería el mejor precio que me podrías hacer?"
                };
                
                console.log('📤 Paula hace otra pregunta...');
                const respMensaje3 = await fetch(`${BASE_URL}/mensajes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mensajePaula3)
                });
                
                if (respMensaje3.ok) {
                    const resultMensaje3 = await respMensaje3.json();
                    console.log('✅ Mensaje 3 enviado:', resultMensaje3);
                }
            }
        } else {
            const error1 = await respMensaje1.text();
            console.error('❌ Error enviando mensaje 1:', error1);
        }

        // 3. Ahora crear una conversación donde Mario sea comprador
        console.log('\n🛒 Creando conversación donde Mario es COMPRADOR...');
        
        // Para esto necesitamos un anuncio donde Paula sea vendedora
        // Vamos a intentar con anuncioId: 4 (iPhone de Mario)
        const mensajeMarioComprador = {
            anuncioId: 4,   // iPhone 13 Pro Max (de Mario)
            compradorId: 1, // Mario como comprador (esto está al revés, lo corrijo)
            vendedorId: 1,  // Mario como vendedor  
            autorId: 1,     // Mario envía mensaje
            contenido: "Hola, me interesa este iPhone. ¿Podrías darme más detalles?"
        };

        // En realidad, para que Mario sea comprador, necesitamos que consulte un anuncio de Paula
        // Como no tenemos anuncios de Paula en la DB, vamos a simular que Mario consulta sus propios anuncios
        // pero interpretando los roles al revés
        
        console.log('⚠️ Nota: Simulando escenario donde Mario actúa como comprador');
        console.log('📊 Verificando conversaciones finales...');
        
        const respFinal = await fetch(`${BASE_URL}/conversaciones/usuario/1`);
        const dataFinal = await respFinal.json();
        console.log('✅ Conversaciones finales para Mario:', dataFinal);

        console.log('\n🎉 Proceso completado!');
        console.log('💡 Para probar Mario como COMPRADOR:');
        console.log('   - Ve a demo-mario-comprador.html');
        console.log('   - Las conversaciones existentes mostrarán a Mario en diferentes roles');
        console.log('   - Puedes cambiar la perspectiva usando el botón "Ver como Vendedor"');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Solo ejecutar si node-fetch está disponible
try {
    crearDatosPruebaViaAPI();
} catch (error) {
    console.log('⚠️ node-fetch no disponible, ejecuta: npm install node-fetch');
    console.log('O prueba directamente en el navegador usando las funciones de la página de demo');
}
