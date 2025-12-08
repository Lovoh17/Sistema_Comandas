import express from 'express';
const router = express.Router();
import MenuDiasProductosController from './Menu_dias_Productos.controller.js';

router.delete('/:id', MenuDiasProductosController.eliminar);
router.patch('/:id/disponibilidad', MenuDiasProductosController.cambiarDisponibilidad);

router.post('/menu-dias/:menu_dia_id/productos/multiples', MenuDiasProductosController.agregarMultiples);
router.post('/menu-dias/:menu_dia_id/productos', MenuDiasProductosController.agregar);
router.post('/menu-dias/:menu_dia_id/copiar', MenuDiasProductosController.copiarMenu);

router.get('/menu-dias/:menu_dia_id/productos/estadisticas', MenuDiasProductosController.obtenerEstadisticas);
router.get('/menu-dias/:menu_dia_id/productos/categoria/:categoria_id', MenuDiasProductosController.obtenerPorCategoria);
router.get('/menu-dias/:menu_dia_id/productos', MenuDiasProductosController.obtenerPorMenuDia);

router.patch('/menu-dias/:menu_dia_id/productos/activar-todos', MenuDiasProductosController.activarTodos);
router.patch('/menu-dias/:menu_dia_id/productos/desactivar-todos', MenuDiasProductosController.desactivarTodos);

router.delete('/menu-dias/:menu_dia_id/productos', MenuDiasProductosController.limpiarMenu);

export default router;