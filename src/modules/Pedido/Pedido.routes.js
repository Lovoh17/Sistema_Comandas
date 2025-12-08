import express from 'express';
const router = express.Router();
import PedidoController from './Pedido.controller.js';

// Rutas de consulta (orden específico para evitar conflictos)
router.get('/activos', PedidoController.obtenerActivos);
router.get('/estadisticas', PedidoController.obtenerEstadisticas);
router.get('/reportes/ventas', PedidoController.obtenerReporteVentas);
router.get('/cliente/:usuario_id', PedidoController.obtenerPorCliente);
router.get('/numero/:numero_pedido', PedidoController.obtenerPorNumero);
router.get('/:id', PedidoController.obtenerPorId);
router.get('/', PedidoController.listar);

// Rutas de modificación
router.post('/', PedidoController.crear);
router.put('/:id', PedidoController.actualizar);
router.patch('/:id/estado', PedidoController.cambiarEstado);
router.patch('/:id/cancelar', PedidoController.cancelar);


export default router;