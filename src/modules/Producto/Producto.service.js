import ProductoModel from './Producto.model.js';

class ProductoService {
  // Crear producto
  static async crear(datos) {
    try {
      // Validaciones
      if (!datos.nombre || !datos.precio || !datos.categoria_id) {
        throw new Error('Nombre, precio y categoría son requeridos');
      }

      if (datos.precio <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      const nuevoProducto = await ProductoModel.crear(datos);

      return {
        success: true,
        data: nuevoProducto,
        message: 'Producto creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listar productos
  static async listar(filtros = {}) {
    try {
      // Convertir strings a boolean y números
      if (filtros.disponible !== undefined) {
        filtros.disponible = filtros.disponible === 'true';
      }

      if (filtros.precio_min) {
        filtros.precio_min = parseFloat(filtros.precio_min);
      }

      if (filtros.precio_max) {
        filtros.precio_max = parseFloat(filtros.precio_max);
      }

      const productos = await ProductoModel.obtenerTodos(filtros);

      return {
        success: true,
        data: productos,
        total: productos.length,
        filtros: filtros
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener producto por ID
  static async obtenerPorId(id) {
    try {
      const producto = await ProductoModel.obtenerPorId(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      return {
        success: true,
        data: producto
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener productos por categoría
  static async obtenerPorCategoria(categoria_id) {
    try {
      const productos = await ProductoModel.obtenerPorCategoria(categoria_id);

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

  // Actualizar producto
  static async actualizar(id, datos) {
    try {
      const existe = await ProductoModel.existe(id);
      if (!existe) {
        throw new Error('Producto no encontrado');
      }

      if (datos.precio !== undefined && datos.precio <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      const productoActualizado = await ProductoModel.actualizar(id, datos);

      return {
        success: true,
        data: productoActualizado,
        message: 'Producto actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cambiar disponibilidad
  static async cambiarDisponibilidad(id, disponible) {
    try {
      const existe = await ProductoModel.existe(id);
      if (!existe) {
        throw new Error('Producto no encontrado');
      }

      const producto = await ProductoModel.cambiarDisponibilidad(id, disponible);

      return {
        success: true,
        data: producto,
        message: `Producto ${disponible ? 'activado' : 'desactivado'} exitosamente`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar producto
  static async eliminar(id) {
    try {
      const existe = await ProductoModel.existe(id);
      if (!existe) {
        throw new Error('Producto no encontrado');
      }

      await ProductoModel.eliminar(id);

      return {
        success: true,
        message: 'Producto eliminado exitosamente'
      };
    } catch (error) {
      // Si hay un error de foreign key, significa que el producto está siendo usado
      if (error.message.includes('foreign key')) {
        return {
          success: false,
          error: 'No se puede eliminar el producto porque está siendo usado en pedidos'
        };
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener productos más vendidos
  static async obtenerMasVendidos(limite = 10) {
    try {
      const productos = await ProductoModel.obtenerMasVendidos(limite);

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

  // Obtener estadísticas
  static async obtenerEstadisticas() {
    try {
      const estadisticas = await ProductoModel.obtenerEstadisticas();
      const porCategoria = await ProductoModel.obtenerPorCategoriaConConteo();

      return {
        success: true,
        data: {
          generales: estadisticas,
          por_categoria: porCategoria
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buscar productos
  static async buscar(termino) {
    try {
      const productos = await ProductoModel.obtenerTodos({ 
        busqueda: termino,
        disponible: true 
      });

      return {
        success: true,
        data: productos,
        total: productos.length,
        termino: termino
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default ProductoService;