// Gestión del Panel del Vendedor - Mis Anuncios
class PanelVendedorManager {
    constructor() {
        this.usuario = null;
        this.anuncios = [];
        this.anunciosFiltrados = [];
        this.filtros = {
            busqueda: '',
            estado: 'all',
            orden: 'date-desc'
        };
        this.init();
    }

    init() {
        this.loadUserInfo();
        this.setupEventListeners();
        this.checkUserAuth();
        
        if (this.usuario && this.usuario.usuarioId) {
            this.loadAnuncios();
        }
    }

    loadUserInfo() {
        try {
            const usuarioData = localStorage.getItem('usuario');
            if (usuarioData) {
                this.usuario = JSON.parse(usuarioData);
                console.log('Usuario vendedor:', this.usuario);
            } else {
                console.log('No hay usuario logueado');
                this.usuario = null;
            }
        } catch (error) {
            console.error('Error al cargar información del usuario:', error);
            this.usuario = null;
        }
    }

    checkUserAuth() {
        if (!this.usuario || !this.usuario.usuarioId) {
            this.showAuthMessage();
            return false;
        }
        return true;
    }

    showAuthMessage() {
        const container = document.getElementById('ads-container');
        if (container) {
            container.innerHTML = `
                <div class="auth-message" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-user-lock" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
                    <h3>Inicia sesión para ver tus anuncios</h3>
                    <p>Necesitas estar logueado para acceder al panel de vendedor</p>
                    <a href="Login.html" class="primary-button" style="margin-top: 20px; display: inline-block;">
                        <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                    </a>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Filtros y búsqueda
        const searchInput = document.getElementById('search-ads');
        const statusFilter = document.getElementById('status-filter');
        const sortSelect = document.getElementById('sort-ads');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filtros.busqueda = e.target.value;
                this.aplicarFiltros();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filtros.estado = e.target.value;
                this.aplicarFiltros();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.filtros.orden = e.target.value;
                this.aplicarFiltros();
            });
        }
    }

    async loadAnuncios() {
        try {
            this.showLoading();
            
            const response = await fetch(`/api/anuncios/vendedor/${this.usuario.usuarioId}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const anuncios = await response.json();
            console.log('Anuncios del vendedor:', anuncios);
            
            this.anuncios = anuncios;
            this.anunciosFiltrados = [...anuncios];
            this.aplicarFiltros();
            
        } catch (error) {
            console.error('Error al cargar anuncios:', error);
            this.showError('Error al cargar tus anuncios');
        }
    }

    aplicarFiltros() {
        let anunciosFiltrados = [...this.anuncios];

        // Filtrar por búsqueda
        if (this.filtros.busqueda.trim()) {
            const termino = this.filtros.busqueda.toLowerCase().trim();
            anunciosFiltrados = anunciosFiltrados.filter(anuncio => 
                anuncio.titulo.toLowerCase().includes(termino) ||
                anuncio.descripcion.toLowerCase().includes(termino) ||
                anuncio.categoriaNombre.toLowerCase().includes(termino)
            );
        }

        // Filtrar por estado
        if (this.filtros.estado !== 'all') {
            const estadoMap = {
                'active': 'activo',
                'inactive': 'inactivo',
                'sold': 'vendido'
            };
            const estadoBuscado = estadoMap[this.filtros.estado];
            anunciosFiltrados = anunciosFiltrados.filter(anuncio => 
                anuncio.estado_publicacion === estadoBuscado
            );
        }

        // Ordenar
        anunciosFiltrados.sort((a, b) => {
            switch (this.filtros.orden) {
                case 'date-desc':
                    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
                case 'date-asc':
                    return new Date(a.fecha_creacion) - new Date(b.fecha_creacion);
                case 'price-desc':
                    return parseFloat(b.precio) - parseFloat(a.precio);
                case 'price-asc':
                    return parseFloat(a.precio) - parseFloat(b.precio);
                case 'views-desc':
                    return parseInt(b.vistas) - parseInt(a.vistas);
                default:
                    return 0;
            }
        });

        this.anunciosFiltrados = anunciosFiltrados;
        this.renderAnuncios();
    }

    renderAnuncios() {
        const container = document.getElementById('ads-container');
        
        if (!container) {
            console.error('Contenedor de anuncios no encontrado');
            return;
        }

        if (this.anunciosFiltrados.length === 0) {
            container.innerHTML = this.renderNoResults();
            return;
        }

        const anunciosHTML = this.anunciosFiltrados.map(anuncio => 
            this.createAnuncioCard(anuncio)
        ).join('');        container.innerHTML = anunciosHTML;
        this.setupCardEvents();
    }

