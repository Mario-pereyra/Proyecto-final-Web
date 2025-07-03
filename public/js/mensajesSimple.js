// Sistema de mensajes simple con long polling
class MensajesSimple {
    constructor() {
        this.usuarioActual = null;
        this.conversacionActual = null;
        this.ultimoMensajeId = 0;
        this.polling = false;
        this.tipoVista = 'comprador'; // 'comprador' o 'vendedor'
        this.esPaginaUnificada = false;
        
        this.init();
    }

    init() {
        this.cargarUsuario();
        this.detectarTipoVista();
        this.setupTabs();
        this.cargarConversaciones();
        this.setupEventListeners();
    }    cargarUsuario() {
        // Verificar diferentes posibles claves en localStorage
        let userSession = localStorage.getItem('userSession');
        
        // Si no existe, probar otras posibles claves
        if (!userSession) {
            userSession = localStorage.getItem('user');
            if (!userSession) {
                userSession = localStorage.getItem('usuario');
            }
        }
        
        console.log('Verificando sesión:', userSession); // Debug
        console.log('Todas las claves localStorage:', Object.keys(localStorage)); // Debug
        
        if (userSession) {
            try {
                this.usuarioActual = JSON.parse(userSession);
                console.log('Usuario cargado:', this.usuarioActual); // Debug
                
                // Verificar que tenga los datos necesarios
                if (this.usuarioActual && (this.usuarioActual.usuarioId || this.usuarioActual.id)) {
                    // Normalizar el ID si viene como 'id' en lugar de 'usuarioId'
                    if (!this.usuarioActual.usuarioId && this.usuarioActual.id) {
                        this.usuarioActual.usuarioId = this.usuarioActual.id;
                    }
                    console.log('Sesión válida encontrada para usuario:', this.usuarioActual.usuarioId);
                    return; // Todo correcto
                }
            } catch (error) {
                console.error('Error al parsear sesión:', error);
            }
        }
        
        console.warn('No hay sesión válida');
        alert('No se encontró sesión válida. Por favor, verifica que estés logueado correctamente.');
        // window.location.href = 'Login.html';
    }

    detectarTipoVista() {
        // Detectar si es página unificada con pestañas
        this.esPaginaUnificada = document.querySelector('.tabs-navigation') !== null;
        
        if (this.esPaginaUnificada) {
            this.tipoVista = 'comprador'; // Por defecto en unificada
        } else if (window.location.pathname.includes('Comprador')) {
            this.tipoVista = 'comprador';
        } else {
            this.tipoVista = 'vendedor';
        }
    }

