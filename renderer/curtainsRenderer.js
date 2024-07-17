const { ipcRenderer } = require('electron');

document.getElementById('toggle-btn').addEventListener('click', function() {
    const curtainTable = document.getElementById('curtains-table');
    const toggleBtn = document.getElementById('toggle-btn');
    const tableBtn = document.getElementById('toggle-btn-table');

    toggleBtn.addEventListener('click', () => {
        curtainTable.classList.remove('hidden');
        getCurtains();
    });

    tableBtn.addEventListener('click', () => {
        curtainTable.classList.add('hidden');
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });

    getDataReferences('colors');
    getDataReferences('fabrictypes');
    getDataReferences('curtaintypes');
    getDataReferences('suppliers');

    addCurtain();
});

function addCurtain() {
    const btn = document.querySelector('button[type="submit"]');
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        const code = document.getElementById('code').value;
        const name = document.getElementById('name').value;
        const colorId = document.getElementById('colors-id').value;
        const fabricTypeId = document.getElementById('fabrictypes-id').value;
        const curtainTypeId = document.getElementById('curtaintypes-id').value;
        const purchasePrice = document.getElementById('purchaseprice').value;
        const sellingPrice = document.getElementById('sellingprice').value;
        const length = document.getElementById('length').value;
        const supplierId = document.getElementById('suppliers-id').value;
        const date = document.getElementById('date').value;
    
        ipcRenderer.send('add-curtain', {
            code, name, colorId, fabricTypeId, curtainTypeId, purchasePrice, sellingPrice, length, supplierId, date
        });

        document.getElementById('code').value = '';
        document.getElementById('name').value = '';
        document.getElementById('colors-id').value = '';
        document.getElementById('fabrictypes-id').value = '';
        document.getElementById('curtaintypes-id').value = '';
        document.getElementById('purchaseprice').value = '';
        document.getElementById('sellingprice').value = '';
        document.getElementById('length').value = '';
        document.getElementById('suppliers-id').value = '';
        document.getElementById('date').value = '';
    });
}

function getCurtains() {
    ipcRenderer.send('get-curtains', null);
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

ipcRenderer.on('curtains', (event, curtains) => {
    const table = document.getElementById('table-body');
    table.innerHTML = ''; 

    curtains.forEach(curtain => {
        const tr = document.createElement('tr');
        tr.classList.add('hover:bg-gray-600'); // Add hover effect

        tr.innerHTML = `
            <td class="py-2 px-4">
                <button class="delete-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-id="${curtain.id}">
                    Видалити
                </button>
            </td>
            <td class="py-2 px-4 border">${curtain.id}</td>
            <td class="py-2 px-4 border">${curtain.code}</td>
            <td class="py-2 px-4 border">${curtain.name}</td>
            <td class="py-2 px-4 border">${curtain.color}</td>
            <td class="py-2 px-4 border">${curtain.fabric}</td>
            <td class="py-2 px-4 border">${curtain.curtain}</td>
            <td class="py-2 px-4 border ($)">${curtain.purchaseprice}</td>
            <td class="py-2 px-4 border (₴)">${curtain.sellingprice}</td>
            <td class="py-2 px-4 border">${curtain.length}</td>
            <td class="py-2 px-4 border">${curtain.supplier}</td>
            <td class="py-2 px-4 border">${curtain.date}</td>
        `;

        table.appendChild(tr);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            ipcRenderer.send('delete-curtain', { id });
        });
    });
});


ipcRenderer.on('curtain-delete', (event, arg) => {
    getCurtains(); 
    console.log(`Видалено штору: ${arg.id}`);
});

ipcRenderer.on('reference-failed', (event, err) => {
    console.error(`Помилка з довідником: ${err}`);
});

ipcRenderer.on('curtain-added', (event, arg) => {
    console.log(`Штора ${arg.name} успішно додана.`);
    const errDiv = document.getElementById('error');
    errDiv.classList.add('hidden');
    getCurtains();
});

ipcRenderer.on('curtain-failed', (event, err) => {
    const error = document.getElementById('error-text');
    const errDiv = document.getElementById('error');
    errDiv.classList.remove('hidden');
    error.innerText = err;
    console.error(`Помилка додавання штори: ${err}`);
});
