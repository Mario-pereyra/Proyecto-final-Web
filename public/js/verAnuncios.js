// 1. Obtener usuario logueado
let usuario = null;
try {
  usuario = JSON.parse(localStorage.getItem('usuario'));
  console.log('Usuario cargado desde localStorage:', usuario);
} catch (e) {
  console.error('Error al parsear usuario desde localStorage:', e);
  usuario = null;
}

// Verificar estructura del usuario
if (usuario) {
  console.log('=== ESTRUCTURA DEL USUARIO ===');
  console.log('Usuario completo:', usuario);
  console.log('Propiedades disponibles:', Object.keys(usuario));
  console.log('usuario.id:', usuario.id);
  console.log('usuario.usuarioId:', usuario.usuarioId);
  console.log('Tipo de usuario.id:', typeof usuario.id);
  console.log('Tipo de usuario.usuarioId:', typeof usuario.usuarioId);
  
  // Intentar encontrar el ID correcto
  const posibleId = usuario.id || usuario.usuarioId || usuario.userId;
  console.log('ID detectado:', posibleId);
  
  if (!posibleId) {
    console.warn('⚠️  Usuario no tiene ID válido en ninguna propiedad');
    console.log('Estructura completa:', JSON.stringify(usuario, null, 2));
  }
} else {
  console.log('No hay usuario logueado');
}

let anunciosGuardados = [];
let pendingRemoveAnuncioId = null; // Para el modal de confirmación

// Función para obtener parámetros de la URL
function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    categoria: urlParams.get('categoria'),
    categoriaId: urlParams.get('categoriaId'),
    subcategoriaId: urlParams.get('subcategoriaId'),
    busqueda: urlParams.get('busqueda'),
    precioMin: urlParams.get('precioMin'),
    precioMax: urlParams.get('precioMax')
  };
}

// Función para aplicar filtros desde URL
function aplicarFiltrosDesdeURL() {
  const params = getUrlParams();
  console.log('Parámetros de URL detectados:', params);
  
  // Si hay filtro de categoría, aplicarlo
  if (params.categoria) {
    const categoriaSelect = document.getElementById('product-filter');
    if (categoriaSelect) {
      // Buscar la opción correspondiente en el select
      Array.from(categoriaSelect.options).forEach(option => {
        if (option.textContent.includes(params.categoria) || option.value === params.categoria) {
          categoriaSelect.value = option.value;
        }
      });
    }
  }
  
  // Si hay búsqueda, aplicarla
  if (params.busqueda) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = params.busqueda;
    }
  }
  
  // Ejecutar búsqueda SOLO si hay filtros
  if (params.categoria || params.busqueda) {
    console.log('Ejecutando búsqueda filtrada desde URL...');
    setTimeout(() => {
      realizarBusquedaFiltrada();
    }, 100); // Reducir el timeout
  }
}

// Función para realizar búsqueda filtrada
function realizarBusquedaFiltrada() {
  const categoria = document.getElementById('product-filter')?.value;
  const subcategoria = document.getElementById('filtro-subcategorias')?.value;
  const busqueda = document.getElementById('search-input')?.value;
  
  const params = new URLSearchParams();
    if (categoria && categoria !== 'all') {
    params.append('categoria', categoria);
  }
  if (subcategoria && subcategoria !== 'all') {
    params.append('subcategoria', subcategoria); // Usar 'subcategoria' en lugar de 'subcategoriaId'
  }
  if (busqueda && busqueda.trim()) {
    params.append('busquedaTexto', busqueda.trim());
  }
  
  console.log('Realizando búsqueda con parámetros:', Object.fromEntries(params));
  
  const apiUrl = `/api/anuncios/buscar?${params.toString()}`;
  
  fetch(apiUrl)
    .then(res => res.json())
    .then(anuncios => {
      console.log('Resultados de búsqueda:', anuncios);
      
      // Actualizar contador
      const totalAnunciosElement = document.getElementById('totalAnuncios');
      if (totalAnunciosElement) {
        totalAnunciosElement.textContent = anuncios.length;
      }
      
      // Generar HTML para los resultados
      let html = '';
      anuncios.forEach(anuncio => {
        const ruta = anuncio.imagen_principal || '../recursos/img/imagen-no-disponible.jpg';
        const precio = anuncio.precio ? `$${anuncio.precio}` : 'Precio no disponible';
        
        html += `
          <div class="ads-card" data-anuncio-id="${anuncio.anuncioId}">
            <div class="ads-card-img" style="position:relative;">
              <div class="bookmark-icon-label" data-anuncio-id="${anuncio.anuncioId}" title="Agregar a favoritos">
                <span class="fa fa-bookmark" data-is-favorite="false"></span>
              </div>
              <a href="#">
                <div class="ads-card-img-container">
                  <img src="../../${ruta}" alt="${anuncio.titulo}" onerror="this.src='../../recursos/img/imagen-no-disponible.jpg'">
                </div>
              </a>
            </div>
            <div class="ads-card-details">
              <div class="ads-card-tags">
                <div class="ads-card-category">${anuncio.subcategoria || 'Sin categoría'}</div>
                <div class="ads-card-condition">${anuncio.estado || 'No especificado'}</div>
              </div>
              <h3 class="ads-card-title">${anuncio.titulo}</h3>
              <p class="ads-card-price">${precio}</p>
            </div>
            <div class="ads-card-vendor">
              <div class="ads-card-vendor-label">Vendedor:</div>
              <div class="ads-card-vendor-name">${anuncio.usuarioNombre || 'Usuario desconocido'}</div>
            </div>
          </div>`;
      });
      
      const containerAnuncios = document.querySelector('#ads-grid');
      containerAnuncios.innerHTML = html;
      
      // Reconfigurar eventos de favoritos
      setupFavoriteHandlers();
    })
    .catch(error => {
      console.error('Error en búsqueda filtrada:', error);
    });
}

