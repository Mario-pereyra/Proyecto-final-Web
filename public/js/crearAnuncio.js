// Gestión de creación de anuncios
class CrearAnuncioManager {
    constructor() {
        this.usuario = null;
        this.form = null;
        this.init();
    }

    init() {
        // Obtener información del usuario logueado
        this.loadUserInfo();
        
        // Obtener referencias del formulario
        this.form = document.getElementById('create-ad-form');
        
        if (!this.form) {
            console.error('Formulario de crear anuncio no encontrado');
            return;
        }

        // Configurar el usuarioId en el campo oculto
        this.setUsuarioId();
        
        // Agregar event listener al formulario
        this.setupFormSubmission();
        
        // Verificar que el usuario esté logueado
        this.checkUserAuth();
    }

    loadUserInfo() {
        try {
            const usuarioData = localStorage.getItem('usuario');
            if (usuarioData) {
                this.usuario = JSON.parse(usuarioData);
                console.log('Usuario logueado:', this.usuario);
            } else {
                console.log('No hay usuario logueado');
                this.usuario = null;
            }
        } catch (error) {
            console.error('Error al cargar información del usuario:', error);
            this.usuario = null;
        }
    }

    setUsuarioId() {
        const usuarioIdInput = document.getElementById('input-usuario-id');
        
        if (usuarioIdInput) {
            if (this.usuario && this.usuario.usuarioId) {
                usuarioIdInput.value = this.usuario.usuarioId;
                console.log('UsuarioId configurado:', this.usuario.usuarioId);
            } else {
                // Si no hay usuario logueado, mantener en 0 o valor por defecto
                usuarioIdInput.value = '0';
                console.warn('No hay usuario logueado, usuarioId configurado como 0');
            }
        } else {
            console.error('Campo usuarioId no encontrado');
        }
    }    checkUserAuth() {
        if (!this.usuario || !this.usuario.usuarioId) {
            // Mostrar mensaje de advertencia si no está logueado
            this.showAuthWarning();
            // Deshabilitar el botón de envío
            this.disableSubmitButton();
        } else {
            // Remover advertencia si existe
            this.removeAuthWarning();
            // Habilitar el botón de envío
            this.enableSubmitButton();
        }
    }

    showAuthWarning() {
        // Remover advertencia existente si la hay
        this.removeAuthWarning();
        
        const formHeader = document.querySelector('.form-header');
        if (formHeader) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'auth-warning';
            warningDiv.style.cssText = `
                background-color: #fef3cd;
                border: 1px solid #fecb00;
                color: #856404;
                padding: 12px;
                border-radius: 6px;
                margin: 10px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            warningDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Para crear un anuncio debes <a href="Login.html" style="color: #0066cc; text-decoration: underline;">iniciar sesión</a> primero.</span>
            `;
            
            formHeader.appendChild(warningDiv);
        }
    }

    removeAuthWarning() {
        const existingWarning = document.querySelector('.auth-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
    }

    disableSubmitButton() {
        const submitBtn = document.querySelector('[data-action="publish-ad"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Inicia sesión para publicar';
        }
    }

    enableSubmitButton() {
        const submitBtn = document.querySelector('[data-action="publish-ad"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Publicar Anuncio';
        }
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });
    }

    handleFormSubmit(e) {
        // Verificar que el usuario esté logueado antes de enviar
        if (!this.usuario || !this.usuario.usuarioId) {
            e.preventDefault();
            alert('Debes iniciar sesión para crear un anuncio');
            window.location.href = 'Login.html';
            return false;
        }

        // Verificar que el usuarioId esté correctamente configurado
        const usuarioIdInput = document.getElementById('input-usuario-id');
        if (usuarioIdInput) {
            usuarioIdInput.value = this.usuario.usuarioId;
        }

        console.log('Enviando formulario con usuarioId:', this.usuario.usuarioId);
        
        // El formulario se enviará normalmente al servidor
        return true;
    }

    // Método para actualizar el usuario si cambia durante la sesión
    updateUser() {
        this.loadUserInfo();
        this.setUsuarioId();
        this.checkUserAuth();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.crearAnuncioManager = new CrearAnuncioManager();
});

// Escuchar cambios en el localStorage (si el usuario se logea/deslogea en otra pestaña)
window.addEventListener('storage', function(e) {
    if (e.key === 'usuario' && window.crearAnuncioManager) {
        window.crearAnuncioManager.updateUser();
    }
});
