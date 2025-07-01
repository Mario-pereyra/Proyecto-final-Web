// Gestión de anuncios más vistos en la página principal
class MostViewedAdsManager {
    constructor() {
        this.baseURL = '/api/anuncios';
        this.isLoading = false;
        this.init();
    }

    init() {
        this.loadMostViewedAds();
    }

    async loadMostViewedAds() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const container = document.getElementById('most-viewed-ads-list');
        const loadingElement = document.getElementById('most-viewed-loading');
        
        try {
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }

            const response = await fetch(`${this.baseURL}/mas-vistos`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const anuncios = await response.json();
            console.log('Anuncios más vistos cargados:', anuncios);

            if (anuncios && anuncios.length > 0) {
                this.renderMostViewedAds(anuncios, container);
            } else {
                this.renderNoResults(container);
            }
        } catch (error) {
            console.error('Error al cargar anuncios más vistos:', error);
            this.renderError(container);
        } finally {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            this.isLoading = false;
        }
    }

    renderMostViewedAds(anuncios, container) {
        const anunciosHTML = anuncios.map(anuncio => this.createAdCard(anuncio)).join('');
        container.innerHTML = anunciosHTML;
        
        // Agregar event listeners para incrementar vistas
        this.addClickListeners();
    }

    createAdCard(anuncio) {
        // Manejar la ruta de la imagen correctamente
        let imagenPrincipal;
        if (anuncio.imagenes && anuncio.imagenes.length > 0) {
            const nombreImagen = anuncio.imagenes[0].nombre_archivo;
            if (nombreImagen.startsWith('uploads/')) {
                imagenPrincipal = `/${nombreImagen}`;
            } else {
                imagenPrincipal = `/uploads/${nombreImagen}`;
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
        const adLinks = document.querySelectorAll('.most-viewed-ads .ad-link');
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
                <p>No se encontraron anuncios en este momento.</p>
            </div>
        `;
    }

    renderError(container) {
        container.innerHTML = `
            <div class="error-message">
                <p>Error al cargar los anuncios más vistos. Por favor, inténtalo más tarde.</p>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MostViewedAdsManager();
});
