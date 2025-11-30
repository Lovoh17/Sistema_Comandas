import express from 'express';
const router = express.Router();
import HistorialPedidosController from './Historial_Pedidos.controller.js';

// Rutas de consulta (orden específico)
router.get('/estadisticas', HistorialPedidosController.obtenerEstadisticas);
router.get('/actividad-usuarios', HistorialPedidosController.obtenerActividadUsuarios);
router.get('/recientes', HistorialPedidosController.obtenerCambiosRecientes);
router.get('/pedido/:pedido_id', HistorialPedidosController.obtenerHistorialPedido);
router.get('/ultimo/:pedido_id', HistorialPedidosController.obtenerUltimoCambio);
router.get('/:id', HistorialPedidosController.obtenerPorId);
router.get('/', HistorialPedidosController.listar);

// Rutas de modificación
router.post('/', HistorialPedidosController.registrarCambio);

export default router;