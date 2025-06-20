const usuarioRepository = require('../repositories/usuarioRepository')


exports.getUsuarios = async(req, rep) => {
     
    const getUsuarios = await usuarioRepository.getUsuarios()

    try {
        if (!getUsuarios || getUsuarios.length === 0) {
            return rep.status(404).json({ "message": "Usuarios no encontrados o no existen" });
        } else if (getUsuarios.length > 0) {
            return rep.status(201).json(getUsuarios);
        }
    } catch (error) {
        return rep.status(500).json({ message :"Error al cargar los usuarios"})
    }
    
}
exports.getUsuarioById = async (req, rep) => {
    const usuarioId = req.params.usuarioId

    try {
        const getUsuario = await usuarioRepository.getUsuarioById(usuarioId)

        if (!getUsuario || getUsuario.length === 0) {
            return rep.status(404).json({ "message": "Usuario no encontrado o no existe" });
        } else if (getUsuario.length > 0) {
            return rep.status(201).json(getUsuario);
        }
        
    } catch (error) {
        console.error(error)
        return rep.status(500).json({
            message:`Error al obtener el usuario con id = ${usuarioId}` //// usa esta coma `contenido con variable`
        })
    }
}

exports.createUsuario = async (req, rep) => {
    const nombre_completo = req.body.nombre_completo;
    const correo = req.body.correo;
    const contrasena = req.body.contrasena;

    try {
        const nuevoUsuario = await usuarioRepository.createUsuario(nombre_completo, correo, contrasena);
        if (nuevoUsuario.affectedRows > 0) {
            return rep.status(201).json({
                "message": "Se creo el usuario correctamente "
            })

        } else if (nuevoUsuario.affectedRows === 0) {
            return rep.status(401).json({ "message": "No se pudo crear el usuario" })
        }
    } catch (error) {
        console.error(error);
        return rep.status(500).json({ "message": "Error al crear el usuario" })
    }


}

exports.deleteUsuario = async (req, rep) => {
    const usuarioId = req.params.usuarioId;
    try {
        
        const deleteResultado = await usuarioRepository.deleteUsuarioById(usuarioId);
        if (deleteResultado.affectedRows > 0) {
            return rep.status(201).json({ "message": "Usuario correctamente eliminado" });
        } else if (deleteResultado.affectedRows === 0) {
            return rep.status(401).json({ "message": "Usuario no encontrado o no existe" });
        }


    } catch (error) {
        console.error(error);
        return rep.status(500).json({ "message": "Error al eliminar el usuario" });

    }

}
exports.updateUsuario = async (req, rep) => {
    const usuarioId = req.body.usuarioId
    const nombre_completo = req.body.nombre_completo
    const correo = req.body.correo
    const contrasena = req.body.contrasena

    try {
        const updateResultado = await usuarioRepository.updateUsuario(nombre_completo,correo,contrasena,usuarioId)
        if (updateResultado.affectedRows > 0) {
            return rep.status(201).json({ message: "Se actualizo el usuario corrrectamente" })

        } else if (updateResultado.affectedRows === 0) {
            return rep.status(401).json({ message: "No se encontro o no existe el usuario con ese id " })
        }
    } catch (error) {
        console.error(error)
        return rep.status(500).json({ message: "Error al actualizar el usuario" })
    }

}

exports.login = async (req, rep) => {   //si algo es asyncrono la funcion debe ser asincrona
    const correo = req.body.correo;
    const contrasena = req.body.contrasena;


    try {
        const cuenta = await usuarioRepository.getUsuarioById(correo);
        if (!cuenta) {
            return rep.status(401).json('message:Usuario o contraseña incorrectos')
        }
        if (cuenta.contrasena !== contrasena) {
            return rep.status(401).json('message:Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error(error);
        return rep.status(500).json('Error al hacer el login')
    }



}