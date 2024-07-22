const { ipcRenderer } = require('electron');

document.getElementById('toggle-btn').addEventListener('click', function() {
    const tulleTable = document.getElementById('tulles-table');
    const toggleBtn = document.getElementById('toggle-btn');
    const tableBtn = document.getElementById('toggle-btn-table');

    toggleBtn.addEventListener('click', () => {
        tulleTable.classList.remove('hidden');
        getTulles();
    });

    tableBtn.addEventListener('click', () => {
        tulleTable.classList.add('hidden');
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });

    getDataReferences('colors');
    getDataReferences('fabrictypes');
    getDataReferences('tulletypes');
    getDataReferences('suppliers');

    addTulle();
});

function addTulle() {
    const btn = document.querySelector('button[type="submit"]');
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        const code = document.getElementById('code').value;
        const name = document.getElementById('name').value;
        const colorId = document.getElementById('colors-id').value;
        const fabricTypeId = document.getElementById('fabrictypes-id').value;
        const tulleTypeId = document.getElementById('tulletypes-id').value;
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
                ipcRenderer.send('add-tulle', {
                    code, name, colorId, fabricTypeId, tulleTypeId, purchasePrice, sellingPrice, length, supplierId, date, image: base64String
                });
            }
        } 
        else {
            ipcRenderer.send('add-tulle', {
                code, name, colorId, fabricTypeId, tulleTypeId, purchasePrice, sellingPrice, length, supplierId, date, image: null
            });
        }
        

        document.getElementById('code').value = '';
        document.getElementById('name').value = '';
        document.getElementById('colors-id').value = '';
        document.getElementById('fabrictypes-id').value = '';
        document.getElementById('tulletypes-id').value = '';
        document.getElementById('purchaseprice').value = '';
        document.getElementById('sellingprice').value = '';
        document.getElementById('length').value = '';
        document.getElementById('suppliers-id').value = '';
        document.getElementById('date').value = '';
        document.getElementById('image').value = '';
    });
}

function getTulles() {
    ipcRenderer.send('get-tulles', null);
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

ipcRenderer.on('tulles', (event, tulles) => {
    const table = document.getElementById('table-body');
    table.innerHTML = ''; 

    tulles.forEach(tulle => {
        const tr = document.createElement('tr');
        tr.classList.add('hover:bg-gray-600'); // Add hover effect

        tr.innerHTML = `
            <td class="py-2 px-4">
                <button class="delete-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-id="${tulle.id}">
                    Видалити
                </button>
            </td>
            <td class="py-2 px-4 flex justify-center items-center">
                ${tulle.image ? `<img src="${tulle.image}" class="w-16 h-16 object-cover">` : ''}
            </td>
            <td class="py-2 px-4 border">${tulle.id}</td>
            <td class="py-2 px-4 border">${tulle.code}</td>
            <td class="py-2 px-4 border">${tulle.name}</td>
            <td class="py-2 px-4 border">${tulle.color}</td>
            <td class="py-2 px-4 border">${tulle.fabric}</td>
            <td class="py-2 px-4 border">${tulle.tulle}</td>
            <td class="py-2 px-4 border ($)">${tulle.purchaseprice}</td>
            <td class="py-2 px-4 border (₴)">${tulle.sellingprice}</td>
            <td class="py-2 px-4 border">${tulle.length}</td>
            <td class="py-2 px-4 border">${tulle.supplier}</td>
            <td class="py-2 px-4 border">${tulle.date}</td>
        `;

        table.appendChild(tr);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            ipcRenderer.send('delete-tulle', { id });
        });
    });
});


ipcRenderer.on('tulle-delete', (event, arg) => {
    getTulles(); 
    console.log(`Видалено тюль: ${arg.id}`);
});

ipcRenderer.on('reference-failed', (event, err) => {
    console.error(`Помилка з довідником: ${err}`);
});

ipcRenderer.on('tulle-added', (event, arg) => {
    console.log(`Тюль ${arg.name} успішно додана.`);
    const errDiv = document.getElementById('error');
    errDiv.classList.add('hidden');
    getTulles();
});

ipcRenderer.on('tulle-failed', (event, err) => {
    const error = document.getElementById('error-text');
    const errDiv = document.getElementById('error');
    errDiv.classList.remove('hidden');
    error.innerText = err;
    console.error(`Помилка з таблицею тюлей: ${err}`);
});
