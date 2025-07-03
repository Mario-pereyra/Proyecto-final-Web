// Gestión unificada de mensajes con sistema de pestañas
class MensajesUnificadosManager {
    constructor() {
        this.usuarioActual = null;
        this.tabActiva = 'comprador';
        this.compradorManager = null;
        this.vendedorManager = null;
        
        this.init();
    }

    async init() {
        this.loadUserInfo();
        this.setupTabNavigation();
        await this.initializeActiveTab();
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

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    async switchTab(tabName) {
        if (this.tabActiva === tabName) return;

        // Limpiar managers anteriores
        this.cleanupPreviousTab();

        // Actualizar UI de pestañas
        this.updateTabButtons(tabName);
        this.updateTabContent(tabName);

        // Actualizar pestaña activa
        this.tabActiva = tabName;

        // Inicializar nueva pestaña
        await this.initializeActiveTab();
    }

    updateTabButtons(activeTab) {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            if (button.dataset.tab === activeTab) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    updateTabContent(activeTab) {
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabContents.forEach(content => {
            if (content.dataset.tabContent === activeTab) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    async initializeActiveTab() {
        const tabContent = document.querySelector(`.tab-content[data-tab-content="${this.tabActiva}"]`);
        
        if (!tabContent) return;

        // Mostrar estado de carga
        tabContent.classList.add('loading');

        try {
            if (this.tabActiva === 'comprador') {
                await this.initCompradorTab();
            } else if (this.tabActiva === 'vendedor') {
                await this.initVendedorTab();
            }
        } catch (error) {
            console.error(`Error al inicializar pestaña ${this.tabActiva}:`, error);
            ChatUtils.showNotification('Error al cargar los mensajes', 'error');
        } finally {
            // Quitar estado de carga
            tabContent.classList.remove('loading');
        }
    }

    async initCompradorTab() {
        // Crear instancia del manager de comprador con contexto específico
        this.compradorManager = new CompradorMessagesManager(this.usuarioActual, 'comprador');
        await this.compradorManager.initialize();
        
        // Verificar si hay conversación específica en URL
        const urlParams = new URLSearchParams(window.location.search);
        const conversacionId = urlParams.get('conversacionId');
        
        if (conversacionId) {
            await this.compradorManager.seleccionarConversacionPorId(conversacionId);
        }
    }

    async initVendedorTab() {
        // Crear instancia del manager de vendedor con contexto específico
        this.vendedorManager = new VendedorMessagesManager(this.usuarioActual, 'vendedor');
        await this.vendedorManager.initialize();
    }

    cleanupPreviousTab() {
        // Limpiar long polling y recursos del tab anterior
        if (this.compradorManager) {
            this.compradorManager.cleanup();
            this.compradorManager = null;
        }
        
        if (this.vendedorManager) {
            this.vendedorManager.cleanup();
            this.vendedorManager = null;
        }
    }

    // Método para actualizar badges de notificación
    async updateNotificationBadges() {
        try {
            // Obtener conteos de mensajes no leídos
            const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
            const data = await response.json();

            if (response.ok && data.conversaciones) {
                let compradorUnread = 0;
                let vendedorUnread = 0;

                data.conversaciones.forEach(conv => {
                    // Lógica para determinar si es conversación de comprador o vendedor
                    if (conv.compradorId === this.usuarioActual.usuarioId) {
                        // Es comprador en esta conversación
                        compradorUnread += conv.mensajes_no_leidos || 0;
                    } else {
                        // Es vendedor en esta conversación
                        vendedorUnread += conv.mensajes_no_leidos || 0;
                    }
                });

                this.updateTabBadge('comprador', compradorUnread);
                this.updateTabBadge('vendedor', vendedorUnread);
            }
        } catch (error) {
            console.error('Error al actualizar badges de notificación:', error);
        }
    }

    updateTabBadge(tabName, count) {
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (!tabButton) return;

        // Remover badge existente
        const existingBadge = tabButton.querySelector('.notification-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        // Agregar nuevo badge si hay mensajes no leídos
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.textContent = count > 99 ? '99+' : count.toString();
            tabButton.appendChild(badge);
        }
    }

    // Método público para cambiar a una pestaña específica desde externa
    switchToTab(tabName) {
        this.switchTab(tabName);
    }

    // Cleanup al cerrar la página
    destroy() {
        this.cleanupPreviousTab();
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    handleBeforeUnload = () => {
        this.destroy();
    }
}

// Manager específico para comprador (adaptado para contexto de pestañas)
class CompradorMessagesManager {
    constructor(usuario, contexto) {
        this.usuarioActual = usuario;
        this.contexto = contexto;
        this.conversacionActual = null;
        this.ultimoMensajeId = 0;
        this.longPollController = null;
        this.isPolling = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async initialize() {
        await this.loadConversaciones();
        this.setupEventListeners();
    }    async loadConversaciones() {
        if (!this.usuarioActual?.usuarioId) {
            console.error('No hay usuario logueado');
            return;
        }

        try {
            const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
            const data = await response.json();

            if (response.ok && data.conversaciones) {
                // Filtrar solo conversaciones donde el usuario es comprador
                const conversacionesComprador = data.conversaciones.filter(conv => 
                    conv.compradorId === this.usuarioActual.usuarioId
                );
                
                if (conversacionesComprador.length > 0) {
                    this.renderConversaciones(conversacionesComprador);
                    this.seleccionarConversacion(conversacionesComprador[0]);
                } else {
                    this.mostrarMensajeVacio();
                }
            } else {
                this.mostrarMensajeVacio();
            }
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            ChatUtils.showNotification('Error al cargar las conversaciones', 'error');
        }
    }

    renderConversaciones(conversaciones) {
        const container = this.getContainer('conversations-list-container-comprador');
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
        
        const otroUsuario = conversacion.vendedorNombre;
        
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
                    <span class="timestamp">${ChatUtils.formatearFecha(conversacion.fecha_ultimo_mensaje)}</span>
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
        this.stopLongPolling();
        this.conversacionActual = conversacion;
        this.updateActiveConversation(conversacion);
        await this.cargarMensajes(conversacion.conversacionId);
        this.startLongPolling();
        
        // Activar vista de chat en móvil
        const chatViewSwitch = this.getElement('chat-view-switch');
        if (chatViewSwitch) {
            chatViewSwitch.checked = true;
        }
    }

    updateActiveConversation(conversacion) {
        // Actualizar elementos activos en el contexto del comprador
        const compradorContainer = document.querySelector('[data-tab-content="comprador"]');
        if (!compradorContainer) return;

        compradorContainer.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = compradorContainer.querySelector(`[data-conversation-id="${conversacion.conversacionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }        // Actualizar header del chat
        const otroUsuario = conversacion.vendedorNombre;
        this.updateChatHeader(otroUsuario, conversacion.anuncioTitulo, conversacion.anuncioImagen);
    }

    updateChatHeader(userName, productName, productImage) {
        const compradorContainer = document.querySelector('[data-tab-content="comprador"]');
        if (!compradorContainer) return;

        const headerName = compradorContainer.querySelector('#chat-header-name-comprador');
        const headerAvatar = compradorContainer.querySelector('#chat-header-avatar-comprador');
        const headerProductName = compradorContainer.querySelector('#chat-header-product-name-comprador');
        const headerProductImg = compradorContainer.querySelector('#chat-header-product-img-comprador');
        
        if (headerName) headerName.textContent = userName;
        if (headerAvatar) headerAvatar.src = '../recursos/img/npc.jpg';
        if (headerProductName) headerProductName.textContent = productName;
        if (headerProductImg) {
            headerProductImg.src = productImage ? '/' + productImage : '../recursos/img/placeholder.jpg';
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
        const container = this.getContainer('chat-messages-container-comprador');
        if (!container) return;

        container.innerHTML = '';

        mensajes.forEach(mensaje => {
            const mensajeElement = this.createMensajeElement(mensaje);
            container.appendChild(mensajeElement);
        });

        ChatUtils.scrollToBottom(container, false);
    }

    createMensajeElement(mensaje) {
        const div = document.createElement('div');
        const esMio = mensaje.emisorId === this.usuarioActual.usuarioId;
        
        div.className = `message ${esMio ? 'sent' : 'received'}`;
        div.dataset.messageId = mensaje.mensajeId;

        div.innerHTML = `
            <div class="message-content">
                <span class="message-text">${ChatUtils.escapeHtml(mensaje.contenido)}</span>
            </div>
            <div class="message-meta">
                <div class="timestamp">${ChatUtils.formatearFecha(mensaje.fecha_envio)}</div>
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
                    headers: { 'Cache-Control': 'no-cache' }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.hasNewMessages && data.mensajes) {
                    this.procesarNuevosMensajes(data.mensajes);
                    this.reconnectAttempts = 0;
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error en long polling:', error);
                this.reconnectAttempts++;
                
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
                    setTimeout(() => this.longPoll(), delay);
                    return;
                }
            }
        }

        if (this.isPolling) {
            setTimeout(() => this.longPoll(), 1000);
        }
    }

    procesarNuevosMensajes(mensajes) {
        const container = this.getContainer('chat-messages-container');
        if (!container) return;

        mensajes.forEach(mensaje => {
            const mensajeElement = this.createMensajeElement(mensaje);
            ChatUtils.addMessageAnimation(mensajeElement);
            container.appendChild(mensajeElement);
            
            if (mensaje.mensajeId > this.ultimoMensajeId) {
                this.ultimoMensajeId = mensaje.mensajeId;
            }
        });

        ChatUtils.scrollToBottom(container);
        this.updateConversacionEnLista(mensajes[mensajes.length - 1]);
    }

    updateConversacionEnLista(ultimoMensaje) {
        const conversacionItem = this.getContainer(`[data-conversation-id="${this.conversacionActual.conversacionId}"]`);
        if (!conversacionItem) return;

        const lastMessageElement = conversacionItem.querySelector('.last-message');
        const timestampElement = conversacionItem.querySelector('.timestamp');
        
        if (lastMessageElement) {
            lastMessageElement.textContent = ultimoMensaje.contenido;
        }
        
        if (timestampElement) {
            timestampElement.textContent = ChatUtils.formatearFecha(ultimoMensaje.fecha_envio);
        }
    }

    stopLongPolling() {
        this.isPolling = false;
        if (this.longPollController) {
            this.longPollController.abort();
            this.longPollController = null;
        }
    }

    async enviarMensaje(contenido) {
        if (!this.conversacionActual) return false;

        const validation = ChatUtils.validateMessageContent(contenido);
        if (!validation.valid) {
            ChatUtils.showNotification(validation.error, 'warning');
            return false;
        }

        try {
            const response = await fetch('/api/chat/mensajes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversacionId: this.conversacionActual.conversacionId,
                    emisorId: this.usuarioActual.usuarioId,
                    contenido: validation.content
                })
            });

            const result = await response.json();

            if (response.ok) {
                return true;
            } else {
                console.error('Error al enviar mensaje:', result.message);
                ChatUtils.showNotification('Error al enviar el mensaje', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            ChatUtils.showNotification('Error de conexión al enviar mensaje', 'error');
            return false;
        }
    }    setupEventListeners() {
        const sendButton = this.getElement('send-button-comprador');
        const messageInput = this.getElement('message-input-comprador');

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
            });

            ChatUtils.setupAutoResizeTextarea(messageInput);
        }

        // Búsqueda de conversaciones
        const searchInput = this.getElement('conversations-search-comprador');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filtrarConversaciones(e.target.value);
            });
        }
    }

    filtrarConversaciones(termino) {
        const conversaciones = this.getContainer('conversations-list-container')?.querySelectorAll('.conversation-item');
        if (!conversaciones) return;

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
        const container = this.getContainer('conversations-list-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>No tienes conversaciones</h3>
                    <p>Cuando inicies una conversación con un vendedor, aparecerá aquí.</p>
                </div>
            `;
        }
    }

    async seleccionarConversacionPorId(conversacionId) {
        try {
            const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
            const data = await response.json();
            
            if (response.ok && data.conversaciones) {
                const conversacion = data.conversaciones.find(c => c.conversacionId == conversacionId);
                if (conversacion && conversacion.compradorId === this.usuarioActual.usuarioId) {
                    await this.seleccionarConversacion(conversacion);
                    return;
                }
            }
        } catch (error) {
            console.error('Error al buscar conversación específica:', error);
        }
        
        ChatUtils.showNotification('No se pudo encontrar la conversación especificada', 'warning');
    }

    // Métodos de utilidad para contexto específico
    getContainer(selector) {
        const compradorContainer = document.querySelector('[data-tab-content="comprador"]');
        return compradorContainer?.querySelector(`#${selector}`) || compradorContainer?.querySelector(selector);
    }

    getElement(id) {
        const compradorContainer = document.querySelector('[data-tab-content="comprador"]');
        return compradorContainer?.querySelector(`#${id}`);
    }

    cleanup() {
        this.stopLongPolling();
    }
}

