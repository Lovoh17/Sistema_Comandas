import MenuDiasProductosModel from './Menu_dias_Productos.model.js';

class MenuDiasProductosService {
  // Agregar producto al menú del día
  static async agregar(datos) {
    try {
      if (!datos.menu_dia_id || !datos.producto_id) {
        throw new Error('Menu día ID y Producto ID son requeridos');
      }

      const resultado = await MenuDiasProductosModel.agregar(datos);

      return {
        success: true,
        data: resultado,
        message: 'Producto agregado al menú del día'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Agregar múltiples productos
  static async agregarMultiples(menu_dia_id, productos) {
    try {
      if (!menu_dia_id || !productos || productos.length === 0) {
        throw new Error('Menu día ID y lista de productos son requeridos');
      }

      // Validar que todos sean IDs válidos
      const productosIds = productos.map(p => {
        if (typeof p === 'number') return p;
        if (p.producto_id) return p.producto_id;
        throw new Error('Formato de producto inválido');
      });

      const productosAgregados = await MenuDiasProductosModel.agregarMultiples(menu_dia_id, productosIds);

      return {
        success: true,
        data: productosAgregados,
        message: `${productosAgregados.length} productos agregados al menú del día`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener productos del menú del día
  static async obtenerPorMenuDia(menu_dia_id, soloDisponibles = false) {
    try {
      let productos;
      
      if (soloDisponibles) {
        productos = await MenuDiasProductosModel.obtenerDisponibles(menu_dia_id);
      } else {
        productos = await MenuDiasProductosModel.obtenerPorMenuDia(menu_dia_id);
      }

      const estadisticas = await MenuDiasProductosModel.obtenerEstadisticas(menu_dia_id);
      const resumenCategoria = await MenuDiasProductosModel.obtenerResumenPorCategoria(menu_dia_id);

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

  // Obtener productos por categoría
  static async obtenerPorCategoria(menu_dia_id, categoria_id) {
    try {
      const productos = await MenuDiasProductosModel.obtenerPorCategoria(menu_dia_id, categoria_id);

      return {
        success: true,
        data: productos,
        total: productos.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cambiar disponibilidad
  static async cambiarDisponibilidad(id, disponible_hoy) {
    try {
      const existe = await MenuDiasProductosModel.existe(id);
      if (!existe) {
        throw new Error('Producto no encontrado en el menú del día');
      }

      const resultado = await MenuDiasProductosModel.cambiarDisponibilidad(id, disponible_hoy);

      return {
        success: true,
        data: resultado,
        message: `Producto ${disponible_hoy ? 'activado' : 'desactivado'} en el menú`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar producto del menú
  static async eliminar(id) {
    try {
      const existe = await MenuDiasProductosModel.existe(id);
      if (!existe) {
        throw new Error('Producto no encontrado en el menú del día');
      }

      await MenuDiasProductosModel.eliminar(id);

      return {
        success: true,
        message: 'Producto eliminado del menú del día'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Limpiar menú del día
  static async limpiarMenu(menu_dia_id) {
    try {
      const cantidad = await MenuDiasProductosModel.eliminarPorMenuDia(menu_dia_id);

      return {
        success: true,
        message: `${cantidad} productos eliminados del menú del día`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Copiar menú de un día a otro
  static async copiarMenu(menu_dia_origen_id, menu_dia_destino_id) {
    try {
      if (!menu_dia_origen_id || !menu_dia_destino_id) {
        throw new Error('Se requieren ambos IDs de menús del día');
      }

      if (menu_dia_origen_id === menu_dia_destino_id) {
        throw new Error('No puedes copiar un menú sobre sí mismo');
      }

      const cantidad = await MenuDiasProductosModel.copiarMenu(menu_dia_origen_id, menu_dia_destino_id);

      return {
        success: true,
        message: `${cantidad} productos copiados al nuevo menú del día`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Activar todos los productos
  static async activarTodos(menu_dia_id) {
    try {
      const cantidad = await MenuDiasProductosModel.activarTodos(menu_dia_id);

      return {
        success: true,
        message: `${cantidad} productos activados en el menú del día`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Desactivar todos los productos
  static async desactivarTodos(menu_dia_id) {
    try {
      const cantidad = await MenuDiasProductosModel.desactivarTodos(menu_dia_id);

      return {
        success: true,
        message: `${cantidad} productos desactivados en el menú del día`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas(menu_dia_id) {
    try {
      const estadisticas = await MenuDiasProductosModel.obtenerEstadisticas(menu_dia_id);
      const resumenCategoria = await MenuDiasProductosModel.obtenerResumenPorCategoria(menu_dia_id);

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

export default MenuDiasProductosService;