// Menú desplegable para el perfil de usuario

document.addEventListener('DOMContentLoaded', function() {
  const profileTrigger = document.getElementById('profile-trigger');
  const profileMenu = document.getElementById('header-profile-menu');

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
});