// Manager específico para vendedor (similar al de comprador pero adaptado)
class VendedorMessagesManager {
    constructor(usuario, contexto) {
        this.usuarioActual = usuario;
        this.contexto = contexto;
        this.anuncioActual = null;
        this.conversacionActual = null;
        this.ultimoMensajeId = 0;
        this.longPollController = null;
        this.isPolling = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async initialize() {
        await this.loadAnunciosConMensajes();
        this.setupEventListeners();
    }

    async loadAnunciosConMensajes() {
        if (!this.usuarioActual?.usuarioId) {
            console.error('No hay usuario logueado');
            return;
        }

        try {
            const response = await fetch(`/api/anuncios/vendedor/${this.usuarioActual.usuarioId}`);
            const anuncios = await response.json();

            if (response.ok && anuncios.length > 0) {
                const anunciosConMensajes = anuncios.filter(anuncio => anuncio.total_conversaciones > 0);
                
                if (anunciosConMensajes.length > 0) {
                    this.renderAnuncios(anunciosConMensajes);
                    this.seleccionarAnuncio(anunciosConMensajes[0]);
                } else {
                    this.mostrarMensajeVacioAnuncios();
                }
            } else {
                this.mostrarMensajeVacioAnuncios();
            }
        } catch (error) {
            console.error('Error al cargar anuncios:', error);
            ChatUtils.showNotification('Error al cargar los anuncios', 'error');
        }
    }    renderAnuncios(anuncios) {
        const container = this.getContainer('products-list-container-vendedor');
        if (!container) return;

        container.innerHTML = '';

        anuncios.forEach(anuncio => {
            const anuncioElement = this.createAnuncioElement(anuncio);
            container.appendChild(anuncioElement);
        });
    }

    createAnuncioElement(anuncio) {
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

        return div;
    }

    async seleccionarAnuncio(anuncio) {
        this.stopLongPolling();
        this.anuncioActual = anuncio;
        this.conversacionActual = null;
        this.updateActiveAnuncio(anuncio);
        await this.loadConversacionesAnuncio(anuncio.anuncioId);
        
        const productViewSwitch = this.getElement('product-view-switch');
        if (productViewSwitch) {
            productViewSwitch.checked = true;
        }
    }

    updateActiveAnuncio(anuncio) {
        const vendedorContainer = document.querySelector('[data-tab-content="vendedor"]');
        if (!vendedorContainer) return;

        vendedorContainer.querySelectorAll('.product-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = vendedorContainer.querySelector(`[data-product-id="${anuncio.anuncioId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        const conversationsTitle = vendedorContainer.querySelector('.conversations-title h2');
        if (conversationsTitle) {
            conversationsTitle.textContent = anuncio.titulo.length > 20 
                ? anuncio.titulo.substring(0, 20) + '...' 
                : anuncio.titulo;
        }
    }    async loadConversacionesAnuncio(anuncioId) {
        try {
            const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
            const data = await response.json();

            if (response.ok && data.conversaciones) {
                const conversacionesAnuncio = data.conversaciones.filter(conv => 
                    conv.anuncioId == anuncioId && conv.vendedorId === this.usuarioActual.usuarioId
                );
                
                if (conversacionesAnuncio.length > 0) {
                    this.renderConversaciones(conversacionesAnuncio);
                    this.seleccionarConversacion(conversacionesAnuncio[0]);
                } else {
                    this.mostrarMensajeVacioConversaciones();
                }
            } else {
                this.mostrarMensajeVacioConversaciones();
            }
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            ChatUtils.showNotification('Error al cargar las conversaciones', 'error');
        }
    }

    renderConversaciones(conversaciones) {
        const container = this.getContainer('conversations-list-container-vendedor');
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
                    <span class="timestamp">${ChatUtils.formatearFecha(conversacion.fecha_ultimo_mensaje)}</span>
                </div>
            </div>
        `;

        div.addEventListener('click', () => {
            this.seleccionarConversacion(conversacion);
        });

        return div;
    }

    async seleccionarConversacion(conversacion) {
        this.stopLongPolling();
        this.conversacionActual = conversacion;
        this.updateActiveConversacion(conversacion);
        await this.cargarMensajes(conversacion.conversacionId);
        this.startLongPolling();

        const conversationsViewSwitch = this.getElement('conversations-view-switch');
        if (conversationsViewSwitch) {
            conversationsViewSwitch.checked = true;
        }
    }

    updateActiveConversacion(conversacion) {
        const vendedorContainer = document.querySelector('[data-tab-content="vendedor"]');
        if (!vendedorContainer) return;

        vendedorContainer.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = vendedorContainer.querySelector(`[data-conversation-id="${conversacion.conversacionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        const headerUsername = vendedorContainer.querySelector('.chat-header-username');
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
    }    renderMensajes(mensajes) {
        const container = this.getContainer('chat-messages-container-vendedor');
        if (!container) return;

        container.innerHTML = '';

        mensajes.forEach(mensaje => {
            const mensajeElement = this.createMensajeElement(mensaje);
            container.appendChild(mensajeElement);
        });

        ChatUtils.scrollToBottom(container, false);
    }

    createMensajeElement(mensaje) {
        const div = document.createElement('div');
        const esMio = mensaje.emisorId === this.usuarioActual.usuarioId;
        
        div.className = `message ${esMio ? 'sent' : 'received'}`;
        div.dataset.messageId = mensaje.mensajeId;

        div.innerHTML = `
            <div class="message-content">
                <span class="message-text">${ChatUtils.escapeHtml(mensaje.contenido)}</span>
            </div>
            <div class="message-meta">
                <div class="timestamp">${ChatUtils.formatearFecha(mensaje.fecha_envio)}</div>
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
                    headers: { 'Cache-Control': 'no-cache' }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.hasNewMessages && data.mensajes) {
                    this.procesarNuevosMensajes(data.mensajes);
                    this.reconnectAttempts = 0;
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error en long polling:', error);
                this.reconnectAttempts++;
                
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
                    setTimeout(() => this.longPoll(), delay);
                    return;
                }
            }
        }

        if (this.isPolling) {
            setTimeout(() => this.longPoll(), 1000);
        }
    }

    procesarNuevosMensajes(mensajes) {
        const container = this.getContainer('chat-messages-container');
        if (!container) return;

        mensajes.forEach(mensaje => {
            const mensajeElement = this.createMensajeElement(mensaje);
            ChatUtils.addMessageAnimation(mensajeElement);
            container.appendChild(mensajeElement);
            
            if (mensaje.mensajeId > this.ultimoMensajeId) {
                this.ultimoMensajeId = mensaje.mensajeId;
            }
        });

        ChatUtils.scrollToBottom(container);
        this.updateConversacionEnLista(mensajes[mensajes.length - 1]);
    }

    updateConversacionEnLista(ultimoMensaje) {
        const conversacionItem = this.getContainer(`[data-conversation-id="${this.conversacionActual.conversacionId}"]`);
        if (!conversacionItem) return;

        const lastMessageElement = conversacionItem.querySelector('.last-message');
        const timestampElement = conversacionItem.querySelector('.timestamp');
        
        if (lastMessageElement) {
            lastMessageElement.textContent = ultimoMensaje.contenido;
        }
        
        if (timestampElement) {
            timestampElement.textContent = ChatUtils.formatearFecha(ultimoMensaje.fecha_envio);
        }
    }

    stopLongPolling() {
        this.isPolling = false;
        if (this.longPollController) {
            this.longPollController.abort();
            this.longPollController = null;
        }
    }

    async enviarMensaje(contenido) {
        if (!this.conversacionActual) return false;

        const validation = ChatUtils.validateMessageContent(contenido);
        if (!validation.valid) {
            ChatUtils.showNotification(validation.error, 'warning');
            return false;
        }

        try {
            const response = await fetch('/api/chat/mensajes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversacionId: this.conversacionActual.conversacionId,
                    emisorId: this.usuarioActual.usuarioId,
                    contenido: validation.content
                })
            });

            const result = await response.json();

            if (response.ok) {
                return true;
            } else {
                console.error('Error al enviar mensaje:', result.message);
                ChatUtils.showNotification('Error al enviar el mensaje', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            ChatUtils.showNotification('Error de conexión al enviar mensaje', 'error');
            return false;
        }
    }

    setupEventListeners() {
        const sendButton = this.getElement('send-button');
        const messageInput = this.getElement('message-input');

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
            });

            ChatUtils.setupAutoResizeTextarea(messageInput);
        }
    }

    mostrarMensajeVacioAnuncios() {
        const container = this.getContainer('products-list-container');
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
        const container = this.getContainer('conversations-list-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>No hay conversaciones</h3>
                    <p>No hay mensajes para este producto.</p>
                </div>
            `;
        }
    }

    // Métodos de utilidad para contexto específico
    getContainer(selector) {
        const vendedorContainer = document.querySelector('[data-tab-content="vendedor"]');
        return vendedorContainer?.querySelector(`#${selector}`) || vendedorContainer?.querySelector(selector);
    }

    getElement(id) {
        const vendedorContainer = document.querySelector('[data-tab-content="vendedor"]');
        return vendedorContainer?.querySelector(`#${id}`);
    }

    cleanup() {
        this.stopLongPolling();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.mensajesUnificadosManager = new MensajesUnificadosManager();
    
    // Cleanup al cerrar la página
    window.addEventListener('beforeunload', () => {
        if (window.mensajesUnificadosManager) {
            window.mensajesUnificadosManager.destroy();
        }
    });
});
