# 🚀 Guía de Instalación Rápida - AstroMarket

Esta guía te ayudará a configurar AstroMarket en tu entorno local de desarrollo.

## Prerrequisitos

- **Node.js** v16 o superior
- **MySQL** v8.0 o superior
- **Git**

## Instalación Paso a Paso

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Mario-pereyra/Proyecto-final-Web.git
cd Proyecto-final-Web
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Base de Datos
```bash
# Iniciar MySQL
mysql -u root -p

# Crear la base de datos
mysql> source db/db_astroMarket.sql;
mysql> exit;
```

### 4. Variables de Entorno
Crear archivo `.env`:
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=db_AstroMarket
```

### 5. Iniciar Aplicación
```bash
node index.js
```

### 6. Verificar Instalación
Abrir navegador en: http://localhost:3001

## Problemas Comunes

### Error de Conexión a Base de Datos
- Verificar que MySQL esté ejecutándose
- Confirmar credenciales en archivo `.env`
- Asegurar que la base de datos `db_AstroMarket` exista

### Error de Módulos
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Puerto en Uso
Cambiar el puerto en `.env`:
```env
PORT=3002
```

## Datos de Prueba

Para cargar datos de prueba, ejecutar:
```bash
# Los archivos JSON en /db contienen datos de ejemplo
# Pueden importarse manualmente a la base de datos
```

## Siguiente Paso

Una vez instalado, revisar la [documentación completa](../README.md) para conocer todas las funcionalidades.