// Función para obtener el ID del usuario de manera robusta
function getUserId() {
  if (!usuario) return null;
  
  // Intentar diferentes propiedades comunes
  const posibleId = usuario.usuarioId || usuario.id || usuario.userId || usuario.user_id;
  
  console.log('Obteniendo ID del usuario:', {
    usuario: usuario,
    usuarioId: usuario.usuarioId,
    id: usuario.id,
    userId: usuario.userId,
    user_id: usuario.user_id,
    resultado: posibleId
  });
  
  return posibleId;
}

// Función para cargar anuncios inicial (será llamada desde DOMContentLoaded)
function cargarAnunciosInicial() {
  console.log('Iniciando carga de datos...');
  console.log('Usuario para petición:', usuario);

  // No aplicar filtros automáticamente aquí, solo cargar todos los anuncios
  // Los filtros se aplicarán después si hay parámetros en la URL
  const apiUrl = '/api/anuncios/buscar'; // Sin parámetros para cargar todos
  console.log('Cargando todos los anuncios inicialmente');

  return Promise.all([
  fetch(apiUrl).then(res => {
    console.log('Status respuesta anuncios:', res.status);
    return res.json();
  }),
  usuario && getUserId() ? 
    fetch(`/api/anuncios_guardados/${getUserId()}`).then(res => {
      console.log('Status respuesta guardados:', res.status);
      console.log('URL llamada:', `/api/anuncios_guardados/${getUserId()}`);
      return res.json();
    }) : 
    Promise.resolve([])
]).then(([anuncios, guardados]) => {
  console.log('=== DATOS RECIBIDOS ===');
  console.log('Total anuncios:', anuncios.length);
  console.log('Anuncios (primeros 2):', anuncios.slice(0, 2));
  console.log('Anuncios guardados:', guardados);
  console.log('Tipo de guardados:', typeof guardados, Array.isArray(guardados));
  
  // Actualizar contador de anuncios
  const totalAnunciosElement = document.getElementById('totalAnuncios');
  if (totalAnunciosElement) {
    totalAnunciosElement.textContent = anuncios.length;
  }
  
  // Validar que guardados sea array
  anunciosGuardados = Array.isArray(guardados) ? guardados.map(a => {
    console.log('Procesando guardado:', a);
    return a.anuncioId || a;
  }) : [];
  
  console.log('IDs de anuncios guardados procesados:', anunciosGuardados);
  
  let html = '';
    anuncios.forEach((anuncio, index) => {
    // Solo mostrar detalles de los primeros 3 anuncios para no saturar la consola
    if (index < 3) {
      console.log(`=== ANUNCIO ${index + 1} ===`);
      console.log('Datos completos:', anuncio);
      console.log('ID:', anuncio.anuncioId || anuncio.id);
      console.log('Título:', anuncio.titulo);
      console.log('Subcategoría:', anuncio.subcategoriaNombre);
      console.log('Usuario:', anuncio.usuarioNombre);
      console.log('Imágenes:', anuncio.imagenes?.length || 0);
    }
    
    // Manejar imagen por defecto
    let ruta = '../recursos/img/imagen-no-disponible.jpg';
    if (anuncio.imagenes && anuncio.imagenes.length > 0) {
      const principal = anuncio.imagenes.find(img => img.es_principal === 1) || anuncio.imagenes[0];
      ruta = principal.ruta_archivo;
    }
    
    // Verificar si está guardado
    const anuncioIdFinal = anuncio.anuncioId || anuncio.id;
    const isGuardado = anunciosGuardados.includes(anuncioIdFinal);
    
    if (index < 3) {
      console.log('¿Está guardado?', isGuardado);
      console.log('ID final:', anuncioIdFinal, 'Tipo:', typeof anuncioIdFinal);
      console.log('Lista guardados:', anunciosGuardados);
    }
    const bookmarkId = `bookmark-${anuncioIdFinal}`;
    
    // Manejar datos faltantes con valores por defecto
    const subcategoriaNombre = anuncio.subcategoriaNombre || 'Sin categoría';
    const estado = anuncio.estado || 'No especificado';
    const titulo = anuncio.titulo || 'Sin título';
    const precio = anuncio.precio ? `$${anuncio.precio}` : 'Precio no disponible';
    const usuarioNombre = anuncio.usuarioNombre || 'Usuario desconocido';
    
    html += `
      <div class="ads-card" data-anuncio-id="${anuncioIdFinal}">
        <div class="ads-card-img" style="position:relative;">
          <div class="bookmark-icon-label" data-anuncio-id="${anuncioIdFinal}" title="${isGuardado ? 'Quitar de favoritos' : 'Agregar a favoritos'}" aria-label="${isGuardado ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
            <span class="fa fa-bookmark${isGuardado ? ' active' : ''}" data-is-favorite="${isGuardado}"></span>
          </div>
          <a href="#">
            <div class="ads-card-img-container">
              <img src="../../${ruta}" alt="${titulo}" onerror="this.src='../../recursos/img/imagen-no-disponible.jpg'">
            </div>
          </a>
        </div>
        <div class="ads-card-details">
          <div class="ads-card-tags">
            <div class="ads-card-category">${subcategoriaNombre}</div>
            <div class="ads-card-condition">${estado}</div>
          </div>
          <h3 class="ads-card-title">${titulo}</h3>
          <p class="ads-card-price">${precio}</p>
        </div>
        <div class="ads-card-vendor">
          <div class="ads-card-vendor-label">Vendedor:</div>
          <div class="ads-card-vendor-name">${usuarioNombre}</div>
        </div>
      </div>`;
  });
  
  const containerAnuncios = document.querySelector('#ads-grid');
  containerAnuncios.innerHTML = html;
  // 3. Configurar eventos de favoritos y filtros
  setupFavoriteHandlers();
  setupFilterHandlers();
  
  // 4. Cargar categorías en selects
  cargarCategoriasEnSelects();
  
})
.catch(error => {
  console.error('=== ERROR AL CARGAR DATOS ===');
  console.error('Error completo:', error);
  console.error('Stack trace:', error.stack);
  
  const containerAnuncios = document.querySelector('#ads-grid');
  containerAnuncios.innerHTML = `
    <div style="padding: 20px; text-align: center; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 20px;">
      <h3 style="color: #c33;">Error al cargar los anuncios</h3>
      <p>Detalles del error: ${error.message}</p>
      <p>Por favor, revisa la consola del navegador y verifica que el servidor esté ejecutándose.</p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Intentar de nuevo
      </button>    </div>
  `;
  });
}

