# 🤝 Guía de Contribución - AstroMarket

¡Gracias por tu interés en contribuir a AstroMarket! Esta guía te ayudará a comenzar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Pruebas](#pruebas)
- [Documentación](#documentación)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código.

### Comportamiento Esperado

- Usa un lenguaje acogedor e inclusivo
- Respeta los diferentes puntos de vista y experiencias
- Acepta críticas constructivas de manera elegante
- Enfócate en lo que es mejor para la comunidad

## 🚀 Cómo Contribuir

### Reportar Bugs

Antes de crear un issue:
1. Verifica que el bug no haya sido reportado anteriormente
2. Incluye pasos para reproducir el problema
3. Proporciona información del entorno (OS, versión de Node.js, etc.)

**Template para reportar bugs:**
```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Scroll hacia '...'
4. Ver error

**Comportamiento Esperado**
Descripción de lo que esperabas que pasara.

**Screenshots**
Si aplica, agregar screenshots para ayudar a explicar el problema.

**Información del Entorno:**
- OS: [ej. iOS]
- Navegador: [ej. chrome, safari]
- Versión: [ej. 22]
```

### Solicitar Features

Para solicitar nuevas funcionalidades:
1. Verifica que la feature no haya sido solicitada anteriormente
2. Explica claramente la necesidad
3. Describe la solución propuesta
4. Considera alternativas

### Pull Requests

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ⚙️ Configuración del Entorno

### Configuración Inicial

```bash
# Clonar tu fork
git clone https://github.com/TU_USERNAME/Proyecto-final-Web.git
cd Proyecto-final-Web

# Agregar el upstream
git remote add upstream https://github.com/Mario-pereyra/Proyecto-final-Web.git

# Instalar dependencias
npm install

# Configurar base de datos
mysql -u root -p < db/db_astroMarket.sql

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### Mantener tu Fork Actualizado

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## 🔄 Proceso de Desarrollo

### Flujo de Trabajo

1. **Sincronizar** con upstream antes de comenzar
2. **Crear rama** específica para la feature/bugfix
3. **Desarrollar** siguiendo los estándares de código
4. **Probar** localmente
5. **Documentar** cambios si es necesario
6. **Commit** con mensajes descriptivos
7. **Push** y crear Pull Request

### Convenciones de Nombrado

#### Ramas
- `feature/nombre-de-la-feature`
- `bugfix/descripcion-del-bug`
- `hotfix/descripcion-urgente`
- `docs/actualizacion-documentacion`

#### Commits
Usar formato: `tipo(scope): descripción`

Tipos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan lógica)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

Ejemplos:
```bash
feat(auth): add password reset functionality
fix(api): resolve user registration validation
docs(readme): update installation instructions
```

## 📝 Estándares de Código

### JavaScript

- Usar `const` y `let` en lugar de `var`
- Preferir arrow functions cuando sea apropiado
- Usar template literals para strings
- Mantener funciones pequeñas y enfocadas
- Agregar comentarios para lógica compleja

```javascript
// ✅ Bueno
const getUserById = async (id) => {
    try {
        const user = await userRepository.findById(id);
        return user;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        throw error;
    }
};

// ❌ Evitar
function getUser(id) {
    var user = userRepository.findById(id);
    return user;
}
```

### CSS

- Usar nombres de clases descriptivos
- Seguir metodología BEM cuando sea apropiado
- Mantener especificidad baja
- Usar custom properties (CSS variables)

```css
/* ✅ Bueno */
.product-card {
    --card-padding: 1rem;
    padding: var(--card-padding);
}

.product-card__title {
    font-size: 1.2rem;
    font-weight: bold;
}

/* ❌ Evitar */
.card {
    padding: 16px;
}

.card div h3 {
    font-size: 18px;
    font-weight: bold;
}
```

### HTML

- Usar HTML semántico
- Incluir atributos `alt` en imágenes
- Usar `data-*` attributes para JavaScript hooks
- Mantener estructura limpia e indentada

## 🧪 Pruebas

### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas específicas
npm test -- --grep "user authentication"

# Ejecutar con coverage
npm run test:coverage
```

### Escribir Pruebas

- Agregar pruebas para nuevas funcionalidades
- Mantener coverage alto
- Usar nombres descriptivos para tests
- Seguir patrón Arrange-Act-Assert

```javascript
describe('User Authentication', () => {
    it('should return user data on successful login', async () => {
        // Arrange
        const loginData = {
            correo: 'test@example.com',
            contrasena: 'password123'
        };

        // Act
        const result = await authController.login(loginData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.usuario).toBeDefined();
        expect(result.usuario.correo).toBe(loginData.correo);
    });
});
```

## 📚 Documentación

### Actualizar Documentación

Cuando hagas cambios que afecten:
- **API**: Actualizar `docs/API.md`
- **Instalación**: Actualizar `docs/INSTALLATION.md`
- **Funcionalidades**: Actualizar `README.md`

### Escribir Documentación

- Usar lenguaje claro y conciso
- Incluir ejemplos cuando sea posible
- Mantener estructura consistente
- Revisar gramática y ortografía

## 🎯 Áreas de Contribución

### Frontend
- Mejoras de UI/UX
- Responsive design
- Optimizaciones de rendimiento
- Accesibilidad

### Backend
- Optimización de APIs
- Seguridad
- Manejo de errores
- Escalabilidad

### Base de Datos
- Optimización de queries
- Migraciones
- Índices
- Backup strategies

### Documentación
- Guías de usuario
- Documentación técnica
- Ejemplos de código
- Tutoriales

## 📞 Contacto

- **Issues**: Para reportar bugs o solicitar features
- **Discussions**: Para preguntas generales
- **Email**: mario.pereyra@email.com

¡Gracias por contribuir a AstroMarket! 🚀