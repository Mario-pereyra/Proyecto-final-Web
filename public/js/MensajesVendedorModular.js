// public/js/MensajesVendedorModular.js

/**
 * Implementación modular para MensajesVendedor.html
 * Reemplaza mensajesVendedor.js con el nuevo sistema modular
 */

import { ChatController } from './controllers/ChatController.js';

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initMensajesVendedorModular();
});

/**
 * Función principal de inicialización
 */
function initMensajesVendedorModular() {
    // Crear controlador con configuración específica para vendedor
    const chatController = new ChatController({
        userRole: 'vendedor',
        elements: {
            conversationsList: document.querySelector('#conversations-list-container'),
            messagesContainer: document.querySelector('#messages-container'),
            messageInput: document.querySelector('#message-input'),
            sendButton: document.querySelector('#send-button'),
            searchInput: document.querySelector('#conversations-search'),
            connectionStatus: document.querySelector('#connection-status')
        },
        autoInit: true
    });

    // Configurar eventos personalizados
    setupCustomEvents(chatController);

    // Configurar comportamiento específico del vendedor
    setupVendedorSpecificBehavior(chatController);

    // Hacer disponible globalmente para debug
    window.chatController = chatController;

    console.log('Sistema modular de mensajes para vendedor inicializado');
}

/**
 * Configurar eventos personalizados
 */
function setupCustomEvents(chatController) {
    // Evento cuando se reciben nuevos mensajes
    chatController.service.on('message:received', (data) => {
        console.log('Nuevos mensajes recibidos:', data.messages);
        
        // Reproducir sonido de notificación
        playNotificationSound();
        
        // Mostrar notificación del navegador si la pestaña no está activa
        if (document.hidden) {
            showBrowserNotification(data.messages[0]);
        }
        
        // Actualizar contador de mensajes no leídos en el título
        updateUnreadCounter();
    });

    // Evento cuando cambia el estado de conexión
    chatController.service.on('connection:status', (data) => {
        console.log('Estado de conexión:', data.status);
        
        // Cambiar título de la página según el estado
        updatePageTitle(data.status);
        
        // Mostrar indicador visual de conexión
        showConnectionIndicator(data.status);
    });

    // Evento cuando hay errores
    chatController.service.on('error', (data) => {
        console.error('Error en el servicio:', data);
        
        // Mostrar mensaje de error personalizado para vendedor
        showVendedorErrorMessage(data.message, data.type);
    });

    // Evento cuando cambia la conversación
    chatController.service.on('conversation:changed', (data) => {
        console.log('Conversación cambiada:', data.conversationId);
        
        // Marcar mensajes como leídos
        markMessagesAsRead(data.conversationId);
    });
}

/**
 * Configurar comportamiento específico del vendedor
 */
function setupVendedorSpecificBehavior(chatController) {
    // Cargar estadísticas de ventas/mensajes
    loadVendedorStats(chatController);
    
    // Configurar respuestas rápidas
    setupQuickResponses(chatController);
    
    // Configurar filtros de conversaciones
    setupConversationFilters(chatController);
}

/**
 * Cargar estadísticas del vendedor
 */
async function loadVendedorStats(chatController) {
    try {
        const userId = chatController.currentUser?.usuarioId;
        if (!userId) return;
        
        // Aquí podrías cargar estadísticas específicas del vendedor
        // como número de consultas, productos más consultados, etc.
        
        console.log('Estadísticas del vendedor cargadas');
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Configurar respuestas rápidas
 */
function setupQuickResponses(chatController) {
    const quickResponses = [
        '¡Hola! Gracias por tu interés en el producto.',
        'El producto está disponible y en perfectas condiciones.',
        'Te puedo hacer un descuento si lo compras hoy.',
        'Tengo otros productos similares que te pueden interesar.',
        '¿Tienes alguna pregunta específica sobre el producto?'
    ];
    
    // Crear botones de respuesta rápida
    createQuickResponseButtons(quickResponses, chatController);
}

/**
 * Crear botones de respuesta rápida
 */
function createQuickResponseButtons(responses, chatController) {
    const quickResponseContainer = document.querySelector('#quick-responses');
    if (!quickResponseContainer) return;
    
    quickResponseContainer.innerHTML = responses.map(response => 
        `<button class="quick-response-btn" data-response="${response}">${response}</button>`
    ).join('');
    
    // Agregar event listeners
    quickResponseContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-response-btn')) {
            const response = e.target.dataset.response;
            chatController.sendMessage(response);
        }
    });
}

/**
 * Configurar filtros de conversaciones
 */
function setupConversationFilters(chatController) {
    const filterButtons = document.querySelectorAll('.conversation-filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            filterConversations(filter, chatController);
        });
    });
}

/**
 * Filtrar conversaciones por tipo
 */
