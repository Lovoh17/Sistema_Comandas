import express from 'express';
import MenuDiasController from './Menu_Dias.controller.js';

// Middlewares de autenticación y autorización (ajusta según tu implementación)
// import { verificarToken } from '../../middleware/auth.middleware.js';
// import { esAdmin } from '../../middleware/role.middleware.js';

const MenuDiasRoutes = (db) => {
  const router = express.Router();

  // ============================================
  // RUTAS PÚBLICAS
  // ============================================

  /**
   * @route   GET /api/menu-dias
   * @desc    Obtener todos los menús con filtros opcionales
   * @query   activo, dia_semana, fecha, fecha_desde, fecha_hasta, limite, offset
   * @access  Public
   */
  router.get('/api/menu-dias', MenuDiasController.obtenerTodos);

  /**
   * @route   GET /api/menu-dias/hoy
   * @desc    Obtener el menú del día actual
   * @access  Public
   */
  router.get('/api/menu-dias/hoy', MenuDiasController.obtenerMenuHoy);

  /**
   * @route   GET /api/menu-dias/proximos
   * @desc    Obtener menús próximos (por defecto 7 días)
   * @query   dias (opcional)
   * @access  Public
   */
  router.get('/api/menu-dias/proximos', MenuDiasController.obtenerMenusProximos);

  /**
   * @route   GET /api/menu-dias/estadisticas
   * @desc    Obtener estadísticas de menús
   * @query   fecha_desde, fecha_hasta
   * @access  Public
   */
  router.get('/api/menu-dias/estadisticas', MenuDiasController.obtenerEstadisticas);

  /**
   * @route   GET /api/menu-dias/productos-populares
   * @desc    Obtener productos más usados en menús
   * @query   limite (opcional, default 10)
   * @access  Public
   */
  router.get('/api/menu-dias/productos-populares', MenuDiasController.obtenerProductosMasUsados);

  /**
   * @route   GET /api/menu-dias/fecha/:fecha
   * @desc    Obtener menú por fecha específica (formato: YYYY-MM-DD)
   * @access  Public
   */
  router.get('/api/menu-dias/fecha/:fecha', MenuDiasController.obtenerPorFecha);

  /**
   * @route   GET /api/menu-dias/:id
   * @desc    Obtener un menú del día por ID
   * @access  Public
   */
  router.get('/api/menu-dias/:id', MenuDiasController.obtenerPorId);

  /**
   * @route   GET /api/menu-dias/:id/productos
   * @desc    Obtener todos los productos de un menú específico
   * @access  Public
   */
  router.get('/api/menu-dias/:id/productos', MenuDiasController.obtenerProductos);

  // ============================================
  // RUTAS PROTEGIDAS - REQUIEREN AUTENTICACIÓN
  // ============================================

  /**
   * @route   POST /api/menu-dias
   * @desc    Crear un nuevo menú del día
   * @body    { dia_semana, fecha, descripcion?, activo?, productos? }
   * @access  Private/Admin
   * 
   * Ejemplo body:
   * {
   *   "dia_semana": "lunes",
   *   "fecha": "2024-01-15",
   *   "descripcion": "Menú especial de lunes",
   *   "activo": true,
   *   "productos": [
   *     { "producto_id": 1, "disponible_hoy": true },
   *     { "producto_id": 2, "disponible_hoy": true }
   *   ]
   * }
   */
  router.post(
    '/api/menu-dias',
    // verificarToken,
    // esAdmin,
    MenuDiasController.crear
  );

  /**
   * @route   PUT /api/menu-dias/:id
   * @desc    Actualizar un menú del día
   * @body    { dia_semana?, fecha?, descripcion?, activo? }
   * @access  Private/Admin
   */
  router.put(
    '/api/menu-dias/:id',
    // verificarToken,
    // esAdmin,
    MenuDiasController.actualizar
  );

  /**
   * @route   POST /api/menu-dias/:id/productos
   * @desc    Agregar productos a un menú del día
   * @body    { productos: [{ producto_id, disponible_hoy? }] }
   * @access  Private/Admin
   * 
   * Ejemplo body:
   * {
   *   "productos": [
   *     { "producto_id": 5, "disponible_hoy": true },
   *     { "producto_id": 8, "disponible_hoy": false }
   *   ]
   * }
   */
  router.post(
    '/api/menu-dias/:id/productos',
    // verificarToken,
    // esAdmin,
    MenuDiasController.agregarProductos
  );

  /**
   * @route   PATCH /api/menu-dias/:id/productos/:producto_id
   * @desc    Actualizar disponibilidad de un producto en el menú
   * @body    { disponible_hoy: boolean }
   * @access  Private/Admin
   */
  router.patch(
    '/api/menu-dias/:id/productos/:producto_id',
    // verificarToken,
    // esAdmin,
    MenuDiasController.actualizarDisponibilidadProducto
  );

  /**
   * @route   DELETE /api/menu-dias/:id/productos/:producto_id
   * @desc    Eliminar un producto del menú del día
   * @access  Private/Admin
   */
  router.delete(
    '/api/menu-dias/:id/productos/:producto_id',
    // verificarToken,
    // esAdmin,
    MenuDiasController.eliminarProducto
  );

  /**
   * @route   DELETE /api/menu-dias/:id
   * @desc    Eliminar un menú del día
   * @access  Private/Admin
   */
  router.delete(
    '/api/menu-dias/:id',
    // verificarToken,
    // esAdmin,
    MenuDiasController.eliminar
  );

  return router;
};

export default MenuDiasRoutes;