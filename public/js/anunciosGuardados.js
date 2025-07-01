// Gestión de anuncios guardados
class SavedAdsManager {    constructor() {
        this.baseURL = '/api/anuncios_guardados';
        this.anunciosURL = '/api/anuncios';
        this.isLoading = false;
        this.usuario = null;
        this.anunciosGuardados = [];
        this.init();
    }    init() {
        console.log('Inicializando SavedAdsManager...');
        this.getUserData();
        this.loadSavedAds();
        this.setupEventListeners();
    }getUserData() {
        try {
            this.usuario = JSON.parse(localStorage.getItem('usuario'));
            console.log('Usuario cargado:', this.usuario);
        } catch (e) {
            console.error('Error al obtener datos del usuario:', e);
            this.showNoUserMessage();
            return;
        }

        if (!this.usuario || !this.usuario.usuarioId) {
            console.log('No hay usuario logueado o falta usuarioId');
            this.showNoUserMessage();
            return;
        }
    }

    async loadSavedAds() {
        if (this.isLoading || !this.usuario) return;
        
        this.isLoading = true;
        const container = document.getElementById('ads-list');
        const resultsCount = document.getElementById('results-count');
        
        try {
            this.showLoadingState(container);            // Obtener anuncios guardados del usuario
            const savedResponse = await fetch(`${this.baseURL}/${this.usuario.usuarioId}`);
            if (!savedResponse.ok) {
                throw new Error(`Error HTTP: ${savedResponse.status}`);
            }            const anunciosGuardadosData = await savedResponse.json();
            console.log('Anuncios guardados obtenidos:', anunciosGuardadosData);

            if (!anunciosGuardadosData || anunciosGuardadosData.length === 0) {
                this.showEmptyState(container);
                this.updateResultsCount(0, resultsCount);
                return;
            }

            // Los datos vienen como array de IDs, necesitamos convertirlos a objetos
            const anunciosGuardadosConFecha = anunciosGuardadosData.map(anuncioId => ({
                anuncioId: anuncioId,
                fecha_guardado: new Date() // Fecha por defecto ya que no viene en la respuesta
            }));

            // Obtener detalles completos de cada anuncio guardado
            const anunciosCompletos = await this.getFullAdDetails(anunciosGuardadosConFecha);
            
            if (anunciosCompletos && anunciosCompletos.length > 0) {
                this.anunciosGuardados = anunciosCompletos;
                this.renderSavedAds(anunciosCompletos, container);
                this.updateResultsCount(anunciosCompletos.length, resultsCount);
            } else {
                this.showEmptyState(container);
                this.updateResultsCount(0, resultsCount);
            }

        } catch (error) {
            console.error('Error al cargar anuncios guardados:', error);
            this.showErrorState(container);
            this.updateResultsCount(0, resultsCount);
        } finally {
            this.isLoading = false;
        }
    }

    async getFullAdDetails(anunciosGuardados) {
        try {
            const anunciosCompletos = [];
            
            for (const guardado of anunciosGuardados) {
                const response = await fetch(`${this.anunciosURL}/${guardado.anuncioId}/con-imagenes`);
                if (response.ok) {
                    const anuncioCompleto = await response.json();
                    // Agregar fecha de guardado al anuncio
                    anuncioCompleto.fecha_guardado = guardado.fecha_guardado;
                    anunciosCompletos.push(anuncioCompleto);
                }
            }
            
            return anunciosCompletos;
        } catch (error) {
            console.error('Error al obtener detalles de anuncios:', error);
            return [];
        }
    }

    renderSavedAds(anuncios, container) {
        const anunciosHTML = anuncios.map(anuncio => this.createAdCard(anuncio)).join('');
        container.innerHTML = anunciosHTML;
        
        // Configurar event listeners para las acciones
        this.setupCardEventListeners();
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
            imagenPrincipal = '../recursos/img/no-image.png';
        }
            
        const precio = anuncio.precio ? `$${anuncio.precio}` : 'Precio no disponible';

