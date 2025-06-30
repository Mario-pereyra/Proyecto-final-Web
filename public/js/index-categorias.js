// Script para la página principal - manejo de categorías dinámicas

// Configuración de diseño para cada categoría
const categoriaDesigns = {
  'Laptops y Computadoras': {
    bgClass: 'bg-laptops',
    icon: 'fa-solid fa-laptop',
    description: 'Aquí encontrarás Laptops Gaming, Ultrabooks, PCs de Escritorio, Componentes y Monitores.'
  },
  'Celulares y Smartphones': {
    bgClass: 'bg-smartphones',
    icon: 'fa-solid fa-mobile-screen-button',
    description: 'Aquí encontrarás celulares Android, iPhone, Teléfonos Básicos y todo tipo de Accesorios.'
  },
  'Tablets y E-readers': {
    bgClass: 'bg-tablets',
    icon: 'fa-solid fa-tablet-screen-button',
    description: 'Aquí encontrarás Tablets Android, iPads, E-readers y todos sus accesorios.'
  },
  'Audio y Sonido': {
    bgClass: 'bg-audio',
    icon: 'fa-solid fa-headphones',
    description: 'Aquí encontrarás Auriculares, Parlantes Bluetooth, Barras de Sonido, Micrófonos y más.'
  },
  'Smartwatches y Wearables': {
    bgClass: 'bg-smartwatches',
    icon: 'fa-solid fa-stopwatch',
    description: 'Aquí encontrarás Smartwatches, Pulseras de Actividad, Anillos y Gafas Inteligentes.'
  },
  'Dispositivos de Hogar Inteligente': {
    bgClass: 'bg-hogar',
    icon: 'fa-solid fa-house-signal',
    description: 'Aquí encontrarás Asistentes de Voz, Iluminación, Cámaras de Seguridad y Robots Aspiradores.'
  },
  'Gaming': {
    bgClass: 'bg-gaming',
    icon: 'fa-solid fa-gamepad',
    description: 'Aquí encontrarás Consolas, Videojuegos, Accesorios Gaming y equipos de Realidad Virtual.'
  },
  'Cámaras y Drones': {
    bgClass: 'bg-camaras',
    icon: 'fa-solid fa-camera-retro',
    description: 'Aquí encontrarás Cámaras Digitales, Cámaras de Acción, Drones y Accesorios de Fotografía.'
  },
  'Accesorios Electrónicos Generales': {
    bgClass: 'bg-accesorios',
    icon: 'fa-solid fa-plug',
    description: 'Aquí encontrarás Power Banks, Cargadores, Cables, Adaptadores, Hubs USB y más.'
  },
  'Almacenamiento': {
    bgClass: 'bg-almacenamiento',
    icon: 'fa-solid fa-hard-drive',
    description: 'Aquí encontrarás Discos Duros, SSD Portátiles, Pendrives y Tarjetas de Memoria.'
  }
};

document.addEventListener('DOMContentLoaded', function() {
    cargarCategoriasPopulares();
});

async function cargarCategoriasPopulares() {
    try {
        console.log('Cargando categorías populares...');
        
        // Obtener categorías con conteo desde el servidor
        const response = await fetch('/api/categorias/con-conteo');
        if (!response.ok) {
            throw new Error(`Error al obtener categorías: ${response.status}`);
        }
          const categorias = await response.json();
        console.log('Categorías recibidas:', categorias);
        
        // Filtrar y ordenar categorías por número de anuncios
        const categoriasPopulares = categorias
            .filter(categoria => categoria.totalAnuncios > 0)
            .sort((a, b) => b.totalAnuncios - a.totalAnuncios)
            .slice(0, 6); // Top 6 categorías
        
        // Generar HTML para las categorías
        const categoriesContainer = document.querySelector('.categories-container');
        if (!categoriesContainer) {
            console.error('No se encontró el contenedor de categorías');
            return;
        }
        
        let htmlContent = '';
          categoriasPopulares.forEach(categoria => {
            const design = categoriaDesigns[categoria.nombre];
            
            // Si no hay diseño específico, usar valores por defecto
            const bgClass = design ? design.bgClass : 'bg-accesorios';
            const icon = design ? design.icon : 'fa-solid fa-cube';
            const description = design ? design.description : 'Encuentra los mejores productos de tecnología.';
            
            const urlCategoria = encodeURIComponent(categoria.nombre);
            
            htmlContent += `
                <a href="pages/VerAnuncios.html?categoria=${urlCategoria}">
                    <div class="category-card" 
                         data-category="${categoria.nombre.toLowerCase().replace(/\s+/g, '-')}" 
                         data-action="browse-category">
                        <div class="icon-placeholder ${bgClass}">
                            <i class="${icon}" style="font-size:1.5rem;"></i>
                        </div>
                        <div class="card-content">
                            <h3 class="card-title" data-info="category-name">${categoria.nombre}</h3>
                            <p class="card-description">${description}</p>
                        </div>
                        <div class="category-stats" data-info="category-stats">
                            <span class="product-count" data-info="product-count">
                                ${categoria.totalAnuncios} producto${categoria.totalAnuncios !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </a>
            `;
        });
        
        // Actualizar el contenido del contenedor
        categoriesContainer.innerHTML = htmlContent;
        
        console.log('Categorías populares cargadas exitosamente');
        
    } catch (error) {
        console.error('Error al cargar categorías populares:', error);
        
        // Mostrar mensaje de error o contenido por defecto
        const categoriesContainer = document.querySelector('.categories-container');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; grid-column: 1 / -1;">
                    <p style="color: #666;">Error al cargar las categorías. Intenta recargar la página.</p>
                    <button onclick="cargarCategoriasPopulares()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// Función para manejar clics en categorías (opcional - para analytics)
document.addEventListener('click', function(e) {
    const categoryCard = e.target.closest('.category-card');
    if (categoryCard) {
        const categoryName = categoryCard.getAttribute('data-category-name');
        const categoryId = categoryCard.getAttribute('data-category-id');
        
        console.log('Navegando a categoría:', {
            nombre: categoryName,
            id: categoryId,
            url: categoryCard.href
        });
        
        // Aquí podrías añadir tracking de analytics si lo necesitas
    }
});
