import UsuarioModel from './Usuario.model.js';
import jwt from 'jsonwebtoken';

class UsuarioService {
  // Registrar nuevo usuario
  static async registrar(datos) {
    try {
      const { nombre, email, password, telefono, rol } = datos;

      if (!nombre || !email || !password) {
        throw new Error('Nombre, email y password son requeridos');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('El formato del email no es válido');
      }

      const emailExiste = await UsuarioModel.emailExiste(email);
      if (emailExiste) {
        throw new Error('El email ya está registrado');
      }

      const rolesPermitidos = ['cliente', 'administrador', 'empleado'];
      if (rol && !rolesPermitidos.includes(rol)) {
        throw new Error('Rol no válido');
      }

      // ✅ SIN HASH - guardar password en texto plano
      const nuevoUsuario = await UsuarioModel.crear({
        ...datos,
        password: password // Guardar directamente sin hash
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

  // ✅ Login de usuario con verificación de rol para redirección
  static async login(email, password) {
    try {
      console.log('🔍 Iniciando login para:', email);
      
      if (!email || !password) {
        throw new Error('Email y password son requeridos');
      }

      // Buscar usuario por email
      const usuario = await UsuarioModel.obtenerPorEmail(email);
      
      console.log('👤 Usuario encontrado:', usuario ? 'Sí' : 'No');
      
      if (!usuario) {
        throw new Error('Credenciales inválidas');
      }

      if (!usuario.activo) {
        throw new Error('Usuario inactivo. Contacte al administrador');
      }

      // ✅ VERIFICAR PASSWORD SIN BCRYPT - comparación directa
      console.log('🔐 Verificando password...');
      console.log('Password ingresado:', password);
      console.log('Password en BD:', usuario.password);
      
      const passwordValido = (password === usuario.password);
      
      console.log('✅ Password válido:', passwordValido);
      
      if (!passwordValido) {
        throw new Error('Credenciales inválidas');
      }

      // ✅ DETERMINAR REDIRECCIÓN BASADA EN EL ROL
      let redireccion = '';
      switch (usuario.rol) {
        case 'administrador':
          redireccion = '/admin/dashboard';
          break;
        case 'empleado':
          redireccion = '/empleado/pedidos';
          break;
        case 'cliente':
          redireccion = '/cliente/menu';
          break;
        default:
          redireccion = '/dashboard';
      }

      console.log('🎯 Redirección para rol', usuario.rol + ':', redireccion);

      // ✅ GENERAR TOKEN JWT CON INFORMACIÓN DE ROL
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          rol: usuario.rol,
          redireccion: redireccion // Incluir redirección en el token
        },
        process.env.JWT_SECRET || 'mi_secret_key_super_secreta_2024',
        { expiresIn: '24h' }
      );

      console.log('🎫 Token generado exitosamente');

      // Eliminar password del objeto de respuesta
      const { password: _, ...usuarioSinPassword } = usuario;

      // ✅ DEVOLVER TOKEN, USUARIO Y REDIRECCIÓN
      return {
        success: true,
        data: {
          token,
          usuario: usuarioSinPassword,
          redireccion: redireccion
        },
        message: `Login exitoso. Bienvenido ${usuario.rol}`
      };
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ Función específica para obtener información de redirección
  static async obtenerRedireccionPorRol(rol) {
    const rutasPorRol = {
      'administrador': '/admin/dashboard',
      'empleado': '/empleado/pedidos', 
      'cliente': '/cliente/menu',
      'mesero': '/mesero/comandas',
      'cocina': '/cocina/ordenes',
      'cajero': '/caja/pagos'
    };

    return rutasPorRol[rol] || '/dashboard';
  }

  // ✅ Verificar token y obtener información de redirección
  static async verificarToken(token) {
    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'mi_secret_key_super_secreta_2024'
      );

      // Obtener usuario actualizado
      const usuario = await UsuarioModel.obtenerPorId(decoded.id);
      
      if (!usuario || !usuario.activo) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // Recalcular redirección por si el rol cambió
      const redireccion = await this.obtenerRedireccionPorRol(usuario.rol);

      return {
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
          },
          redireccion: redireccion
        }
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
      const total = await UsuarioModel.contar(filtros);
      
      return {
        success: true,
        data: usuarios,
        total,
        pagina: filtros.offset ? Math.floor(filtros.offset / (filtros.limite || 10)) + 1 : 1,
        totalPaginas: filtros.limite ? Math.ceil(total / filtros.limite) : 1
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
      if (!id) {
        throw new Error('ID de usuario es requerido');
      }

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

  // Obtener usuario por email
  static async obtenerPorEmail(email) {
    try {
      if (!email) {
        throw new Error('Email es requerido');
      }

      const usuario = await UsuarioModel.obtenerPorEmail(email);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      const { password: _, ...usuarioSinPassword } = usuario;

      return {
        success: true,
        data: usuarioSinPassword
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
      if (!id) {
        throw new Error('ID de usuario es requerido');
      }

      const usuarioExiste = await UsuarioModel.obtenerPorId(id);
      if (!usuarioExiste) {
        throw new Error('Usuario no encontrado');
      }

      if (datos.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datos.email)) {
          throw new Error('El formato del email no es válido');
        }

        const emailExiste = await UsuarioModel.emailExiste(datos.email, id);
        if (emailExiste) {
          throw new Error('El email ya está en uso');
        }
      }

      if (datos.rol) {
        const rolesPermitidos = ['cliente', 'administrador', 'empleado', 'mesero', 'cocina', 'cajero'];
        if (!rolesPermitidos.includes(datos.rol)) {
          throw new Error('Rol no válido');
        }
      }

      // ✅ Si se actualiza password, guardar en texto plano
      if (datos.password) {
        datos.password = datos.password; // Mantener en texto plano
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

  // Cambiar estado de usuario
  static async cambiarEstado(id, activo) {
    try {
      if (!id || typeof activo !== 'boolean') {
        throw new Error('ID y estado (booleano) son requeridos');
      }

      const usuarioExiste = await UsuarioModel.obtenerPorId(id);
      if (!usuarioExiste) {
        throw new Error('Usuario no encontrado');
      }

      const resultado = await UsuarioModel.cambiarEstado(id, activo);

      return {
        success: true,
        data: resultado,
        message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cambiar rol de usuario
  static async cambiarRol(id, rol) {
    try {
      if (!id || !rol) {
        throw new Error('ID y rol son requeridos');
      }

      const rolesPermitidos = ['cliente', 'administrador', 'empleado', 'mesero', 'cocina', 'cajero'];
      if (!rolesPermitidos.includes(rol)) {
        throw new Error('Rol no válido');
      }

      const usuarioExiste = await UsuarioModel.obtenerPorId(id);
      if (!usuarioExiste) {
        throw new Error('Usuario no encontrado');
      }

      const resultado = await UsuarioModel.cambiarRol(id, rol);

      return {
        success: true,
        data: resultado,
        message: `Rol cambiado a ${rol} exitosamente`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ Cambiar contraseña (SIN BCRYPT)
  static async cambiarPassword(id, passwordActual, nuevaPassword) {
    try {
      if (!id || !passwordActual || !nuevaPassword) {
        throw new Error('ID, password actual y nueva password son requeridos');
      }

      const usuario = await UsuarioModel.obtenerPorEmail(
        (await UsuarioModel.obtenerPorId(id)).email
      );

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // ✅ Verificar password actual sin bcrypt
      const passwordValido = (passwordActual === usuario.password);
      if (!passwordValido) {
        throw new Error('Password actual incorrecto');
      }

      // ✅ Guardar nueva password en texto plano
      await UsuarioModel.cambiarPassword(id, nuevaPassword);

      return {
        success: true,
        message: 'Contraseña cambiada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar usuario (soft delete)
  static async eliminar(id) {
    try {
      if (!id) {
        throw new Error('ID de usuario es requerido');
      }

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

  // Obtener reporte de registros
  static async obtenerReporteRegistros(fecha_desde, fecha_hasta) {
    try {
      if (!fecha_desde || !fecha_hasta) {
        throw new Error('fecha_desde y fecha_hasta son requeridos');
      }

      const reporte = await UsuarioModel.obtenerReporteRegistros(fecha_desde, fecha_hasta);

      return {
        success: true,
        data: reporte,
        total: reporte.length
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