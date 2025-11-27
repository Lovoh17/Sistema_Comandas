document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu');
    const orderSummary = document.getElementById('orderSummary');
    const totalPriceEl = document.getElementById('totalPrice');
    const orderForm = document.getElementById('orderForm');

    const menu = {
        'Entradas': {
            'ensalada': 5.00,
            'nachos': 7.50,
        },
        'Plato Fuerte': {
            'hamburguesa': 12.00,
            'pizza': 15.00,
        },
        'Bebidas': {
            'refresco': 2.50,
            'cerveza': 4.00,
        }
    };

    let currentOrder = [];

    function renderMenu() {
        for (const category in menu) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `<h3>${category}</h3>`;
            for (const item in menu[category]) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.innerHTML = `
                    <span class="item-name">${item} ($${menu[category][item].toFixed(2)})</span>
                    <button class="add-item" data-category="${category}" data-name="${item}">Añadir</button>
                `;
                categoryDiv.appendChild(itemDiv);
            }
            menuContainer.appendChild(categoryDiv);
        }
    }

    function renderSummary() {
        orderSummary.innerHTML = '';
        let total = 0;
        currentOrder.forEach(orderItem => {
            const itemTotal = menu[orderItem.category][orderItem.name] * orderItem.quantity;
            total += itemTotal;
            const summaryItem = document.createElement('div');
            summaryItem.className = 'item';
            summaryItem.innerHTML = `
                <span>${orderItem.quantity} x ${orderItem.name}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            `;
            orderSummary.appendChild(summaryItem);
        });
        totalPriceEl.textContent = total.toFixed(2);
    }

    menuContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-item')) {
            const itemName = e.target.dataset.name;
            const itemCategory = e.target.dataset.category;
            const existingItem = currentOrder.find(item => item.name === itemName);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                currentOrder.push({ category: itemCategory.toLowerCase().replace(' ', '_'), name: itemName, quantity: 1 });
            }
            renderSummary();
        }
    });

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;

        if (currentOrder.length === 0) {
            alert('Por favor, añade al menos un artículo a tu pedido.');
            return;
        }

        const response = await fetch('/api/user/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerName: customerName,
                customerPhone: customerPhone,
                items: currentOrder
            }),
        });

        if (response.ok) {
            alert('¡Pedido realizado con éxito!');
            orderForm.reset();
            currentOrder = [];
            renderSummary();
        } else {
            alert('Hubo un error al realizar el pedido.');
        }
    });

    renderMenu();
});
