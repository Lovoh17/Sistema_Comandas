import GananciasService from './Ganancias.service.js';

class GananciasController {
  // POST /api/ganancias
  static async crear(req, res) {
    try {
      const resultado = await GananciasService.crear(req.body);

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

  // DELETE /api/ganancias/:id
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await GananciasService.eliminar(id);

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

  // GET /api/ganancias/resumen/dia
  static async obtenerResumenDia(req, res) {
    try {
      const { fecha } = req.query;
      const resultado = await GananciasService.obtenerResumenDia(fecha);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/ganancias/resumen/periodo
  static async obtenerResumenPeriodo(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;

      if (!fecha_desde || !fecha_hasta) {
        return res.status(400).json({
          success: false,
          error: 'fecha_desde y fecha_hasta son requeridos'
        });
      }

      const resultado = await GananciasService.obtenerResumenPeriodo(fecha_desde, fecha_hasta);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/ganancias/estadisticas/mensual
  static async obtenerEstadisticasMensuales(req, res) {
    try {
      const { anio, mes } = req.query;

      if (!anio || !mes) {
        return res.status(400).json({
          success: false,
          error: 'anio y mes son requeridos'
        });
      }

      const resultado = await GananciasService.obtenerEstadisticasMensuales(parseInt(anio), parseInt(mes));

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/ganancias/estadisticas/anual
  static async obtenerEstadisticasAnuales(req, res) {
    try {
      const { anio } = req.query;
      const resultado = await GananciasService.obtenerEstadisticasAnuales(anio ? parseInt(anio) : undefined);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/ganancias/top-dias
  static async obtenerTopDias(req, res) {
    try {
      const limite = req.query.limite ? parseInt(req.query.limite) : 10;
      const resultado = await GananciasService.obtenerTopDias(limite);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // POST /api/ganancias/comparar-periodos
  static async compararPeriodos(req, res) {
    try {
      const { periodo1_inicio, periodo1_fin, periodo2_inicio, periodo2_fin } = req.body;

      if (!periodo1_inicio || !periodo1_fin || !periodo2_inicio || !periodo2_fin) {
        return res.status(400).json({
          success: false,
          error: 'Todas las fechas son requeridas'
        });
      }

      const resultado = await GananciasService.compararPeriodos(
        periodo1_inicio, 
        periodo1_fin, 
        periodo2_inicio, 
        periodo2_fin
      );

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // POST /api/ganancias/registrar-pedido/:pedido_id
  static async registrarDesdePedido(req, res) {
    try {
      const { pedido_id } = req.params;
      const resultado = await GananciasService.registrarDesdePedido(pedido_id);

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

  // GET /api/ganancias
  static async listar(req, res) {
    try {
      const filtros = {
        fecha: req.query.fecha,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        pedido_id: req.query.pedido_id,
        limite: req.query.limite ? parseInt(req.query.limite) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      };

      const resultado = await GananciasService.listar(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // GET /api/ganancias/:id
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await GananciasService.obtenerPorId(id);

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

  // PUT /api/ganancias/:id
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await GananciasService.actualizar(id, req.body);

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

  // PATCH /api/ganancias/:id/costos
  static async actualizarCostos(req, res) {
    try {
      const { id } = req.params;
      const { costos } = req.body;

      if (costos === undefined) {
        return res.status(400).json({
          success: false,
          error: 'El campo costos es requerido'
        });
      }

      const resultado = await GananciasService.actualizarCostos(id, costos);

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
}

export default GananciasController;