const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });

    renderTable();
});

function renderTable() {
    ipcRenderer.send('get-search-fittings', null);
}

ipcRenderer.on('search-fittings', (event, arg) => {
    const { fittings, colors, suppliers } = arg;
    
    const filter_code = document.getElementById('filter-code-input');
    const filter_name = document.getElementById('filter-name-input');
    const filter_date = document.getElementById('filter-date-input');
    const filter_color = document.getElementById('color-filters');
    const filter_supplier = document.getElementById('supplier-filters');
    const apply_filters = document.getElementById('apply-filters');
    const clear_filters = document.getElementById('clear-filters');
    
    filter_code.innerHTML = '';
    filter_name.innerHTML = '';
    filter_date.innerHTML = '';
    filter_color.innerHTML = '';
    filter_supplier.innerHTML = '';

    showTable(fittings, colors, suppliers);

    let selectedColors = [];
    let selectedSuppliers = [];
    let code;
    let name;
    let date;

    colors.forEach((color) => {
        createFilterOption(filter_color, color, selectedColors);
    });

    suppliers.forEach((supplier) => {
        createFilterOption(filter_supplier, supplier, selectedSuppliers);
    });  

    filter_code.addEventListener('input', (event) => {
        code = event.target.value;
    });

    filter_name.addEventListener('input', (event) => {
        name = event.target.value;
    });

    filter_date.addEventListener('input', (event) => {
        date = event.target.value;
    });
    
    apply_filters.addEventListener('click', () => {
        const filteredfittings = fittings.filter(fitting => {
            return (!code || fitting.code.includes(code)) &&
                   (!name || fitting.name.includes(name)) &&
                   (!date || fitting.date.includes(date)) &&
                   (selectedColors.length === 0 || selectedColors.includes(fitting.color_id)) &&
                   (selectedSuppliers.length === 0 || selectedSuppliers.includes(fitting.supplier_id));
        });
    
        showTable(filteredfittings, colors, suppliers);
    });

    clear_filters.addEventListener('click', () => {
        filter_code.value = '';
        filter_name.value = '';
        filter_date.value = '';
        selectedColors = [];
        selectedSuppliers = [];
        document.querySelectorAll('input[type=checkbox]').forEach(checkbox => checkbox.checked = false);
        renderTable();
    });
});

ipcRenderer.on('search-failed', (event, arg) => {
    console.error(`Помилка в пошуку: ${arg}`);
});

ipcRenderer.on('search-updated', (event, arg) => {
    const { column, value, id } = arg;
    console.log(`Значення ${column} для id ${id} оновлено на ${value}`);
    renderTable();
});

function makeCellEditable(cell) {
    const originalValue = cell.innerText;
    const column = cell.getAttribute('data-column');
    const id = cell.getAttribute('data-id');
    let input;

    if (column === 'date') {
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'p-2 w-full bg-gray-700 text-white';
        input.value = originalValue;
        flatpickr(input, {
            enableTime: false,
            dateFormat: "d-m-Y",
            allowInput: true
        });
    } else {
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'p-2 w-full bg-gray-700 text-white';
        input.value = originalValue;
    }

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            cell.innerText = input.value;
            ipcRenderer.send('update-search', { column, value: input.value, id, table: 'fittings' });
        } else if (event.key === 'Escape') {
            cell.innerText = originalValue;
        }
    });

    cell.innerText = '';
    cell.appendChild(input);
    input.focus();
}

function makeCellEditableSelect(cell, colors, suppliers) {
    const originalText = cell.innerText;
    const column = cell.getAttribute('data-select');
    const id = cell.getAttribute('data-id');
    let select;

    if (column === 'color_id') {
        select = document.createElement('select');
        select.className = 'p-2 w-full bg-gray-700 text-white';
        colors.forEach((color) => {
            const option = document.createElement('option');
            option.value = color.id;
            option.innerText = color.name;
            select.appendChild(option);
        });
    } else if (column === 'supplier_id') {
        select = document.createElement('select');
        select.className = 'p-2 w-full bg-gray-700 text-white';
        suppliers.forEach((supplier) => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.innerText = supplier.name;
            select.appendChild(option);
        });
    }

    select.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            cell.innerText = select.options[select.selectedIndex].innerText;
            ipcRenderer.send('update-search', { column, value: select.value, id, table: 'fittings' });
        } else if (event.key === 'Escape') {
            cell.innerText = originalText;
        }
    });

    cell.innerText = '';
    cell.appendChild(select);
    select.focus();
}

function createFilterOption(filter, item, selectedItems) {
    const li = document.createElement('li');
    li.className = 'py-1 px-3 flex items-center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mr-2'; 
    checkbox.value = item.id; 

    checkbox.addEventListener('change', function(event) {
        if (this.checked) {
            selectedItems.push(item.id);
        } else {
            const index = selectedItems.indexOf(item.id);
            if (index > -1) {
                selectedItems.splice(index, 1); 
            }
        }
    });
    
    const label = document.createElement('span');
    label.innerText = item.name;
    
    li.appendChild(checkbox);
    li.appendChild(label);
    
    filter.appendChild(li);
}

function showTable(fittings, colors, suppliers) {
    const table = document.getElementById('product-table-body');
    table.innerHTML = '';

    fittings.forEach((fitting) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td class="py-2 px-4 flex justify-center items-center">
            ${fitting.image ? `<img src="${fitting.image}" class="w-16 h-16 object-cover">` : ''}
            </td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="code" data-id="${fitting.id}">${fitting.code}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="name" data-id="${fitting.id}">${fitting.name}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-select="color_id" data-id="${fitting.id}">${fitting.color}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="purchaseprice" data-id="${fitting.id}">${fitting.purchaseprice}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="sellingprice" data-id="${fitting.id}">${fitting.sellingprice}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="length" data-id="${fitting.id}">${fitting.length}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-select="supplier_id" data-id="${fitting.id}">${fitting.supplier}</td>
            <td style="white-space: nowrap;" style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600 w-64" data-column="date" data-id="${fitting.id}">${fitting.date}</td>
        `;
        table.appendChild(row);

        row.querySelectorAll('[data-column]').forEach((cell) => {
            cell.addEventListener('dblclick', () => {
                makeCellEditable(cell);
            });
        });

        row.querySelectorAll('[data-select]').forEach((cell) => {
            cell.addEventListener('dblclick', () => {
                makeCellEditableSelect(cell, colors, suppliers);
            });
        });

        row.querySelectorAll('[data-img]').forEach((cell) => {
            cell.addEventListener('dblclick', () => {
                makeImageEditable(cell);
            });
        });
    });
}