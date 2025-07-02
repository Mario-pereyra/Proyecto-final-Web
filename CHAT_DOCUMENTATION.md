# Sistema de Chat con Long Polling - AstroMarket

## Descripción General

Se ha implementado un sistema de chat en tiempo real utilizando la técnica de **Long Polling** para proporcionar comunicación instantánea entre compradores y vendedores en la plataforma AstroMarket.

## Arquitectura del Sistema

### Backend (Node.js/Express)

#### 1. Controladores
- **`mensajeController.js`**: Maneja toda la lógica del chat
  - `getConversaciones()`: Obtiene conversaciones de un usuario
  - `getMensajes()`: Obtiene mensajes de una conversación
  - `crearMensaje()`: Crea un nuevo mensaje
  - `iniciarConversacion()`: Inicia o encuentra una conversación existente
  - `longPollMensajes()`: Endpoint de long polling para mensajes en tiempo real
  - `notificarNuevoMensaje()`: Notifica a conexiones activas sobre nuevos mensajes

#### 2. Repositorios
- **`mensajeRepository.js`**: Acceso a datos de mensajes
  - `getMensajesNuevos()`: Obtiene mensajes posteriores a un ID específico
  - `getUltimoMensajeId()`: Obtiene el ID del último mensaje
  - `marcarMensajesComoLeidos()`: Marca mensajes como leídos

#### 3. Rutas
- **`chatRouter.js`**: Define endpoints del chat
  - `POST /api/chat/conversacion/iniciar`
  - `GET /api/chat/conversaciones/usuario/:usuarioId`
  - `GET /api/chat/conversacion/:conversacionId/mensajes`
  - `POST /api/chat/mensajes`
  - `GET /api/chat/conversacion/:conversacionId/poll` (Long Polling)

### Frontend (JavaScript Vanilla)

#### 1. Clases Principales

##### `MensajesCompradorManager`
- Maneja la interfaz de chat para compradores
- Funcionalidades:
  - Carga y muestra conversaciones
  - Selección de conversaciones específicas desde URL
  - Long polling para mensajes en tiempo real
  - Envío de mensajes
  - Búsqueda de conversaciones

##### `MensajesVendedorManager`
- Maneja la interfaz de chat para vendedores
- Funcionalidades:
  - Carga anuncios con mensajes
  - Gestión de conversaciones por producto
  - Long polling para mensajes en tiempo real
  - Envío de mensajes

##### `ChatUtils`
- Utilidades comunes para el sistema de chat
- Funcionalidades:
  - Notificaciones del sistema
  - Formateo de fechas
  - Validación de contenido
  - Auto-resize de textareas
  - Indicadores de conexión

#### 2. Páginas HTML
- **`MensajesComprador.html`**: Interfaz para compradores
- **`MensajesVendedorV2.html`**: Interfaz para vendedores

#### 3. Estilos CSS
- **`mensajesEstados.css`**: Estilos para estados vacíos y notificaciones

## Funcionamiento del Long Polling

### 1. Conexión Inicial
```javascript
// El cliente hace una petición al servidor
GET /api/chat/conversacion/{id}/poll?usuarioId={id}&lastMessageId={id}
```

### 2. Espera en el Servidor
- El servidor mantiene la conexión abierta por hasta 30 segundos
- Verifica periódicamente si hay nuevos mensajes
- Si encuentra mensajes nuevos, los envía inmediatamente

### 3. Respuesta del Servidor
```javascript
// Respuesta con nuevos mensajes
{
  "mensajes": [...],
  "hasNewMessages": true
}

// Respuesta sin nuevos mensajes (timeout)
Status: 204 No Content
```

### 4. Reconexión Automática
- El cliente automáticamente inicia una nueva petición de long polling
- Implementa backoff exponencial en caso de errores
- Máximo 5 intentos de reconexión

## Características Implementadas

### ✅ Funcionalidades Principales
- [x] Chat en tiempo real con long polling
- [x] Creación automática de conversaciones
- [x] Interfaz separada para compradores y vendedores
- [x] Notificaciones de mensajes nuevos
- [x] Marcado automático de mensajes como leídos
- [x] Búsqueda de conversaciones
- [x] Navegación móvil-responsive
- [x] Estados vacíos informativos
- [x] Validación de contenido de mensajes

