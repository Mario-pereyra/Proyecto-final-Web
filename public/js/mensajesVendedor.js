// Gestión de mensajes para vendedores
class MensajesVendedorManager {
    constructor() {
        this.usuarioActual = null;
        this.anuncioActual = null;
        this.conversacionActual = null;
        this.ultimoMensajeId = 0;
        this.longPollController = null;
        this.isPolling = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.init();
    }

    async init() {
        this.loadUserInfo();
        await this.loadAnunciosConMensajes();
        this.setupEventListeners();
    }

    loadUserInfo() {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            this.usuarioActual = JSON.parse(userSession);
        } else {
            console.warn('No hay sesión de usuario');
            window.location.href = 'Login.html';
            return;
        }
    }

    async loadAnunciosConMensajes() {
        if (!this.usuarioActual?.usuarioId) {
            console.error('No hay usuario logueado');
            return;
        }

        try {
            // Cargar anuncios del vendedor
            const response = await fetch(`/api/anuncios/vendedor/${this.usuarioActual.usuarioId}`);
            const anuncios = await response.json();

            if (response.ok && anuncios.length > 0) {
                // Filtrar solo anuncios que tienen conversaciones
                const anunciosConMensajes = anuncios.filter(anuncio => anuncio.total_conversaciones > 0);
                
                if (anunciosConMensajes.length > 0) {
                    this.renderAnuncios(anunciosConMensajes);
                    // Seleccionar el primer anuncio por defecto
                    this.seleccionarAnuncio(anunciosConMensajes[0]);
                } else {
                    this.mostrarMensajeVacioAnuncios();
                }
            } else {
                this.mostrarMensajeVacioAnuncios();
            }
        } catch (error) {
            console.error('Error al cargar anuncios:', error);
            this.showNotification('Error al cargar los anuncios', 'error');
        }
    }

    renderAnuncios(anuncios) {
        const container = document.getElementById('products-list-container');
        if (!container) return;

        container.innerHTML = '';

        anuncios.forEach(anuncio => {
            const anuncioElement = this.createAnuncioElement(anuncio);
            container.appendChild(anuncioElement);
        });
    }

    createAnuncioElement(anuncio) {
        const label = document.createElement('label');
        label.setAttribute('for', 'product-view-switch');
        
        const div = document.createElement('div');
        div.className = 'product-item';
        div.dataset.productId = anuncio.anuncioId;

        div.innerHTML = `
            <div class="product-main-info">
                <img src="${anuncio.imagen_principal ? '/' + anuncio.imagen_principal : '../recursos/img/placeholder.jpg'}" 
                     alt="${anuncio.titulo}" class="product-image">
                <div class="product-details">
                    <h3 class="product-name">${anuncio.titulo}</h3>
                    <p class="product-price">$${parseFloat(anuncio.precio).toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
                </div>
            </div>
            <div class="product-messages-info">
                <div class="messages-count">
                    <span class="count-number">${anuncio.total_conversaciones}</span>
                    <span class="count-label">Chats</span>
                </div>
                ${anuncio.mensajes_no_leidos > 0 ? `<div class="new-messages-badge">${anuncio.mensajes_no_leidos}</div>` : ''}
            </div>
        `;

        div.addEventListener('click', () => {
            this.seleccionarAnuncio(anuncio);
        });

        label.appendChild(div);
        return label;
    }

    async seleccionarAnuncio(anuncio) {
        // Detener polling anterior
        this.stopLongPolling();
        
        this.anuncioActual = anuncio;
        this.conversacionActual = null;

        // Actualizar UI
        this.updateActiveAnuncio(anuncio);

        // Cargar conversaciones para este anuncio
        await this.loadConversacionesAnuncio(anuncio.anuncioId);

        // Mostrar vista de conversaciones en móvil
        const productViewSwitch = document.getElementById('product-view-switch');
        if (productViewSwitch) {
            productViewSwitch.checked = true;
        }
    }

    updateActiveAnuncio(anuncio) {
        // Actualizar elementos activos
        document.querySelectorAll('.product-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-product-id="${anuncio.anuncioId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Actualizar título de conversaciones
        const conversationsTitle = document.querySelector('.conversations-title h2');
        if (conversationsTitle) {
            conversationsTitle.textContent = anuncio.titulo.length > 20 
                ? anuncio.titulo.substring(0, 20) + '...' 
                : anuncio.titulo;
        }
    }

    async loadConversacionesAnuncio(anuncioId) {
        try {
            const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
            const data = await response.json();

            if (response.ok && data.conversaciones) {
                // Filtrar conversaciones para este anuncio
                const conversacionesAnuncio = data.conversaciones.filter(conv => conv.anuncioId == anuncioId);
                
                if (conversacionesAnuncio.length > 0) {
                    this.renderConversaciones(conversacionesAnuncio);
                    // Seleccionar la primera conversación
                    this.seleccionarConversacion(conversacionesAnuncio[0]);
                } else {
                    this.mostrarMensajeVacioConversaciones();
                }
            } else {
                this.mostrarMensajeVacioConversaciones();
            }
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            this.showNotification('Error al cargar las conversaciones', 'error');
        }
    }

    renderConversaciones(conversaciones) {
        const container = document.getElementById('conversations-list-container');
        if (!container) return;

        container.innerHTML = '';

        conversaciones.forEach(conversacion => {
            const conversacionElement = this.createConversacionElement(conversacion);
            container.appendChild(conversacionElement);
        });
    }

    createConversacionElement(conversacion) {
        const label = document.createElement('label');
        label.setAttribute('for', 'conversations-view-switch');
        
        const div = document.createElement('div');
        div.className = 'conversation-item';
        div.dataset.conversationId = conversacion.conversacionId;

        // Para el vendedor, el comprador es el otro usuario
        const nombreComprador = conversacion.compradorNombre;

        div.innerHTML = `
            <div class="user-info">
                <div class="profile-pic-container">
                    <img src="../recursos/img/npc.jpg" alt="Foto comprador" class="profile-pic">
                </div>
                <div class="user-details">
                    <span class="user-name">${nombreComprador}</span>
                </div>
            </div>
            <div class="message-details">
                <p class="last-message">${conversacion.ultimoMensaje || 'No hay mensajes'}</p>
                <div class="meta-info">
                    <span class="timestamp">${this.formatearFecha(conversacion.fecha_ultimo_mensaje)}</span>
                    <!-- Badge de mensajes no leídos se agregará dinámicamente -->
                </div>
            </div>
        `;

        div.addEventListener('click', () => {
            this.seleccionarConversacion(conversacion);
        });

        label.appendChild(div);
        return label;
    }

    async seleccionarConversacion(conversacion) {
        // Detener polling anterior
        this.stopLongPolling();
        
        this.conversacionActual = conversacion;

        // Actualizar UI
        this.updateActiveConversacion(conversacion);

        // Cargar mensajes
        await this.cargarMensajes(conversacion.conversacionId);

        // Iniciar long polling
        this.startLongPolling();

        // En móvil, mostrar el chat
        const conversationsViewSwitch = document.getElementById('conversations-view-switch');
        if (conversationsViewSwitch) {
            conversationsViewSwitch.checked = true;
        }
    }

    updateActiveConversacion(conversacion) {
        // Actualizar elementos activos
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-conversation-id="${conversacion.conversacionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Actualizar header del chat
        const headerUsername = document.querySelector('.chat-header-username');
        if (headerUsername) {
            headerUsername.textContent = conversacion.compradorNombre;
        }
    }

    async cargarMensajes(conversacionId) {
        try {
            const response = await fetch(`/api/chat/conversacion/${conversacionId}/mensajes?usuarioId=${this.usuarioActual.usuarioId}`);
            const mensajes = await response.json();

            if (response.ok) {
                this.renderMensajes(mensajes);
                this.ultimoMensajeId = mensajes.length > 0 ? Math.max(...mensajes.map(m => m.mensajeId)) : 0;
            } else {
                console.error('Error al cargar mensajes:', mensajes.message);
            }
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        }
    }

    renderMensajes(mensajes) {
        const container = document.getElementById('chat-messages-container');
        if (!container) return;

        container.innerHTML = '';

        mensajes.forEach(mensaje => {
            const mensajeElement = this.createMensajeElement(mensaje);
            container.appendChild(mensajeElement);
        });

        // Scroll al final
        container.scrollTop = container.scrollHeight;
    }

    createMensajeElement(mensaje) {
        const div = document.createElement('div');
        const esMio = mensaje.emisorId === this.usuarioActual.usuarioId;
        
        div.className = `message ${esMio ? 'sent' : 'received'}`;
        div.dataset.messageId = mensaje.mensajeId;

        div.innerHTML = `
            <div class="message-content">
                <span class="message-text">${mensaje.contenido}</span>
            </div>
            <div class="message-meta">
                <div class="timestamp">${this.formatearFecha(mensaje.fecha_envio)}</div>
                ${esMio ? '<div class="message-status"><span class="read-receipt">✓✓</span></div>' : ''}
            </div>
        `;

        return div;
    }

    startLongPolling() {
        if (this.isPolling || !this.conversacionActual) return;
        
        this.isPolling = true;
        this.longPoll();
    }

    async longPoll() {
        if (!this.isPolling || !this.conversacionActual) return;

        try {
            this.longPollController = new AbortController();
            
            const response = await fetch(
                `/api/chat/conversacion/${this.conversacionActual.conversacionId}/poll?usuarioId=${this.usuarioActual.usuarioId}&lastMessageId=${this.ultimoMensajeId}`,
                {
                    signal: this.longPollController.signal,
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                
                if (data.hasNewMessages && data.mensajes) {
                    this.procesarNuevosMensajes(data.mensajes);
                    this.reconnectAttempts = 0;
                }
            } else if (response.status !== 204) {
                console.error('Error en long polling:', response.status);
            }

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error en long polling:', error);
                this.reconnectAttempts++;
                
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    // Esperar antes de reconectar
                    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
                    setTimeout(() => this.longPoll(), delay);
                    return;
                }
            }
        }

        // Continuar polling si aún está activo
        if (this.isPolling) {
            setTimeout(() => this.longPoll(), 1000);
        }
    }

    procesarNuevosMensajes(mensajes) {
        const container = document.getElementById('chat-messages-container');
        if (!container) return;

        mensajes.forEach(mensaje => {
            const mensajeElement = this.createMensajeElement(mensaje);
            container.appendChild(mensajeElement);
            
            // Actualizar último mensaje ID
            if (mensaje.mensajeId > this.ultimoMensajeId) {
                this.ultimoMensajeId = mensaje.mensajeId;
            }
        });

        // Scroll al final
        container.scrollTop = container.scrollHeight;

        // Actualizar la lista de conversaciones
        this.updateConversacionEnLista(mensajes[mensajes.length - 1]);
    }

    updateConversacionEnLista(ultimoMensaje) {
        const conversacionItem = document.querySelector(`[data-conversation-id="${this.conversacionActual.conversacionId}"]`);
        if (!conversacionItem) return;

        const lastMessageElement = conversacionItem.querySelector('.last-message');
        const timestampElement = conversacionItem.querySelector('.timestamp');
        
        if (lastMessageElement) {
            lastMessageElement.textContent = ultimoMensaje.contenido;
        }
        
        if (timestampElement) {
            timestampElement.textContent = this.formatearFecha(ultimoMensaje.fecha_envio);
        }
    }

    stopLongPolling() {
        this.isPolling = false;
        if (this.longPollController) {
            this.longPollController.abort();
            this.longPollController = null;
        }
    }    async enviarMensaje(contenido) {
        if (!this.conversacionActual) return;

        // Validar contenido del mensaje
        const validation = ChatUtils.validateMessageContent(contenido);
        if (!validation.valid) {
            this.showNotification(validation.error, 'warning');
            return false;
        }

        try {
            const response = await fetch('/api/chat/mensajes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversacionId: this.conversacionActual.conversacionId,
                    emisorId: this.usuarioActual.usuarioId,
                    contenido: validation.content
                })
            });

            const result = await response.json();

            if (response.ok) {
                // El mensaje aparecerá automáticamente vía long polling
                return true;
            } else {
                console.error('Error al enviar mensaje:', result.message);
                this.showNotification('Error al enviar el mensaje', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            this.showNotification('Error de conexión al enviar mensaje', 'error');
            return false;
        }
    }

    setupEventListeners() {
        // Enviar mensaje
        const sendButton = document.getElementById('send-button');
        const messageInput = document.getElementById('message-input');

        if (sendButton && messageInput) {
            sendButton.addEventListener('click', async () => {
                const contenido = messageInput.value;
                if (await this.enviarMensaje(contenido)) {
                    messageInput.value = '';
                    messageInput.style.height = 'auto';
                }
            });

            messageInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const contenido = messageInput.value;
                    if (await this.enviarMensaje(contenido)) {
                        messageInput.value = '';
                        messageInput.style.height = 'auto';
                    }
                }
            });            // Auto-resize del textarea
            ChatUtils.setupAutoResizeTextarea(messageInput);
        }

        // Limpiar polling al cerrar la página
        window.addEventListener('beforeunload', () => {
            this.stopLongPolling();
        });
    }

    mostrarMensajeVacioAnuncios() {
        const container = document.getElementById('products-list-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>No tienes mensajes</h3>
                    <p>Cuando alguien esté interesado en tus productos, los mensajes aparecerán aquí.</p>
                </div>
            `;
        }
    }

    mostrarMensajeVacioConversaciones() {
        const container = document.getElementById('conversations-list-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>No hay conversaciones</h3>
                    <p>No hay mensajes para este producto.</p>
                </div>
            `;
        }
    }    formatearFecha(fecha) {
        return ChatUtils.formatearFecha(fecha);
    }

    showNotification(message, type = 'info') {
        ChatUtils.showNotification(message, type);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.mensajesVendedorManager = new MensajesVendedorManager();
});
