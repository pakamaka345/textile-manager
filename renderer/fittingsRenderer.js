const { ipcRenderer } = require('electron');

document.getElementById('toggle-btn').addEventListener('click', function() {
    const fittingTable = document.getElementById('fittings-table');
    const toggleBtn = document.getElementById('toggle-btn');
    const tableBtn = document.getElementById('toggle-btn-table');

    toggleBtn.addEventListener('click', () => {
        fittingTable.classList.remove('hidden');
        getFittings();
    });

    tableBtn.addEventListener('click', () => {
        fittingTable.classList.add('hidden');
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });

    getDataReferences('colors');
    getDataReferences('suppliers');

    addFittings();
});

function addFittings() {
    const btn = document.querySelector('button[type="submit"]');
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        const code = document.getElementById('code').value;
        const name = document.getElementById('name').value;
        const colorId = document.getElementById('colors-id').value;
        const purchasePrice = document.getElementById('purchaseprice').value;
        const sellingPrice = document.getElementById('sellingprice').value;
        const length = document.getElementById('length').value;
        const supplierId = document.getElementById('suppliers-id').value;
        const date = document.getElementById('date').value;
    
        ipcRenderer.send('add-fitting', {
            code, name, colorId, purchasePrice, sellingPrice, length, supplierId, date
        });

        document.getElementById('code').value = '';
        document.getElementById('name').value = '';
        document.getElementById('colors-id').value = '';
        document.getElementById('purchaseprice').value = '';
        document.getElementById('sellingprice').value = '';
        document.getElementById('length').value = '';
        document.getElementById('suppliers-id').value = '';
        document.getElementById('date').value = '';
    });
}

function getFittings() {
    ipcRenderer.send('get-fittings', null);
}

function getDataReferences(type) {
    ipcRenderer.send('get-references', { type });
}

ipcRenderer.on('references', (event, arg) => {
    const { type, references } = arg;
    const element = document.getElementById(`${type}-id`);

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.innerText = 'Оберіть...';
    element.appendChild(defaultOption);

    references.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.innerText = item.name;
        element.appendChild(option);
    });
});

ipcRenderer.on('fittings', (event, fittings) => {
    const table = document.getElementById('table-body');
    table.innerHTML = ''; 

    fittings.forEach(fitting => {
        const tr = document.createElement('tr');
        tr.classList.add('hover:bg-gray-600'); // Add hover effect

        tr.innerHTML = `
            <td class="py-2 px-4">
                <button class="delete-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-id="${fitting.id}">
                    Видалити
                </button>
            </td>
            <td class="py-2 px-4 border">${fitting.id}</td>
            <td class="py-2 px-4 border">${fitting.code}</td>
            <td class="py-2 px-4 border">${fitting.name}</td>
            <td class="py-2 px-4 border">${fitting.color}</td>
            <td class="py-2 px-4 border ($)">${fitting.purchaseprice}</td>
            <td class="py-2 px-4 border (₴)">${fitting.sellingprice}</td>
            <td class="py-2 px-4 border">${fitting.length}</td>
            <td class="py-2 px-4 border">${fitting.supplier}</td>
            <td class="py-2 px-4 border">${fitting.date}</td>
        `;

        table.appendChild(tr);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            ipcRenderer.send('delete-fitting', { id });
        });
    });
});


ipcRenderer.on('fitting-delete', (event, arg) => {
    getFittings(); 
    console.log(`Видалено фурнітуру: ${arg.id}`);
});

ipcRenderer.on('reference-failed', (event, err) => {
    console.error(`Помилка з довідником: ${err}`);
});

ipcRenderer.on('fitting-added', (event, arg) => {
    console.log(`Фурнітура ${arg.name} успішно додана.`);
    const errDiv = document.getElementById('error');
    errDiv.classList.add('hidden');
    getFittings();
});

ipcRenderer.on('fitting-failed', (event, err) => {
    const error = document.getElementById('error-text');
    const errDiv = document.getElementById('error');
    errDiv.classList.remove('hidden');
    error.innerText = err;
    console.error(`Помилка з таблицею фурнітур: ${err}`);
});
