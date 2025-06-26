 

const nombre_completo = document.querySelector('#input-nombreCompleto');
const email = document.querySelector('#input-email');
const contrasena = document.querySelector('#input-contrasena');
const confirmarContrasena = document.querySelector('#input-confirmarcontraseña');

const msgNombreCompleto = document.querySelector('#msg-error-nombreCompleto');
const msgEmail = document.querySelector('#msg-error-email');
const msgContrasena = document.querySelector('#msg-error-password');
const msgConfirmarContrasena = document.querySelector('#msg-error-confirmarcontraseña');

const reqLength = document.getElementById('req-length');
const reqUppercase = document.getElementById('req-uppercase');
const reqLowercase = document.getElementById('req-lowercase');
const reqNumber = document.getElementById('req-number');

async function   validarRequisitos(password) {
  let valid = true;
  // Mínimo 6 caracteres
  if (password.length >= 6) {
    reqLength.classList.add('met');
  } else {
    reqLength.classList.remove('met');
    valid = false;
  }
  // Una mayúscula
  if (/[A-Z]/.test(password)) {
    reqUppercase.classList.add('met');
  } else {
    reqUppercase.classList.remove('met');
    valid = false;
  }
  // Una minúscula
  if (/[a-z]/.test(password)) {
    reqLowercase.classList.add('met');
  } else {
    reqLowercase.classList.remove('met');
    valid = false;
  }
  // Un número
  if (/[0-9]/.test(password)) {
    reqNumber.classList.add('met');
  } else {
    reqNumber.classList.remove('met');
    valid = false;
  }
  return valid;
}

if (contrasena) {
  contrasena.addEventListener('input', function () {
    validarRequisitos(contrasena.value);
  });
}

const form = document.getElementById('register-form');
if (form) {
  form.addEventListener('submit', async function (e) {
    const msgRegisterGlobal = document.getElementById('msg-register-global');
    const msgRegisterGlobalBottom = document.getElementById('msg-register-global-bottom');
    if (msgRegisterGlobal) { msgRegisterGlobal.style.display = "none"; msgRegisterGlobal.innerHTML = ""; }
    if (msgRegisterGlobalBottom) { msgRegisterGlobalBottom.style.display = "none"; msgRegisterGlobalBottom.innerHTML = ""; }

    let hayError = false;
    // Validar nombre
    if (!nombre_completo.value.trim()) {
      hayError = true;
      msgNombreCompleto.innerHTML = 'Debe ingresar un nombre';
    } else {
      msgNombreCompleto.innerHTML = '';
    }
    // Validar email
    if (!email.value.trim()) {
      hayError = true;
      msgEmail.innerHTML = 'Debe ingresar un email';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
      hayError = true;
      msgEmail.innerHTML = 'Email inválido';
    } else {
      msgEmail.innerHTML = '';
    }
    // Validar contraseña
    if (!contrasena.value) {
      hayError = true;
      msgContrasena.innerHTML = 'Debe ingresar una contraseña';
    } else if (!await validarRequisitos(contrasena.value)) {
      hayError = true;
      msgContrasena.innerHTML = 'La contraseña no cumple los requisitos';
    } else {
      msgContrasena.innerHTML = '';
    }
    // Validar confirmación
    if (!confirmarContrasena.value) {
      hayError = true;
      msgConfirmarContrasena.innerHTML = 'Debe confirmar la contraseña';
    } else if (contrasena.value !== confirmarContrasena.value) {
      hayError = true;
      msgConfirmarContrasena.innerHTML = 'Las contraseñas no coinciden';
    } else {
      msgConfirmarContrasena.innerHTML = '';
    }
    if (hayError) {
      e.preventDefault();
      if (msgRegisterGlobalBottom) {
        msgRegisterGlobalBottom.innerHTML = 'Por favor corrige los errores antes de continuar.';
        msgRegisterGlobalBottom.style.display = "block";
        msgRegisterGlobalBottom.classList.add("show");
      }
      return;
    }
    e.preventDefault();
    try {
      const resp = await fetch('/api/usuario/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: nombre_completo.value,
          correo: email.value,
          contrasena: contrasena.value
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        let globalMsg = data.message || 'Error de registro';
        if (msgRegisterGlobalBottom) {
          msgRegisterGlobalBottom.innerHTML = globalMsg;
          msgRegisterGlobalBottom.style.display = "block";
          msgRegisterGlobalBottom.classList.add("show");
        }
        if (data.message && data.message.toLowerCase().includes('contraseña')) {
          msgContrasena.innerHTML = data.message;
        } else if (data.message && data.message.toLowerCase().includes('usuario')) {
          msgEmail.innerHTML = data.message;
        } else {
          msgEmail.innerHTML = data.message || 'Error de autenticación';
        }
        return;
      }
      if (window.refrescarHeaderUsuario) window.refrescarHeaderUsuario();
      if (msgRegisterGlobal) {
        msgRegisterGlobal.innerHTML = '¡Registro exitoso! Redirigiendo...';
        msgRegisterGlobal.style.display = "block";
        msgRegisterGlobal.classList.add("show");
      }
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1200);
    } catch (err) {
      if (msgRegisterGlobalBottom) {
        msgRegisterGlobalBottom.innerHTML = 'Error de red o servidor';
        msgRegisterGlobalBottom.style.display = "block";
        msgRegisterGlobalBottom.classList.add("show");
      }
    }
  });
}