        // Formato exacto de VerAnuncios.html
        return `
            <div class="ads-card" data-anuncio-id="${anuncio.anuncioId}">
                <div class="ads-card-img">
                    <a href="DetalleAnuncio.html?anuncioId=${anuncio.anuncioId}" class="ad-link">
                        <div class="ads-card-img-container">
                            <img src="${imagenPrincipal}" 
                                 alt="${anuncio.titulo}" 
                                 onerror="this.src='../recursos/img/no-image.png'">
                        </div>
                    </a>
                    <button class="bookmark-icon active" 
                            data-action="remove-from-saved" 
                            data-ad-id="${anuncio.anuncioId}"
                            title="Quitar de guardados">
                        <i class="fas fa-bookmark"></i>
                    </button>
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

    setupEventListeners() {
        // Configurar buscador
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterAds(e.target.value);
            });
        }

        // Configurar filtros
        const filterForm = document.getElementById('filter-form');
        if (filterForm) {
            filterForm.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }

    setupCardEventListeners() {
        // Event listeners para quitar de guardados
        const removeButtons = document.querySelectorAll('[data-action="remove-from-saved"]');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const anuncioId = button.getAttribute('data-ad-id');
                this.removeFromSaved(anuncioId);
            });
        });

        // Event listeners para incrementar vistas
        const adLinks = document.querySelectorAll('.ad-link');
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

    async removeFromSaved(anuncioId) {
        try {
            const response = await fetch(`${this.baseURL}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuarioId: this.usuario.usuarioId,
                    anuncioId: parseInt(anuncioId)
                })
            });

            if (response.ok) {
                // Remover el anuncio de la vista
                const adCard = document.querySelector(`[data-anuncio-id="${anuncioId}"]`);
                if (adCard) {
                    adCard.remove();
                    
                    // Actualizar contador
                    this.anunciosGuardados = this.anunciosGuardados.filter(a => a.anuncioId != anuncioId);
                    const resultsCount = document.getElementById('results-count');
                    this.updateResultsCount(this.anunciosGuardados.length, resultsCount);
                    
                    // Mostrar estado vacío si no quedan anuncios
                    if (this.anunciosGuardados.length === 0) {
                        const container = document.getElementById('ads-list');
                        this.showEmptyState(container);
                    }
                }
                
                this.showNotification('Anuncio removido de guardados', 'success');
            } else {
                this.showNotification('Error al remover anuncio', 'error');
            }
        } catch (error) {
            console.error('Error al remover de guardados:', error);
            this.showNotification('Error al remover anuncio', 'error');
        }
    }

    async incrementViews(anuncioId) {
        try {
            await fetch(`${this.anunciosURL}/${anuncioId}/incrementar-vistas`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error al incrementar vistas:', error);
        }
    }

    filterAds(searchTerm) {
        const cards = document.querySelectorAll('.ads-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.querySelector('.ads-card-title').textContent.toLowerCase();
            const category = card.querySelector('.ads-card-category').textContent.toLowerCase();
            
            if (title.includes(searchTerm.toLowerCase()) || category.includes(searchTerm.toLowerCase())) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        const resultsCount = document.getElementById('results-count');
        this.updateResultsCount(visibleCount, resultsCount);
    }

    applyFilters() {
        // Implementar filtros adicionales si es necesario
        console.log('Aplicando filtros...');
    }

    showLoadingState(container) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner">Cargando anuncios guardados...</div>
            </div>
        `;
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No tienes anuncios guardados</h3>
                <p>Los anuncios que guardes aparecerán aquí para que puedas acceder a ellos fácilmente.</p>
                <a href="VerAnuncios.html" class="btn-primary">Explorar Anuncios</a>
            </div>
        `;
    }

    showErrorState(container) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #dc3545; margin-bottom: 1rem;"></i>
                <h3>Error al cargar anuncios guardados</h3>
                <p>Hubo un problema al cargar tus anuncios guardados. Por favor, inténtalo más tarde.</p>
                <button onclick="location.reload()" class="btn-primary">Reintentar</button>
            </div>
        `;
    }    showNoUserMessage() {
        const container = document.getElementById('ads-list');
        const self = this; // Capturar referencia para usar en el botón
        container.innerHTML = `
            <div class="no-user-state">
                <i class="fas fa-user-slash" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>Inicia sesión para ver tus anuncios guardados</h3>
                <p>Necesitas estar logueado para acceder a tus anuncios guardados.</p>
                <a href="Login.html" class="btn-primary">Iniciar Sesión</a>
                <button id="test-user-btn" class="btn-primary" style="margin-left: 10px; background-color: #28a745;">Probar con Usuario de Ejemplo</button>
            </div>
        `;
        
        // Agregar event listener al botón de test
        const testBtn = document.getElementById('test-user-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                self.testWithSampleUser();
            });
        }
    }

    // Función para testing - simula un usuario logueado
    testWithSampleUser() {
        const sampleUser = {
            usuarioId: 1,
            nombre: 'Usuario Test',
            email: 'test@example.com'
        };
        localStorage.setItem('usuario', JSON.stringify(sampleUser));
        location.reload(); // Recargar la página para aplicar los cambios
    }

    updateResultsCount(count, element) {
        if (element) {
            element.textContent = `${count} anuncio${count !== 1 ? 's' : ''} guardado${count !== 1 ? 's' : ''}`;
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación simple
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 5px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SavedAdsManager();
});
