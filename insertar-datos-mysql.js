const mysql = require('mysql2/promise');
const fs = require('fs');

async function ejecutarDatosPrueba() {
    let connection;
    
    try {
        console.log('🔌 Conectando a MySQL...');
        
        // Crear conexión usando la misma configuración que la app
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || "localhost",
            user: process.env.MYSQL_USER || "root", 
            password: process.env.MYSQL_PASSWORD || "master123",
            database: process.env.MYSQL_DATABASE || "db_AstroMarket",
            port: process.env.MYSQL_PORT || "3006",
            multipleStatements: true
        });

        console.log('✅ Conectado a MySQL');

        // 1. Insertar anuncios para Paula
        console.log('📝 Insertando anuncios para Paula...');
        await connection.execute(`
            INSERT INTO anuncios (anuncioId, usuarioId, titulo, descripcion, precio, categoriaId, subcategoriaId, estado, estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion, fecha_creacion, fecha_modificacion) VALUES
            (100, 2, 'Laptop HP Pavilion 15"', 'Laptop HP Pavilion de 15 pulgadas, Intel Core i5, 8GB RAM, 256GB SSD. Perfecta para trabajo y estudio.', 450.00, 2, 3, 'usado', 'activo', 1, 1, 'Zona Sur', 12, 0.0, '2025-01-28 10:00:00', '2025-01-28 10:00:00'),
            (101, 2, 'Bicicleta de Montaña Trek', 'Bicicleta Trek de montaña, aro 26, cambios Shimano, suspensión delantera. Muy bien cuidada.', 280.00, 3, 7, 'seminuevo', 'activo', 1, 2, 'Calacoto', 8, 0.0, '2025-01-28 11:30:00', '2025-01-28 11:30:00')
            ON DUPLICATE KEY UPDATE titulo = VALUES(titulo)
        `);

        // 2. Insertar conversaciones
        console.log('💬 Insertando conversaciones...');
        await connection.execute(`
            INSERT INTO conversaciones (conversacionId, compradorId, vendedorId, anuncioId, fecha_creacion, fecha_ultimo_mensaje, estado) VALUES
            (100, 1, 2, 100, '2025-01-28 14:00:00', '2025-01-28 16:45:00', 'activa'),
            (101, 1, 2, 101, '2025-01-28 16:00:00', '2025-01-28 18:15:00', 'activa')
            ON DUPLICATE KEY UPDATE fecha_ultimo_mensaje = VALUES(fecha_ultimo_mensaje)
        `);

        // 3. Insertar mensajes
        console.log('📨 Insertando mensajes...');
        await connection.execute(`
            INSERT INTO mensajes (mensajeId, conversacionId, emisorId, contenido, fecha_envio, leido) VALUES
            (100, 100, 1, 'Hola Paula, me interesa tu laptop HP Pavilion. ¿Está disponible?', '2025-01-28 14:00:00', 1),
            (101, 100, 2, '¡Hola Mario! Sí, está disponible. La laptop está en muy buen estado, apenas la he usado para trabajo.', '2025-01-28 14:15:00', 1),
            (102, 100, 1, 'Perfecto. ¿Podrías enviarme más fotos del estado actual? ¿Y el precio es negociable?', '2025-01-28 14:30:00', 1),
            (103, 100, 2, 'Claro, te envío fotos por WhatsApp. El precio podría ser $420 si la compras esta semana.', '2025-01-28 16:45:00', 0),
            (104, 101, 1, 'Paula, también me interesa tu bicicleta Trek. ¿Cuánto tiempo de uso tiene?', '2025-01-28 16:00:00', 1),
            (105, 101, 2, 'Hola Mario! La bicicleta tiene aproximadamente 8 meses de uso, pero solo los fines de semana. Está muy bien mantenida.', '2025-01-28 16:30:00', 1),
            (106, 101, 1, 'Suena bien. Si me das un buen precio por la laptop y la bicicleta juntas, podría llevarme ambas.', '2025-01-28 17:00:00', 1),
            (107, 101, 2, '¡Qué buena idea! Por ambas te podría hacer $650 en total. ¿Qué te parece?', '2025-01-28 18:15:00', 0)
            ON DUPLICATE KEY UPDATE contenido = VALUES(contenido)
        `);

        // 4. Insertar imágenes
        console.log('🖼️ Insertando imágenes...');
        await connection.execute(`
            INSERT INTO imagenes (imagenId, ruta_archivo, nombre_archivo, fecha_subida) VALUES
            (200, 'uploads/laptop-hp-1.jpg', 'laptop-hp-1.jpg', '2025-01-28 10:00:00'),
            (201, 'uploads/bicicleta-trek-1.jpg', 'bicicleta-trek-1.jpg', '2025-01-28 11:30:00')
            ON DUPLICATE KEY UPDATE nombre_archivo = VALUES(nombre_archivo)
        `);

        // 5. Relacionar imágenes con anuncios
        console.log('🔗 Relacionando imágenes con anuncios...');
        await connection.execute(`
            INSERT INTO anuncio_imagenes (anuncioId, imagenId, es_principal, orden) VALUES
            (100, 200, 1, 1),
            (101, 201, 1, 1)
            ON DUPLICATE KEY UPDATE es_principal = VALUES(es_principal)
        `);

        // Verificar datos insertados
        console.log('\n📊 VERIFICANDO DATOS INSERTADOS:');
        
        // Anuncios de Paula
        const [anuncios] = await connection.execute(
            'SELECT anuncioId, titulo, precio, estado FROM anuncios WHERE usuarioId = 2'
        );
        console.log('📦 Anuncios de Paula:', anuncios);

        // Conversaciones donde Mario es comprador
        const [conversaciones] = await connection.execute(`
            SELECT c.conversacionId, c.compradorId, c.vendedorId, a.titulo as anuncio 
            FROM conversaciones c 
            JOIN anuncios a ON c.anuncioId = a.anuncioId 
            WHERE c.compradorId = 1
        `);
        console.log('💬 Conversaciones donde Mario es comprador:', conversaciones);

        // Algunos mensajes de ejemplo
        const [mensajes] = await connection.execute(`
            SELECT m.conversacionId, u.nombre_completo as emisor, m.contenido, m.fecha_envio
            FROM mensajes m 
            JOIN usuarios u ON m.emisorId = u.usuarioId 
            WHERE m.conversacionId IN (100, 101)
            ORDER BY m.conversacionId, m.fecha_envio
            LIMIT 6
        `);
        console.log('📨 Mensajes de ejemplo:', mensajes);

        console.log('\n🎉 ¡Datos de prueba insertados exitosamente en MySQL!');
        console.log('\n🛒 RESUMEN:');
        console.log('- Mario Pereyra (ID: 1) puede actuar como COMPRADOR');
        console.log('- Paula Mendez (ID: 2) tiene 2 anuncios como VENDEDORA');
        console.log('- Se crearon 2 conversaciones donde Mario consulta a Paula');
        console.log('- Cada conversación tiene 4 mensajes de ejemplo');    } catch (error) {
        console.error('❌ Error completo:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensaje:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('ℹ️ Algunos datos ya existían (esto es normal)');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('ℹ️ No se puede conectar a MySQL. Verifica que esté corriendo en puerto 3006');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión MySQL cerrada');
        }
    }
}

// Ejecutar
ejecutarDatosPrueba();
