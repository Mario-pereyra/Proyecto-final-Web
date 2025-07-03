// public/js/chat.js - Versión ULTRA MÍNIMA con manejo de errores

class Chat {
    constructor() {
        try {
            const userSession = localStorage.getItem('userSession');
            if (!userSession) {
                console.error('❌ No hay sesión de usuario');
                return;
            }
            
            this.user = JSON.parse(userSession).usuarioId;
            if (!this.user) {
                console.error('❌ No se encontró usuarioId');
                return;
            }
            
            console.log('✅ Usuario cargado:', this.user);
            this.active = null;
            this.lastMessageId = 0; // ✅ Agregar tracking del último mensaje
            this.pollingActive = false; // ✅ Controlar polling
            this.load();
        } catch (error) {
            console.error('❌ Error en constructor:', error);
        }
    }

    async load() {
        try {
            console.log('🔄 Cargando conversaciones para usuario:', this.user);
            const res = await fetch(`/api/chat/conversaciones/usuario/${this.user}`);
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const data = await res.json();
            console.log('📦 Datos recibidos:', data);
            
            const conversaciones = data.conversaciones || [];
            console.log('💬 Conversaciones:', conversaciones.length);
              if (conversaciones.length === 0) {
                document.getElementById('conversations-list-container').innerHTML = 
                    '<div style="padding: 20px; text-align: center; color: #666;">No hay conversaciones disponibles</div>';
                return;
            }
            
            // Filtrar solo conversaciones donde Mario es comprador
            const conversacionesComprador = conversaciones.filter(c => c.compradorId == this.user);
            console.log('🛒 Conversaciones como comprador:', conversacionesComprador.length);
            
            if (conversacionesComprador.length === 0) {
                document.getElementById('conversations-list-container').innerHTML = 
                    '<div style="padding: 20px; text-align: center; color: #666;">No hay conversaciones como comprador</div>';
                return;
            }
            
            document.getElementById('conversations-list-container').innerHTML = conversacionesComprador.map(c => 
                `<div class="conversation-item" onclick="chat.select(${c.conversacionId})" data-conversation-id="${c.conversacionId}">
                    <div class="user-info">
                        <div class="profile-pic-container">
                            <img src="../recursos/img/npc.jpg" class="profile-pic">
                        </div>
                        <div class="user-details">
                            <span class="user-name">${c.vendedorNombre || 'Vendedor'}</span>
                            <span class="user-role">Vendedor</span>
                        </div>
                    </div>
                    <div class="product-info">
                        <img src="../${c.anuncioImagen || 'recursos/img/MacBook_Pro_16.webp'}" class="product-thumbnail">
                        <div class="product-details">
                            <span class="product-name">${c.anuncioTitulo || 'Producto'}</span>
                            <span class="last-message">${c.ultimoMensaje || 'Sin mensajes'}</span>
                        </div>
                    </div>
                    <div class="message-details">
                        <div class="meta-info">
                            <span class="timestamp">${new Date(c.fecha_ultimo_mensaje).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>`
            ).join('');
            
            console.log('✅ Conversaciones renderizadas');
            
        } catch (error) {
            console.error('❌ Error cargando conversaciones:', error);
            document.getElementById('conversations-list-container').innerHTML = 
                `<div style="padding: 20px; text-align: center; color: red;">Error: ${error.message}</div>`;
        }
    }    async select(id) {
        try {
            console.log('🎯 Seleccionando conversación:', id);
            this.active = id;
            
            // Marcar conversación como activa
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-conversation-id="${id}"]`)?.classList.add('active');
            
            // Mostrar indicador de carga
            document.getElementById('chat-messages-container').innerHTML = 
                '<div style="padding: 20px; text-align: center; color: #666;">Cargando mensajes...</div>';
            
            const res = await fetch(`/api/chat/conversacion/${id}/mensajes`);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const mensajes = await res.json();
            console.log('📨 Mensajes cargados:', mensajes.length);
            console.log('📋 Estructura de mensajes:', mensajes[0] || 'No hay mensajes');
            
            if (mensajes.length === 0) {
                document.getElementById('chat-messages-container').innerHTML = 
                    '<div style="padding: 20px; text-align: center; color: #666;">No hay mensajes en esta conversación</div>';
                return;
            }
            
            // Generar HTML de mensajes
            const messagesHtml = mensajes.map(m => {
                const isFromUser = m.emisorId == this.user;
                const messageClass = isFromUser ? 'sent' : 'received';
                const timestamp = new Date(m.fecha_envio).toLocaleTimeString();
                
                return `<div class="message ${messageClass}">
                    <div class="message-content">
                        <span class="message-text">${m.contenido || ''}</span>
                    </div>
                    <div class="message-meta">
                        <div class="timestamp">${timestamp}</div>
                    </div>
                </div>`;
            }).join('');
              document.getElementById('chat-messages-container').innerHTML = messagesHtml;
            
            // ✅ Rastrear el último mensaje ID
            if (mensajes.length > 0) {
                this.lastMessageId = Math.max(...mensajes.map(m => m.mensajeId));
                console.log('📌 Último mensaje ID:', this.lastMessageId);
            }
            
            // Scroll al final
            const container = document.getElementById('chat-messages-container');
            container.scrollTop = container.scrollHeight;
            
            console.log('✅ Mensajes renderizados correctamente');
            
            // Iniciar polling (solo una vez)
            if (!this.pollingActive) {
                this.pollingActive = true;
                setInterval(() => this.poll(), 3000);
            }
            
        } catch (error) {
            console.error('❌ Error seleccionando conversación:', error);
            document.getElementById('chat-messages-container').innerHTML = 
                `<div style="padding: 20px; text-align: center; color: red;">
                    <strong>Error cargando mensajes:</strong><br>
                    ${error.message}<br>
                    <small>Ver consola para más detalles</small>
                </div>`;
        }
    }

    async send() {
        try {
            const input = document.getElementById('message-input');
            const content = input.value.trim();
            
            if (!content) {
                console.log('⚠️ Mensaje vacío');
                return;
            }
            
            if (!this.active) {
                console.log('⚠️ No hay conversación activa');
                return;
            }
            
            console.log('📤 Enviando mensaje:', content);
            
            const res = await fetch('/api/chat/mensajes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversacionId: this.active,
                    emisorId: this.user,
                    contenido: content
                })
            });
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
              const data = await res.json();
            console.log('✅ Mensaje enviado:', data);
            
            // ✅ Actualizar último mensaje ID si lo devuelve la API
            if (data.mensajeId) {
                this.lastMessageId = Math.max(this.lastMessageId, data.mensajeId);
                console.log('📌 Último mensaje ID actualizado:', this.lastMessageId);
            }
            
            document.getElementById('chat-messages-container').innerHTML += 
                `<div class="message sent">
                    <div class="message-content">
                        <span class="message-text">${content}</span>
                    </div>
                    <div class="message-meta">
                        <div class="timestamp">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>`;
            
            input.value = '';
            
            // Scroll al final
            document.getElementById('chat-messages-container').scrollTop = 
                document.getElementById('chat-messages-container').scrollHeight;
                
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            alert('Error enviando mensaje: ' + error.message);
        }
    }    async poll() {
        try {
            if (!this.active) return;
            
            console.log('🔄 Polling - Conversación:', this.active, 'Último mensaje ID:', this.lastMessageId);
            
            const res = await fetch(`/api/chat/conversacion/${this.active}/poll?usuarioId=${this.user}&lastMessageId=${this.lastMessageId}`);
            
            if (res.ok && res.status === 200) {
                const data = await res.json();
                
                // ✅ Verificar si realmente hay mensajes nuevos
                if (data.mensajes && data.mensajes.length > 0) {
                    console.log('📨 Nuevos mensajes encontrados:', data.mensajes.length);
                    
                    data.mensajes.forEach(m => {
                        // ✅ Solo agregar si es realmente nuevo
                        if (m.mensajeId > this.lastMessageId) {
                            console.log('➕ Agregando mensaje nuevo:', m.mensajeId);
                            
                            const isFromUser = m.emisorId == this.user;
                            const messageClass = isFromUser ? 'sent' : 'received';
                            const timestamp = new Date(m.fecha_envio).toLocaleTimeString();
                            
                            const messageHtml = `<div class="message ${messageClass}">
                                <div class="message-content">
                                    <span class="message-text">${m.contenido}</span>
                                </div>
                                <div class="message-meta">
                                    <div class="timestamp">${timestamp}</div>
                                </div>
                            </div>`;
                            
                            document.getElementById('chat-messages-container').innerHTML += messageHtml;
                            
                            // ✅ Actualizar último mensaje ID
                            this.lastMessageId = Math.max(this.lastMessageId, m.mensajeId);
                        } else {
                            console.log('⏭️ Mensaje ya existe, omitiendo:', m.mensajeId);
                        }
                    });
                    
                    // Scroll al final solo si agregamos mensajes
                    const container = document.getElementById('chat-messages-container');
                    container.scrollTop = container.scrollHeight;
                } else {
                    console.log('📭 No hay mensajes nuevos');
                }
            }
        } catch (error) {
            console.error('❌ Error en polling:', error);
        }
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando chat...');
    
    // Verificar elementos necesarios
    const elements = [
        'conversations-list-container',
        'chat-messages-container', 
        'message-input',
        'send-button'
    ];
    
    for (const id of elements) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`❌ Elemento no encontrado: ${id}`);
            return;
        }
    }
    
    console.log('✅ Todos los elementos encontrados');
    
    window.chat = new Chat();
    
    // Configurar evento del botón enviar
    document.getElementById('send-button').addEventListener('click', () => {
        console.log('🖱️ Click en botón enviar');
        chat.send();
    });
    
    // Configurar evento Enter en el textarea
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log('⌨️ Enter presionado');
            chat.send();
        }
    });
    
    console.log('✅ Chat inicializado correctamente');
});
