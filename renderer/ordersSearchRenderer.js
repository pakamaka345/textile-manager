const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });
    ipcRenderer.send('get-search-orders', {});
});

ipcRenderer.on('search-orders', (event, orders) => {
    showOrders(orders);

    const phone_filter = document.getElementById('filter-phone-number-input');
    const date_filter = document.getElementById('filter-date-input');

    let phone_number = '';
    let date = '';

    phone_filter.addEventListener('input', (event) => {
        phone_number = event.target.value;
    });

    date_filter.addEventListener('input', (event) => {
        date = event.target.value;
    });

    document.getElementById('apply-filters').addEventListener('click', () => {
        const filtered_orders = orders.filter(order => {
            return order.phone_number.includes(phone_number) && order.date.includes(date);
        });
        showOrders(filtered_orders);
    });

    document.getElementById('clear-filters').addEventListener('click', () => {
        phone_filter.value = '';
        date_filter.value = '';
        phone_number = '';
        date = '';
        ipcRenderer.send('get-search-orders', {});
    });
});

ipcRenderer.on('search-failed', (event, error) => {
    console.error('Search failed:', error);
});

function showOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';


    orders.forEach(order => {
        let total_price = totalprice(order);
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <h2 class="text-xl font-bold mb-2">Замовлення #${order.id}</h2>
            <p class="mb-2"><strong>Дата:</strong> ${order.date}</p>
            <p class="mb-2"><strong>Ціна роботи:</strong> ${order.work_price}</p>
            <p class="mb-2"><strong>Знижка:</strong> ${order.discount}</p>
            <p class="mb-2"><strong>Передоплата:</strong> ${order.prepayment}</p>
            <p class="mb-2"><strong>Номер телефону:</strong> ${order.phone_number}</p>
            <p class="mb-2"><strong>Загальна ціна:</strong> ${total_price}</p>
            <div class="items">
                ${order.curtains.length > 0 ? `
                    <h3 class="text-lg font-semibold mb-2 border-b-2 border-gray-600 pb-1">Штори:</h3>
                    ${order.curtains.map(curtain => `
                        <div class="item">
                            <p><strong>Код:</strong> ${curtain.code}</p>
                            <p><strong>Назва:</strong> ${curtain.name}</p>
                            <p><strong>Довжина:</strong> ${curtain.length}</p>
                            <p><strong>Ціна:</strong> ${curtain.sellingprice}</p>
                            <p><strong>Колір:</strong> ${curtain.color}</p>
                        </div>
                    `).join('')}
                    <hr class="my-2 border-gray-700">
                ` : ''}

                ${order.tulles.length > 0 ? `
                    <h3 class="text-lg font-semibold mb-2 border-b-2 border-gray-600 pb-1">Тюлі:</h3>
                    ${order.tulles.map(tulle => `
                        <div class="item">
                            <p><strong>Код:</strong> ${tulle.code}</p>
                            <p><strong>Назва:</strong> ${tulle.name}</p>
                            <p><strong>Довжина:</strong> ${tulle.length}</p>
                            <p><strong>Ціна:</strong> ${tulle.sellingprice}</p>
                            <p><strong>Колір:</strong> ${tulle.color}</p>
                        </div>
                    `).join('')}
                    <hr class="my-2 border-gray-700">
                ` : ''}

                ${order.laces.length > 0 ? `
                    <h3 class="text-lg font-semibold mb-2 border-b-2 border-gray-600 pb-1">Мережива:</h3>
                    ${order.laces.map(lace => `
                        <div class="item">
                            <p><strong>Код:</strong> ${lace.code}</p>
                            <p><strong>Назва:</strong> ${lace.name}</p>
                            <p><strong>Довжина:</strong> ${lace.length}</p>
                            <p><strong>Ціна:</strong> ${lace.sellingprice}</p>
                            <p><strong>Колір:</strong> ${lace.color}</p>
                        </div>
                    `).join('')}
                    <hr class="my-2 border-gray-700">
                ` : ''}

                ${order.fittings.length > 0 ? `
                    <h3 class="text-lg font-semibold mb-2 border-b-2 border-gray-600 pb-1">Фурнітура:</h3>
                    ${order.fittings.map(fitting => `
                        <div class="item">
                            <p><strong>Код:</strong> ${fitting.code}</p>
                            <p><strong>Назва:</strong> ${fitting.name}</p>
                            <p><strong>Довжина:</strong> ${fitting.length}</p>
                            <p><strong>Ціна:</strong> ${fitting.sellingprice}</p>
                            <p><strong>Колір:</strong> ${fitting.color}</p>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

function totalprice(order) {
    let total_price = 0;
    total_price += order.work_price;
        order.curtains.forEach(curtain => {
            total_price += curtain.sellingprice * curtain.length;
        });
        order.tulles.forEach(tulle => {
            total_price += tulle.sellingprice * tulle.length;
        }
        );
        order.laces.forEach(lace => {
            total_price += lace.sellingprice * lace.length;
        });
        order.fittings.forEach(fitting => {
            total_price += fitting.sellingprice * fitting.length;
        });

    return total_price;
}



