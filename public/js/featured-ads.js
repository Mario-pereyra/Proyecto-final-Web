// Gestión de anuncios destacados en la página principal
class FeaturedAdsManager {
    constructor() {
        this.baseURL = '/api/anuncios';
        this.isLoading = false;
        this.init();
    }

    init() {
        this.loadFeaturedAds();
    }

    async loadFeaturedAds() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const container = document.getElementById('featured-ads-list');
        const loadingElement = document.getElementById('featured-ads-loading');
        
        try {
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }

            const response = await fetch(`${this.baseURL}/con-imagenes`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const anuncios = await response.json();
            console.log('Anuncios destacados cargados:', anuncios);

            if (anuncios && anuncios.length > 0) {
                // Tomar solo los primeros 4 anuncios para destacados
                const anunciosDestacados = anuncios.slice(0, 4);
                this.renderFeaturedAds(anunciosDestacados, container);
            } else {
                this.renderNoResults(container);
            }
        } catch (error) {
            console.error('Error al cargar anuncios destacados:', error);
            this.renderError(container);
        } finally {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            this.isLoading = false;
        }
    }

    renderFeaturedAds(anuncios, container) {
        const anunciosHTML = anuncios.map(anuncio => this.createAdCard(anuncio)).join('');
        container.innerHTML = anunciosHTML;
        
        // Agregar event listeners para incrementar vistas
        this.addClickListeners();
    }

    createAdCard(anuncio) {
        // Manejar la ruta de la imagen correctamente
        let imagenPrincipal;
        if (anuncio.imagenes && anuncio.imagenes.length > 0) {
            const principal = anuncio.imagenes.find(img => img.es_principal === 1) || anuncio.imagenes[0];
            if (principal.ruta_archivo.startsWith('uploads/')) {
                imagenPrincipal = `/${principal.ruta_archivo}`;
            } else {
                imagenPrincipal = `/uploads/${principal.ruta_archivo}`;
            }
        } else if (anuncio.imagen_principal) {
            if (anuncio.imagen_principal.startsWith('uploads/')) {
                imagenPrincipal = `/${anuncio.imagen_principal}`;
            } else {
                imagenPrincipal = `/uploads/${anuncio.imagen_principal}`;
            }
        } else {
            imagenPrincipal = '/recursos/img/no-image.png';
        }
            
        const precio = anuncio.precio ? `$${anuncio.precio}` : 'Precio no disponible';

        // Formato exacto de VerAnuncios.html - SIN etiquetas especiales
        return `
            <div class="ads-card" data-anuncio-id="${anuncio.anuncioId}">
                <div class="ads-card-img">
                    <a href="pages/DetalleAnuncio.html?anuncioId=${anuncio.anuncioId}" class="ad-link">
                        <div class="ads-card-img-container">
                            <img src="${imagenPrincipal}" 
                                 alt="${anuncio.titulo}" 
                                 onerror="this.src='/recursos/img/no-image.png'">
                        </div>
                    </a>
                </div>
                <div class="ads-card-details">
                    <div class="ads-card-tags">
                        <div class="ads-card-category">${anuncio.subcategoriaNombre || anuncio.categoriaNombre || 'Sin categoría'}</div>
                        <div class="ads-card-condition">${this.formatCondition(anuncio.estado)}</div>
                    </div>
                    <h3 class="ads-card-title">${anuncio.titulo}</h3>
                    <p class="ads-card-price">${precio}</p>
                </div>
                <div class="ads-card-vendor">
                    <div class="ads-card-vendor-label">Vendedor:</div>
                    <div class="ads-card-vendor-name">${anuncio.usuarioNombre || 'Usuario'}</div>
                </div>
            </div>
        `;
    }

    formatCondition(estado) {
        const conditionMap = {
            'nuevo': 'Nuevo',
            'usado': 'Usado',
            'seminuevo': 'Semi-nuevo'
        };
        return conditionMap[estado] || estado;
    }

    addClickListeners() {
        // Agregar event listeners para incrementar vistas cuando se hace clic en un anuncio
        const adLinks = document.querySelectorAll('.featured-ads .ad-link');
        adLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const anuncioId = href.split('anuncioId=')[1];
                if (anuncioId) {
                    this.incrementViews(anuncioId);
                }
            });
        });
    }

    async incrementViews(anuncioId) {
        try {
            const response = await fetch(`${this.baseURL}/${anuncioId}/incrementar-vistas`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log(`Vista incrementada para anuncio ${anuncioId}`);
            }
        } catch (error) {
            console.error('Error al incrementar vistas:', error);
        }
    }

    renderNoResults(container) {
        container.innerHTML = `
            <div class="no-results">
                <p>No se encontraron anuncios destacados en este momento.</p>
            </div>
        `;
    }

    renderError(container) {
        container.innerHTML = `
            <div class="error-message">
                <p>Error al cargar los anuncios destacados. Por favor, inténtalo más tarde.</p>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new FeaturedAdsManager();
});