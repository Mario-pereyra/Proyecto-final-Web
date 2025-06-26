
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    loguerse();
});

async function loguerse() {
    const msgErrorEmail = document.querySelector("#msg-error-email");
    msgErrorEmail.innerHTML = "";
    const msgErrorContrasena = document.querySelector("#msg-error-contrasena");
    msgErrorContrasena.innerHTML = "";
    const msgLoginGlobal = document.getElementById("msg-login-global");
    const msgLoginGlobalBottom = document.getElementById("msg-login-global-bottom");
    if (msgLoginGlobal) { msgLoginGlobal.style.display = "none"; msgLoginGlobal.innerHTML = ""; }
    if (msgLoginGlobalBottom) { msgLoginGlobalBottom.style.display = "none"; msgLoginGlobalBottom.innerHTML = ""; }

    const inputEmail = document.querySelector("#input-email");
    const inputcontrasena = document.querySelector("#input-contrasena");

    let hayError = false;

    const correo = inputEmail.value.trim();
    if (correo === "") {
        msgErrorEmail.innerHTML = "Ingresa un correo";
        msgErrorEmail.classList.add("show");
        hayError = true;
    } else {
        msgErrorEmail.classList.remove("show");
    }

    const contrasena = inputcontrasena.value;
    if (contrasena === "") {
        msgErrorContrasena.innerHTML = "Ingresa una contraseña";
        msgErrorContrasena.classList.add("show");
        hayError = true;
    } else {
        msgErrorContrasena.classList.remove("show");
    }

    if (hayError) return;

    // Llamada a la API de login
    try {
        const resp = await fetch('/api/usuario/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        const data = await resp.json();
        if (!resp.ok) {
            let globalMsg = data.message || 'Error de autenticación';
            if (msgLoginGlobalBottom) {
                msgLoginGlobalBottom.innerHTML = globalMsg;
                msgLoginGlobalBottom.style.display = "block";
                msgLoginGlobalBottom.classList.add("show");
            }
            if (data.message && data.message.toLowerCase().includes('contraseña')) {
                msgErrorContrasena.innerHTML = data.message;
                msgErrorContrasena.classList.add("show");
            } else if (data.message && data.message.toLowerCase().includes('usuario')) {
                msgErrorEmail.innerHTML = data.message;
                msgErrorEmail.classList.add("show");
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
        // Mensaje de éxito
        if (msgLoginGlobal) {
            msgLoginGlobal.innerHTML = '¡Login exitoso! Redirigiendo...';
            msgLoginGlobal.style.display = "block";
            msgLoginGlobal.classList.add("show");
        }
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1200);
    } catch (err) {
        if (msgLoginGlobalBottom) {
            msgLoginGlobalBottom.innerHTML = 'Error de red o servidor';
            msgLoginGlobalBottom.style.display = "block";
            msgLoginGlobalBottom.classList.add("show");
        }
    }
}


function cerrarSesion() {
    localStorage.removeItem('usuario');
    if (window.refrescarHeaderUsuario) window.refrescarHeaderUsuario();
    window.location.href = '/login.html';
}