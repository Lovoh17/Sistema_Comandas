import PedidoService from './Pedido.service.js';

class PedidoController {
  // POST /api/pedidos
  static async crear(req, res) {
    try {
      const resultado = await PedidoService.crear(req.body);

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

  // GET /api/pedidos
  static async listar(req, res) {
    try {
      const filtros = {
        estado: req.query.estado,
        usuario_id: req.query.usuario_id,
        numero_mesa: req.query.numero_mesa,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        limite: req.query.limite ? parseInt(req.query.limite) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      };

      const resultado = await PedidoService.listar(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/pedidos/activos
  static async obtenerActivos(req, res) {
    try {
      const resultado = await PedidoService.obtenerActivos();

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/pedidos/estadisticas
  static async obtenerEstadisticas(req, res) {
    try {
      const filtros = {
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const resultado = await PedidoService.obtenerEstadisticas(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/pedidos/cliente/:usuario_id
  static async obtenerPorCliente(req, res) {
    try {
      const { usuario_id } = req.params;
      const limite = req.query.limite ? parseInt(req.query.limite) : 10;

      const resultado = await PedidoService.obtenerPorCliente(usuario_id, limite);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/pedidos/numero/:numero_pedido
  static async obtenerPorNumero(req, res) {
    try {
      const { numero_pedido } = req.params;
      const resultado = await PedidoService.obtenerPorNumero(numero_pedido);

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

  // GET /api/pedidos/:id
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await PedidoService.obtenerPorId(id);

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

  // PUT /api/pedidos/:id
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await PedidoService.actualizar(id, req.body);

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

  // PATCH /api/pedidos/:id/estado
  static async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({
          success: false,
          error: 'El estado es requerido'
        });
      }

      const resultado = await PedidoService.cambiarEstado(id, estado);

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

  // PATCH /api/pedidos/:id/cancelar
  static async cancelar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await PedidoService.cancelar(id);

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

  // GET /api/pedidos/reportes/ventas
  static async obtenerReporteVentas(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;

      if (!fecha_desde || !fecha_hasta) {
        return res.status(400).json({
          success: false,
          error: 'fecha_desde y fecha_hasta son requeridos'
        });
      }

      const resultado = await PedidoService.obtenerReporteVentas(fecha_desde, fecha_hasta);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export default PedidoController;