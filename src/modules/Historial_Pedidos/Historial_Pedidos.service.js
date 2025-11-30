import HistorialPedidosModel from './Historial_Pedidos.model.js';

class HistorialPedidosService {
  // Registrar cambio de estado
  static async registrarCambio(datos) {
    try {
      // Validaciones
      if (!datos.pedido_id || !datos.usuario_id || !datos.estado_nuevo) {
        throw new Error('Pedido ID, Usuario ID y estado nuevo son requeridos');
      }

      const estadosValidos = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(datos.estado_nuevo)) {
        throw new Error('Estado no válido');
      }

      if (datos.estado_anterior && !estadosValidos.includes(datos.estado_anterior)) {
        throw new Error('Estado anterior no válido');
      }

      const registro = await HistorialPedidosModel.crear(datos);

      return {
        success: true,
        data: registro,
        message: 'Cambio registrado en el historial'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener historial de un pedido
  static async obtenerHistorialPedido(pedido_id) {
    try {
      const historial = await HistorialPedidosModel.obtenerPorPedido(pedido_id);
      const lineaTiempo = await HistorialPedidosModel.obtenerLineaTiempo(pedido_id);

      return {
        success: true,
        data: {
          historial: historial,
          linea_tiempo: lineaTiempo
        },
        total: historial.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listar registros
  static async listar(filtros = {}) {
    try {
      const registros = await HistorialPedidosModel.obtenerTodos(filtros);
      const total = await HistorialPedidosModel.contar(filtros);

      return {
        success: true,
        data: registros,
        total: total,
        filtros: filtros
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener por ID
  static async obtenerPorId(id) {
    try {
      const registro = await HistorialPedidosModel.obtenerPorId(id);

      if (!registro) {
        throw new Error('Registro no encontrado');
      }

      return {
        success: true,
        data: registro
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas(filtros = {}) {
    try {
      const estadisticas = await HistorialPedidosModel.obtenerEstadisticas(filtros);
      const tiemposPromedio = await HistorialPedidosModel.obtenerTiempoPromedioEstados();

      return {
        success: true,
        data: {
          por_estado: estadisticas,
          tiempos_promedio: tiemposPromedio
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener actividad por usuario
  static async obtenerActividadUsuarios(fecha_desde, fecha_hasta) {
    try {
      if (!fecha_desde || !fecha_hasta) {
        throw new Error('Fecha desde y fecha hasta son requeridas');
      }

      const actividad = await HistorialPedidosModel.obtenerActividadPorUsuario(fecha_desde, fecha_hasta);

      return {
        success: true,
        data: actividad,
        periodo: { fecha_desde, fecha_hasta }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener cambios recientes
  static async obtenerCambiosRecientes(limite = 20) {
    try {
      const cambios = await HistorialPedidosModel.obtenerCambiosRecientes(limite);

      return {
        success: true,
        data: cambios,
        total: cambios.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener último cambio de un pedido
  static async obtenerUltimoCambio(pedido_id) {
    try {
      const ultimoCambio = await HistorialPedidosModel.obtenerUltimoCambio(pedido_id);

      if (!ultimoCambio) {
        throw new Error('No hay cambios registrados para este pedido');
      }

      return {
        success: true,
        data: ultimoCambio
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default HistorialPedidosService;