import express from 'express';
import MenuDiasController from './Menu_Dias.controller.js';

const router = express.Router();

router.get('/', MenuDiasController.obtenerTodos);
router.get('/hoy', MenuDiasController.obtenerMenuHoy);
router.get('/proximos', MenuDiasController.obtenerMenusProximos);
router.get('/estadisticas', MenuDiasController.obtenerEstadisticas);
router.get('/productos-populares', MenuDiasController.obtenerProductosMasUsados);
router.get('/fecha/:fecha', MenuDiasController.obtenerPorFecha);
router.get('/:id/productos', MenuDiasController.obtenerProductos);
router.get('/:id', MenuDiasController.obtenerPorId);
router.post('/', MenuDiasController.crear);
router.post('/:id/productos', MenuDiasController.agregarProductos);
router.put('/:id', MenuDiasController.actualizar);
router.patch('/:id/productos/:producto_id/disponibilidad', MenuDiasController.actualizarDisponibilidadProducto);
router.delete('/:id/productos/:producto_id', MenuDiasController.eliminarProducto);
router.delete('/:id', MenuDiasController.eliminar);

export default router;