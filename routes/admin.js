const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rutas para el panel de administrador
router.get('/orders', adminController.getPendingOrders);
router.get('/orders/history', adminController.getOrderHistory);
router.get('/stats', adminController.getStats);

// Nueva ruta para actualizar el estado de un pedido
router.put('/orders/:id', adminController.updateOrderStatus);

module.exports = router;
