const orders = require('../models/order');

// Precios de los productos (simulando una base de datos de productos)
const menu = {
    'entradas': {
        'ensalada': 5.00,
        'nachos': 7.50,
    },
    'plato_fuerte': {
        'hamburguesa': 12.00,
        'pizza': 15.00,
    },
    'bebidas': {
        'refresco': 2.50,
        'cerveza': 4.00,
    }
};

function calculateTotal(items) {
    let total = 0;
    for (const item of items) {
        // item = { category: 'entradas', name: 'ensalada', quantity: 1 }
        if (menu[item.category] && menu[item.category][item.name]) {
            total += menu[item.category][item.name] * item.quantity;
        }
    }
    return total;
}

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { customerName, customerPhone, items } = req.body;

        if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Nombre del cliente, teléfono y al menos un artículo son requeridos.' });
        }

        const total = calculateTotal(items);

        const newOrder = {
            id: orders.length + 1,
            customerName,
            customerPhone,
            items,
            total,
            status: 'pending', // pending, completed, cancelled
            createdAt: new Date()
        };

        orders.push(newOrder);

        res.status(201).json({ message: 'Pedido creado exitosamente', order: newOrder });

    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ error: 'Fallo al crear el pedido' });
    }
};
