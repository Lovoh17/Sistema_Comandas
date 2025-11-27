document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.getElementById('stats');
    const pendingOrdersContainer = document.getElementById('pendingOrders');
    const orderHistoryContainer = document.getElementById('orderHistory');

    async function fetchStats() {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        statsContainer.innerHTML = `
            <p><strong>Ganancias Totales:</strong> $${data.totalRevenue.toFixed(2)}</p>
            <p><strong>Pedidos Completados:</strong> ${data.totalOrders}</p>
        `;
    }

    async function fetchPendingOrders() {
        const response = await fetch('/api/admin/orders');
        const orders = await response.json();
        renderOrders(pendingOrdersContainer, orders, true);
    }

    async function fetchOrderHistory() {
        const response = await fetch('/api/admin/orders/history');
        const orders = await response.json();
        renderOrders(orderHistoryContainer, orders, false);
    }

    function renderOrders(container, orders, isPending) {
        container.innerHTML = '';
        if (orders.length === 0) {
            container.innerHTML = '<p>No hay pedidos.</p>';
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.className = 'order';
            let itemsHtml = '';
            order.items.forEach(item => {
                itemsHtml += `<li>${item.quantity} x ${item.name}</li>`;
            });

            orderDiv.innerHTML = `
                <div class="order-details">
                    <div>
                        <strong>ID del Pedido:</strong> ${order.id}<br>
                        <strong>Cliente:</strong> ${order.customerName} (${order.customerPhone})<br>
                        <strong>Total:</strong> $${order.total.toFixed(2)}
                        <ul>${itemsHtml}</ul>
                    </div>
                    ${isPending ? 
                    `<div>
                        <button class="complete-btn" data-id="${order.id}">Completar</button>
                        <button class="cancel-btn" data-id="${order.id}">Cancelar</button>
                    </div>` : ''}
                </div>
            `;
            container.appendChild(orderDiv);
        });
    }

    async function updateOrderStatus(id, status) {
        const response = await fetch(`/api/admin/orders/${id}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            fetchAllData();
        } else {
            alert('Error al actualizar el estado del pedido');
        }
    }

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('complete-btn')) {
            updateOrderStatus(e.target.dataset.id, 'completed');
        }
        if (e.target.classList.contains('cancel-btn')) {
            updateOrderStatus(e.target.dataset.id, 'cancelled');
        }
    });

    function fetchAllData() {
        fetchStats();
        fetchPendingOrders();
        fetchOrderHistory();
    }

    // Carga inicial y actualización periódica
    fetchAllData();
    setInterval(fetchAllData, 5000); // Actualiza cada 5 segundos
});