### ✅ Características Técnicas
- [x] Reconexión automática en caso de pérdida de conexión
- [x] Gestión de memoria (limpieza de conexiones inactivas)
- [x] Timeouts configurables
- [x] Manejo de errores robusto
- [x] Escape de HTML para seguridad
- [x] Indicadores visuales de estado de conexión

## Flujo de Uso

### Para Compradores
1. **Iniciar Conversación**: Desde la página de detalle del anuncio, click en "Contactar Vendedor"
2. **Ver Mensajes**: Acceder a `MensajesComprador.html`
3. **Seleccionar Conversación**: Click en cualquier conversación de la lista
4. **Enviar Mensajes**: Escribir en el textarea y presionar Enter o click en enviar
5. **Recibir Mensajes**: Los mensajes nuevos aparecen automáticamente en tiempo real

### Para Vendedores
1. **Ver Anuncios con Mensajes**: Acceder a `MensajesVendedorV2.html`
2. **Seleccionar Producto**: Click en un producto que tenga conversaciones
3. **Seleccionar Conversación**: Click en una conversación específica
4. **Gestionar Mensajes**: Responder a compradores en tiempo real

## Configuración y Instalación

### 1. Dependencias
No se requieren dependencias adicionales. El sistema utiliza:
- Fetch API (nativo del navegador)
- WebSocket no requerido (se usa long polling)

### 2. Base de Datos
Las tablas ya están creadas en `db_astroMarket.sql`:
- `conversaciones`
- `mensajes`
- `usuarios`
- `anuncios`

### 3. Configuración del Servidor
El sistema está integrado en el servidor Express existente. Solo asegurar que:
- Las rutas del chat estén incluidas: `app.use('/api/chat', chatRouter)`
- El servidor esté corriendo en el puerto configurado

## Rendimiento y Escalabilidad

### Ventajas del Long Polling
- **Simplicidad**: No requiere WebSocket servers
- **Compatibilidad**: Funciona con cualquier navegador moderno
- **Firewall-friendly**: Usa HTTP estándar
- **Balanceador de carga**: Compatible con load balancers HTTP

### Consideraciones de Rendimiento
- **Conexiones Concurrentes**: El servidor puede manejar múltiples conexiones long polling
- **Timeout**: 30 segundos por conexión para balancear tiempo real vs recursos
- **Memoria**: Limpieza automática de conexiones inactivas
- **Reconexión**: Backoff exponencial para evitar spam de reconexiones

### Escalabilidad
Para mayor escala, considerar:
- Redis para almacenar conexiones activas entre instancias
- WebSockets para cargas muy altas
- Clustering de Node.js

## Seguridad

### Medidas Implementadas
- **Validación de Input**: Contenido de mensajes limitado a 1000 caracteres
- **Escape de HTML**: Prevención de XSS
- **Autenticación**: Verificación de usuario logueado
- **Autorización**: Solo participantes de conversación pueden acceder

### Recomendaciones Adicionales
- Implementar rate limiting para prevención de spam
- Añadir CSRF tokens
- Validar permisos a nivel de base de datos

## Monitoreo y Debugging

### Logs Útiles
```javascript
// En el navegador (Developer Tools)
console.log('Long polling iniciado para conversación:', conversacionId);
console.log('Nuevos mensajes recibidos:', mensajes);
console.log('Error en long polling:', error);

// En el servidor
console.log('Conexión long polling establecida:', connectionKey);
console.log('Notificando nuevo mensaje a conexiones activas');
```

### Métricas a Monitorear
- Número de conexiones long polling activas
- Tiempo promedio de respuesta
- Errores de reconexión
- Memoria utilizada por conexiones activas

## Futuras Mejoras

### Características Potenciales
- [ ] Notificaciones push del navegador
- [ ] Indicadores de "escribiendo..."
- [ ] Adjuntar imágenes en mensajes
- [ ] Reacciones a mensajes
- [ ] Mensajes de voz
- [ ] Cifrado end-to-end

### Optimizaciones Técnicas
- [ ] Paginación de mensajes antiguos
- [ ] Compresión de mensajes
- [ ] WebSockets como alternativa
- [ ] Service Workers para notificaciones offline
- [ ] Sincronización offline
