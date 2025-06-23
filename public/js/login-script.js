
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    loguerse();
});

async function loguerse() {
    const msgErrorEmail = document.querySelector("#msg-error-email");
    msgErrorEmail.innerHTML = "";
    const msgErrorContrasena = document.querySelector("#msg-error-contrasena");
    msgErrorContrasena.innerHTML = "";

    const inputEmail = document.querySelector("#input-email");
    const inputcontrasena = document.querySelector("#input-contrasena");

    let hayError = false;

    const correo = inputEmail.value.trim();
    if (correo === "") {
        msgErrorEmail.innerHTML = "Ingresa un correo";
        hayError = true;
    }

    const contrasena = inputcontrasena.value;
    if (contrasena === "") {
        msgErrorContrasena.innerHTML = "Ingresa una contraseña";
        hayError = true;
    }

    if (hayError) return;

    // Llamada a la API de login
    try {
        const resp = await fetch('http://localhost:3000/api/usuario/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        const data = await resp.json();
        if (!resp.ok) {
            if (data.message && data.message.toLowerCase().includes('contraseña')) {
                msgErrorContrasena.innerHTML = data.message;
            } else if (data.message && data.message.toLowerCase().includes('usuario')) {
                msgErrorEmail.innerHTML = data.message;
            } else {
                msgErrorEmail.innerHTML = data.message || 'Error de autenticación';
            }
            return;
        }
        // Guardar usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify({
            usuarioId: data.usuarioId,
            nombre: data.nombre_completo,
            rol: data.rol || 'Usuario',
            avatar: data.avatar || 'recursos/img/npc.jpg',
            correo: data.correo
        }));
        if (window.refrescarHeaderUsuario) window.refrescarHeaderUsuario();
        // Redirigir o recargar
        window.location.href = '/index.html';
    } catch (err) {
        msgErrorEmail.innerHTML = 'Error de red o servidor';
    }
}


function cerrarSesion() {
    localStorage.removeItem('usuario');
    if (window.refrescarHeaderUsuario) window.refrescarHeaderUsuario();
    window.location.href = '/login.html';
}