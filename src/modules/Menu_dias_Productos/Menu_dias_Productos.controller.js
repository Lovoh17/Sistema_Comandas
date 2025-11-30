import MenuDiasProductosService from './Menu_dias_Productos.service.js';

class MenuDiasProductosController {
  static async agregar(req, res) {
    try {
      const { menu_dia_id } = req.params;
      const datos = {
        menu_dia_id,
        ...req.body
      };

      const resultado = await MenuDiasProductosService.agregar(datos);

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

  // POST /api/menu-dias/:menu_dia_id/productos/multiples
  static async agregarMultiples(req, res) {
    try {
      const { menu_dia_id } = req.params;
      const { productos } = req.body;

      if (!productos || !Array.isArray(productos)) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de productos'
        });
      }

      const resultado = await MenuDiasProductosService.agregarMultiples(menu_dia_id, productos);

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

  // GET /api/menu-dias/:menu_dia_id/productos
  static async obtenerPorMenuDia(req, res) {
    try {
      const { menu_dia_id } = req.params;
      const soloDisponibles = req.query.disponibles === 'true';

      const resultado = await MenuDiasProductosService.obtenerPorMenuDia(menu_dia_id, soloDisponibles);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/menu-dias/:menu_dia_id/productos/categoria/:categoria_id
  static async obtenerPorCategoria(req, res) {
    try {
      const { menu_dia_id, categoria_id } = req.params;

      const resultado = await MenuDiasProductosService.obtenerPorCategoria(menu_dia_id, categoria_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // PATCH /api/menu-dias-productos/:id/disponibilidad
  static async cambiarDisponibilidad(req, res) {
    try {
      const { id } = req.params;
      const { disponible_hoy } = req.body;

      if (disponible_hoy === undefined) {
        return res.status(400).json({
          success: false,
          error: 'El campo disponible_hoy es requerido'
        });
      }

      const resultado = await MenuDiasProductosService.cambiarDisponibilidad(id, disponible_hoy);

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

  // DELETE /api/menu-dias-productos/:id
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await MenuDiasProductosService.eliminar(id);

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

  // DELETE /api/menu-dias/:menu_dia_id/productos
  static async limpiarMenu(req, res) {
    try {
      const { menu_dia_id } = req.params;
      const resultado = await MenuDiasProductosService.limpiarMenu(menu_dia_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // POST /api/menu-dias/:menu_dia_id/copiar
  static async copiarMenu(req, res) {
    try {
      const { menu_dia_id } = req.params;
      const { menu_dia_destino_id } = req.body;

      if (!menu_dia_destino_id) {
        return res.status(400).json({
          success: false,
          error: 'menu_dia_destino_id es requerido'
        });
      }

      const resultado = await MenuDiasProductosService.copiarMenu(menu_dia_id, menu_dia_destino_id);

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

  // PATCH /api/menu-dias/:menu_dia_id/productos/activar-todos
  static async activarTodos(req, res) {
    try {
      const { menu_dia_id } = req.params;
      const resultado = await MenuDiasProductosService.activarTodos(menu_dia_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // PATCH /api/menu-dias/:menu_dia_id/productos/desactivar-todos
  static async desactivarTodos(req, res) {
    try {
      const { menu_dia_id } = req.params;
      const resultado = await MenuDiasProductosService.desactivarTodos(menu_dia_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/menu-dias/:menu_dia_id/productos/estadisticas
  static async obtenerEstadisticas(req, res) {
    try {
      const { menu_dia_id } = req.params;
      const resultado = await MenuDiasProductosService.obtenerEstadisticas(menu_dia_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export default MenuDiasProductosController;