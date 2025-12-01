import PedidosProductosService from './Pedidos_Productos.service.js';

class PedidosProductosController {
  static async agregar(req, res) {
    try {
      const { pedido_id } = req.params;
      const datos = {
        pedido_id,
        ...req.body
      };

      const resultado = await PedidosProductosService.agregar(datos);

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

  // POST /api/pedidos/:pedido_id/productos/multiples
  static async agregarMultiples(req, res) {
    try {
      const { pedido_id } = req.params;
      const { productos } = req.body;

      if (!productos || !Array.isArray(productos)) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de productos'
        });
      }

      const resultado = await PedidosProductosService.agregarMultiples(pedido_id, productos);

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

  // GET /api/pedidos/:pedido_id/productos
  static async obtenerPorPedido(req, res) {
    try {
      const { pedido_id } = req.params;
      const resultado = await PedidosProductosService.obtenerPorPedido(pedido_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // PATCH /api/pedidos-productos/:id/cantidad
  static async actualizarCantidad(req, res) {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;

      if (!cantidad) {
        return res.status(400).json({
          success: false,
          error: 'La cantidad es requerida'
        });
      }

      const resultado = await PedidosProductosService.actualizarCantidad(id, cantidad);

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

  // PATCH /api/pedidos-productos/:id/notas
  static async actualizarNotas(req, res) {
    try {
      const { id } = req.params;
      const { notas } = req.body;

      const resultado = await PedidosProductosService.actualizarNotas(id, notas || '');

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

  // DELETE /api/pedidos-productos/:id
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await PedidosProductosService.eliminar(id);

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

  // GET /api/pedidos/:pedido_id/productos/estadisticas
  static async obtenerEstadisticas(req, res) {
    try {
      const { pedido_id } = req.params;
      const resultado = await PedidosProductosService.obtenerEstadisticas(pedido_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export default PedidosProductosController;