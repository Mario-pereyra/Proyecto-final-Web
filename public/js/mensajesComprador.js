// Gestión de mensajes para compradores
class MensajesCompradorManager {
    constructor() {
        this.usuarioActual = null;
        this.conversacionActual = null;
        this.ultimoMensajeId = 0;
        this.longPollController = null;
        this.isPolling = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.init();
    }    async init() {
        this.loadUserInfo();
        
        // Verificar si hay una conversación específica en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const conversacionId = urlParams.get('conversacionId');
        
        await this.loadConversaciones();
        
        // Si hay una conversación específica, seleccionarla
        if (conversacionId) {
            await this.seleccionarConversacionPorId(conversacionId);
        }
        
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

    async loadConversaciones() {
        if (!this.usuarioActual?.usuarioId) {
            console.error('No hay usuario logueado');
            return;
        }

        try {
            const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
            const data = await response.json();

            if (response.ok && data.conversaciones) {
                this.renderConversaciones(data.conversaciones);
                
                // Si hay conversaciones, seleccionar la primera por defecto
                if (data.conversaciones.length > 0) {
                    this.seleccionarConversacion(data.conversaciones[0]);
                }
            } else {
                console.log('No hay conversaciones disponibles');
                this.mostrarMensajeVacio();
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
        const div = document.createElement('div');
        div.className = 'conversation-item';
        div.dataset.conversationId = conversacion.conversacionId;
        
        // Determinar si es vendedor o comprador
        const esVendedor = conversacion.vendedorId === this.usuarioActual.usuarioId;
        const otroUsuario = esVendedor ? conversacion.compradorNombre : conversacion.vendedorNombre;
        
        div.innerHTML = `
            <div class="user-info">
                <div class="profile-pic-container">
                    <img src="../recursos/img/npc.jpg" alt="Foto perfil" class="profile-pic">
                </div>
                <div class="user-details">
                    <span class="user-name">${otroUsuario}</span>
                </div>
            </div>
            <div class="product-info">
                <img src="${conversacion.anuncioImagen ? '/' + conversacion.anuncioImagen : '../recursos/img/placeholder.jpg'}" 
                     alt="Producto" class="product-thumbnail">
                <div class="product-details">
                    <span class="product-name">${conversacion.anuncioTitulo}</span>
                </div>
            </div>
            <div class="message-details">
                <p class="last-message">${conversacion.ultimoMensaje || 'No hay mensajes'}</p>
                <div class="meta-info">
                    <span class="timestamp">${this.formatearFecha(conversacion.fecha_ultimo_mensaje)}</span>
                    <div class="message-indicators">
                        <!-- Badge de mensajes no leídos se agregará dinámicamente -->
                    </div>
                </div>
            </div>
        `;

        div.addEventListener('click', () => {
            this.seleccionarConversacion(conversacion);
        });

        return div;
    }

    async seleccionarConversacion(conversacion) {
        // Detener polling anterior
        this.stopLongPolling();
        
        this.conversacionActual = conversacion;
        
        // Actualizar UI
        this.updateActiveConversation(conversacion);
        
        // Cargar mensajes
        await this.cargarMensajes(conversacion.conversacionId);
        
        // Iniciar long polling
        this.startLongPolling();
        
        // En móvil, mostrar el chat
        const chatViewSwitch = document.getElementById('chat-view-switch');
        if (chatViewSwitch) {
            chatViewSwitch.checked = true;
        }
    }

    async seleccionarConversacionPorId(conversacionId) {
        // Buscar la conversación en la lista cargada
        const conversacionElement = document.querySelector(`[data-conversation-id="${conversacionId}"]`);
        if (conversacionElement) {
            // Si encontramos el elemento, obtener los datos de la conversación
            // Esto es un fallback, idealmente deberíamos tener los datos
            try {
                const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
                const data = await response.json();
                
                if (response.ok && data.conversaciones) {
                    const conversacion = data.conversaciones.find(c => c.conversacionId == conversacionId);
                    if (conversacion) {
                        await this.seleccionarConversacion(conversacion);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error al buscar conversación específica:', error);
            }
        }
        
        // Si no encontramos la conversación específica, mostrar notificación
        this.showNotification('No se pudo encontrar la conversación especificada', 'warning');
    }

    updateActiveConversation(conversacion) {
        // Actualizar elementos activos
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-conversation-id="${conversacion.conversacionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Actualizar header del chat
        const esVendedor = conversacion.vendedorId === this.usuarioActual.usuarioId;
        const otroUsuario = esVendedor ? conversacion.compradorNombre : conversacion.vendedorNombre;
        
        const headerName = document.getElementById('chat-header-name');
        const headerAvatar = document.getElementById('chat-header-avatar');
        const headerProductName = document.getElementById('chat-header-product-name');
        const headerProductImg = document.getElementById('chat-header-product-img');
        
        if (headerName) headerName.textContent = otroUsuario;
        if (headerAvatar) headerAvatar.src = '../recursos/img/npc.jpg';
        if (headerProductName) headerProductName.textContent = conversacion.anuncioTitulo;
        if (headerProductImg) {
            headerProductImg.src = conversacion.anuncioImagen ? '/' + conversacion.anuncioImagen : '../recursos/img/placeholder.jpg';
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
                    // Esperar antes de reconectar (backoff exponencial)
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

        // Búsqueda de conversaciones
        const searchInput = document.getElementById('conversations-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filtrarConversaciones(e.target.value);
            });
        }

        // Limpiar polling al cerrar la página
        window.addEventListener('beforeunload', () => {
            this.stopLongPolling();
        });
    }

    filtrarConversaciones(termino) {
        const conversaciones = document.querySelectorAll('.conversation-item');
        const terminoLower = termino.toLowerCase();

        conversaciones.forEach(conv => {
            const userName = conv.querySelector('.user-name')?.textContent || '';
            const productName = conv.querySelector('.product-name')?.textContent || '';
            const lastMessage = conv.querySelector('.last-message')?.textContent || '';

            const coincide = userName.toLowerCase().includes(terminoLower) ||
                           productName.toLowerCase().includes(terminoLower) ||
                           lastMessage.toLowerCase().includes(terminoLower);

            conv.style.display = coincide ? 'flex' : 'none';
        });
    }

    mostrarMensajeVacio() {
        const container = document.getElementById('conversations-list-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>No tienes conversaciones</h3>
                    <p>Cuando inicies una conversación con un vendedor, aparecerá aquí.</p>
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
    window.mensajesCompradorManager = new MensajesCompradorManager();
});
