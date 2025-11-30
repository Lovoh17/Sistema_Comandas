import ProductoService from './Producto.service.js';

class ProductoController {
  // POST /api/productos
  static async crear(req, res) {
    try {
      const resultado = await ProductoService.crear(req.body);

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

  // GET /api/productos
  static async listar(req, res) {
    try {
      const filtros = {
        categoria_id: req.query.categoria_id,
        disponible: req.query.disponible,
        busqueda: req.query.busqueda,
        precio_min: req.query.precio_min,
        precio_max: req.query.precio_max
      };

      const resultado = await ProductoService.listar(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/productos/:id
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ProductoService.obtenerPorId(id);

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

  // GET /api/productos/categoria/:categoria_id
  static async obtenerPorCategoria(req, res) {
    try {
      const { categoria_id } = req.params;
      const resultado = await ProductoService.obtenerPorCategoria(categoria_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/productos/:id
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ProductoService.actualizar(id, req.body);

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

  // PATCH /api/productos/:id/disponibilidad
  static async cambiarDisponibilidad(req, res) {
    try {
      const { id } = req.params;
      const { disponible } = req.body;

      if (disponible === undefined) {
        return res.status(400).json({
          success: false,
          error: 'El campo disponible es requerido'
        });
      }

      const resultado = await ProductoService.cambiarDisponibilidad(id, disponible);

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

  // DELETE /api/productos/:id
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ProductoService.eliminar(id);

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

  // GET /api/productos/mas-vendidos
  static async obtenerMasVendidos(req, res) {
    try {
      const limite = req.query.limite || 10;
      const resultado = await ProductoService.obtenerMasVendidos(limite);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/productos/estadisticas
  static async obtenerEstadisticas(req, res) {
    try {
      const resultado = await ProductoService.obtenerEstadisticas();

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/productos/buscar
  static async buscar(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'El parámetro de búsqueda "q" es requerido'
        });
      }

      const resultado = await ProductoService.buscar(q);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export default ProductoController;