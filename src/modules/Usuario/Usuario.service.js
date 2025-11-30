import UsuarioModel from './Usuario.model.js';
import bcrypt from 'bcrypt';

class UsuarioService {
  // Registrar nuevo usuario
  static async registrar(datos) {
    try {
      // Validar que el email no exista
      const emailExiste = await UsuarioModel.emailExiste(datos.email);
      if (emailExiste) {
        throw new Error('El email ya está registrado');
      }

      // Encriptar password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(datos.password, salt);

      // Crear usuario
      const nuevoUsuario = await UsuarioModel.crear({
        ...datos,
        password: passwordHash
      });

      return {
        success: true,
        data: nuevoUsuario,
        message: 'Usuario registrado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Login de usuario
  static async login(email, password) {
    try {
      // Buscar usuario por email
      const usuario = await UsuarioModel.obtenerPorEmail(email);
      
      if (!usuario) {
        throw new Error('Credenciales inválidas');
      }

      if (!usuario.activo) {
        throw new Error('Usuario inactivo');
      }

      // Verificar password
      const passwordValido = await bcrypt.compare(password, usuario.password);
      
      if (!passwordValido) {
        throw new Error('Credenciales inválidas');
      }

      // Eliminar password del objeto de respuesta
      delete usuario.password;

      return {
        success: true,
        data: usuario,
        message: 'Login exitoso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listar usuarios
  static async listar(filtros = {}) {
    try {
      const usuarios = await UsuarioModel.obtenerTodos(filtros);
      
      return {
        success: true,
        data: usuarios,
        total: usuarios.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener usuario por ID
  static async obtenerPorId(id) {
    try {
      const usuario = await UsuarioModel.obtenerPorId(id);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        data: usuario
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Actualizar usuario
  static async actualizar(id, datos) {
    try {
      // Verificar que el usuario existe
      const usuarioExiste = await UsuarioModel.obtenerPorId(id);
      if (!usuarioExiste) {
        throw new Error('Usuario no encontrado');
      }

      // Si se está actualizando el email, verificar que no exista
      if (datos.email) {
        const emailExiste = await UsuarioModel.emailExiste(datos.email, id);
        if (emailExiste) {
          throw new Error('El email ya está en uso');
        }
      }

      const usuarioActualizado = await UsuarioModel.actualizar(id, datos);

      return {
        success: true,
        data: usuarioActualizado,
        message: 'Usuario actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar usuario
  static async eliminar(id) {
    try {
      const usuario = await UsuarioModel.obtenerPorId(id);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      await UsuarioModel.eliminar(id);

      return {
        success: true,
        message: 'Usuario desactivado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas() {
    try {
      const estadisticas = await UsuarioModel.obtenerEstadisticas();

      return {
        success: true,
        data: estadisticas
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default UsuarioService;