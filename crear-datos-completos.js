const fs = require('fs');
const path = require('path');

// Función para leer un archivo JSON
function leerJSON(archivo) {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'db', archivo), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log(`Archivo ${archivo} no encontrado o vacío, creando array vacío`);
        return [];
    }
}

// Función para escribir un archivo JSON
function escribirJSON(archivo, datos) {
    fs.writeFileSync(
        path.join(__dirname, 'db', archivo), 
        JSON.stringify(datos, null, 2), 
        'utf8'
    );
}

// Función principal para crear datos de prueba
async function crearDatosPruebaCompletos() {
    console.log('🚀 Iniciando creación de datos de prueba completos...');

    // 1. Crear anuncios para Paula Mendez (usuarioId: 2)
    const anuncios = leerJSON('anuncios.json');
    const nuevosAnunciosPaula = [
        {
            anuncioId: 100,
            usuarioId: 2,
            titulo: "Laptop HP Pavilion 15\"",
            descripcion: "Laptop HP Pavilion de 15 pulgadas, Intel Core i5, 8GB RAM, 256GB SSD. Perfecta para trabajo y estudio.",
            precio: 450.00,
            categoriaId: 2,
            subcategoriaId: 3,
            estado: "usado",
            estado_publicacion: "activo",
            departamentoId: 1,
            ciudadId: 1,
            zona: "Zona Sur",
            vistas: 12,
            valoracion: 0.0,
            fecha_creacion: "2025-01-28 10:00:00",
            fecha_modificacion: "2025-01-28 10:00:00"
        },
        {
            anuncioId: 101,
            usuarioId: 2,
            titulo: "Bicicleta de Montaña Trek",
            descripcion: "Bicicleta Trek de montaña, aro 26, cambios Shimano, suspensión delantera. Muy bien cuidada.",
            precio: 280.00,
            categoriaId: 3,
            subcategoriaId: 7,
            estado: "seminuevo",
            estado_publicacion: "activo",
            departamentoId: 1,
            ciudadId: 2,
            zona: "Calacoto",
            vistas: 8,
            valoracion: 0.0,
            fecha_creacion: "2025-01-28 11:30:00",
            fecha_modificacion: "2025-01-28 11:30:00"
        }
    ];

    // Agregar anuncios de Paula si no existen
    nuevosAnunciosPaula.forEach(nuevoAnuncio => {
        const existe = anuncios.find(a => a.anuncioId === nuevoAnuncio.anuncioId);
        if (!existe) {
            anuncios.push(nuevoAnuncio);
        }
    });

    escribirJSON('anuncios.json', anuncios);
    console.log('✅ Anuncios de Paula Mendez creados');

    // 2. Crear conversaciones bidireccionales
    const conversaciones = leerJSON('conversaciones.json');
    const nuevasConversaciones = [
        // Conversación 1: Mario (comprador) consulta a Paula (vendedora) sobre la laptop
        {
            conversacionId: 1,
            compradorId: 1, // Mario
            vendedorId: 2,  // Paula
            anuncioId: 100, // Laptop HP
            fechaCreacion: "2025-01-28 14:00:00",
            ultimaActividad: "2025-01-28 16:45:00",
            estado: "activa"
        },
        // Conversación 2: Paula (compradora) consulta a Mario (vendedor) sobre Samsung Galaxy
        {
            conversacionId: 2,
            compradorId: 2, // Paula
            vendedorId: 1,  // Mario
            anuncioId: 3,   // Samsung Galaxy S24
            fechaCreacion: "2025-01-28 15:30:00",
            ultimaActividad: "2025-01-28 17:20:00",
            estado: "activa"
        },
        // Conversación 3: Mario (comprador) consulta a Paula (vendedora) sobre la bicicleta
        {
            conversacionId: 3,
            compradorId: 1, // Mario
            vendedorId: 2,  // Paula
            anuncioId: 101, // Bicicleta Trek
            fechaCreacion: "2025-01-28 16:00:00",
            ultimaActividad: "2025-01-28 18:15:00",
            estado: "activa"
        }
    ];

    // Agregar conversaciones si no existen
    nuevasConversaciones.forEach(nuevaConv => {
        const existe = conversaciones.find(c => c.conversacionId === nuevaConv.conversacionId);
        if (!existe) {
            conversaciones.push(nuevaConv);
        }
    });

    escribirJSON('conversaciones.json', conversaciones);
    console.log('✅ Conversaciones bidireccionales creadas');

    // 3. Crear mensajes para cada conversación
    const mensajes = leerJSON('mensajes.json');
    const nuevosMensajes = [
        // Mensajes de la conversación 1 (Mario compra laptop de Paula)
        {
            mensajeId: 1,
            conversacionId: 1,
            autorId: 1, // Mario
            contenido: "Hola Paula, me interesa tu laptop HP Pavilion. ¿Está disponible?",
            fechaEnvio: "2025-01-28 14:00:00",
            leido: true
        },
        {
            mensajeId: 2,
            conversacionId: 1,
            autorId: 2, // Paula
            contenido: "¡Hola Mario! Sí, está disponible. La laptop está en muy buen estado, apenas la he usado para trabajo.",
            fechaEnvio: "2025-01-28 14:15:00",
            leido: true
        },
        {
            mensajeId: 3,
            conversacionId: 1,
            autorId: 1, // Mario
            contenido: "Perfecto. ¿Podrías enviarme más fotos del estado actual? ¿Y el precio es negociable?",
            fechaEnvio: "2025-01-28 14:30:00",
            leido: true
        },
        {
            mensajeId: 4,
            conversacionId: 1,
            autorId: 2, // Paula
            contenido: "Claro, te envío fotos por WhatsApp. El precio podría ser $420 si la compras esta semana.",
            fechaEnvio: "2025-01-28 16:45:00",
            leido: false
        },

        // Mensajes de la conversación 2 (Paula compra Samsung de Mario)
        {
            mensajeId: 5,
            conversacionId: 2,
            autorId: 2, // Paula
            contenido: "Hola Mario, vi tu Samsung Galaxy S24. ¿Viene con cargador original?",
            fechaEnvio: "2025-01-28 15:30:00",
            leido: true
        },
        {
            mensajeId: 6,
            conversacionId: 2,
            autorId: 1, // Mario
            contenido: "¡Hola Paula! Sí, incluye cargador original, caja y protector de pantalla ya instalado.",
            fechaEnvio: "2025-01-28 15:45:00",
            leido: true
        },
        {
            mensajeId: 7,
            conversacionId: 2,
            autorId: 2, // Paula
            contenido: "Excelente. ¿Dónde podríamos encontrarnos para verlo? Estoy en zona sur.",
            fechaEnvio: "2025-01-28 16:00:00",
            leido: true
        },
        {
            mensajeId: 8,
            conversacionId: 2,
            autorId: 1, // Mario
            contenido: "Podemos encontrarnos en el centro comercial Megacenter. ¿Te parece mañana a las 3 PM?",
            fechaEnvio: "2025-01-28 17:20:00",
            leido: false
        },

        // Mensajes de la conversación 3 (Mario compra bicicleta de Paula)
        {
            mensajeId: 9,
            conversacionId: 3,
            autorId: 1, // Mario
            contenido: "Paula, también me interesa tu bicicleta Trek. ¿Cuánto tiempo de uso tiene?",
            fechaEnvio: "2025-01-28 16:00:00",
            leido: true
        },
        {
            mensajeId: 10,
            conversacionId: 3,
            autorId: 2, // Paula
            contenido: "Hola Mario! La bicicleta tiene aproximadamente 8 meses de uso, pero solo los fines de semana. Está muy bien mantenida.",
            fechaEnvio: "2025-01-28 16:30:00",
            leido: true
        },
        {
            mensajeId: 11,
            conversacionId: 3,
            autorId: 1, // Mario
            contenido: "Suena bien. Si me das un buen precio por la laptop y la bicicleta juntas, podría llevarme ambas.",
            fechaEnvio: "2025-01-28 17:00:00",
            leido: true
        },
        {
            mensajeId: 12,
            conversacionId: 3,
            autorId: 2, // Paula
            contenido: "¡Qué buena idea! Por ambas te podría hacer $650 en total. ¿Qué te parece?",
            fechaEnvio: "2025-01-28 18:15:00",
            leido: false
        }
    ];

    // Agregar mensajes si no existen
    nuevosMensajes.forEach(nuevoMensaje => {
        const existe = mensajes.find(m => m.mensajeId === nuevoMensaje.mensajeId);
        if (!existe) {
            mensajes.push(nuevoMensaje);
        }
    });

    escribirJSON('mensajes.json', mensajes);
    console.log('✅ Mensajes bidireccionales creados');

    // 4. Crear algunas imágenes de ejemplo para los anuncios de Paula
    const imagenes = leerJSON('imagenes.json');
    const nuevasImagenes = [
        {
            imagenId: 200,
            anuncioId: 100,
            nombreArchivo: "laptop-hp-1.jpg",
            rutaArchivo: "uploads/laptop-hp-1.jpg",
            esPrincipal: true,
            fechaSubida: "2025-01-28 10:00:00"
        },
        {
            imagenId: 201,
            anuncioId: 101,
            nombreArchivo: "bicicleta-trek-1.jpg", 
            rutaArchivo: "uploads/bicicleta-trek-1.jpg",
            esPrincipal: true,
            fechaSubida: "2025-01-28 11:30:00"
        }
    ];

    nuevasImagenes.forEach(nuevaImagen => {
        const existe = imagenes.find(i => i.imagenId === nuevaImagen.imagenId);
        if (!existe) {
            imagenes.push(nuevaImagen);
        }
    });

    escribirJSON('imagenes.json', imagenes);
    console.log('✅ Imágenes de ejemplo creadas');

    console.log('\n🎉 ¡Datos de prueba completos creados exitosamente!');
    console.log('\nResumen de conversaciones creadas:');
    console.log('📱 Conv 1: Mario (comprador) → Paula (vendedora) | Laptop HP');
    console.log('📱 Conv 2: Paula (compradora) → Mario (vendedor) | Samsung Galaxy');
    console.log('🚴 Conv 3: Mario (comprador) → Paula (vendedora) | Bicicleta Trek');
    console.log('\nAhora puedes probar el chat con usuarios reales que tienen roles intercambiados.');
}

// Ejecutar la función
crearDatosPruebaCompletos().catch(console.error);
