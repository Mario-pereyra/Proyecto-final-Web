// Script de prueba para verificar datos en la base de datos
const dbConnection = require('./db/mysqlConecction');

async function testearDatos() {
    let connection;
    try {
        console.log('=== TESTING CHAT FUNCTIONALITY ===\n');
        
        connection = await dbConnection();
        console.log('Conexión a base de datos establecida');
        
        // 1. Verificar usuarios
        console.log('\n1. Verificando usuarios...');
        const [usuarios] = await connection.execute('SELECT usuarioId, nombre_completo, email FROM usuarios LIMIT 5');
        console.log('Usuarios encontrados:', usuarios.length);
        usuarios.forEach(u => console.log(`- ${u.usuarioId}: ${u.nombre_completo} (${u.email})`));
        
        // 2. Verificar anuncios
        console.log('\n2. Verificando anuncios...');
        const [anuncios] = await connection.execute('SELECT anuncioId, titulo, usuarioId FROM anuncios LIMIT 5');
        console.log('Anuncios encontrados:', anuncios.length);
        anuncios.forEach(a => console.log(`- ${a.anuncioId}: ${a.titulo} (Usuario: ${a.usuarioId})`));
        
        // 3. Verificar conversaciones
        console.log('\n3. Verificando conversaciones...');
        const [conversaciones] = await connection.execute('SELECT * FROM conversaciones LIMIT 5');
        console.log('Conversaciones encontradas:', conversaciones.length);
        conversaciones.forEach(c => console.log(`- ID: ${c.conversacionId}, Anuncio: ${c.anuncioId}, Comprador: ${c.compradorId}, Vendedor: ${c.vendedorId}`));
        
        // 4. Verificar mensajes
        console.log('\n4. Verificando mensajes...');
        const [mensajes] = await connection.execute('SELECT * FROM mensajes LIMIT 5');
        console.log('Mensajes encontrados:', mensajes.length);
        mensajes.forEach(m => console.log(`- ID: ${m.mensajeId}, Conversación: ${m.conversacionId}, Emisor: ${m.emisorId}, Contenido: "${m.contenido.substring(0, 50)}..."`));
        
        // 5. Crear datos de prueba si no existen
        if (usuarios.length >= 2 && anuncios.length >= 1) {
            console.log('\n5. Creando datos de prueba...');
            
            const usuario1 = usuarios[0];
            const usuario2 = usuarios[1];
            const anuncio = anuncios[0];
            
            // Crear conversación de prueba si no existe
            const [existeConv] = await connection.execute(
                'SELECT conversacionId FROM conversaciones WHERE anuncioId = ? AND compradorId = ? AND vendedorId = ?',
                [anuncio.anuncioId, usuario1.usuarioId, usuario2.usuarioId]
            );
            
            let conversacionId;
            if (existeConv.length === 0) {
                const [resultConv] = await connection.execute(
                    'INSERT INTO conversaciones (anuncioId, compradorId, vendedorId, fecha_inicio) VALUES (?, ?, ?, NOW())',
                    [anuncio.anuncioId, usuario1.usuarioId, usuario2.usuarioId]
                );
                conversacionId = resultConv.insertId;
                console.log(`Conversación creada con ID: ${conversacionId}`);
            } else {
                conversacionId = existeConv[0].conversacionId;
                console.log(`Usando conversación existente ID: ${conversacionId}`);
            }
            
            // Crear mensajes de prueba
            const mensajesPrueba = [
                `Hola, me interesa tu ${anuncio.titulo}`,
                'Hola! Sí, aún está disponible. ¿Tienes alguna pregunta específica?',
                '¿Cuál es el estado del producto?',
                'Está en excelente estado, prácticamente nuevo. ¿Te gustaría verlo?'
            ];
            
            for (let i = 0; i < mensajesPrueba.length; i++) {
                const emisorId = i % 2 === 0 ? usuario1.usuarioId : usuario2.usuarioId;
                await connection.execute(
                    'INSERT IGNORE INTO mensajes (conversacionId, emisorId, contenido, fecha_envio) VALUES (?, ?, ?, NOW())',
                    [conversacionId, emisorId, mensajesPrueba[i]]
                );
            }
            console.log('Mensajes de prueba creados');
        }
        
        // 6. Probar endpoint de conversaciones
        console.log('\n6. Probando endpoints...');
        if (usuarios.length > 0) {
            const testUserId = usuarios[0].usuarioId;
            console.log(`Probando consulta para usuario ${testUserId}`);
            
            // Simular la consulta que hace el endpoint
            const query = `
                SELECT 
                    c.conversacionId,
                    c.anuncioId,
                    c.compradorId,
                    c.vendedorId,
                    c.fecha_inicio,
                    a.titulo as anuncioTitulo,
                    a.precio,
                    i_principal.ruta_imagen as imagen_principal,
                    u_comprador.nombre_completo as compradorNombre,
                    u_vendedor.nombre_completo as vendedorNombre,
                    (SELECT contenido FROM mensajes WHERE conversacionId = c.conversacionId ORDER BY fecha_envio DESC LIMIT 1) as ultimoMensaje,
                    (SELECT fecha_envio FROM mensajes WHERE conversacionId = c.conversacionId ORDER BY fecha_envio DESC LIMIT 1) as fecha_ultimo_mensaje,
                    (SELECT COUNT(*) FROM mensajes WHERE conversacionId = c.conversacionId AND emisorId != ? AND leido = 0) as mensajes_no_leidos
                FROM conversaciones c
                JOIN anuncios a ON c.anuncioId = a.anuncioId
                LEFT JOIN imagenes i_principal ON a.anuncioId = i_principal.anuncioId AND i_principal.es_principal = 1
                JOIN usuarios u_comprador ON c.compradorId = u_comprador.usuarioId
                JOIN usuarios u_vendedor ON c.vendedorId = u_vendedor.usuarioId
                WHERE c.compradorId = ? OR c.vendedorId = ?
                ORDER BY fecha_ultimo_mensaje DESC, c.fecha_inicio DESC
            `;
            
            const [resultados] = await connection.execute(query, [testUserId, testUserId, testUserId]);
            console.log(`Conversaciones encontradas para usuario ${testUserId}:`, resultados.length);
            resultados.forEach(r => {
                console.log(`- Conv ${r.conversacionId}: ${r.anuncioTitulo} | Comprador: ${r.compradorNombre} | Vendedor: ${r.vendedorNombre} | Último: "${r.ultimoMensaje}"`);
            });
        }
        
        console.log('\n=== TEST COMPLETED ===');
        
    } catch (error) {
        console.error('Error en test:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testearDatos();