function filterConversations(filter, chatController) {
    const state = chatController.getState();
    const conversations = state.serviceState?.conversations || [];
    
    let filteredConversations = conversations;
    
    switch (filter) {
        case 'unread':
            filteredConversations = conversations.filter(c => c.mensajesNoLeidos > 0);
            break;
        case 'recent':
            filteredConversations = conversations.filter(c => {
                const lastMessage = new Date(c.ultimoMensajeFecha);
                const now = new Date();
                return (now - lastMessage) < 24 * 60 * 60 * 1000; // Últimas 24 horas
            });
            break;
        case 'all':
        default:
            filteredConversations = conversations;
            break;
    }
    
    chatController.ui.filterConversations(filteredConversations, 'vendedor');
}

/**
 * Reproducir sonido de notificación
 */
function playNotificationSound() {
    try {
        const audio = new Audio('/sounds/vendedor-notification.mp3');
        audio.volume = 0.4;
        audio.play().catch(e => {
            console.log('No se pudo reproducir sonido de notificación:', e);
        });
    } catch (error) {
        console.log('Error al reproducir sonido:', error);
    }
}

/**
 * Mostrar notificación del navegador
 */
function showBrowserNotification(message) {
    if (Notification.permission === 'granted') {
        const notification = new Notification('Nueva consulta - AstroMarket', {
            body: `Consulta sobre: ${message.conversacionProducto || 'tu producto'}`,
            icon: '/favicon.ico',
            tag: 'vendedor-message'
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        setTimeout(() => {
            notification.close();
        }, 7000);
    }
}

/**
 * Actualizar título de la página según estado de conexión
 */
function updatePageTitle(status) {
    const baseTitle = 'Mensajes Vendedor - AstroMarket';
    const statusIndicators = {
        'connected': '🟢',
        'connecting': '🟡',
        'disconnected': '🔴',
        'error': '🟠',
        'failed': '🔴'
    };
    
    const indicator = statusIndicators[status] || '';
    document.title = `${indicator} ${baseTitle}`;
}

/**
 * Mostrar indicador visual de conexión
 */
function showConnectionIndicator(status) {
    const indicator = document.querySelector('#connection-indicator');
    if (!indicator) return;
    
    const statusClasses = {
        'connected': 'connected',
        'connecting': 'connecting',
        'disconnected': 'disconnected',
        'error': 'error',
        'failed': 'failed'
    };
    
    indicator.className = `connection-indicator ${statusClasses[status]}`;
}

/**
 * Actualizar contador de mensajes no leídos
 */
function updateUnreadCounter() {
    if (!window.chatController) return;
    
    const state = window.chatController.getState();
    const conversations = state.serviceState?.conversations || [];
    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.mensajesNoLeidos || 0), 0);
    
    // Actualizar contador en el título
    if (totalUnread > 0) {
        document.title = `(${totalUnread}) Mensajes Vendedor - AstroMarket`;
    }
    
    // Actualizar contador visual
    const counter = document.querySelector('#unread-counter');
    if (counter) {
        counter.textContent = totalUnread;
        counter.style.display = totalUnread > 0 ? 'inline' : 'none';
    }
}

/**
 * Mostrar mensaje de error personalizado para vendedor
 */
function showVendedorErrorMessage(message, type) {
    const errorMessages = {
        'load_conversations': 'Error al cargar consultas de tus productos. Por favor, recarga la página.',
        'load_messages': 'Error al cargar mensajes. Intenta seleccionar otra consulta.',
        'send_message': 'Error al enviar respuesta. Verifica tu conexión.',
        'start_conversation': 'Error al iniciar conversación. Intenta nuevamente.'
    };
    
    const userMessage = errorMessages[type] || message;
    
    // Mostrar notificación
    if (window.chatController && window.chatController.ui) {
        window.chatController.ui.showNotification('error', userMessage, 6000);
    }
}

/**
 * Marcar mensajes como leídos
 */
async function markMessagesAsRead(conversationId) {
    try {
        // Aquí podrías implementar la lógica para marcar mensajes como leídos
        console.log('Mensajes marcados como leídos para conversación:', conversationId);
    } catch (error) {
        console.error('Error al marcar mensajes como leídos:', error);
    }
}

/**
 * Solicitar permiso para notificaciones
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Permiso de notificación:', permission);
        });
    }
}

// Solicitar permiso para notificaciones cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    requestNotificationPermission();
});

// Funciones globales para compatibilidad (si es necesario)
window.chatVendedorModular = {
    // Función para responder rápidamente
    sendQuickResponse: async (response) => {
        if (window.chatController) {
            try {
                await window.chatController.sendMessage(response);
                return true;
            } catch (error) {
                console.error('Error al enviar respuesta rápida:', error);
                return false;
            }
        }
        return false;
    },
    
    // Función para obtener estadísticas
    getStats: () => {
        if (window.chatController) {
            const state = window.chatController.getState();
            const conversations = state.serviceState?.conversations || [];
            
            return {
                totalConversations: conversations.length,
                unreadConversations: conversations.filter(c => c.mensajesNoLeidos > 0).length,
                totalUnreadMessages: conversations.reduce((sum, conv) => sum + (conv.mensajesNoLeidos || 0), 0)
            };
        }
        return null;
    },
    
    // Función para filtrar conversaciones
    filterConversations: (filter) => {
        if (window.chatController) {
            filterConversations(filter, window.chatController);
        }
    }
};

export { initMensajesVendedorModular };
