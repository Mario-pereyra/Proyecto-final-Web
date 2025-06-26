
// 1. Obtener usuario logueado
let usuario = null;
try {
  usuario = JSON.parse(localStorage.getItem('usuario'));
} catch (e) {
  usuario = null;
}

let anunciosGuardados = [];

// 2. Traer anuncios y anuncios guardados (si hay usuario)
Promise.all([
  fetch('/api/anuncios').then(res => res.json()),
  usuario ? fetch(`/api/anuncios_guardados/${usuario.id}`).then(res => res.json()) : Promise.resolve([])
]).then(([anuncios, guardados]) => {
  anunciosGuardados = guardados.map(a => a.anuncioId || a); // por si el backend devuelve array de ids o de objetos
  let html = '';
  anuncios.forEach(anuncio => {
    let ruta = '../recursos/img/imagen-no-disponible.jpg';
    if (anuncio.imagenes && anuncio.imagenes.length > 0) {
      const principal = anuncio.imagenes.find(img => img.es_principal === 1) || anuncio.imagenes[0];
      ruta = principal.ruta_archivo;
    }
    // Icono bookmark
    const isGuardado = anunciosGuardados.includes(anuncio.anuncioId || anuncio.id);
    html += `
      <div class="ads-card" data-anuncio-id="${anuncio.anuncioId || anuncio.id}">
        <div class="ads-card-img" style="position:relative;">
          <span class="bookmark-icon fa fa-bookmark${isGuardado ? ' active' : ''}" title="Guardar anuncio"></span>
          <a href="#">
            <div class="ads-card-img-container">
              <img src="${ruta}" alt="${anuncio.titulo}">
            </div>
          </a>
        </div>
        <div class="ads-card-details">
          <div class="ads-card-tags">
            <div class="ads-card-category">${anuncio.subcategoriaId}</div> 
            <div class="ads-card-condition">${anuncio.estado}</div> 
          </div>
          <h3 class="ads-card-title">${anuncio.titulo}</h3>
          <p class="ads-card-price">$${anuncio.precio}</p>       
        </div>
        <div class="ads-card-vendor">
          <div class="ads-card-vendor-label">Vendedor:</div>
          <div class="ads-card-vendor-name">${anuncio.usuarioId}</div> 
        </div>
      </div>`;
  });
  const containerAnuncios = document.querySelector('#ads-grid');
  containerAnuncios.innerHTML = html;

  // 3. Manejar click en bookmark
  containerAnuncios.querySelectorAll('.bookmark-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      const card = this.closest('.ads-card');
      const anuncioId = card.getAttribute('data-anuncio-id');
      if (!usuario) {
        window.location.href = '/pages/Login/index.html';
        return;
      }
      if (!this.classList.contains('active')) {
        // Guardar anuncio
        fetch('/api/anuncios_guardados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId: usuario.id, anuncioId })
        })
        .then(res => {
          if (res.ok) this.classList.add('active');
        });
      } else {
        // Quitar anuncio guardado
        fetch('/api/anuncios_guardados', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId: usuario.id, anuncioId })
        })
        .then(res => {
          if (res.ok) this.classList.remove('active');
        });
      }
    });
  });
});