// DetalleAnuncio.js - Manejo dinámico de la página de detalles del anuncio
class DetalleAnuncioManager {
    constructor() {
        this.anunciosURL = '/api/anuncios';
        this.anuncioId = null;
        this.anuncioData = null;
        this.usuario = null;
        this.init();
    }

    init() {
        console.log('Inicializando DetalleAnuncioManager...');
        this.getAnuncioIdFromURL();
        this.getUserData();
        if (this.anuncioId) {
            this.loadAnuncioDetails();
        } else {
            this.showError('ID de anuncio no válido');
        }
    }

    getAnuncioIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.anuncioId = urlParams.get('anuncioId');
        console.log('Anuncio ID desde URL:', this.anuncioId);
    }

    getUserData() {
        try {
            this.usuario = JSON.parse(localStorage.getItem('usuario'));
            console.log('Usuario logueado:', this.usuario);
        } catch (e) {
            console.log('No hay usuario logueado');
            this.usuario = null;
        }
    }

    async loadAnuncioDetails() {
        try {
            console.log(`Cargando detalles del anuncio ${this.anuncioId}...`);
            
            // Mostrar estado de carga
            this.showLoadingState();

            // Obtener detalles del anuncio con imágenes
            const response = await fetch(`${this.anunciosURL}/${this.anuncioId}/con-imagenes`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Anuncio no encontrado');
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }

            this.anuncioData = await response.json();
            console.log('Datos del anuncio cargados:', this.anuncioData);

            // Incrementar vistas del anuncio
            await this.incrementarVistas();

            // Renderizar los detalles del anuncio
            this.renderAnuncioDetails();

            // Verificar si el anuncio está guardado
            if (this.usuario) {
                await this.checkIfSaved();
            }

            // Configurar event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Error al cargar detalles del anuncio:', error);
            this.showError(error.message);
        }
    }

    async incrementarVistas() {
        try {
            await fetch(`${this.anunciosURL}/${this.anuncioId}/incrementar-vistas`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Vistas incrementadas');
        } catch (error) {
            console.error('Error al incrementar vistas:', error);
        }
    }

    showLoadingState() {
        const mainContainer = document.getElementById('ad-content');
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 50px;">
                    <div class="loading-spinner">Cargando detalles del anuncio...</div>
                </div>
            `;
        }
    }

    showError(message) {
        const mainContainer = document.getElementById('ad-content');
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 50px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
                    <h3>Error al cargar el anuncio</h3>
                    <p>${message}</p>
                    <button onclick="history.back()" class="primary-button">Volver</button>
                </div>
            `;
        }
    }

    renderAnuncioDetails() {
        try {
            // Actualizar título de la página
            document.title = `${this.anuncioData.titulo} - AstroMarket`;

            // Renderizar contenido original con datos dinámicos
            this.renderFullContent();

            // Verificar si el anuncio está guardado
            if (this.usuario) {
                this.checkIfSaved();
            }

            // Configurar event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Error al renderizar detalles del anuncio:', error);
            this.showError('Error al mostrar los detalles del anuncio');
        }
    }

    renderFullContent() {
        const mainContainer = document.getElementById('ad-content');
        if (!mainContainer) {
            console.error('Contenedor principal no encontrado');
            return;
        }

        // Datos de imágenes
        let imagenPrincipal = '../recursos/img/no-image.png';
        let thumbnailsHTML = '';

        if (this.anuncioData.imagenes && this.anuncioData.imagenes.length > 0) {
            const principal = this.anuncioData.imagenes.find(img => img.es_principal === 1) || this.anuncioData.imagenes[0];
            imagenPrincipal = `/${principal.ruta_archivo}`;

            thumbnailsHTML = this.anuncioData.imagenes.map((imagen, index) => {
                const imageSrc = `/${imagen.ruta_archivo}`;
                const isActive = imagen.es_principal === 1 ? 'active' : '';
                
                return `
                    <div class="ad-thumbnail ${isActive}" data-image="thumb-${index + 1}">
                        <img class="ad-thumbnail-img" 
                             src="${imageSrc}" 
                             alt="Imagen ${index + 1}"
                             data-action="change-main-image"
                             data-image-src="${imageSrc}"
                             onerror="this.src='../recursos/img/no-image.png'">
                    </div>
                `;
            }).join('');
        } else {
            thumbnailsHTML = `
                <div class="ad-thumbnail active">
                    <img class="ad-thumbnail-img" 
                         src="../recursos/img/no-image.png" 
                         alt="Sin imagen"
                         data-action="change-main-image"
                         data-image-src="../recursos/img/no-image.png">
                </div>
            `;
        }

        // Datos de ubicación
        const ubicacionParts = [
            this.anuncioData.zona,
            this.anuncioData.ciudadNombre,
            this.anuncioData.departamentoNombre
        ].filter(part => part && part.trim());
        const ubicacion = ubicacionParts.length > 0 ? ubicacionParts.join(', ') : 'Ubicación no especificada';

        // Fecha de publicación
        const fechaPublicacion = new Date(this.anuncioData.fecha_creacion);
        const tiempoTranscurrido = this.formatTimeAgo(fechaPublicacion);

        // Condición del producto
        const condicion = this.formatCondition(this.anuncioData.estado);

        // Contenido completo de la página
        const contentHTML = `
            <div class="ad-details-gallery" data-component="gallery">
                <div class="ad-main-img-container" data-image="main-container">
                    <img class="ad-main-img" id="main-image" 
                         src="${imagenPrincipal}"
                         alt="${this.anuncioData.titulo}" 
                         data-image="main"
                         onerror="this.src='../recursos/img/no-image.png'">
                    <button class="bookmark-btn" id="bookmark-btn" 
                            data-action="toggle-bookmark" 
                            data-product="${this.anuncioId}"
                            data-saved="false">
                        <i class="fas fa-bookmark" id="bookmark-icon"></i>
                        <span id="bookmark-text">Guardar</span>
                    </button>
                </div>
                <div class="ad-thumbnails" data-component="thumbnails">
                    ${thumbnailsHTML}
                </div>
            </div>

            <div class="ads-detail-info-container">
                <div class="ads-details-info" data-component="product-info">
                    <h2 class="ads-card-title" id="product-title">${this.anuncioData.titulo}</h2>
                    <p class="ads-card-price" id="product-price">$${this.anuncioData.precio}</p>
                    <div class="ads-card-tags">
                        <div class="ads-card-category" id="product-category">${this.anuncioData.subcategoriaNombre || this.anuncioData.categoriaNombre || 'Sin categoría'}</div>
                        <div class="ads-card-condition" id="product-condition">${condicion}</div>
                    </div>
                    <div class="product-metadata" data-info="metadata">
                        <p><strong>Publicado:</strong> <span id="publish-date">${tiempoTranscurrido}</span></p>
                        <p><strong>Ubicación:</strong> <span id="location">${ubicacion}</span></p>
                        <p><strong>Vistas:</strong> <span id="view-count">${this.anuncioData.vistas || 0}</span></p>
                    </div>
                    <div class="description-section">
                        <h3>Descripción</h3>
                        <div class="product-description" id="product-description">
                            <p>${this.anuncioData.descripcion || 'Sin descripción disponible'}</p>
                        </div>
                    </div>
                </div>

                <div class="contact-vendor" data-component="vendor-contact">
                    <div class="header-chat-details">
                        <div class="vendor-profile" data-info="vendor-profile">
                            <i class="fa fa-user" aria-hidden="true"></i>                            <div class="vendor-info">
                                <h3 class="vendor-name" id="vendor-name">${this.anuncioData.usuarioNombre || 'Vendedor'}</h3>
                                <p class="vendor-status" id="vendor-status">Disponible</p>
                            </div>
                        </div>
                        <div class="ads-card-details">
                            <div class="ads-card-tags">
                                <div class="ads-card-type">Vendedor</div>
                            </div>
                        </div>
                    </div>

                    ${this.renderContactSection()}
                </div>
            </div>
        `;

        mainContainer.innerHTML = contentHTML;
    }

    renderContactSection() {
        if (!this.usuario) {
            return `
                <div class="contact-vendor-login" id="login-required" data-state="guest">
                    <i class="fa-solid fa-message"></i>
                    <p>Inicia sesión para contactar al vendedor</p>
                    <button class="primary-button" data-action="navigate" data-page="login">
                        Iniciar sesión
                    </button>
                </div>
            `;
        }

        if (this.usuario.usuarioId == this.anuncioData.usuarioId) {
            return `
                <div class="contact-vendor-authenticated" id="contact-section" data-state="authenticated">
                    <div class="own-ad-message">
                        <i class="fas fa-info-circle"></i>
                        <p>Este es tu anuncio</p>
                        <button class="primary-button" onclick="window.location.href='PanelVendedor.html'">
                            Ir al Panel de Vendedor
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="contact-vendor-authenticated" id="contact-section" data-state="authenticated">
                <div class="action-buttons">
                    <button class="primary-button" id="btn-start-conversation"
                            data-action="start-conversation" 
                            data-vendor="${this.anuncioData.usuarioId}" 
                            data-product="${this.anuncioId}">
                        <i class="fa-solid fa-message"></i>
                        Enviar mensaje
                    </button>
                </div>
            </div>
        `;
    }

    async checkIfSaved() {
        if (!this.usuario) return;

        try {
            const response = await fetch(`/api/anuncios_guardados/${this.usuario.usuarioId}`);
            if (response.ok) {
                const savedAds = await response.json();
                const isSaved = savedAds.includes(parseInt(this.anuncioId));
                this.updateSaveButtonState(isSaved);
            }
        } catch (error) {
            console.error('Error al verificar anuncio guardado:', error);
        }
    }

    updateSaveButtonState(isSaved) {
        const bookmarkBtn = document.getElementById('bookmark-btn');
        const bookmarkIcon = document.getElementById('bookmark-icon');
        const bookmarkText = document.getElementById('bookmark-text');

        if (!bookmarkBtn || !bookmarkIcon || !bookmarkText) return;

        bookmarkBtn.setAttribute('data-saved', isSaved.toString());

        if (isSaved) {
            bookmarkIcon.className = 'fas fa-bookmark';
            bookmarkText.textContent = 'Guardado';
            bookmarkBtn.classList.add('saved');
        } else {
            bookmarkIcon.className = 'far fa-bookmark';
            bookmarkText.textContent = 'Guardar';
            bookmarkBtn.classList.remove('saved');
        }
    }

    async toggleSaveAd() {
        if (!this.usuario) {
            this.showNotification('Debes iniciar sesión para guardar anuncios', 'error');
            return;
        }

        const bookmarkBtn = document.getElementById('bookmark-btn');
        const isSaved = bookmarkBtn.getAttribute('data-saved') === 'true';

        try {
            let response;
            if (isSaved) {
                response = await fetch('/api/anuncios_guardados', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuarioId: this.usuario.usuarioId,
                        anuncioId: parseInt(this.anuncioId)
                    })
                });
            } else {
                response = await fetch('/api/anuncios_guardados', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuarioId: this.usuario.usuarioId,
                        anuncioId: parseInt(this.anuncioId)
                    })
                });
            }

            if (response.ok) {
                this.updateSaveButtonState(!isSaved);
                this.showNotification(
                    isSaved ? 'Anuncio removido de guardados' : 'Anuncio guardado exitosamente',
                    'success'
                );
            } else {
                throw new Error('Error en la operación');
            }

        } catch (error) {
            console.error('Error al guardar/remover anuncio:', error);
            this.showNotification('Error al procesar la solicitud', 'error');
        }
    }

    setupEventListeners() {
        // Event listener para cambiar imagen principal
        document.querySelectorAll('[data-action="change-main-image"]').forEach(thumbnail => {
            thumbnail.addEventListener('click', (e) => {
                const imageSrc = e.target.getAttribute('data-image-src');
                const mainImage = document.getElementById('main-image');
                
                if (imageSrc && mainImage) {
                    mainImage.src = imageSrc;
                    
                    // Actualizar thumbnail activo
                    document.querySelectorAll('.ad-thumbnail').forEach(thumb => thumb.classList.remove('active'));
                    e.target.closest('.ad-thumbnail').classList.add('active');
                }
            });
        });

        // Event listener para botón de guardar
        const bookmarkBtn = document.getElementById('bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', () => {
                this.toggleSaveAd();
            });
        }

        // Event listener para botón de iniciar sesión
        document.querySelectorAll('[data-action="navigate"][data-page="login"]').forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = 'Login.html';
            });
        });

        // Event listener para iniciar conversación
        const btnStartConversation = document.getElementById('btn-start-conversation');
        if (btnStartConversation) {
            btnStartConversation.addEventListener('click', () => {
                const vendorId = this.anuncioData.usuarioId;
                window.location.href = `MensajesComprador.html?vendorId=${vendorId}&anuncioId=${this.anuncioId}`;
            });
        }
    }

    formatCondition(estado) {
        const conditionMap = {
            'nuevo': 'Nuevo',
            'usado': 'Usado',
            'seminuevo': 'Semi-nuevo'
        };
        return conditionMap[estado] || estado;
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minuto${Math.floor(diffInSeconds / 60) !== 1 ? 's' : ''}`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} hora${Math.floor(diffInSeconds / 3600) !== 1 ? 's' : ''}`;
        
        const diffInDays = Math.floor(diffInSeconds / 86400);
        if (diffInDays < 30) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `Hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `Hace ${diffInYears} año${diffInYears !== 1 ? 's' : ''}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            color: white;
            background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; margin-left: 10px; cursor: pointer;">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DetalleAnuncioManager();
});
