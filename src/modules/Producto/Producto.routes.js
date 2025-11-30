import express from 'express';
const router = express.Router();
import ProductoController from './Producto.controller.js';

// Rutas de consulta
router.get('/buscar', ProductoController.buscar);
router.get('/mas-vendidos', ProductoController.obtenerMasVendidos);
router.get('/estadisticas', ProductoController.obtenerEstadisticas);
router.get('/categoria/:categoria_id', ProductoController.obtenerPorCategoria);
router.get('/:id', ProductoController.obtenerPorId);
router.get('/', ProductoController.listar);

// Rutas de modificación
router.post('/', ProductoController.crear);
router.put('/:id', ProductoController.actualizar);
router.patch('/:id/disponibilidad', ProductoController.cambiarDisponibilidad);
router.delete('/:id', ProductoController.eliminar);

export default router;