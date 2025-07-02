Create database db_AstroMarket;
use db_AstroMarket;
CREATE TABLE usuarios (
    usuarioId INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(100) NOT NULL
);


CREATE TABLE categorias (
    categoriaId INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE subcategorias (
    subcategoriaId INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoriaId INT NOT NULL,
    FOREIGN KEY (categoriaId) REFERENCES categorias(categoriaId)
);

CREATE TABLE departamentos (
    departamentoId INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE ciudades (
    ciudadId INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamentoId INT NOT NULL,
    FOREIGN KEY (departamentoId) REFERENCES departamentos(departamentoId)
);


CREATE TABLE anuncios (
    anuncioId INT AUTO_INCREMENT PRIMARY KEY,
    usuarioId INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoriaId INT NOT NULL,
    subcategoriaId INT NOT NULL,
    estado ENUM('nuevo', 'usado', 'seminuevo') NOT NULL,
    estado_publicacion ENUM('activo', 'inactivo', 'vendido') NOT NULL DEFAULT 'activo',
    departamentoId INT NOT NULL,
    ciudadId INT NOT NULL,
    zona VARCHAR(100),
    vistas INT DEFAULT 0,
    valoracion DECIMAL(2,1) DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuarioId) REFERENCES usuarios(usuarioId),
    FOREIGN KEY (categoriaId) REFERENCES categorias(categoriaId),
    FOREIGN KEY (subcategoriaId) REFERENCES subcategorias(subcategoriaId),
    FOREIGN KEY (departamentoId) REFERENCES departamentos(departamentoId),
    FOREIGN KEY (ciudadId) REFERENCES ciudades(ciudadId)
);

CREATE TABLE imagenes (
    imagenId INT AUTO_INCREMENT PRIMARY KEY,
    nombre_archivo VARCHAR(150) NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anuncio_imagenes (
    anuncioImagenId INT AUTO_INCREMENT PRIMARY KEY,
    anuncioId INT NOT NULL,
    imagenId INT NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT 0,
    orden INT NOT NULL,
    FOREIGN KEY (anuncioId) REFERENCES anuncios(anuncioId),
    FOREIGN KEY (imagenId) REFERENCES imagenes(imagenId)
);

CREATE TABLE anuncios_guardados (
    anuncioGuardadoId INT AUTO_INCREMENT PRIMARY KEY,
    usuarioId INT NOT NULL,
    anuncioId INT NOT NULL,
    fecha_guardado DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unico_guardado (usuarioId, anuncioId),
    FOREIGN KEY (usuarioId) REFERENCES usuarios(usuarioId),
    FOREIGN KEY (anuncioId) REFERENCES anuncios(anuncioId)
);

CREATE TABLE conversaciones (
    conversacionId INT AUTO_INCREMENT PRIMARY KEY,
    anuncioId INT NOT NULL,
    compradorId INT NOT NULL,
    vendedorId INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_mensaje DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anuncioId) REFERENCES anuncios(anuncioId),
    FOREIGN KEY (compradorId) REFERENCES usuarios(usuarioId),
    FOREIGN KEY (vendedorId) REFERENCES usuarios(usuarioId),
    UNIQUE KEY unica_conversacion (anuncioId, compradorId, vendedorId)
);

CREATE TABLE mensajes (
    mensajeId INT AUTO_INCREMENT PRIMARY KEY,
    conversacionId INT NOT NULL,
    emisorId INT NOT NULL,
    contenido TEXT,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT 0,
    estado_entrega ENUM('enviado', 'entregado', 'leido') DEFAULT 'enviado',
    FOREIGN KEY (conversacionId) REFERENCES conversaciones(conversacionId),
    FOREIGN KEY (emisorId) REFERENCES usuarios(usuarioId)
);

CREATE TABLE mensaje_imagenes (
    mensajeImagenId INT AUTO_INCREMENT PRIMARY KEY,
    mensajeId INT NOT NULL,
    imagenId INT NOT NULL,
    FOREIGN KEY (mensajeId) REFERENCES mensajes(mensajeId),
    FOREIGN KEY (imagenId) REFERENCES imagenes(imagenId)
);

CREATE TABLE auditoria_anuncios (
    auditoriaAnuncioId INT AUTO_INCREMENT PRIMARY KEY,
    anuncioId INT NOT NULL,
    usuarioId INT NOT NULL,
    cambio TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anuncioId) REFERENCES anuncios(anuncioId),
    FOREIGN KEY (usuarioId) REFERENCES usuarios(usuarioId)
);


DELIMITER $$
CREATE TRIGGER no_actualizar_fecha_creacion
BEFORE UPDATE ON anuncios
FOR EACH ROW
BEGIN
    SET NEW.fecha_creacion = OLD.fecha_creacion;
END$$
DELIMITER ;