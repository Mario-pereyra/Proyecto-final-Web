// Tabs funcionalidad
document.addEventListener('DOMContentLoaded', function () {
        const tabInfo = document.querySelector('.tab-button[data-tab="information"]');
        const tabImages = document.querySelector('.tab-button[data-tab="images"]');
        const formInfo = document.getElementById('create-ad-form');
        const formImages = document.getElementById('upload-images-form');

        tabInfo.addEventListener('click', function () {
            tabInfo.classList.add('active');
            tabImages.classList.remove('active');
            formInfo.style.display = 'block';
            formImages.style.display = 'none';
        });
        tabImages.addEventListener('click', function () {
            tabImages.classList.add('active');
            tabInfo.classList.remove('active');
            formInfo.style.display = 'none';
            formImages.style.display = 'block';
        });

        // Botón "Guardar y Continuar" pasa a la pestaña de imágenes
        const btnContinue = formInfo.querySelector('[data-action="save-and-continue"]');
        if (btnContinue) {
            btnContinue.addEventListener('click', function (e) {
                e.preventDefault();
                tabImages.click();
            });
        }
        // Botón "Volver" regresa a la pestaña de información
        const btnBack = formImages.querySelector('[data-action="go-back"]');
        if (btnBack) {
            btnBack.addEventListener('click', function (e) {
                e.preventDefault();
                tabInfo.click();
            });
        }

        // Lógica de previsualización de imágenes (idéntica a la de crear anuncio)
        const wrappers = formImages.querySelectorAll('.ad-image-wrapper');
        const previewImages = formImages.querySelectorAll('.preview-image');
        const controls = formImages.querySelectorAll('.image-controls');
        const inputs = formImages.querySelectorAll('.image-input');

        wrappers.forEach((wrapper, idx) => {
            wrapper.addEventListener('click', function (e) {
                if (e.target.closest('.control-btn')) return;
                inputs[idx].click();
            });
        });
        inputs.forEach((input, idx) => {
            input.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        previewImages[idx].src = event.target.result;
                        previewImages[idx].style.display = 'block';
                        wrappers[idx].setAttribute('data-status', 'filled');
                        wrappers[idx].querySelector('.image-controls').style.display = 'flex';
                        const placeholder = wrappers[idx].querySelector('.image-placeholder');
                        if (placeholder) placeholder.style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                } else {
                    previewImages[idx].src = '';
                    previewImages[idx].style.display = 'none';
                    wrappers[idx].setAttribute('data-status', 'empty');
                    wrappers[idx].querySelector('.image-controls').style.display = 'none';
                    const placeholder = wrappers[idx].querySelector('.image-placeholder');
                    if (placeholder) placeholder.style.display = 'flex';
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
                wrappers[idx].setAttribute('data-status', 'empty');
                control.style.display = 'none';
                const placeholder = wrappers[idx].querySelector('.image-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
            });
        });
    });