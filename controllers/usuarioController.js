const usuarioRepository = require("../repositories/usuarioRepository");

exports.getUsuarios = async (req, rep) => {
  try {
    const getUsuarios = await usuarioRepository.getUsuarios();
    if (!getUsuarios || getUsuarios.length === 0) {
      return rep.status(404).json({ message: "Usuarios no encontrados o no existen" });
    }
    return rep.status(200).json(getUsuarios);
  } catch (error) {
    return rep.status(500).json({ message: "Error al cargar los usuarios" });
  }
};
exports.getUsuarioById = async (req, rep) => {
  const usuarioId = req.params.usuarioId;
  try {
    const getUsuario = await usuarioRepository.getUsuarioById(usuarioId);
    if (!getUsuario || getUsuario.length === 0) {
      return rep.status(404).json({ message: "Usuario no encontrado o no existe" });
    }
    return rep.status(200).json(getUsuario);
  } catch (error) {
    console.error(error);
    return rep.status(500).json({
      message: `Error al obtener el usuario con id = ${usuarioId}`,
    });
  }
};
exports.getUsuarioByCorreo = async (req, rep) => {
  const correo = req.body.correo;
  try {
    const usuario = await usuarioRepository.getUsuarioByCorreo(correo);
    if (!usuario) {
      return rep
        .status(401)
        .json({ message: "No se encontro nombre con ese correo" });
    }
    return rep.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    return rep
      .status(500)
      .json({ message: "Error al obtener usuario por correo" });
  }
};

exports.createUsuario = async (req, rep) => {
  const { nombre_completo, correo, contrasena } = req.body;
  if (!nombre_completo || typeof nombre_completo !== 'string' || !nombre_completo.trim()) {
    return rep.status(400).json({ message: "El nombre completo es obligatorio y debe ser un string no vacío" });
  }
  if (!correo || typeof correo !== 'string' || !correo.trim()) {
    return rep.status(400).json({ message: "El correo es obligatorio y debe ser un string no vacío" });
  }
  if (!contrasena || typeof contrasena !== 'string' || !contrasena.trim()) {
    return rep.status(400).json({ message: "La contraseña es obligatoria y debe ser un string no vacío" });
  }
  try {
    const nuevoUsuario = await usuarioRepository.createUsuario(
      nombre_completo,
      correo,
      contrasena
    );
    if (nuevoUsuario.affectedRows > 0) {
      return rep.status(201).json({
        message: "Se creo el usuario correctamente ",
      });
    } else if (nuevoUsuario.affectedRows === 0) {
      return rep.status(500).json({ message: "No se pudo crear el usuario" });
    }
  } catch (error) {
    if (error.code === "ER_DUP-ENTRY") {
      return rep
        .status(409)
        .json({
          message: "Error al crear ya existe un usuario con este correo ",
        });
    }
    console.error(error);
    return rep.status(500).json({ message: "Error al crear el usuario" });
  }
};

exports.deleteUsuario = async (req, rep) => {
  const usuarioId = req.params.usuarioId;
  try {
    const deleteResultado = await usuarioRepository.deleteUsuarioById(usuarioId);
    if (deleteResultado.affectedRows > 0) {
      return rep.status(200).json({ message: "Usuario correctamente eliminado" });
    } else if (deleteResultado.affectedRows === 0) {
      return rep.status(404).json({ message: "Usuario no encontrado o no existe" });
    }
  } catch (error) {
    console.error(error);
    return rep.status(500).json({ message: "Error al eliminar el usuario" });
  }
};
exports.updateUsuario = async (req, rep) => {
  const usuarioId = req.params.usuarioId;
  const { nombre_completo, correo, contrasena } = req.body;
  if (!nombre_completo || typeof nombre_completo !== 'string' || !nombre_completo.trim()) {
    return rep.status(400).json({ message: "El nombre completo es obligatorio y debe ser un string no vacío" });
  }
  if (!correo || typeof correo !== 'string' || !correo.trim()) {
    return rep.status(400).json({ message: "El correo es obligatorio y debe ser un string no vacío" });
  }
  if (!contrasena || typeof contrasena !== 'string' || !contrasena.trim()) {
    return rep.status(400).json({ message: "La contraseña es obligatoria y debe ser un string no vacío" });
  }
  try {
    const updateResultado = await usuarioRepository.updateUsuario(
      nombre_completo,
      correo,
      contrasena,
      usuarioId
    );
    if (updateResultado.affectedRows > 0) {
      return rep.status(200).json({ message: "Se actualizo el usuario corrrectamente" });
    } else if (updateResultado.affectedRows === 0) {
      return rep.status(404).json({ message: "No se encontro o no existe el usuario con ese id " });
    }
  } catch (error) {
    console.error(error);
    return rep.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

exports.login = async (req, rep) => {
  console.log("BODY:", req.body);
  const { correo, contrasena } = req.body;

  try {
    const usuario = await usuarioRepository.getUsuarioByCorreo(correo);
    if (!usuario) {
      return rep
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }
    if (usuario.contrasena !== contrasena) {
      return rep.status(401).json({ message: "contraseña incorrectos" });
    }
    delete usuario.contrasena;
    return rep.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    return rep.status(500).json({ message: "Error al hacer el login" });
  }
};

exports.registro = async (req, rep) => {
  const { nombre_completo, correo, contrasena } = req.body;
  if (!nombre_completo || typeof nombre_completo !== 'string' || !nombre_completo.trim()) {
    return rep.status(400).json({ message: "El nombre completo es obligatorio y debe ser un string no vacío" });
  }
  if (!correo || typeof correo !== 'string' || !correo.trim()) {
    return rep.status(400).json({ message: "El correo es obligatorio y debe ser un string no vacío" });
  }
  if (!contrasena || typeof contrasena !== 'string' || !contrasena.trim()) {
    return rep.status(400).json({ message: "La contraseña es obligatoria y debe ser un string no vacío" });
  }
  try {
    const registrar = await usuarioRepository.createUsuario(
      nombre_completo,
      correo,
      contrasena
    );
    if (registrar && registrar.affectedRows > 0) {
      return rep.status(201).json({
        message: "Usuario registrado correctamente",
        usuarioId: registrar.insertId,
      });
    }
    if (!registrar || registrar.affectedRows === 0) {
      return rep.status(500).json({
        message:
          "No se pudo registrar el usuario. Verifica los datos o si el correo ya está registrado.",
      });
    }
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return rep.status(409).json({ message: "El correo ya está registrado" });
    }
    console.error(error);
    return rep.status(500).json({ message: "Error al registrar el usuario" });
  }
};
