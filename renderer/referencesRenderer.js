const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');

    setTitle(type);
    showTable(type);
    addReference(type);
});

function addReference(type) {
    const btn = document.querySelector('button[type="submit"]');
    btn.addEventListener('click', async (event) => { 
        event.preventDefault();
        const name = document.getElementById('name').value;
        const errText = document.getElementById('error-text');
        const errorDiv = document.getElementById('error');

        try {
            const exists = await checkReference(type, name); 
            if (name !== ''){
                if (!exists) {
                    ipcRenderer.send('add-reference', { type, name });
                    errText.innerText = '';
                    errorDiv.classList.add('hidden');
                } else {
                    errText.innerText = 'Такий запис вже існує';
                    errorDiv.classList.remove('hidden');
                }
            } else {
                errText.innerText = 'Поле не може бути пустим';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error checking reference:', error);
            errText.innerText = 'Помилка перевірки запису';
            errorDiv.classList.remove('hidden');
        }
        document.getElementById('name').value = '';
    });
}

async function checkReference(type, name) {
    return result = await ipcRenderer.invoke('check-reference', { type, name });
}

function setTitle(type) {
    switch(type) {
        case 'colors':
            document.getElementById('title').innerText = 'Довідник кольорів';
            break;
        case 'suppliers':
            document.getElementById('title').innerText = 'Довідник постачальників';
            break;
        case 'curtaintypes':
            document.getElementById('title').innerText = 'Довідник типів тканин штор';
            break;
        case 'tulletypes':
            document.getElementById('title').innerText = 'Довідник типів тканин тюлі';
            break;
        case 'fabrictypes':
            document.getElementById('title').innerText = 'Довідник видів тканин';
            break;
    }
}

function showTable(type) {
    ipcRenderer.send('get-references', { type });
}

ipcRenderer.on('references', (event, arg) => {
    const { type, references } = arg;
    const table = document.getElementById('table-body');
    table.innerHTML = '';
    references.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="w-1/6 px-4 py-2">
                <button class="delete-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-id="${row.id}" data-type="${type}">
                    Видалити
                </button>
            </td>
            <td class="w-5/6 px-4 py-2 text-lg">${row.name}</td>
        `;
        table.appendChild(tr);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const { id, type } = event.target.dataset;
            ipcRenderer.send('delete-reference', { id, type });
        })
    });
});

ipcRenderer.on('reference-delete', (event, arg) => {
    showTable(arg.type);
    console.log(`Видалено з довідника: ${arg.id}`);
});

ipcRenderer.on('reference-added', (event, arg) => {
    showTable(arg.type);
    console.log(`Додано до довідника: ${arg.name}`);
});

ipcRenderer.on('reference-failed', (event, err) => {
    console.error(`Помилка додавання до довідника: ${err}`);
});
