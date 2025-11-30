import express from 'express';
const router = express.Router();
import PedidosProductosController from './Pedidos_Productos.controller.js';

// Rutas anidadas en pedidos
router.post('/:pedido_id/productos', PedidosProductosController.agregar);
router.post('/:pedido_id/productos/multiples', PedidosProductosController.agregarMultiples);
router.get('/:pedido_id/productos', PedidosProductosController.obtenerPorPedido);
router.get('/:pedido_id/productos/estadisticas', PedidosProductosController.obtenerEstadisticas);

// Rutas directas para items específicos
const routerItems = express.Router();
routerItems.patch('/:id/cantidad', PedidosProductosController.actualizarCantidad);
routerItems.patch('/:id/notas', PedidosProductosController.actualizarNotas);
routerItems.delete('/:id', PedidosProductosController.eliminar);

export default router;