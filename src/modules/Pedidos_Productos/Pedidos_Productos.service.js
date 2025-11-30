import PedidosProductosModel from './Pedidos_Productos.model.js';

class PedidosProductosService {
  // Agregar producto a pedido
  static async agregar(datos) {
    try {
      // Validaciones
      if (!datos.pedido_id || !datos.producto_id || !datos.cantidad || !datos.precio_unitario) {
        throw new Error('Pedido ID, Producto ID, cantidad y precio son requeridos');
      }

      if (datos.cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      if (datos.precio_unitario <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      // Verificar si el producto ya existe en el pedido
      const productoExistente = await PedidosProductosModel.productoEnPedido(
        datos.pedido_id, 
        datos.producto_id
      );

      if (productoExistente) {
        // Si existe, actualizar la cantidad sumando
        const nuevaCantidad = productoExistente.cantidad + datos.cantidad;
        const actualizado = await PedidosProductosModel.actualizarCantidad(
          productoExistente.id, 
          nuevaCantidad
        );

        return {
          success: true,
          data: actualizado,
          message: 'Cantidad actualizada en el pedido'
        };
      }

      // Si no existe, agregarlo
      const nuevoItem = await PedidosProductosModel.agregar(datos);

      // Recalcular el total del pedido
      const total = await PedidosProductosModel.calcularTotal(datos.pedido_id);

      return {
        success: true,
        data: nuevoItem,
        total_pedido: total,
        message: 'Producto agregado al pedido exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Agregar múltiples productos
  static async agregarMultiples(pedido_id, productos) {
    try {
      if (!pedido_id || !productos || productos.length === 0) {
        throw new Error('Pedido ID y lista de productos son requeridos');
      }

      // Validar cada producto
      for (const prod of productos) {
        if (!prod.producto_id || !prod.cantidad || !prod.precio_unitario) {
          throw new Error('Cada producto debe tener producto_id, cantidad y precio_unitario');
        }

        if (prod.cantidad <= 0 || prod.precio_unitario <= 0) {
          throw new Error('Cantidad y precio deben ser mayores a 0');
        }
      }

      const productosAgregados = await PedidosProductosModel.agregarMultiples(pedido_id, productos);
      const total = await PedidosProductosModel.calcularTotal(pedido_id);

      return {
        success: true,
        data: productosAgregados,
        total_pedido: total,
        message: `${productosAgregados.length} productos agregados al pedido`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener productos de un pedido
  static async obtenerPorPedido(pedido_id) {
    try {
      const productos = await PedidosProductosModel.obtenerPorPedido(pedido_id);
      const estadisticas = await PedidosProductosModel.obtenerEstadisticas(pedido_id);
      const resumenCategoria = await PedidosProductosModel.obtenerResumenPorCategoria(pedido_id);

      return {
        success: true,
        data: productos,
        estadisticas: estadisticas,
        resumen_por_categoria: resumenCategoria,
        total: productos.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Actualizar cantidad
  static async actualizarCantidad(id, cantidad) {
    try {
      if (cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      const item = await PedidosProductosModel.existe(id);
      if (!item) {
        throw new Error('Item no encontrado en el pedido');
      }

      const actualizado = await PedidosProductosModel.actualizarCantidad(id, cantidad);
      const total = await PedidosProductosModel.calcularTotal(item.pedido_id);

      return {
        success: true,
        data: actualizado,
        total_pedido: total,
        message: 'Cantidad actualizada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Actualizar notas
  static async actualizarNotas(id, notas) {
    try {
      const existe = await PedidosProductosModel.existe(id);
      if (!existe) {
        throw new Error('Item no encontrado en el pedido');
      }

      const actualizado = await PedidosProductosModel.actualizarNotas(id, notas);

      return {
        success: true,
        data: actualizado,
        message: 'Notas actualizadas exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar producto del pedido
  static async eliminar(id) {
    try {
      const item = await PedidosProductosModel.existe(id);
      if (!item) {
        throw new Error('Item no encontrado en el pedido');
      }

      await PedidosProductosModel.eliminar(id);
      const total = await PedidosProductosModel.calcularTotal(item.pedido_id);

      return {
        success: true,
        total_pedido: total,
        message: 'Producto eliminado del pedido exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener estadísticas del pedido
  static async obtenerEstadisticas(pedido_id) {
    try {
      const estadisticas = await PedidosProductosModel.obtenerEstadisticas(pedido_id);
      const resumenCategoria = await PedidosProductosModel.obtenerResumenPorCategoria(pedido_id);

      return {
        success: true,
        data: {
          generales: estadisticas,
          por_categoria: resumenCategoria
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

export default PedidosProductosService;