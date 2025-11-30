import HistorialPedidosService from './Historial_Pedidos.service.js';

class HistorialPedidosController {
  // POST /api/historial-pedidos
  static async registrarCambio(req, res) {
    try {
      const resultado = await HistorialPedidosService.registrarCambio(req.body);

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

  // GET /api/historial-pedidos/pedido/:pedido_id
  static async obtenerHistorialPedido(req, res) {
    try {
      const { pedido_id } = req.params;
      const resultado = await HistorialPedidosService.obtenerHistorialPedido(pedido_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/historial-pedidos
  static async listar(req, res) {
    try {
      const filtros = {
        pedido_id: req.query.pedido_id,
        usuario_id: req.query.usuario_id,
        estado_nuevo: req.query.estado_nuevo,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        limite: req.query.limite ? parseInt(req.query.limite) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      };

      const resultado = await HistorialPedidosService.listar(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/historial-pedidos/:id
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await HistorialPedidosService.obtenerPorId(id);

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

  // GET /api/historial-pedidos/estadisticas
  static async obtenerEstadisticas(req, res) {
    try {
      const filtros = {
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const resultado = await HistorialPedidosService.obtenerEstadisticas(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/historial-pedidos/actividad-usuarios
  static async obtenerActividadUsuarios(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;

      if (!fecha_desde || !fecha_hasta) {
        return res.status(400).json({
          success: false,
          error: 'fecha_desde y fecha_hasta son requeridos'
        });
      }

      const resultado = await HistorialPedidosService.obtenerActividadUsuarios(fecha_desde, fecha_hasta);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/historial-pedidos/recientes
  static async obtenerCambiosRecientes(req, res) {
    try {
      const limite = req.query.limite ? parseInt(req.query.limite) : 20;
      const resultado = await HistorialPedidosService.obtenerCambiosRecientes(limite);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/historial-pedidos/ultimo/:pedido_id
  static async obtenerUltimoCambio(req, res) {
    try {
      const { pedido_id } = req.params;
      const resultado = await HistorialPedidosService.obtenerUltimoCambio(pedido_id);

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
}

export default HistorialPedidosController;