    createAnuncioCard(anuncio) {
        // Corregir la ruta de la imagen
        let rutaImagen = '/recursos/img/no-image.png';
        
        if (anuncio.imagen_principal) {
            if (anuncio.imagen_principal.startsWith('uploads/')) {
                rutaImagen = `/${anuncio.imagen_principal}`;
            } else if (anuncio.imagen_principal.startsWith('/uploads/')) {
                rutaImagen = anuncio.imagen_principal;
            } else {
                rutaImagen = `/uploads/${anuncio.imagen_principal}`;
            }
        }
        
        const precio = anuncio.precio ? `$${parseFloat(anuncio.precio).toFixed(2)}` : 'Precio no disponible';
        const fechaPublicacion = this.formatearFecha(anuncio.fecha_creacion);
        const estadoClass = this.getEstadoClass(anuncio.estado_publicacion);
        const estadoTexto = this.getEstadoTexto(anuncio.estado_publicacion);
        const ubicacion = this.formatearUbicacion(anuncio);
          return `
            <div class="ad-card" data-anuncio-id="${anuncio.anuncioId}" data-status="${anuncio.estado_publicacion}">
                <div class="ad-image-wrapper-container">
                    <div class="ad-image-wrapper">
                        <img src="${rutaImagen}" alt="${anuncio.titulo}" class="ad-image" 
                             onerror="this.src='/recursos/img/no-image.png'; console.log('Error loading image: ${rutaImagen}');"
                             onload="console.log('Image loaded successfully: ${rutaImagen}');">
                    </div>
                </div>
                <div class="ad-content">
                    <h3 class="ad-title">${anuncio.titulo}</h3>
                    <p class="ad-price">${precio}</p>
                    <div class="ad-tags">
                        <span class="ad-category">${anuncio.categoriaNombre || 'Sin categoría'}</span>
                        <span class="ad-condition">${anuncio.estado || 'Sin estado'}</span>
                        <span class="ad-status ${estadoClass}">${estadoTexto}</span>
                    </div>
                    <div class="ad-stats">
                        <div class="ad-stat-item">
                            <b>Publicado:</b> <span class="stat-value">${fechaPublicacion}</span>
                        </div>
                        <div class="ad-stat-item">
                            <b>Vistas:</b> <span class="stat-value">${anuncio.vistas || 0}</span>
                        </div>
                        <div class="ad-stat-item">
                            <b>Conversaciones:</b> <span class="stat-value">${anuncio.total_conversaciones || 0}</span>
                        </div>
                        ${anuncio.mensajes_no_leidos > 0 ? `
                        <div class="ad-stat-item unread-messages">
                            <b>Mensajes sin leer:</b> <span class="stat-value">${anuncio.mensajes_no_leidos}</span>
                        </div>
                        ` : ''}
                        <div class="ad-stat-item">
                            <b>Ubicación:</b> <span class="stat-value">${ubicacion}</span>
                        </div>
                    </div>
                    <div class="ad-visibility">
                        <label class="visibility-label">
                            <input type="checkbox" class="visibility-checkbox" 
                                   ${anuncio.estado_publicacion === 'activo' ? 'checked' : ''} 
                                   data-action="toggle-visibility" 
                                   data-anuncio-id="${anuncio.anuncioId}">
                            <span>Anuncio visible</span>
                        </label>
                    </div>
                </div>
                <div class="ad-actions">
                    <button class="secundary-button action-btn edit-btn" data-anuncio-id="${anuncio.anuncioId}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="secundary-button action-btn delete-btn" data-anuncio-id="${anuncio.anuncioId}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button class="secundary-button action-btn messages-btn" data-anuncio-id="${anuncio.anuncioId}">
                        <i class="fas fa-comments"></i> Mensajes
                    </button>
                    <button class="secundary-button action-btn view-btn" data-anuncio-id="${anuncio.anuncioId}">
                        <i class="fas fa-eye"></i> Ver Anuncio
                    </button>
                </div>
            </div>
        `;
    }

