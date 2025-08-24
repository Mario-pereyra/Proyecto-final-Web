# 📡 Documentación de API - AstroMarket

Esta documentación describe todos los endpoints disponibles en la API de AstroMarket.

## Base URL
```
http://localhost:3001/api
```

## Autenticación
La mayoría de endpoints requieren que el usuario esté autenticado. La autenticación se maneja mediante sesiones.

---

## 👥 Usuarios

### Registro de Usuario
```http
POST /api/usuario/registro
Content-Type: application/json

{
  "nombre_completo": "Juan Pérez",
  "correo": "juan@example.com",
  "contrasena": "password123"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "usuarioId": 1
}
```

### Inicio de Sesión
```http
POST /api/usuario/login
Content-Type: application/json

{
  "correo": "juan@example.com",
  "contrasena": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "usuario": {
    "usuarioId": 1,
    "nombre_completo": "Juan Pérez",
    "correo": "juan@example.com"
  }
}
```

---

## 📱 Anuncios

### Listar Anuncios
```http
GET /api/anuncios
Query Parameters:
- categoria (opcional): Filtrar por categoría
- precio_min (opcional): Precio mínimo
- precio_max (opcional): Precio máximo
- departamento (opcional): Filtrar por departamento
- busqueda (opcional): Búsqueda por texto
```

**Respuesta exitosa (200):**
```json
{
  "anuncios": [
    {
      "anuncioId": 1,
      "titulo": "iPhone 13 Pro",
      "descripcion": "iPhone en excelente estado",
      "precio": 800.00,
      "estado": "usado",
      "estado_publicacion": "activo",
      "vistas": 25,
      "fecha_creacion": "2024-01-15T10:30:00Z",
      "usuario": {
        "nombre_completo": "María García"
      },
      "categoria": {
        "nombre": "Smartphones"
      },
      "imagenes": [
        {
          "ruta_archivo": "/uploads/iphone-1.jpg",
          "es_principal": true
        }
      ]
    }
  ]
}
```

### Obtener Anuncio Específico
```http
GET /api/anuncios/:id
```

### Crear Anuncio
```http
POST /api/anuncios
Content-Type: application/json

{
  "titulo": "MacBook Pro 2023",
  "descripcion": "Laptop en perfecto estado, poco uso",
  "precio": 1500.00,
  "categoriaId": 1,
  "subcategoriaId": 2,
  "estado": "seminuevo",
  "departamentoId": 1,
  "ciudadId": 1,
  "zona": "Centro"
}
```

### Actualizar Anuncio
```http
PUT /api/anuncios/:id
Content-Type: application/json

{
  "titulo": "MacBook Pro 2023 - Actualizado",
  "precio": 1400.00
}
```

### Eliminar Anuncio
```http
DELETE /api/anuncios/:id
```

---

## 🏷️ Categorías

### Listar Categorías
```http
GET /api/categorias
```

**Respuesta exitosa (200):**
```json
{
  "categorias": [
    {
      "categoriaId": 1,
      "nombre": "Computadoras"
    },
    {
      "categoriaId": 2,
      "nombre": "Smartphones"
    }
  ]
}
```

### Listar Subcategorías
```http
GET /api/subcategorias?categoriaId=1
```

---

## 💬 Sistema de Mensajería

### Iniciar Conversación
```http
POST /api/chat/conversacion/iniciar
Content-Type: application/json

{
  "anuncioId": 1,
  "compradorId": 2,
  "vendedorId": 1
}
```

### Obtener Conversaciones de Usuario
```http
GET /api/chat/conversaciones/usuario/:usuarioId
```

**Respuesta exitosa (200):**
```json
{
  "conversaciones": [
    {
      "conversacionId": 1,
      "anuncioId": 1,
      "anuncioTitulo": "iPhone 13 Pro",
      "compradorId": 2,
      "compradorNombre": "Juan Pérez",
      "vendedorId": 1,
      "vendedorNombre": "María García",
      "ultimoMensaje": "¿Está disponible todavía?",
      "fecha_ultimo_mensaje": "2024-01-15T14:30:00Z"
    }
  ]
}
```

### Obtener Mensajes de Conversación
```http
GET /api/chat/conversacion/:conversacionId/mensajes?usuarioId=1
```

### Enviar Mensaje
```http
POST /api/chat/mensajes
Content-Type: application/json

{
  "conversacionId": 1,
  "emisorId": 1,
  "contenido": "Hola, ¿el producto sigue disponible?"
}
```

### Long Polling para Mensajes Nuevos
```http
GET /api/chat/conversacion/:conversacionId/poll?usuarioId=1&lastMessageId=5
```

---

## 📍 Ubicaciones

### Listar Departamentos
```http
GET /api/departamentos
```

### Listar Ciudades
```http
GET /api/ciudades?departamentoId=1
```

---

## 🖼️ Imágenes

### Subir Imagen
```http
POST /api/imagenes/upload
Content-Type: multipart/form-data

Form data:
- imagen: [archivo de imagen]
- anuncioId: 1
```

### Obtener Imagen
```http
GET /uploads/:filename
```

---

## 💾 Anuncios Guardados

### Guardar Anuncio
```http
POST /api/anuncios_guardados
Content-Type: application/json

{
  "usuarioId": 1,
  "anuncioId": 5
}
```

### Listar Anuncios Guardados
```http
GET /api/anuncios_guardados/usuario/:usuarioId
```

### Eliminar Anuncio Guardado
```http
DELETE /api/anuncios_guardados/:usuarioId/:anuncioId
```

---

## 📊 Códigos de Estado HTTP

- **200** - OK: Solicitud exitosa
- **201** - Created: Recurso creado exitosamente
- **400** - Bad Request: Error en la solicitud
- **401** - Unauthorized: No autorizado
- **404** - Not Found: Recurso no encontrado
- **500** - Internal Server Error: Error del servidor

## Manejo de Errores

Todas las respuestas de error siguen este formato:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Código de error específico"
}
```

## Ejemplos de Uso

### Flujo Completo: Crear y Publicar Anuncio

1. **Autenticarse**
2. **Crear anuncio**
3. **Subir imágenes**
4. **Verificar publicación**

### Flujo de Mensajería

1. **Iniciar conversación desde anuncio**
2. **Enviar mensaje inicial**
3. **Usar long polling para recibir respuestas**
4. **Continuar conversación**