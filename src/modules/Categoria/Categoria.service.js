import CategoriaModel from './Categoria.model.js';

class CategoriaService {
  // Crear nueva categoría
  static async crearCategoria(datos) {
    try {
      // Validar que el nombre no exista
      const categoriaExistente = await CategoriaModel.obtenerPorNombre(datos.nombre);
      if (categoriaExistente) {
        throw new Error('Ya existe una categoría con ese nombre');
      }

      // Validar datos requeridos
      if (!datos.nombre || datos.nombre.trim().length < 2) {
        throw new Error('El nombre de la categoría es requerido y debe tener al menos 2 caracteres');
      }

      const categoria = await CategoriaModel.crear(datos);
      return {
        success: true,
        data: categoria,
        message: 'Categoría creada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al crear categoría: ${error.message}`);
    }
  }

  // Obtener todas las categorías
  static async obtenerCategorias(soloActivas = false) {
    try {
      const categorias = await CategoriaModel.obtenerTodas(soloActivas);
      return {
        success: true,
        data: categorias,
        count: categorias.length
      };
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
  }

  // Obtener categoría por ID
  static async obtenerCategoriaPorId(id) {
    try {
      const categoria = await CategoriaModel.obtenerPorId(id);
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      return {
        success: true,
        data: categoria
      };
    } catch (error) {
      throw new Error(`Error al obtener categoría: ${error.message}`);
    }
  }

  // Actualizar categoría
  static async actualizarCategoria(id, datos) {
    try {
      // Verificar que la categoría existe
      const categoriaExistente = await CategoriaModel.existe(id);
      if (!categoriaExistente) {
        throw new Error('Categoría no encontrada');
      }

      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (datos.nombre) {
        const nombreExistente = await CategoriaModel.nombreExiste(datos.nombre, id);
        if (nombreExistente) {
          throw new Error('Ya existe otra categoría con ese nombre');
        }
      }

      const categoriaActualizada = await CategoriaModel.actualizar(id, datos);
      return {
        success: true,
        data: categoriaActualizada,
        message: 'Categoría actualizada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
  }

  // Eliminar categoría (lógico)
  static async eliminarCategoria(id) {
    try {
      // Verificar que la categoría existe
      const categoriaExistente = await CategoriaModel.existe(id);
      if (!categoriaExistente) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar si la categoría tiene productos asociados
      const estadisticas = await CategoriaModel.obtenerEstadisticas();
      const categoriaStats = estadisticas.find(cat => cat.id === id);
      
      if (categoriaStats && categoriaStats.total_productos > 0) {
        throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
      }

      const categoriaEliminada = await CategoriaModel.eliminar(id);
      return {
        success: true,
        data: categoriaEliminada,
        message: 'Categoría eliminada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
  }

  // Reactivar categoría
  static async reactivarCategoria(id) {
    try {
      const categoriaExistente = await CategoriaModel.existe(id);
      if (!categoriaExistente) {
        throw new Error('Categoría no encontrada');
      }

      const categoriaReactivada = await CategoriaModel.reactivar(id);
      return {
        success: true,
        data: categoriaReactivada,
        message: 'Categoría reactivada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al reactivar categoría: ${error.message}`);
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas() {
    try {
      const estadisticas = await CategoriaModel.obtenerEstadisticas();
      const totalCategorias = await CategoriaModel.contar();
      const categoriasActivas = await CategoriaModel.contar(true);

      return {
        success: true,
        data: {
          categorias: estadisticas,
          resumen: {
            total_categorias: totalCategorias,
            categorias_activas: categoriasActivas,
            categorias_inactivas: totalCategorias - categoriasActivas
          }
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // Obtener categorías con productos
  static async obtenerCategoriasConProductos(soloActivas = true) {
    try {
      const categorias = await CategoriaModel.obtenerConProductos(soloActivas);
      return {
        success: true,
        data: categorias,
        count: categorias.length
      };
    } catch (error) {
      throw new Error(`Error al obtener categorías con productos: ${error.message}`);
    }
  }
}

export default CategoriaService;