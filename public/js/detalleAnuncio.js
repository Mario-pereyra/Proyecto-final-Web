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
        mainContainer.innerHTML = `
            <div class="loading-container" style="text-align: center; padding: 50px;">
                <div class="loading-spinner">Cargando detalles del anuncio...</div>
            </div>
        `;
    }

    showError(message) {
        const mainContainer = document.getElementById('ad-content');
        mainContainer.innerHTML = `
            <div class="error-container" style="text-align: center; padding: 50px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
                <h3>Error al cargar el anuncio</h3>
                <p>${message}</p>
                <button onclick="history.back()" class="primary-button">Volver</button>
            </div>
        `;
    }    renderAnuncioDetails() {
        try {
            // Actualizar título de la página
            document.title = `${this.anuncioData.titulo} - AstroMarket`;

            // Renderizar galería de imágenes
            this.renderGallery();

            // Renderizar información del producto
            this.renderProductInfo();

            // Renderizar información del vendedor
            this.renderVendorInfo();

            // Configurar botón de guardar
            this.setupSaveButton();

            // Configurar sección de contacto
            this.setupContactSection();

            // Agregar clase de animación
            const mainContainer = document.getElementById('ad-content');
            if (mainContainer) {
                mainContainer.classList.add('fade-in');
            }

        } catch (error) {
            console.error('Error al renderizar detalles del anuncio:', error);
            this.showError('Error al mostrar los detalles del anuncio');
        }
    }renderGallery() {
        const mainImage = document.getElementById('main-image');
        const thumbnailsContainer = document.querySelector('.ad-thumbnails');

        if (!mainImage || !thumbnailsContainer) {
            console.error('Elementos de galería no encontrados en el DOM');
            return;
        }

        if (this.anuncioData.imagenes && this.anuncioData.imagenes.length > 0) {
            // Encontrar imagen principal o usar la primera
            const imagenPrincipal = this.anuncioData.imagenes.find(img => img.es_principal === 1) || this.anuncioData.imagenes[0];
            
            // Configurar imagen principal
            const mainImageSrc = `/${imagenPrincipal.ruta_archivo}`;
            mainImage.src = mainImageSrc;
            mainImage.alt = this.anuncioData.titulo;
            mainImage.onerror = function() {
                this.src = '../recursos/img/no-image.png';
            };

            // Renderizar thumbnails
            const thumbnailsHTML = this.anuncioData.imagenes.map((imagen, index) => {
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

            thumbnailsContainer.innerHTML = thumbnailsHTML;
        } else {
            // Sin imágenes - usar imagen por defecto
            mainImage.src = '../recursos/img/no-image.png';
            mainImage.alt = this.anuncioData.titulo;
            mainImage.onerror = null; // No necesario para imagen por defecto
            
            thumbnailsContainer.innerHTML = `
                <div class="ad-thumbnail active">
                    <img class="ad-thumbnail-img" 
                         src="../recursos/img/no-image.png" 
                         alt="Sin imagen"
                         data-action="change-main-image"
                         data-image-src="../recursos/img/no-image.png">
                </div>
            `;
        }
    }    renderProductInfo() {
        // Función helper para actualizar elemento de forma segura
        const updateElement = (id, value, defaultValue = 'No disponible') => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || defaultValue;
            } else {
                console.warn(`Elemento con ID '${id}' no encontrado`);
            }
        };

        // Título del producto
        updateElement('product-title', this.anuncioData.titulo, 'Sin título');

        // Precio
        updateElement('product-price', `$${this.anuncioData.precio}`, 'Precio no disponible');

        // Categoría y subcategoría
        updateElement('product-category', 
            this.anuncioData.subcategoriaNombre || this.anuncioData.categoriaNombre, 
            'Sin categoría');

        // Condición del producto
        updateElement('product-condition', this.formatCondition(this.anuncioData.estado));

        // Fecha de publicación
        if (this.anuncioData.fecha_creacion) {
            const fechaPublicacion = new Date(this.anuncioData.fecha_creacion);
            updateElement('publish-date', this.formatTimeAgo(fechaPublicacion));
        }

        // Ubicación
        const ubicacionParts = [
            this.anuncioData.zona,
            this.anuncioData.ciudadNombre,
            this.anuncioData.departamentoNombre
        ].filter(part => part && part.trim() !== '');
        
        const ubicacion = ubicacionParts.length > 0 ? ubicacionParts.join(', ') : 'Ubicación no especificada';
        updateElement('location', ubicacion);

        // Vistas
        updateElement('view-count', this.anuncioData.vistas || 0);

        // Descripción
        const descriptionElement = document.getElementById('product-description');
        if (descriptionElement) {
            descriptionElement.innerHTML = `<p>${this.anuncioData.descripcion || 'Sin descripción disponible'}</p>`;
        }

        // Configurar atributos de datos
        const adContent = document.getElementById('ad-content');
        if (adContent) {
            adContent.setAttribute('data-product', this.anuncioId);
            adContent.setAttribute('data-vendor', this.anuncioData.usuarioId);
        }
    }    renderVendorInfo() {
        // Función helper para actualizar elemento de forma segura
        const updateElement = (id, value, defaultValue = 'No disponible') => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || defaultValue;
            }
        };

        // Nombre del vendedor
        updateElement('vendor-name', this.anuncioData.usuarioNombre, 'Vendedor');        // Estado del vendedor (por ahora estático)
        updateElement('vendor-status', 'Disponible');

        // Configurar botones con datos del vendedor
        const btnStartConversation = document.getElementById('btn-start-conversation');
        if (btnStartConversation) {
            btnStartConversation.setAttribute('data-vendor', this.anuncioData.usuarioId);
            btnStartConversation.setAttribute('data-product', this.anuncioId);
        }
    }

    setupSaveButton() {
        const bookmarkBtn = document.getElementById('bookmark-btn');
        const bookmarkIcon = document.getElementById('bookmark-icon');
        const bookmarkText = document.getElementById('bookmark-text');

        bookmarkBtn.setAttribute('data-product', this.anuncioId);

        if (!this.usuario) {
            // Usuario no logueado - deshabilitar botón
            bookmarkBtn.disabled = true;
            bookmarkText.textContent = 'Inicia sesión para guardar';
            return;
        }

        // Configurar click listener para guardar/quitar
        bookmarkBtn.addEventListener('click', () => {
            this.toggleSaveAd();
        });
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
            alert('Debes iniciar sesión para guardar anuncios');
            return;
        }

        const bookmarkBtn = document.getElementById('bookmark-btn');
        const isSaved = bookmarkBtn.getAttribute('data-saved') === 'true';

        try {
            let response;
            if (isSaved) {
                // Remover de guardados
                response = await fetch('/api/anuncios_guardados', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        usuarioId: this.usuario.usuarioId,
                        anuncioId: parseInt(this.anuncioId)
                    })
                });
            } else {
                // Agregar a guardados
                response = await fetch('/api/anuncios_guardados', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        usuarioId: this.usuario.usuarioId,
                        anuncioId: parseInt(this.anuncioId)
                    })
                });
            }

            if (response.ok) {
                this.updateSaveButtonState(!isSaved);
                this.showNotification(isSaved ? 'Anuncio removido de guardados' : 'Anuncio guardado exitosamente', 'success');
            } else {
                throw new Error('Error en la operación');
            }

        } catch (error) {
            console.error('Error al guardar/remover anuncio:', error);
            this.showNotification('Error al procesar la solicitud', 'error');
        }
    }

    setupContactSection() {
        const loginSection = document.getElementById('login-required');
        const contactSection = document.getElementById('contact-section');

        if (this.usuario) {
            // Usuario logueado - mostrar sección de contacto
            loginSection.style.display = 'none';
            contactSection.style.display = 'block';

            // Verificar si es el propio anuncio del usuario
            if (this.usuario.usuarioId == this.anuncioData.usuarioId) {
                contactSection.innerHTML = `
                    <div class="own-ad-message">
                        <i class="fas fa-info-circle"></i>
                        <p>Este es tu anuncio</p>
                        <button class="primary-button" onclick="window.location.href='PanelVendedor.html'">
                            Ir al Panel de Vendedor
                        </button>
                    </div>
                `;
            }
        } else {
            // Usuario no logueado - mostrar sección de login
            loginSection.style.display = 'block';
            contactSection.style.display = 'none';
        }
    }    setupEventListeners() {
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
                // Redirigir a mensajes con parámetros
                const vendorId = this.anuncioData.usuarioId;
                window.location.href = `MensajesComprador.html?vendorId=${vendorId}&anuncioId=${this.anuncioId}`;
            });
        }

        // Event listener para teclas de navegación en galería
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.navigateGallery(e.key === 'ArrowRight');
            }
        });
    }

    navigateGallery(next = true) {
        const activeThumbnail = document.querySelector('.ad-thumbnail.active');
        if (!activeThumbnail) return;

        const thumbnails = document.querySelectorAll('.ad-thumbnail');
        const currentIndex = Array.from(thumbnails).indexOf(activeThumbnail);
        
        let newIndex;
        if (next) {
            newIndex = (currentIndex + 1) % thumbnails.length;
        } else {
            newIndex = currentIndex === 0 ? thumbnails.length - 1 : currentIndex - 1;
        }

        const newThumbnail = thumbnails[newIndex];
        const newImage = newThumbnail.querySelector('[data-action="change-main-image"]');
        if (newImage) {
            newImage.click();
        }
    }

    formatCondition(estado) {
        const conditionMap = {
            'nuevo': 'Nuevo',
            'usado': 'Usado',
            'seminuevo': 'Semi-nuevo'
        };
        return conditionMap[estado] || estado;
    }    formatTimeAgo(date) {
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
        // Crear notificación simple
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
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Agregar CSS de animación si no existe
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
