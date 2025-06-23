document.addEventListener('DOMContentLoaded', () => {
    const anunciosContainer = document.getElementById('anuncios-container'); // Necesitas este ID en tu HTML
    const filtroCategoriaSelect = document.getElementById('filtro-categoria'); // ID del <select> de categorías
    
    // --- FUNCIÓN PRINCIPAL PARA CARGAR Y RENDERIZAR ANUNCIOS ---
    const cargarAnuncios = async (filtros = {}) => {
        const queryParams = new URLSearchParams(filtros).toString();
        
        try {
            const response = await fetch(`/api/anuncios/buscar?${queryParams}`);
            if (!response.ok) throw new Error('Error al obtener los anuncios.');
            
            const anuncios = await response.json();
            renderizarAnuncios(anuncios);

        } catch (error) {
            console.error('Error al cargar anuncios:', error);
            anunciosContainer.innerHTML = '<p>Hubo un error al cargar los anuncios. Inténtalo de nuevo más tarde.</p>';
        }
    };

    // --- FUNCIÓN PARA DIBUJAR LOS ANUNCIOS EN LA PÁGINA ---
    const renderizarAnuncios = (anuncios) => {
        anunciosContainer.innerHTML = ''; // Limpiar contenedor

        if (anuncios.length === 0) {
            anunciosContainer.innerHTML = '<p class="no-results">No se encontraron anuncios que coincidan con tu búsqueda.</p>';
            return;
        }

        anuncios.forEach(anuncio => {
            // Adapta este HTML para que coincida con el diseño de tu tarjeta de anuncio
            const card = document.createElement('div');
            card.className = 'anuncio-card'; // Asegúrate de que esta clase exista en tu CSS
            card.innerHTML = `
                <a href="AnuncioDetalle.html?id=${anuncio.anuncioId}">
                    <img src="${anuncio.imagen_principal || '../recursos/img/placeholder.png'}" alt="Imagen de ${anuncio.titulo}">
                    <div class="card-body">
                        <h3 class="card-title">${anuncio.titulo}</h3>
                        <p class="card-price">Bs. ${Number(anuncio.precio).toFixed(2)}</p>
                        <p class="card-category">${anuncio.categoria}</p>
                        <p class="card-location">${anuncio.ciudad}, ${anuncio.departamento}</p>
                    </div>
                </a>
            `;
            anunciosContainer.appendChild(card);
        });
    };

    // --- LÓGICA PARA LEER LA URL Y APLICAR FILTRO INICIAL ---
    const aplicarFiltroDesdeURL = () => {
        const parametrosURL = new URLSearchParams(window.location.search);
        const categoria = parametrosURL.get('categoria');
        
        const filtrosIniciales = {};

        if (categoria) {
            console.log(`Filtrando automáticamente por categoría: ${categoria}`);
            filtrosIniciales.categoria = categoria;

            // Si tienes un <select> de filtros, actualiza su valor para que refleje el filtro actual
            if (filtroCategoriaSelect) {
                filtroCategoriaSelect.value = categoria;
            }
        }
        
        cargarAnuncios(filtrosIniciales);
    };

    // --- INICIAR LA PÁGINA ---
    aplicarFiltroDesdeURL();
    
    // Aquí puedes añadir listeners para otros filtros (formularios, botones, etc.)
    // document.getElementById('form-filtros').addEventListener('submit', (event) => { ... });
});