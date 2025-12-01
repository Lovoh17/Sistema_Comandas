import UsuarioService from './Usuario.service.js';

class UsuarioController {
  // POST /api/usuarios/registro
  static async registrar(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;

      // Validaciones básicas
      if (!nombre || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Nombre, email y password son requeridos'
        });
      }

      const resultado = await UsuarioService.registrar(req.body);

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      res.status(201).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email y password son requeridos'
        });
      }

      const resultado = await UsuarioService.login(email, password);

      if (!resultado.success) {
        return res.status(401).json(resultado);
      }

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/usuarios
  static async listar(req, res) {
    try {
      const filtros = {
        rol: req.query.rol,
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
        limite: req.query.limite ? parseInt(req.query.limite) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      };

      const resultado = await UsuarioService.listar(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/usuarios/:id
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario es requerido'
        });
      }

      const resultado = await UsuarioService.obtenerPorId(id);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/usuarios/email/:email
  static async obtenerPorEmail(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email es requerido'
        });
      }

      const resultado = await UsuarioService.obtenerPorEmail(email);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/usuarios/:id
  static async actualizar(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario es requerido'
        });
      }

      const resultado = await UsuarioService.actualizar(id, req.body);

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // PATCH /api/usuarios/:id/estado
  static async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario es requerido'
        });
      }

      if (typeof activo !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'El campo activo es requerido y debe ser booleano'
        });
      }

      const resultado = await UsuarioService.cambiarEstado(id, activo);

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // PATCH /api/usuarios/:id/rol
  static async cambiarRol(req, res) {
    try {
      const { id } = req.params;
      const { rol } = req.body;

      if (!id || !rol) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario y rol son requeridos'
        });
      }

      const resultado = await UsuarioService.cambiarRol(id, rol);

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // DELETE /api/usuarios/:id
  static async eliminar(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario es requerido'
        });
      }

      const resultado = await UsuarioService.eliminar(id);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/usuarios/estadisticas
  static async obtenerEstadisticas(req, res) {
    try {
      const resultado = await UsuarioService.obtenerEstadisticas();

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/usuarios/reportes/registros
  static async obtenerReporteRegistros(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;

      if (!fecha_desde || !fecha_hasta) {
        return res.status(400).json({
          success: false,
          error: 'fecha_desde y fecha_hasta son requeridos'
        });
      }

      const resultado = await UsuarioService.obtenerReporteRegistros(fecha_desde, fecha_hasta);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export default UsuarioController;