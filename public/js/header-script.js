document.addEventListener('DOMContentLoaded', function() {
  let usuario = null;
  try { usuario = JSON.parse(localStorage.getItem('usuario')); } catch {}
  const navPrivado = document.querySelectorAll('.nav-privado');
  const navPublico = document.querySelectorAll('.nav-publico');
  // Los de .nav-todos siempre visibles
  if (usuario && usuario.usuarioId) {
    navPrivado.forEach(el => el.style.display = '');
    navPublico.forEach(el => el.style.display = 'none');
  } else {
    navPrivado.forEach(el => el.style.display = 'none');
    navPublico.forEach(el => el.style.display = '');
  }
});

// Menú lateral/side bar de usuario y lógica de sesión
document.addEventListener('DOMContentLoaded', function() {
  const profileTrigger = document.getElementById('profile-trigger');
  const profileMenu = document.getElementById('header-profile-menu');
  function mostrarUsuarioEnHeader() {
    const userSpan = document.querySelector('.header-user-name[data-info="user-name"]');
    const roleSpan = document.querySelector('.header-user-role[data-info="user-role"]');
    const avatarImg = document.getElementById('header-profile-image');
    let usuario = null;
    try {
      usuario = JSON.parse(localStorage.getItem('usuario'));
    } catch {}
    if (usuario && usuario.usuarioId) {
      userSpan.textContent = usuario.nombre || usuario.nombre_completo || 'Usuario';
      roleSpan.textContent = usuario.rol || 'Usuario';
      if (usuario.avatar && avatarImg) avatarImg.src = usuario.avatar;
      if (profileTrigger) profileTrigger.style.display = '';
      if (profileMenu) profileMenu.style.display = '';
    } else {
      userSpan.textContent = 'Desconocido';
      roleSpan.textContent = 'Visitante';
      if (avatarImg) avatarImg.src = 'recursos/img/npc.jpg';
      if (profileTrigger) profileTrigger.style.display = '';
      if (profileMenu) profileMenu.style.display = 'none';
    }
  }
  mostrarUsuarioEnHeader();

  // Sidebar/menú lateral: solo se puede abrir si hay usuario logueado
  if (!profileTrigger || !profileMenu) return;
  profileTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!usuario || !usuario.usuarioId) return; // Solo usuarios logueados
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

  // Logout
  function logout() {
    localStorage.removeItem('usuario');
    mostrarUsuarioEnHeader();
    window.location.href = '/pages/Login.html';
  }
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
  window.refrescarHeaderUsuario = mostrarUsuarioEnHeader;
  window.logoutUsuario = logout;
});
