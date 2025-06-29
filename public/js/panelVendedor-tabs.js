// Panel de Vendedor: Tabs de navegación entre "Mis anuncios" y "Mis Mensajes"
document.addEventListener('DOMContentLoaded', function () {
    const tabAds = document.querySelector('.tab-button[data-tab="ads"]');
    const tabMessages = document.querySelector('.tab-button[data-tab="messages"]');
    const adsContainer = document.getElementById('ads-container');
    // Crear contenedor para mensajes si no existe
    let messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.id = 'messages-container';
        messagesContainer.setAttribute('data-component', 'messages-grid');
        messagesContainer.style.display = 'none';
        messagesContainer.innerHTML = `<div class="messages-placeholder" style="text-align:center;padding:40px 0;color:#888;">
            <i class="fas fa-comments" style="font-size:2rem;"></i><br>
            Aquí aparecerán tus mensajes de compradores.
        </div>`;
        adsContainer.parentNode.insertBefore(messagesContainer, adsContainer.nextSibling);
    }

    function showAds() {
        tabAds.classList.add('active');
        tabMessages.classList.remove('active');
        adsContainer.style.display = '';
        messagesContainer.style.display = 'none';
    }
    function showMessages() {
        tabMessages.classList.add('active');
        tabAds.classList.remove('active');
        adsContainer.style.display = 'none';
        messagesContainer.style.display = '';
    }
    tabAds.addEventListener('click', showAds);
    tabMessages.addEventListener('click', showMessages);
    // Mostrar anuncios por defecto
    showAds();
});
