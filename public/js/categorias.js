// Rellena el select de categorías y subcategorías dinámicamente desde la API

document.addEventListener('DOMContentLoaded', function () {
    const categoriaSelect = document.getElementById('input-categoria-anuncio');
    const subcategoriaSelect = document.getElementById('input-subcategoria-anuncio');

    // 1. Cargar categorías al iniciar
    fetch('/api/categorias')
        .then(res => res.json())
        .then(categorias => {
            categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
            categorias.forEach(cat => {
                categoriaSelect.innerHTML += `<option value="${cat.categoriaId}">${cat.nombre}</option>`;
            });
            categoriaSelect.disabled = false;
        });

    // 2. Cuando cambia la categoría, cargar subcategorías
    categoriaSelect.addEventListener('change', function () {
        const categoriaId = this.value;
        if (!categoriaId) {
            subcategoriaSelect.innerHTML = '<option value="">Primero selecciona una categoría</option>';
            subcategoriaSelect.disabled = true;
            return;
        }
        fetch(`/api/categorias/${categoriaId}/subcategorias`)
            .then(res => res.json())
            .then(subcategorias => {
                subcategoriaSelect.innerHTML = '<option value="">Selecciona una subcategoría</option>';
                subcategorias.forEach(sub => {
                    subcategoriaSelect.innerHTML += `<option value="${sub.subcategoriaId}">${sub.nombre}</option>`;
                });
                subcategoriaSelect.disabled = false;
            });
    });
});