    setupTabs() {
        if (!this.esPaginaUnificada) return;

        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const newTab = e.currentTarget.dataset.tab;
                this.switchTab(newTab);
            });
        });
    }

    switchTab(tabName) {
        if (this.tipoVista === tabName) return;

        // Parar polling anterior
        this.pararPolling();

        // Actualizar UI de pestañas
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tabContent === tabName);
        });

        // Cambiar tipo de vista
        this.tipoVista = tabName;
        this.conversacionActual = null;
        this.ultimoMensajeId = 0;

        // Cargar contenido de la nueva pestaña
        this.cargarConversaciones();
    }    async cargarConversaciones() {
        if (!this.usuarioActual || !this.usuarioActual.usuarioId) {
            console.error('No hay usuario válido para cargar conversaciones');
            return;
        }

        console.log(`Cargando conversaciones para usuario ${this.usuarioActual.usuarioId} como ${this.tipoVista}`);

        try {
            const response = await fetch(`/api/chat/conversaciones/usuario/${this.usuarioActual.usuarioId}`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Datos recibidos:', data);

            if (data.conversaciones && Array.isArray(data.conversaciones)) {
                if (this.tipoVista === 'comprador') {
                    const conversacionesComprador = data.conversaciones.filter(conv => 
                        conv.compradorId == this.usuarioActual.usuarioId
                    );
                    console.log('Conversaciones comprador:', conversacionesComprador.length);
                    this.mostrarConversaciones(conversacionesComprador);
                } else {
                    // Para vendedor, cargar anuncios primero
                    console.log('Cargando vista vendedor...');
                    this.cargarAnunciosVendedor();
                }
            } else {
                console.log('No hay conversaciones o formato inválido');
                this.mostrarConversaciones([]);
            }
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            // Mostrar mensaje de error en la interfaz
            const container = this.getContainer('conversations-list-container');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">⚠️</div>
                        <p>Error al cargar conversaciones</p>
                        <p>Por favor, recarga la página</p>
                    </div>
                `;
            }
        }
    }    async cargarAnunciosVendedor() {
        console.log(`Cargando anuncios para vendedor ${this.usuarioActual.usuarioId}`);
        
        try {
            const response = await fetch(`/api/anuncios/vendedor/${this.usuarioActual.usuarioId}`);
            console.log('Response anuncios status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const anuncios = await response.json();
            console.log('Anuncios recibidos:', anuncios);

            if (response.ok && Array.isArray(anuncios)) {
                const anunciosConMensajes = anuncios.filter(anuncio => anuncio.total_conversaciones > 0);
                console.log('Anuncios con mensajes:', anunciosConMensajes.length);
                
                if (anunciosConMensajes.length > 0) {
                    this.mostrarAnuncios(anunciosConMensajes);
                } else {
                    this.mostrarAnunciosVacio();
                }
            } else {
                this.mostrarAnunciosVacio();
            }
        } catch (error) {
            console.error('Error al cargar anuncios:', error);
            this.mostrarAnunciosVacio();
        }
    }

    mostrarAnunciosVacio() {
        const container = this.getContainer('products-list-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <p>No tienes mensajes</p>
                    <p>Cuando alguien esté interesado en tus productos, los mensajes aparecerán aquí.</p>
                </div>
            `;
        }
    }    mostrarConversaciones(conversaciones) {
        const container = this.getContainer('conversations-list-container');
        if (!container) {
            console.error('No se encontró el contenedor de conversaciones');
            return;
        }

        // IMPORTANTE: Limpiar todo el contenido estático primero
        container.innerHTML = '';

        if (conversaciones.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <p>No tienes conversaciones</p>
                    <p>Cuando inicies una conversación con un vendedor, aparecerá aquí.</p>
                </div>
            `;
            return;
        }

        console.log('Mostrando conversaciones:', conversaciones.length);

        conversaciones.forEach(conv => {
            const div = document.createElement('div');
            div.className = 'conversation-item';
            div.dataset.conversationId = conv.conversacionId;
            
            // Determinar el nombre de la otra persona según el tipo de vista
            let nombreOtraPersona;
            let rolOtraPersona;
            
            if (this.tipoVista === 'comprador') {
                // Si soy comprador, mostrar el nombre del vendedor
                nombreOtraPersona = conv.vendedorNombre || 'Vendedor';
                rolOtraPersona = 'Vendedor';
            } else {
                // Si soy vendedor, mostrar el nombre del comprador
                nombreOtraPersona = conv.compradorNombre || 'Comprador';
                rolOtraPersona = 'Comprador';
            }
            
            div.innerHTML = `
                <div class="user-info">
                    <div class="profile-pic-container">
                        <img src="../recursos/img/npc.jpg" alt="Avatar" class="profile-pic">
                    </div>
                    <div class="user-details">
                        <span class="user-name">${nombreOtraPersona}</span>
                        <span class="user-role">${rolOtraPersona}</span>
                    </div>
                </div>                ${this.tipoVista === 'comprador' ? `                    <div class="product-info">
                        <img src="${this.getImageUrl(conv.anuncioImagen)}" 
                             alt="Producto" class="product-thumbnail"
                             onerror="this.src='../recursos/imagenes/placeholder.svg'">
                        <div class="product-details">
                            <span class="product-name">${conv.anuncioTitulo || 'Producto'}</span>
                        </div>
                    </div>
                ` : ''}
                <div class="message-details">
                    <p class="last-message">${conv.ultimoMensaje || 'Sin mensajes'}</p>
                    <div class="meta-info">
                        <span class="timestamp">${this.formatearFecha(conv.fecha_ultimo_mensaje)}</span>
                        ${conv.mensajes_no_leidos > 0 ? `<span class="new-badge">${conv.mensajes_no_leidos}</span>` : ''}
                    </div>
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
            div.dataset.productId = anuncio.anuncioId;            div.innerHTML = `
                <div class="product-main-info">
                    <img src="${this.getImageUrl(anuncio.imagen_principal)}" 
                         alt="${anuncio.titulo}" class="product-image"
                         onerror="this.src='../recursos/imagenes/placeholder.svg'">
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
    }    mostrarConversacionesAnuncio(conversaciones) {
        const container = this.getContainer('conversations-list-container');
        if (!container) return;

        container.innerHTML = '';

        if (conversaciones.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <p>No hay conversaciones</p>
                    <p>No hay mensajes para este producto.</p>
                </div>
            `;
            return;
        }

        conversaciones.forEach(conv => {
            const div = document.createElement('div');
            div.className = 'conversation-item';
            div.dataset.conversationId = conv.conversacionId;
            
            // Para vendedor, siempre mostrar el nombre del comprador
            const nombreComprador = conv.compradorNombre || 'Comprador';
            
            div.innerHTML = `
                <div class="user-info">
                    <div class="profile-pic-container">
                        <img src="../recursos/img/npc.jpg" alt="Avatar" class="profile-pic">
                    </div>
                    <div class="user-details">
                        <span class="user-name">${nombreComprador}</span>
                        <span class="user-role">Comprador</span>
                    </div>
                </div>
                <div class="message-details">
                    <p class="last-message">${conv.ultimoMensaje || 'Sin mensajes'}</p>
                    <div class="meta-info">
                        <span class="timestamp">${this.formatearFecha(conv.fecha_ultimo_mensaje)}</span>
                        ${conv.mensajes_no_leidos > 0 ? `<span class="new-badge">${conv.mensajes_no_leidos}</span>` : ''}
                    </div>
                </div>
            `;
            
            div.addEventListener('click', () => this.seleccionarConversacion(conv));
            container.appendChild(div);
        });

        if (conversaciones.length > 0) {
            this.seleccionarConversacion(conversaciones[0]);
        }
    }    async seleccionarConversacion(conversacion) {
        this.pararPolling();
        this.conversacionActual = conversacion;
        
        // Actualizar UI - marcar conversación activa
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-conversation-id="${conversacion.conversacionId}"]`)?.classList.add('active');
        
        // Actualizar header del chat con el nombre correcto
        this.actualizarHeaderChat(conversacion);
        
        // Cargar mensajes
        await this.cargarMensajes();
        this.iniciarPolling();
    }

    actualizarHeaderChat(conversacion) {
        // Determinar qué nombre mostrar en el header
        let nombreOtraPersona;
        let rolOtraPersona;
        
        if (this.tipoVista === 'comprador') {
            nombreOtraPersona = conversacion.vendedorNombre || 'Vendedor';
            rolOtraPersona = 'Vendedor';
        } else {
            nombreOtraPersona = conversacion.compradorNombre || 'Comprador';
            rolOtraPersona = 'Comprador';
        }

        // Actualizar elementos del header si existen
        const headerName = this.getElement('chat-header-name') || 
                          document.querySelector('.vendor-name') || 
                          document.querySelector('.chat-header-username');
        
        if (headerName) {
            headerName.textContent = nombreOtraPersona;
        }

        const headerStatus = this.getElement('chat-header-status') || 
                            document.querySelector('.vendor-status');
        
        if (headerStatus) {
            headerStatus.textContent = 'En línea';
        }        // Actualizar imagen de producto si existe (para vista comprador)
        if (this.tipoVista === 'comprador') {
            const productImg = this.getElement('chat-header-product-img') || 
                              document.querySelector('.product-context-image');
            const productName = this.getElement('chat-header-product-name') || 
                               document.querySelector('.product-context-name');
              if (productImg && conversacion.anuncioImagen) {
                productImg.src = this.getImageUrl(conversacion.anuncioImagen);
                productImg.onerror = function() {
                    this.src = '../recursos/img/placeholder.jpg';
                };
            }
            
            if (productName && conversacion.anuncioTitulo) {
                productName.textContent = conversacion.anuncioTitulo;
            }
        }
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
    }    // Utilidades
    getImageUrl(imagePath) {
        console.log('🖼️ getImageUrl recibió:', imagePath); // Debug
        
        if (!imagePath) {
            console.log('🖼️ Sin imagePath, usando placeholder');
            return '../recursos/imagenes/placeholder.svg';
        }
        
        // Si ya tiene protocolo (http/https), usarla tal como está
        if (imagePath.startsWith('http')) {
            console.log('🖼️ URL completa, usando tal como está');
            return imagePath;
        }
        
        // Si ya empieza con /uploads/, convertir a ruta relativa correcta
        if (imagePath.startsWith('/uploads/')) {
            const resultado = '..' + imagePath;
            console.log('🖼️ Convirtiendo /uploads/ a:', resultado);
            return resultado;
        }
        
        // Si empieza con uploads/ (sin barra inicial), agregar ../
        if (imagePath.startsWith('uploads/')) {
            const resultado = '../' + imagePath;
            console.log('🖼️ Convirtiendo uploads/ a:', resultado);
            return resultado;
        }
        
        // Si solo es el nombre del archivo, agregar ../uploads/
        const resultado = '../uploads/' + imagePath;
        console.log('🖼️ Agregando ruta completa:', resultado);
        return resultado;
    }

    getContainer(selector) {
        if (this.esPaginaUnificada) {
            // En página unificada, buscar dentro del tab-content activo
            const activeTab = document.querySelector(`[data-tab-content="${this.tipoVista}"]`);
            if (activeTab) {
                // Buscar con sufijo específico primero
                let element = activeTab.querySelector(`#${selector}-${this.tipoVista}`);
                if (element) return element;
                
                // Buscar sin sufijo
                element = activeTab.querySelector(`#${selector}`);
                if (element) return element;
                
                // Buscar por clase
                element = activeTab.querySelector(`.${selector}`);
                return element;
            }
        }
        
        // Para páginas individuales
        // Buscar con sufijo específico primero
        const conSufijo = document.querySelector(`#${selector}-${this.tipoVista}`);
        if (conSufijo) return conSufijo;
        
        // Buscar sin sufijo como fallback
        return document.querySelector(`#${selector}`) || document.querySelector(`.${selector}`);
    }

    getElement(selector) {
        if (this.esPaginaUnificada) {
            const activeTab = document.querySelector(`[data-tab-content="${this.tipoVista}"]`);
            if (activeTab) {
                let element = activeTab.querySelector(`#${selector}-${this.tipoVista}`);
                if (element) return element;
                
                element = activeTab.querySelector(`#${selector}`);
                return element;
            }
        }
        
        // Para páginas individuales
        const conSufijo = document.querySelector(`#${selector}-${this.tipoVista}`);
        if (conSufijo) return conSufijo;
        
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
