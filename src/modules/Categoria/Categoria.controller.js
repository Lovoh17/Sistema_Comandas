import CategoriaService from './Categoria.service.js';

class CategoriaController {
  // Crear nueva categoría
  static async crear(req, res) {
    try {
      const resultado = await CategoriaService.crearCategoria(req.body);
      
      res.status(201).json({
        success: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener todas las categorías
  static async listar(req, res) {
    try {
      const { soloActivas } = req.query;
      const soloActivasBool = soloActivas === 'true';
      
      const resultado = await CategoriaService.obtenerCategorias(soloActivasBool);
      
      res.json({
        success: true,
        data: resultado.data,
        count: resultado.count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener categoría por ID
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await CategoriaService.obtenerCategoriaPorId(parseInt(id));
      
      res.json({
        success: true,
        data: resultado.data
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Actualizar categoría
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await CategoriaService.actualizarCategoria(parseInt(id), req.body);
      
      res.json({
        success: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrada') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Eliminar categoría
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await CategoriaService.eliminarCategoria(parseInt(id));
      
      res.json({
        success: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrada') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Reactivar categoría
  static async reactivar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await CategoriaService.reactivarCategoria(parseInt(id));
      
      res.json({
        success: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas(req, res) {
    try {
      const resultado = await CategoriaService.obtenerEstadisticas();
      
      res.json({
        success: true,
        data: resultado.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener categorías con productos
  static async obtenerConProductos(req, res) {
    try {
      const { soloActivas } = req.query;
      const soloActivasBool = soloActivas !== 'false'; // default true
      
      const resultado = await CategoriaService.obtenerCategoriasConProductos(soloActivasBool);
      
      res.json({
        success: true,
        data: resultado.data,
        count: resultado.count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default CategoriaController;