import PedidoModel from './Pedido.model.js';
import PedidosProductosModel from '../Pedidos_Productos/Pedidos_Productos.model.js';

class PedidoService {
  // Crear pedido
  static async crear(datos) {
    try {
      // Validaciones
      if (!datos.usuario_id) {
        throw new Error('Usuario ID es requerido');
      }

      // Generar número de pedido si no viene
      if (!datos.numero_pedido) {
        datos.numero_pedido = await PedidoModel.generarNumeroPedido();
      }

      const nuevoPedido = await PedidoModel.crear(datos);

      // Si vienen productos, agregarlos
      if (datos.productos && datos.productos.length > 0) {
        await PedidosProductosModel.agregarMultiples(nuevoPedido.id, datos.productos);
        
        // Recalcular total
        const total = await PedidosProductosModel.calcularTotal(nuevoPedido.id);
        await PedidoModel.actualizarTotal(nuevoPedido.id, total);
        nuevoPedido.total = total;
      }

      return {
        success: true,
        data: nuevoPedido,
        message: 'Pedido creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listar pedidos
  static async listar(filtros = {}) {
    try {
      const pedidos = await PedidoModel.obtenerTodos(filtros);
      const total = await PedidoModel.contar(filtros);

      return {
        success: true,
        data: pedidos,
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

  // Obtener pedido por ID con productos
  static async obtenerPorId(id) {
    try {
      const pedido = await PedidoModel.obtenerPorId(id);

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      // Obtener productos del pedido
      const productos = await PedidosProductosModel.obtenerPorPedido(id);

      return {
        success: true,
        data: {
          ...pedido,
          productos: productos
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener pedido por número
  static async obtenerPorNumero(numero_pedido) {
    try {
      const pedido = await PedidoModel.obtenerPorNumeroPedido(numero_pedido);

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      const productos = await PedidosProductosModel.obtenerPorPedido(pedido.id);

      return {
        success: true,
        data: {
          ...pedido,
          productos: productos
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Actualizar pedido
  static async actualizar(id, datos) {
    try {
      const existe = await PedidoModel.existe(id);
      if (!existe) {
        throw new Error('Pedido no encontrado');
      }

      // No permitir actualizar pedidos entregados o cancelados
      if (existe.estado === 'entregado' || existe.estado === 'cancelado') {
        throw new Error(`No se puede actualizar un pedido ${existe.estado}`);
      }

      const pedidoActualizado = await PedidoModel.actualizar(id, datos);

      return {
        success: true,
        data: pedidoActualizado,
        message: 'Pedido actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cambiar estado del pedido
  static async cambiarEstado(id, estado) {
    try {
      const pedido = await PedidoModel.existe(id);
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      // Validar transiciones de estado
      const estadosValidos = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        throw new Error('Estado inválido');
      }

      // No permitir cambiar estado de pedidos finalizados
      if (pedido.estado === 'entregado' || pedido.estado === 'cancelado') {
        throw new Error(`No se puede cambiar el estado de un pedido ${pedido.estado}`);
      }

      const pedidoActualizado = await PedidoModel.actualizarEstado(id, estado);

      return {
        success: true,
        data: pedidoActualizado,
        message: `Pedido cambiado a ${estado}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cancelar pedido
  static async cancelar(id) {
    try {
      const pedido = await PedidoModel.existe(id);
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      if (pedido.estado === 'entregado') {
        throw new Error('No se puede cancelar un pedido entregado');
      }

      if (pedido.estado === 'cancelado') {
        throw new Error('El pedido ya está cancelado');
      }

      const pedidoCancelado = await PedidoModel.cancelar(id);

      return {
        success: true,
        data: pedidoCancelado,
        message: 'Pedido cancelado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener pedidos activos
  static async obtenerActivos() {
    try {
      const pedidos = await PedidoModel.obtenerActivos();

      return {
        success: true,
        data: pedidos,
        total: pedidos.length
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
      const estadisticas = await PedidoModel.obtenerEstadisticas(filtros);
      const mesasOcupadas = await PedidoModel.obtenerMesasOcupadas();

      return {
        success: true,
        data: {
          generales: estadisticas,
          mesas_ocupadas: mesasOcupadas
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener pedidos por cliente
  static async obtenerPorCliente(usuario_id, limite = 10) {
    try {
      const pedidos = await PedidoModel.obtenerPorCliente(usuario_id, limite);

      return {
        success: true,
        data: pedidos,
        total: pedidos.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener reporte de ventas
  static async obtenerReporteVentas(fecha_desde, fecha_hasta) {
    try {
      if (!fecha_desde || !fecha_hasta) {
        throw new Error('Fecha desde y fecha hasta son requeridas');
      }

      const ventas = await PedidoModel.obtenerVentasPorPeriodo(fecha_desde, fecha_hasta);
      const estadisticas = await PedidoModel.obtenerEstadisticas({ fecha_desde, fecha_hasta });

      return {
        success: true,
        data: {
          resumen: estadisticas,
          ventas_por_dia: ventas
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default PedidoService;