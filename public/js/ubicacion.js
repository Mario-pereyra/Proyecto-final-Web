// Rellenar selects de departamento y ciudad dinámicamente desde la API

document.addEventListener('DOMContentLoaded', function () {
    const departamentoSelect = document.getElementById('input-departamento-anuncio');
    const ciudadSelect = document.getElementById('input-ciudad-anuncio');

    // 1. Cargar departamentos al iniciar
    fetch('/api/departamentos')
        .then(res => res.json())
        .then(departamentos => {
            departamentoSelect.innerHTML = '<option value="">Selecciona un departamento</option>';
            departamentos.forEach(dep => {
                departamentoSelect.innerHTML += `<option value="${dep.departamentoId}">${dep.nombre}</option>`;
            });
            departamentoSelect.disabled = false;
        });

    // 2. Cuando cambia el departamento, cargar ciudades
    departamentoSelect.addEventListener('change', function () {
        const departamentoId = this.value;
        if (!departamentoId) {
            ciudadSelect.innerHTML = '<option value="">Primero selecciona un departamento</option>';
            ciudadSelect.disabled = true;
            return;
        }
        fetch(`/api/departamentos/${departamentoId}/ciudades`)
            .then(res => res.json())
            .then(ciudades => {
                ciudadSelect.innerHTML = '<option value="">Selecciona una ciudad</option>';
                ciudades.forEach(ciudad => {
                    ciudadSelect.innerHTML += `<option value="${ciudad.ciudadId}">${ciudad.nombre}</option>`;
                });
                ciudadSelect.disabled = false;
            });
    });
});
