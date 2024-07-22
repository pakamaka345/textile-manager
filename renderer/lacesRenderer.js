const { ipcRenderer } = require('electron');

document.getElementById('toggle-btn').addEventListener('click', function() {
    const laceTable = document.getElementById('laces-table');
    const toggleBtn = document.getElementById('toggle-btn');
    const tableBtn = document.getElementById('toggle-btn-table');

    toggleBtn.addEventListener('click', () => {
        laceTable.classList.remove('hidden');
        getLaces();
    });

    tableBtn.addEventListener('click', () => {
        laceTable.classList.add('hidden');
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });

    getDataReferences('colors');
    getDataReferences('suppliers');

    addLace();
});

function addLace() {
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

        const file = document.getElementById('image').files[0];
        const reader = new FileReader();

        if (file) {
            reader.readAsDataURL(file);
            reader.onload = function() {
                const base64String = reader.result;
                ipcRenderer.send('add-lace', {
                    code, name, colorId, purchasePrice, sellingPrice, length, supplierId, date, image: base64String
                });
            }
        }
        else {
            ipcRenderer.send('add-lace', {
                code, name, colorId, purchasePrice, sellingPrice, length, supplierId, date, image: null
            });
        }

        document.getElementById('code').value = '';
        document.getElementById('name').value = '';
        document.getElementById('colors-id').value = '';
        document.getElementById('purchaseprice').value = '';
        document.getElementById('sellingprice').value = '';
        document.getElementById('length').value = '';
        document.getElementById('suppliers-id').value = '';
        document.getElementById('date').value = '';
        document.getElementById('image').value = '';
    });
}

function getLaces() {
    ipcRenderer.send('get-laces', null);
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

ipcRenderer.on('laces', (event, laces) => {
    const table = document.getElementById('table-body');
    table.innerHTML = ''; 

    laces.forEach(lace => {
        const tr = document.createElement('tr');
        tr.classList.add('hover:bg-gray-600'); // Add hover effect

        tr.innerHTML = `
            <td class="py-2 px-4">
                <button class="delete-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-id="${lace.id}">
                    Видалити
                </button>
            </td>
            <td class="py-2 px-4 flex justify-center items-center">
                ${lace.image ? `<img src="${lace.image}" class="w-16 h-16 object-cover">` : ''}
            </td>
            <td class="py-2 px-4 border">${lace.id}</td>
            <td class="py-2 px-4 border">${lace.code}</td>
            <td class="py-2 px-4 border">${lace.name}</td>
            <td class="py-2 px-4 border">${lace.color}</td>
            <td class="py-2 px-4 border ($)">${lace.purchaseprice}</td>
            <td class="py-2 px-4 border (₴)">${lace.sellingprice}</td>
            <td class="py-2 px-4 border">${lace.length}</td>
            <td class="py-2 px-4 border">${lace.supplier}</td>
            <td class="py-2 px-4 border">${lace.date}</td>
        `;

        table.appendChild(tr);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            ipcRenderer.send('delete-lace', { id });
        });
    });
});


ipcRenderer.on('lace-delete', (event, arg) => {
    getLaces(); 
    console.log(`Видалено мереживо: ${arg.id}`);
});

ipcRenderer.on('reference-failed', (event, err) => {
    console.error(`Помилка з довідником: ${err}`);
});

ipcRenderer.on('lace-added', (event, arg) => {
    console.log(`Мереживо ${arg.name} успішно додана.`);
    const errDiv = document.getElementById('error');
    errDiv.classList.add('hidden');
    getLaces();
});

ipcRenderer.on('lace-failed', (event, err) => {
    const error = document.getElementById('error-text');
    const errDiv = document.getElementById('error');
    errDiv.classList.remove('hidden');
    error.innerText = err;
    console.error(`Помилка з таблицею мережива: ${err}`);
});