// Función para configurar los manejadores de eventos de favoritos
function setupFavoriteHandlers() {
  const containerAnuncios = document.querySelector('#ads-grid');
  
  // Manejar clics en íconos de favoritos
  containerAnuncios.addEventListener('click', function(e) {
    const bookmarkLabel = e.target.closest('.bookmark-icon-label');
    if (!bookmarkLabel) return;
      e.preventDefault();
    e.stopPropagation();
    
    if (!usuario) {
      console.log('Usuario no encontrado, redirigiendo al login');
      alert('Debes iniciar sesión para guardar anuncios');
      window.location.href = '/pages/Login.html';
      return;
    }
    
    const userId = getUserId();
    console.log('ID de usuario obtenido:', userId);
    
    if (!userId) {
      console.error('Usuario sin ID válido:', usuario);
      alert('Error: Usuario sin ID válido. Por favor, inicia sesión nuevamente.');
      localStorage.removeItem('usuario');
      window.location.href = '/pages/Login.html';
      return;
    }
    
    const anuncioId = bookmarkLabel.getAttribute('data-anuncio-id');
    const bookmarkIcon = bookmarkLabel.querySelector('.fa-bookmark');
    const isFavorite = bookmarkIcon.getAttribute('data-is-favorite') === 'true';
    
    if (isFavorite) {
      // Si ya es favorito, mostrar modal de confirmación
      showRemoveConfirmation(anuncioId);
    } else {
      // Si no es favorito, agregar inmediatamente
      addToFavorites(anuncioId, bookmarkLabel);
    }
  });
  
  // Configurar modal de confirmación
  setupConfirmationModal();
}

