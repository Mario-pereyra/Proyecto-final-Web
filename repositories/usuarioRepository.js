const dbConnection = require('../db/mysqlConecction');

let connection = null;

const getConnection = async () => {
    if (connection === null) {
        connection = await dbConnection();
    }
    return connection;
}

exports.getUsuarios = async () =>{
 const connection = await getConnection()
 
    const [getUsuarios] = await connection.query('SELECT* FROM usuarios')
    if (!getUsuarios || getUsuarios.length === 0){
        return null
    }
    return getUsuarios
}

exports.getUsuarioById = async (usuarioId) => {
    const connection = await getConnection();

    const [filas] = await connection.query('SELECT* FROM usuarios WHERE usuarioId = ? ', [usuarioId]);
    if (filas.length === 0) {
        return null;
    }
    return filas
}
exports.getUsuarioByCorreo = async (correo) =>{
    const connection = await getConnection();
     const [Usuario] = await connection.query('SELECT* FROM usuarios WHERE correo = ?',[correo])
    if (!Usuario || Usuario.length === 0) {
       return null;
    }
     return Usuario[0]   
}
exports.createUsuario = async (nombre_completo, correo, contrasena) => {
    const connection = await getConnection();

    const [CreateResultado] = await connection.query('INSERT INTO usuarios (nombre_completo,correo,contrasena) VALUES(? ,? ,?)', [nombre_completo, correo, contrasena]);
    if (!CreateResultado) {
        return null;
    }
    return CreateResultado
}

exports.updateUsuario = async (nombre_completo, correo, contrasena,usuarioId) => {
    const connection = await getConnection();

    const [updateResultado] = await connection.query('UPDATE usuarios SET nombre_completo = ?, correo = ?, contrasena = ? WHERE usuarioId = ?',[nombre_completo,correo,contrasena,usuarioId]);
    if (!updateResultado) {
        return null;
    }
    return updateResultado
}

exports.deleteUsuarioById = async (usuarioId) => {
    const connection = await getConnection();

    const [deleteResultado] = await connection.query("DELETE FROM usuarios WHERE usuarioId = ? ", [usuarioId]);
    
    if (!deleteResultado) {
        return null;


    }
    return deleteResultado

}
exports.createUsuario = async (nombre_completo, correo, contrasena) => {
    const connection = await getConnection();

    const [CreateResultado] = await connection.query('INSERT INTO usuarios (nombre_completo,correo,contrasena) VALUES(? ,? ,?)', [nombre_completo, correo, contrasena]);
    if (!CreateResultado) {
        return null;
    }
    return CreateResultado
}

exports.updateUsuario = async (nombre_completo, correo, contrasena,usuarioId) => {
    const connection = await getConnection();

    const [updateResultado] = await connection.query('UPDATE usuarios SET nombre_completo = ?, correo = ?, contrasena = ? WHERE usuarioId = ?',[nombre_completo,correo,contrasena,usuarioId]);
    if (!updateResultado) {
        return null;
    }
    return updateResultado
}


