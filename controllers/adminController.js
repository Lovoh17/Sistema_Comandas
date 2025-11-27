const orders = require('../models/order');

// Get pending orders
exports.getPendingOrders = async (req, res) => {
    try {
        const pendingOrders = orders.filter(order => order.status === 'pending');
        res.status(200).json(pendingOrders);
    } catch (error) {
        console.error('Error al obtener los pedidos pendientes:', error);
        res.status(500).json({ error: 'Fallo al obtener los pedidos pendientes' });
    }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
    try {
        const completedOrders = orders.filter(order => order.status !== 'pending');
        res.status(200).json(completedOrders);
    } catch (error) {
        console.error('Error al obtener el historial de pedidos:', error);
        res.status(500).json({ error: 'Fallo al obtener el historial de pedidos' });
    }
};

// Get sales stats
exports.getStats = async (req, res) => {
    try {
        const totalRevenue = orders
            .filter(order => order.status === 'completed')
            .reduce((acc, order) => acc + order.total, 0);

        const totalOrders = orders.filter(order => order.status === 'completed').length;

        res.status(200).json({ totalRevenue, totalOrders });
    } catch (error) {
        console.error('Error al obtener las estadísticas:', error);
        res.status(500).json({ error: 'Fallo al obtener las estadísticas' });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const { status } = req.body; // 'completed' o 'cancelled'

        const order = orders.find(o => o.id === orderId);

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        order.status = status;

        res.status(200).json({ message: `Pedido ${orderId} actualizado a ${status}` });
    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        res.status(500).json({ error: 'Fallo al actualizar el estado del pedido' });
    }
};