// Función para mostrar modal de confirmación
function showRemoveConfirmation(anuncioId) {
  pendingRemoveAnuncioId = anuncioId;
  const modal = document.getElementById('confirmModal');
  modal.style.display = 'flex';
  
  // Enfocar el botón de confirmar para accesibilidad
  setTimeout(() => {
    document.getElementById('confirmRemove').focus();
  }, 100);
}

// Función para ocultar modal
function hideConfirmationModal() {
  const modal = document.getElementById('confirmModal');
  modal.classList.add('fade-out');
  
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('fade-out');
    pendingRemoveAnuncioId = null;
  }, 200);
}

// Configurar eventos del modal
function setupConfirmationModal() {
  const modal = document.getElementById('confirmModal');
  const cancelBtn = document.getElementById('confirmCancel');
  const confirmBtn = document.getElementById('confirmRemove');
  
  // Cancelar
  cancelBtn.addEventListener('click', hideConfirmationModal);
  
  // Confirmar eliminación
  confirmBtn.addEventListener('click', () => {
    if (pendingRemoveAnuncioId) {
      removeFromFavorites(pendingRemoveAnuncioId);
      hideConfirmationModal();
    }
  });
  
  // Cerrar modal al hacer clic en el overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideConfirmationModal();
    }
  });
  
  // Cerrar modal con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      hideConfirmationModal();
    }
  });
}

// Función para agregar a favoritos (optimista)
function addToFavorites(anuncioId, bookmarkLabel) {
  const bookmarkIcon = bookmarkLabel.querySelector('.fa-bookmark');
  const userId = getUserId();
  
  console.log('Agregando a favoritos:', { 
    usuarioId: userId, 
    anuncioId: parseInt(anuncioId),
    usuario: usuario
  });
  
  // Cambio visual inmediato (optimista)
  bookmarkIcon.classList.add('active');
  bookmarkIcon.setAttribute('data-is-favorite', 'true');
  bookmarkLabel.title = 'Quitar de favoritos';
  bookmarkLabel.setAttribute('aria-label', 'Quitar de favoritos');
  
  // Actualizar lista local
  anunciosGuardados.push(parseInt(anuncioId));
  
  // Enviar al servidor
  fetch('/api/anuncios_guardados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      usuarioId: parseInt(userId), 
      anuncioId: parseInt(anuncioId) 
    })
  })
  .then(response => {
    console.log('Response status:', response.status);
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.message || 'Error al guardar anuncio');
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Anuncio guardado exitosamente:', data);
  })
  .catch(error => {
    console.error('Error al guardar anuncio:', error);
    
    // Revertir cambios visuales en caso de error
    bookmarkIcon.classList.remove('active');
    bookmarkIcon.setAttribute('data-is-favorite', 'false');
    bookmarkLabel.title = 'Agregar a favoritos';
    bookmarkLabel.setAttribute('aria-label', 'Agregar a favoritos');
    
    // Revertir lista local
    const index = anunciosGuardados.indexOf(parseInt(anuncioId));
    if (index > -1) {
      anunciosGuardados.splice(index, 1);
    }
    
    alert('Error al guardar el anuncio en favoritos: ' + error.message);
  });
}

