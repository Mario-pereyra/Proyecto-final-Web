// Sistema de mensajes simple con long polling
class MensajesSimple {
    constructor() {
        this.usuarioActual = null;
        this.conversacionActual = null;
        this.ultimoMensajeId = 0;
        this.polling = false;
        this.tipoVista = 'comprador'; // 'comprador' o 'vendedor'
        
        this.init();
    }

    init() {
        this.cargarUsuario();
        this.detectarTipoVista();
        this.cargarConversaciones();
        this.setupEventListeners();
    }

    cargarUsuario() {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            this.usuarioActual = JSON.parse(userSession);
        } else {
            window.location.href = 'Login.html';
        }
    }

    detectarTipoVista() {
        // Detectar si estamos en vista comprador o vendedor basado en la URL o elementos
        if (window.location.pathname.includes('Comprador') || 
            document.querySelector('#conversations-list-container-comprador')) {
            this.tipoVista = 'comprador';
        } else {
            this.tipoVista = 'vendedor';
        }
    }

    async cargarConversaciones() {
        try {
            const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
            const data = await response.json();

            if (response.ok && data.conversaciones) {
                if (this.tipoVista === 'comprador') {
                    const conversacionesComprador = data.conversaciones.filter(conv => 
                        conv.compradorId === this.usuarioActual.usuarioId
                    );
                    this.mostrarConversaciones(conversacionesComprador);
                } else {
                    // Para vendedor, agrupar por anuncios
                    this.cargarAnunciosVendedor();
                }
            }
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
        }
    }

    async cargarAnunciosVendedor() {
        try {
            const response = await fetch(`/api/anuncios/vendedor/${this.usuarioActual.usuarioId}`);
            const anuncios = await response.json();

            if (response.ok) {
                const anunciosConMensajes = anuncios.filter(anuncio => anuncio.total_conversaciones > 0);
                this.mostrarAnuncios(anunciosConMensajes);
            }
        } catch (error) {
            console.error('Error al cargar anuncios:', error);
        }
    }

    mostrarConversaciones(conversaciones) {
        const container = this.getContainer('conversations-list-container');
        if (!container) return;

        container.innerHTML = '';

        if (conversaciones.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No tienes conversaciones</p></div>';
            return;
        }

        conversaciones.forEach(conv => {
            const div = document.createElement('div');
            div.className = 'conversation-item';
            div.dataset.conversationId = conv.conversacionId;
            
            div.innerHTML = `
                <div class="user-info">
                    <img src="../recursos/img/npc.jpg" alt="Avatar" class="profile-pic">
                    <div class="user-details">
                        <span class="user-name">${conv.vendedorNombre || conv.compradorNombre}</span>
                    </div>
                </div>
                <div class="message-details">
                    <p class="last-message">${conv.ultimoMensaje || 'Sin mensajes'}</p>
                    <span class="timestamp">${this.formatearFecha(conv.fecha_ultimo_mensaje)}</span>
                </div>
            `;
            
            div.addEventListener('click', () => this.seleccionarConversacion(conv));
            container.appendChild(div);
        });

        // Seleccionar la primera automáticamente
        if (conversaciones.length > 0) {
            this.seleccionarConversacion(conversaciones[0]);
        }
    }

    mostrarAnuncios(anuncios) {
        const container = this.getContainer('products-list-container');
        if (!container) return;

        container.innerHTML = '';

        anuncios.forEach(anuncio => {
            const div = document.createElement('div');
            div.className = 'product-item';
            div.dataset.productId = anuncio.anuncioId;
            
            div.innerHTML = `
                <div class="product-main-info">
                    <img src="${anuncio.imagen_principal ? '/' + anuncio.imagen_principal : '../recursos/img/placeholder.jpg'}" 
                         alt="${anuncio.titulo}" class="product-image">
                    <div class="product-details">
                        <h3 class="product-name">${anuncio.titulo}</h3>
                        <p class="product-price">$${parseFloat(anuncio.precio).toLocaleString('es-ES')}</p>
                    </div>
                </div>
                <div class="product-messages-info">
                    <span class="count-number">${anuncio.total_conversaciones}</span>
                    <span class="count-label">Chats</span>
                </div>
            `;
            
            div.addEventListener('click', () => this.seleccionarAnuncio(anuncio));
            container.appendChild(div);
        });
    }

    async seleccionarAnuncio(anuncio) {
        // Cargar conversaciones de este anuncio
        const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
        const data = await response.json();
        
        if (response.ok) {
            const conversacionesAnuncio = data.conversaciones.filter(conv => 
                conv.anuncioId == anuncio.anuncioId && conv.vendedorId === this.usuarioActual.usuarioId
            );
            this.mostrarConversacionesAnuncio(conversacionesAnuncio);
        }
    }

    mostrarConversacionesAnuncio(conversaciones) {
        const container = this.getContainer('conversations-list-container');
        if (!container) return;

        container.innerHTML = '';

        conversaciones.forEach(conv => {
            const div = document.createElement('div');
            div.className = 'conversation-item';
            div.dataset.conversationId = conv.conversacionId;
            
            div.innerHTML = `
                <div class="user-info">
                    <img src="../recursos/img/npc.jpg" alt="Avatar" class="profile-pic">
                    <span class="user-name">${conv.compradorNombre}</span>
                </div>
                <div class="message-details">
                    <p class="last-message">${conv.ultimoMensaje || 'Sin mensajes'}</p>
                    <span class="timestamp">${this.formatearFecha(conv.fecha_ultimo_mensaje)}</span>
                </div>
            `;
            
            div.addEventListener('click', () => this.seleccionarConversacion(conv));
            container.appendChild(div);
        });

        if (conversaciones.length > 0) {
            this.seleccionarConversacion(conversaciones[0]);
        }
    }

    async seleccionarConversacion(conversacion) {
        this.pararPolling();
        this.conversacionActual = conversacion;
        
        // Actualizar UI
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-conversation-id="${conversacion.conversacionId}"]`)?.classList.add('active');
        
        // Cargar mensajes
        await this.cargarMensajes();
        this.iniciarPolling();
    }

    async cargarMensajes() {
        if (!this.conversacionActual) return;

        try {
            const response = await fetch(
                `/api/chat/conversacion/${this.conversacionActual.conversacionId}/mensajes?usuarioId=${this.usuarioActual.usuarioId}`
            );
            const mensajes = await response.json();

            if (response.ok) {
                this.mostrarMensajes(mensajes);
                this.ultimoMensajeId = mensajes.length > 0 ? Math.max(...mensajes.map(m => m.mensajeId)) : 0;
            }
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        }
    }

    mostrarMensajes(mensajes) {
        const container = this.getContainer('chat-messages-container');
        if (!container) return;

        container.innerHTML = '';

        mensajes.forEach(mensaje => {
            const div = document.createElement('div');
            div.className = `message ${mensaje.emisorId === this.usuarioActual.usuarioId ? 'sent' : 'received'}`;
            
            div.innerHTML = `
                <div class="message-content">
                    <span class="message-text">${mensaje.contenido}</span>
                </div>
                <div class="message-meta">
                    <span class="timestamp">${this.formatearFecha(mensaje.fecha_envio)}</span>
                </div>
            `;
            
            container.appendChild(div);
        });

        container.scrollTop = container.scrollHeight;
    }

    // Long polling simple
    async iniciarPolling() {
        if (this.polling || !this.conversacionActual) return;
        this.polling = true;
        this.poll();
    }

    async poll() {
        if (!this.polling || !this.conversacionActual) return;

        try {
            const response = await fetch(
                `/api/chat/conversacion/${this.conversacionActual.conversacionId}/poll?usuarioId=${this.usuarioActual.usuarioId}&lastMessageId=${this.ultimoMensajeId}`
            );

            if (response.ok) {
                const data = await response.json();
                
                if (data.hasNewMessages && data.mensajes?.length > 0) {
                    this.agregarNuevosMensajes(data.mensajes);
                }
            }
        } catch (error) {
            console.error('Error en polling:', error);
        }

        // Repetir polling si aún está activo
        if (this.polling) {
            setTimeout(() => this.poll(), 1000);
        }
    }

    agregarNuevosMensajes(mensajes) {
        const container = this.getContainer('chat-messages-container');
        if (!container) return;

        mensajes.forEach(mensaje => {
            const div = document.createElement('div');
            div.className = `message ${mensaje.emisorId === this.usuarioActual.usuarioId ? 'sent' : 'received'}`;
            
            div.innerHTML = `
                <div class="message-content">
                    <span class="message-text">${mensaje.contenido}</span>
                </div>
                <div class="message-meta">
                    <span class="timestamp">${this.formatearFecha(mensaje.fecha_envio)}</span>
                </div>
            `;
            
            container.appendChild(div);
            this.ultimoMensajeId = Math.max(this.ultimoMensajeId, mensaje.mensajeId);
        });

        container.scrollTop = container.scrollHeight;
    }

    pararPolling() {
        this.polling = false;
    }

    async enviarMensaje(contenido) {
        if (!this.conversacionActual || !contenido.trim()) return;

        try {
            const response = await fetch('/api/chat/mensajes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversacionId: this.conversacionActual.conversacionId,
                    emisorId: this.usuarioActual.usuarioId,
                    contenido: contenido.trim()
                })
            });

            if (response.ok) {
                // El mensaje aparecerá automáticamente via polling
                return true;
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        }
        return false;
    }

    setupEventListeners() {
        // Botón enviar
        const sendButton = this.getElement('send-button');
        const messageInput = this.getElement('message-input');

        if (sendButton && messageInput) {
            sendButton.addEventListener('click', async () => {
                const contenido = messageInput.value;
                if (await this.enviarMensaje(contenido)) {
                    messageInput.value = '';
                }
            });

            messageInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const contenido = messageInput.value;
                    if (await this.enviarMensaje(contenido)) {
                        messageInput.value = '';
                    }
                }
            });
        }
    }

    // Utilidades
    getContainer(selector) {
        // Buscar con sufijo específico primero
        const conSufijo = document.querySelector(`#${selector}-${this.tipoVista}`);
        if (conSufijo) return conSufijo;
        
        // Buscar sin sufijo como fallback
        return document.querySelector(`#${selector}`);
    }

    getElement(selector) {
        // Buscar con sufijo específico primero
        const conSufijo = document.querySelector(`#${selector}-${this.tipoVista}`);
        if (conSufijo) return conSufijo;
        
        // Buscar sin sufijo como fallback
        return document.querySelector(`#${selector}`);
    }

    formatearFecha(fecha) {
        if (!fecha) return '';
        const date = new Date(fecha);
        const ahora = new Date();
        
        if (date.toDateString() === ahora.toDateString()) {
            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('es-ES');
        }
    }

    // Cleanup
    destroy() {
        this.pararPolling();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.mensajesManager = new MensajesSimple();
    
    // Cleanup al cerrar
    window.addEventListener('beforeunload', () => {
        if (window.mensajesManager) {
            window.mensajesManager.destroy();
        }
    });
});
