import UsuarioService from './Usuario.service.js';


class UsuarioController {
  // POST /api/usuarios/registro
  static async registrar(req, res) {
    try {
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

  // POST /api/usuarios/login
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
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
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

  // PUT /api/usuarios/:id
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
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

  // DELETE /api/usuarios/:id
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
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
}

export default UsuarioController;