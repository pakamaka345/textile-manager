const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });

    ipcRenderer.send('get-ordersId', (null));

    textileLogic('curtains');
    textileLogic('tulles');
    textileLogic('laces');
    textileLogic('fittings');
    addOrder();

    const orderID = document.getElementById('number');
    orderID.addEventListener('input', async () => {
        const order_id = orderID.value;
        const checkedId = await ipcRenderer.invoke('check-orderId', { order_id });
        if (checkedId) {
            ipcRenderer.send('get-order-list', { table: 'curtains', id: order_id });
            ipcRenderer.send('get-order-list', { table: 'tulles', id: order_id });
            ipcRenderer.send('get-order-list', { table: 'laces', id: order_id });
            ipcRenderer.send('get-order-list', { table: 'fittings', id: order_id });
        }
    });
});

function addOrder() {
    const id = document.getElementById('number');
    const date = document.getElementById('date');
    const work_price = document.getElementById('work_price');
    const discount = document.getElementById('discount');
    const prepayment = document.getElementById('prepayment');
    const phone_number = document.getElementById('phone_number');
    const submitBtn = document.getElementById('order-submit');

    submitBtn.addEventListener('click', (event) => {
        event.preventDefault();

        ipcRenderer.send('add-order', { 
            id: id.value,
            date: date.value,
            work_price: work_price.value,
            discount: discount.value,
            prepayment: prepayment.value,
            phone_number: phone_number.value
        });

        date.value = '';
        work_price.value = '';
        discount.value = '';
        prepayment.value = '';
        phone_number.value = '';
    });
}

function textileLogic(textile) {
    ipcRenderer.send('get-textile', { textile });
}

ipcRenderer.on('textile', (event, arg) => {
    let { table, result } = arg;

    const codeInput = document.getElementById(`${table}-code`);
    const nameInput = document.getElementById(`${table}-name`);
    const length = document.getElementById(`${table}-length`);
    const sellingPrice = document.getElementById(`${table}-sellingprice`);
    const toggle = document.getElementById(`${table}-toggle`);
    const select = document.getElementById(`${table}`);
    const submitBtn = document.getElementById(`${table}-submit`);
    const orderID = document.getElementById('number');

    const initialData = result;

    function updateSelect(data) {
        select.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.text = 'Оберіть...';
        defaultOption.value = '';
        select.add(defaultOption);

        data.forEach((item) => {
            const option = document.createElement('option');
            option.text = `${item.code} : ${item.name} : ${item.color} : ${item.length}`;
            option.value = item.id;
            select.add(option);
        });
    }

    updateSelect(initialData);

    codeInput.addEventListener('input', () => {
        const filteredData = initialData.filter(item => item.code.startsWith(codeInput.value) && item.name.startsWith(nameInput.value));
        updateSelect(filteredData);
    });

    nameInput.addEventListener('input', () => {
        const filteredData = initialData.filter(item => item.code.startsWith(codeInput.value) && item.name.startsWith(nameInput.value));
        updateSelect(filteredData);
    });

    select.addEventListener('change', () => {
        const selectedId = parseInt(select.value, 10);
        const selected = initialData.find(item => selectedId === item.id);
        codeInput.value = selected.code;
        nameInput.value = selected.name;
        sellingPrice.value = selected.sellingprice;
    });

    submitBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        
        const textile_id = select.value;
        const lenghtInDB = await ipcRenderer.invoke('get-textileasync', { table, id: textile_id });
        const currentLength = parseFloat(length.value);
        const isEnd = toggle.checked;
        const updatedLength = isEnd ? 0 : lenghtInDB - currentLength;

        if (updatedLength < 0) {
            try { 
                const realLength = await showModal();
                ipcRenderer.send('update-length', { table: table, id: textile_id, length: realLength });
            } catch (err) {
                console.error(`Error: ${err}`);
            }
        } else {
            ipcRenderer.send('update-length', { table: table, id: textile_id, length: updatedLength });
        }

        ipcRenderer.send('add-order-textile', {
            table: table,
            order_id: orderID.value,
            textile_id: textile_id,
            length: currentLength,
            sellingprice: sellingPrice.value
        });

        codeInput.value = '';
        nameInput.value = '';
        select.value = '';
        length.value = ''
        sellingPrice.value = '';
        document.getElementById(`${table}-toggle`).checked = false;

        ipcRenderer.send('get-textile', { textile: table });
        ipcRenderer.send('get-order-list', { table: 'curtains', id: orderID.value });
        ipcRenderer.send('get-order-list', { table: 'tulles', id: orderID.value });
        ipcRenderer.send('get-order-list', { table: 'laces', id: orderID.value });
        ipcRenderer.send('get-order-list', { table: 'fittings', id: orderID.value });
    });
});

function showModal() {
    return new Promise((resolve, reject) => {
        const modal = document.getElementById('realLengthModal');
        const input = document.getElementById('realLengthInput');
        const confirmBtn = document.getElementById('confirmRealLengthBtn');

        modal.style.display = 'block';

        confirmBtn.onclick = () => {
            const realLength = parseFloat(input.value);
            if (!isNaN(realLength) && realLength >= 0) {
                modal.style.display = 'none'; // Сховати модальне вікно
                resolve(realLength);
            } else {
                reject(new Error('Invalid input'));
            }
        };
    });
}

ipcRenderer.on('order-list', (event, arg) => {
    let { table, result } = arg;

    const ulBody = document.getElementById(`${table}-list`);
    ulBody.innerHTML = '';

    result.forEach((item) => {
        const delete_btn = document.createElement('button');
        delete_btn.innerText = 'Видалити з замовлення';
        delete_btn.className = 'ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded';
        delete_btn.onclick = () => {
            ipcRenderer.send('delete-order-textile', { table: table, order_id: item.order_id, textile_id: item.textile_id, length: item.length });
            ipcRenderer.send('get-order-list', { table: 'curtains', id: item.order_id });
            ipcRenderer.send('get-order-list', { table: 'tulles', id: item.order_id });
            ipcRenderer.send('get-order-list', { table: 'laces', id: item.order_id });
            ipcRenderer.send('get-order-list', { table: 'fittings', id: item.order_id });
        }
    
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-gray-700 text-white p-2 mb-2 rounded';
        li.innerHTML = `
            <span>${item.code} : ${item.name} : ${item.color} : ${item.length} м. : ${item.sellingprice} грн.</span>
        `;
        li.appendChild(delete_btn);
        ulBody.appendChild(li);
    });
});

ipcRenderer.on('order-textile-deleted', (event, arg) => {
    console.log(`Order textile deleted: ${arg.table} ${arg.order_id} ${arg.textile_id}`);
});

ipcRenderer.on('order-added', (event, arg) => {
    console.log(`Order added: ${arg.id}`);
});

ipcRenderer.on('length-updated', (event, arg) => {
    console.log(`Length updated: ${arg.id} to ${arg.length}`);
});

ipcRenderer.on('order-textile-added', (event, arg) => {
    console.log(`Order textile added: ${arg.table} ${arg.order_id} ${arg.textile_id}`);
});

ipcRenderer.on('ordersId', (event, result) => {
    let id = result.id;
    const orderId = document.getElementById('number');
    orderId.value = id + 1;
}); 

ipcRenderer.on('orders-failed', (err) => {
    console.log(`Error: ${err}`);
});