// Función para quitar de favoritos (después de confirmación)
function removeFromFavorites(anuncioId) {
  const userId = getUserId();
  
  console.log('Quitando de favoritos:', { 
    usuarioId: userId, 
    anuncioId: parseInt(anuncioId),
    usuario: usuario
  });

  fetch('/api/anuncios_guardados', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      usuarioId: parseInt(userId), 
      anuncioId: parseInt(anuncioId) 
    })
  })
  .then(response => {
    console.log('Response status:', response.status);
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.message || 'Error al quitar anuncio de favoritos');
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Anuncio quitado de favoritos exitosamente:', data);
    
    // Solo después del éxito del servidor, actualizar la interfaz
    const bookmarkLabel = document.querySelector(`[data-anuncio-id="${anuncioId}"]`);
    if (bookmarkLabel) {
      const bookmarkIcon = bookmarkLabel.querySelector('.fa-bookmark');
      bookmarkIcon.classList.remove('active');
      bookmarkIcon.setAttribute('data-is-favorite', 'false');
      bookmarkLabel.title = 'Agregar a favoritos';
      bookmarkLabel.setAttribute('aria-label', 'Agregar a favoritos');
    }
    
    // Actualizar lista local
    const index = anunciosGuardados.indexOf(parseInt(anuncioId));
    if (index > -1) {
      anunciosGuardados.splice(index, 1);
    }
  })
  .catch(error => {
    console.error('Error al quitar anuncio de favoritos:', error);
    alert('Error al quitar el anuncio de favoritos: ' + error.message);
  });
}

// Función para cargar categorías en los selects
async function cargarCategoriasEnSelects() {
  try {
    const response = await fetch('/api/categorias');
    const categorias = await response.json();
    
    const categoriaSelect = document.getElementById('product-filter');
    if (categoriaSelect) {
      // Limpiar opciones existentes (excepto "Todas las Categorías")
      categoriaSelect.innerHTML = '<option value="all">Todas las Categorías</option>';
      
      // Añadir categorías
      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.nombre;
        option.textContent = categoria.nombre;
        categoriaSelect.appendChild(option);
      });
    }
    
    console.log('Categorías cargadas en select:', categorias.length);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// Función para cargar subcategorías cuando se selecciona una categoría
async function cargarSubcategorias(categoriaNombre) {
  try {
    const subcategoriaSelect = document.getElementById('filtro-subcategorias');
    if (!subcategoriaSelect) return;
    
    // Limpiar subcategorías
    subcategoriaSelect.innerHTML = '<option value="all">Todas las Subcategorías</option>';
    
    if (!categoriaNombre || categoriaNombre === 'all') {
      return;
    }
    
    console.log('Cargando subcategorías para:', categoriaNombre);
    
    const response = await fetch(`/api/subcategorias/por-categoria/${encodeURIComponent(categoriaNombre)}`);
    if (!response.ok) {
      console.error('Error al obtener subcategorías:', response.status);
      return;
    }
    
    const subcategorias = await response.json();
    console.log('Subcategorías obtenidas:', subcategorias);
      // Añadir subcategorías al select
    subcategorias.forEach(subcategoria => {
      const option = document.createElement('option');
      option.value = subcategoria.nombre; // Usar nombre en lugar de ID
      option.textContent = subcategoria.nombre;
      subcategoriaSelect.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error al cargar subcategorías:', error);
  }
}

// Función para configurar eventos de filtros
function setupFilterHandlers() {
  // Manejar cambio en select de categorías
  const categoriaSelect = document.getElementById('product-filter');
  if (categoriaSelect) {
    categoriaSelect.addEventListener('change', function() {
      const categoriaSeleccionada = this.value;
      cargarSubcategorias(categoriaSeleccionada);
    });
  }
  
  // Manejar envío del formulario de filtros
  const filterForm = document.getElementById('filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      realizarBusquedaFiltrada();
    });
  }
  
  // Manejar búsqueda en tiempo real
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (this.value.length >= 3 || this.value.length === 0) {
          realizarBusquedaFiltrada();
        }
      }, 500);
    });
  }
}

// Aplicar filtros desde URL al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded ejecutándose...');
  
  // 1. Cargar categorías en los selects primero
  await cargarCategoriasEnSelects();
  
  // 2. Verificar si hay parámetros de URL
  const params = getUrlParams();
  console.log('Parámetros de URL detectados:', params);
  
  // 3. Si hay parámetros, aplicar filtros y buscar
  if (params.categoria || params.busqueda) {
    console.log('Aplicando filtros desde URL...');
    aplicarFiltrosDesdeURL();
  } else {
    // 4. Si no hay parámetros, cargar todos los anuncios
    console.log('No hay filtros en URL, cargando todos los anuncios...');
    await cargarAnunciosInicial();
  }
});