    setupCardEvents() {
        // Event listeners para los botones de acción
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const anuncioId = e.target.closest('.edit-btn').dataset.anuncioId;
                this.editarAnuncio(anuncioId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const anuncioId = e.target.closest('.delete-btn').dataset.anuncioId;
                this.eliminarAnuncio(anuncioId);
            });
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const anuncioId = e.target.closest('.view-btn').dataset.anuncioId;
                this.verAnuncio(anuncioId);
            });
        });

        document.querySelectorAll('.messages-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const anuncioId = e.target.closest('.messages-btn').dataset.anuncioId;
                this.verMensajes(anuncioId);
            });
        });

        document.querySelectorAll('.visibility-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const anuncioId = e.target.dataset.anuncioId;
                const isVisible = e.target.checked;
                this.toggleVisibilidad(anuncioId, isVisible);
            });
        });
    }

    async toggleVisibilidad(anuncioId, isVisible) {
        const nuevoEstado = isVisible ? 'activo' : 'inactivo';
        
        try {
            const response = await fetch(`/api/anuncios/${anuncioId}/vendedor/${this.usuario.usuarioId}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado_publicacion: nuevoEstado })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('Estado actualizado:', result);
            
            // Actualizar el anuncio localmente
            const anuncio = this.anuncios.find(a => a.anuncioId == anuncioId);
            if (anuncio) {
                anuncio.estado_publicacion = nuevoEstado;
            }
            
            this.aplicarFiltros();
            this.showNotification(`Anuncio ${isVisible ? 'activado' : 'desactivado'} correctamente`, 'success');
            
        } catch (error) {
            console.error('Error al cambiar visibilidad:', error);
            this.showNotification('Error al cambiar la visibilidad del anuncio', 'error');
            
            // Revertir el checkbox
            const checkbox = document.querySelector(`[data-anuncio-id="${anuncioId}"]`);
            if (checkbox) {
                checkbox.checked = !isVisible;
            }
        }
    }

    async eliminarAnuncio(anuncioId) {
        const anuncio = this.anuncios.find(a => a.anuncioId == anuncioId);
        if (!anuncio) return;

        const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el anuncio "${anuncio.titulo}"?\n\nEsta acción no se puede deshacer.`);
        
        if (!confirmacion) return;

        try {
            const response = await fetch(`/api/anuncios/${anuncioId}/vendedor/${this.usuario.usuarioId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('Anuncio eliminado:', result);
            
            // Remover del array local
            this.anuncios = this.anuncios.filter(a => a.anuncioId != anuncioId);
            this.aplicarFiltros();
            
            this.showNotification('Anuncio eliminado correctamente', 'success');
            
        } catch (error) {
            console.error('Error al eliminar anuncio:', error);
            this.showNotification('Error al eliminar el anuncio', 'error');
        }
    }    editarAnuncio(anuncioId) {
        // Validar que tenemos un ID válido
        if (!anuncioId) {
            this.showNotification('Error: ID de anuncio no válido', 'error');
            return;
        }
        
        // Abrir en la misma ventana para mejor experiencia
        window.location.href = `editarAnuncio.html?anuncioId=${anuncioId}`;
    }    verAnuncio(anuncioId) {
        // Validar que tenemos un ID válido
        if (!anuncioId) {
            this.showNotification('Error: ID de anuncio no válido', 'error');
            return;
        }
        
        window.open(`DetalleAnuncio.html?anuncioId=${anuncioId}`, '_blank');
    }

    verMensajes(anuncioId) {
        // Por ahora abrir en nueva pestaña, luego se implementará
        console.log('Ver mensajes del anuncio:', anuncioId);
        this.showNotification('Funcionalidad de mensajes pendiente de implementación', 'info');
    }

    // Métodos auxiliares
    formatearFecha(fecha) {
        const date = new Date(fecha);
        const ahora = new Date();
        const diffTime = ahora - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatearUbicacion(anuncio) {
        const partes = [anuncio.zona, anuncio.ciudadNombre, anuncio.departamentoNombre]
            .filter(parte => parte && parte.trim())
            .slice(0, 2);
        
        return partes.length > 0 ? partes.join(', ') : 'No especificada';
    }

    getEstadoClass(estado) {
        const estados = {
            'activo': 'active',
            'inactivo': 'inactive',
            'vendido': 'sold'
        };
        return estados[estado] || 'inactive';
    }

    getEstadoTexto(estado) {
        const estados = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'vendido': 'Vendido'
        };
        return estados[estado] || 'Desconocido';
    }

    showLoading() {
        const container = document.getElementById('ads-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #666;"></i>
                    <p style="margin-top: 20px; color: #666;">Cargando tus anuncios...</p>
                </div>
            `;
        }
    }

    showError(mensaje) {
        const container = document.getElementById('ads-container');
        if (container) {
            container.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545;"></i>
                    <p style="margin-top: 20px; color: #dc3545;">${mensaje}</p>
                    <button class="primary-button" onclick="window.panelVendedorManager.loadAnuncios()" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    renderNoResults() {
        const mensaje = this.anuncios.length === 0 
            ? 'No tienes anuncios publicados aún'
            : 'No se encontraron anuncios que coincidan con los filtros';
        
        const botonCrear = this.anuncios.length === 0 
            ? `<a href="CrearAnuncio.html" class="primary-button" style="margin-top: 20px; display: inline-block;">
                 <i class="fas fa-plus"></i> Crear mi primer anuncio
               </a>`
            : '';

        return `
            <div class="no-results" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
                <h3>${mensaje}</h3>
                ${botonCrear}
            </div>
        `;
    }

    showNotification(mensaje, tipo = 'info') {
        const colores = {
            'success': '#28a745',
            'error': '#dc3545',
            'info': '#17a2b8',
            'warning': '#ffc107'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colores[tipo]};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        notification.textContent = mensaje;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.panelVendedorManager = new PanelVendedorManager();
});

// Escuchar cambios en el localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'usuario' && window.panelVendedorManager) {
        window.panelVendedorManager.loadUserInfo();
        if (window.panelVendedorManager.checkUserAuth()) {
            window.panelVendedorManager.loadAnuncios();
        }
    }
});
