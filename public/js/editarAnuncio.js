
// Lógica para alternar pestañas, precargar datos y manejar el formulario de edición de anuncio

// Utilidad para obtener query params
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// (Futuro) Obtener usuario autenticado desde localStorage/sessionStorage
// function getUsuarioId() {
//     // return localStorage.getItem('usuarioId') || null;
// }

document.addEventListener('DOMContentLoaded', function () {
    // Tabs
    const tabInfo = document.querySelector('.tab-button[data-tab="information"]');
    const tabImages = document.querySelector('.tab-button[data-tab="images"]');
    const infoSection = document.querySelector('.form-section[data-section="basic-info"]').parentElement;
    const imagesSection = document.getElementById('images-section');

    tabInfo.addEventListener('click', function () {
        tabInfo.classList.add('active');
        tabImages.classList.remove('active');
        infoSection.style.display = 'block';
        imagesSection.style.display = 'none';
    });
    tabImages.addEventListener('click', function () {
        tabImages.classList.add('active');
        tabInfo.classList.remove('active');
        infoSection.style.display = 'none';
        imagesSection.style.display = 'block';
    });

    // Lógica de previsualización y controles de imágenes (idéntica a la de crear anuncio)
    const wrappers = document.querySelectorAll('.ad-image-wrapper');
    const previewImages = document.querySelectorAll('.preview-image');
    const controls = document.querySelectorAll('.image-controls');
    const inputs = document.querySelectorAll('.image-input');
    const currentImages = document.querySelectorAll('.current-image');

    wrappers.forEach((wrapper, idx) => {
        wrapper.addEventListener('click', function (e) {
            if (e.target.closest('.control-btn')) return;
            if (wrapper.getAttribute('data-status') === 'empty') {
                inputs[idx].click();
            }
        });
        const changeBtn = wrapper.querySelector('.change-image');
        if (changeBtn) {
            changeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                inputs[idx].click();
            });
        }
    });

    inputs.forEach((input, idx) => {
        input.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    previewImages[idx].src = event.target.result;
                    previewImages[idx].style.display = 'block';
                    wrappers[idx].setAttribute('data-status', 'modified');
                    wrappers[idx].querySelector('.image-controls').style.display = 'flex';
                    const placeholder = wrappers[idx].querySelector('.image-placeholder');
                    if (placeholder) placeholder.style.display = 'none';
                    if (currentImages[idx]) currentImages[idx].style.display = 'none';
                };
                reader.readAsDataURL(file);
            } else {
                previewImages[idx].src = '';
                previewImages[idx].style.display = 'none';
                wrappers[idx].setAttribute('data-status', currentImages[idx] && currentImages[idx].src ? 'current' : 'empty');
                wrappers[idx].querySelector('.image-controls').style.display = (currentImages[idx] && currentImages[idx].src) ? 'flex' : 'none';
                const placeholder = wrappers[idx].querySelector('.image-placeholder');
                if (placeholder) placeholder.style.display = (currentImages[idx] && currentImages[idx].src) ? 'none' : 'flex';
                if (currentImages[idx] && currentImages[idx].src) currentImages[idx].style.display = 'block';
            }
        });
    });

    controls.forEach((control, idx) => {
        const removeBtn = control.querySelector('.remove-image');
        removeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            inputs[idx].value = '';
            previewImages[idx].src = '';
            previewImages[idx].style.display = 'none';
            if (currentImages[idx] && currentImages[idx].src) {
                wrappers[idx].setAttribute('data-status', 'removed');
                currentImages[idx].style.display = 'none';
            } else {
                wrappers[idx].setAttribute('data-status', 'empty');
            }
            control.style.display = 'none';
            const placeholder = wrappers[idx].querySelector('.image-placeholder');
            if (placeholder) placeholder.style.display = 'flex';
        });
    });

    // --- Precarga de datos del anuncio ---
    const anuncioId = getQueryParam('id');
    if (anuncioId) {
        fetch(`/api/anuncios/${anuncioId}/con-imagenes`)
            .then(res => res.json())
            .then(anuncio => {
                // Precargar campos de texto y selects
                document.getElementById('input-titulo-anuncio').value = anuncio.titulo || '';
                document.getElementById('input-descripcion-anuncio').value = anuncio.descripcion || '';
                document.getElementById('input-precio-anuncio').value = anuncio.precio || '';
                document.getElementById('input-condicion-anuncio').value = anuncio.estado || '';
                document.getElementById('input-zona-anuncio').value = anuncio.zona || '';

                // Precargar selects dependientes (categoría, subcategoría, departamento, ciudad)
                // Esperar a que los selects estén llenos (por categorias.js y ubicacion.js)
                function setSelectValue(selectId, value) {
                    const select = document.getElementById(selectId);
                    if (!select) return;
                    const trySet = () => {
                        if (select.options.length > 1) {
                            select.value = value || '';
                            select.dispatchEvent(new Event('change'));
                        } else {
                            setTimeout(trySet, 100);
                        }
                    };
                    trySet();
                }
                setSelectValue('input-categoria-anuncio', anuncio.categoriaId);
                setTimeout(() => setSelectValue('input-subcategoria-anuncio', anuncio.subcategoriaId), 400);
                setSelectValue('input-departamento-anuncio', anuncio.departamentoId);
                setTimeout(() => setSelectValue('input-ciudad-anuncio', anuncio.ciudadId), 400);

                // Precargar info adicional (última actualización, vistas, mensajes)
                document.querySelectorAll('#last-updated, [data-info="last-updated"]').forEach(e => e.textContent = anuncio.fecha_actualizacion || '--');
                document.querySelectorAll('#total-views, [data-info="total-views"]').forEach(e => e.textContent = anuncio.vistas || '0');
                document.querySelectorAll('#total-messages, [data-info="total-messages"]').forEach(e => e.textContent = anuncio.mensajes || '0');

                // Precargar imágenes
                if (Array.isArray(anuncio.imagenes)) {
                    anuncio.imagenes.forEach((img, idx) => {
                        const wrapper = document.querySelector(`.ad-image-wrapper[data-image-slot="${idx}"]`);
                        if (wrapper) {
                            const currentImg = wrapper.querySelector('.current-image');
                            if (currentImg) {
                                currentImg.src = img.ruta_archivo;
                                currentImg.style.display = 'block';
                                wrapper.setAttribute('data-status', 'current');
                                wrapper.setAttribute('data-current-image', img.ruta_archivo);
                            }
                        }
                    });
                }
            });
    }

    // --- Envío del formulario por AJAX (PUT) ---
    const form = document.getElementById('edit-ad-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!anuncioId) return alert('No se encontró el ID del anuncio.');

            const formData = new FormData(form);
            // Construir objeto plano para PUT (solo datos, no imágenes)
            const data = {};
            formData.forEach((value, key) => {
                if (key !== 'images[]') data[key] = value;
            });

            fetch(`/api/anuncios/${anuncioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(resp => {
                if (resp.message && resp.message.includes('exitosamente')) {
                    alert('Anuncio actualizado correctamente.');
                    // (Opcional) Redirigir o recargar
                } else {
                    alert('Error al actualizar: ' + (resp.message || '')); 
                }
            })
            .catch(() => alert('Error de red o servidor.'));
        });
    }
});
