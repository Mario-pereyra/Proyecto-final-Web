
// Menú desplegable para el perfil de usuario y lógica de sesión
document.addEventListener('DOMContentLoaded', function() {
  const profileTrigger = document.getElementById('profile-trigger');
  const profileMenu = document.getElementById('header-profile-menu');

  // --- Lógica de usuario autenticado (localStorage/sessionStorage) ---
  // Se espera que al hacer login, se guarde en localStorage:
  // localStorage.setItem('usuario', JSON.stringify({ usuarioId, nombre, rol, avatar }))
  function mostrarUsuarioEnHeader() {
    const userSpan = document.querySelector('.header-user-name[data-info="user-name"]');
    const roleSpan = document.querySelector('.header-user-role[data-info="user-role"]');
    const avatarImg = document.getElementById('header-profile-image');
    let usuario = null;
    try {
      usuario = JSON.parse(localStorage.getItem('usuario'));
    } catch {}
    if (usuario && usuario.usuarioId) {
      userSpan.textContent = usuario.nombre || 'Usuario';
      roleSpan.textContent = usuario.rol || 'Usuario';
      if (usuario.avatar && avatarImg) avatarImg.src = usuario.avatar;
    } else {
      userSpan.textContent = 'Desconocido';
      roleSpan.textContent = 'Visitante';
      if (avatarImg) avatarImg.src = 'recursos/img/npc.jpg';
    }
  }
  mostrarUsuarioEnHeader();

  // --- Menú desplegable (sin cambios) ---
  if (!profileTrigger || !profileMenu) return;

  profileTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    if (profileMenu.getAttribute('data-state') === 'visible') {
      profileMenu.setAttribute('data-state', 'hidden');
      profileMenu.style.display = 'none';
    } else {
      profileMenu.setAttribute('data-state', 'visible');
      profileMenu.style.display = 'flex';
    }
  });

  document.addEventListener('click', function() {
    if (profileMenu.getAttribute('data-state') === 'visible') {
      profileMenu.setAttribute('data-state', 'hidden');
      profileMenu.style.display = 'none';
    }
  });

  // (Opcional) Exponer función global para refrescar header tras login/logout
  window.refrescarHeaderUsuario = mostrarUsuarioEnHeader;
});
