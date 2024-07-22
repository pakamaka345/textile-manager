const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });

    renderTable();
});

function renderTable() {
    ipcRenderer.send('get-search-curtains', null);
}

ipcRenderer.on('search-curtains', (event, arg) => {
    const { curtains, colors, fabrictypes, curtaintypes, suppliers } = arg;
    
    const filter_code = document.getElementById('filter-code-input');
    const filter_name = document.getElementById('filter-name-input');
    const filter_date = document.getElementById('filter-date-input');
    const filter_color = document.getElementById('color-filters');
    const filter_fabric = document.getElementById('fabric-filters');
    const filter_curtain = document.getElementById('curtain-filters');
    const filter_supplier = document.getElementById('supplier-filters');
    const apply_filters = document.getElementById('apply-filters');
    const clear_filters = document.getElementById('clear-filters');
    
    filter_code.innerHTML = '';
    filter_name.innerHTML = '';
    filter_date.innerHTML = '';
    filter_color.innerHTML = '';
    filter_fabric.innerHTML = '';
    filter_curtain.innerHTML = '';
    filter_supplier.innerHTML = '';

    showTable(curtains, colors, fabrictypes, curtaintypes, suppliers);

    let selectedColors = [];
    let selectedFabricTypes = [];
    let selectedCurtainTypes = [];
    let selectedSuppliers = [];
    let code;
    let name;
    let date;

    colors.forEach((color) => {
        createFilterOption(filter_color, color, selectedColors);
    });

    fabrictypes.forEach((fabric) => {
        createFilterOption(filter_fabric, fabric, selectedFabricTypes);
    });

    curtaintypes.forEach((curtain) => {
        createFilterOption(filter_curtain, curtain, selectedCurtainTypes);
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
        const filteredCurtains = curtains.filter(curtain => {
            return (!code || curtain.code.includes(code)) &&
                   (!name || curtain.name.includes(name)) &&
                   (!date || curtain.date.includes(date)) &&
                   (selectedColors.length === 0 || selectedColors.includes(curtain.color_id)) &&
                   (selectedFabricTypes.length === 0 || selectedFabricTypes.includes(curtain.fabrictype_id)) &&
                   (selectedCurtainTypes.length === 0 || selectedCurtainTypes.includes(curtain.curtaintype_id)) &&
                   (selectedSuppliers.length === 0 || selectedSuppliers.includes(curtain.supplier_id));
        });
    
        showTable(filteredCurtains, colors, fabrictypes, curtaintypes, suppliers);
    });

    clear_filters.addEventListener('click', () => {
        filter_code.value = '';
        filter_name.value = '';
        filter_date.value = '';
        selectedColors = [];
        selectedFabricTypes = [];
        selectedCurtainTypes = [];
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
            ipcRenderer.send('update-search', { column, value: input.value, id, table: 'curtains' });
        } else if (event.key === 'Escape') {
            cell.innerText = originalValue;
        }
    });

    cell.innerText = '';
    cell.appendChild(input);
    input.focus();
}

function makeCellEditableSelect(cell, colors, fabricTypes, curtainTypes, suppliers) {
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
    } else if (column === 'fabrictype_id') {
        select = document.createElement('select');
        select.className = 'p-2 w-full bg-gray-700 text-white';
        fabricTypes.forEach((fabric) => {
            const option = document.createElement('option');
            option.value = fabric.id;
            option.innerText = fabric.name;
            select.appendChild(option);
        });
    } else if (column === 'curtaintype_id') {
        select = document.createElement('select');
        select.className = 'p-2 w-full bg-gray-700 text-white';
        curtainTypes.forEach((curtain) => {
            const option = document.createElement('option');
            option.value = curtain.id;
            option.innerText = curtain.name;
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
            ipcRenderer.send('update-search', { column, value: select.value, id, table: 'curtains' });
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

function showTable(curtains, colors, fabrictypes, curtaintypes, suppliers) {
    const table = document.getElementById('product-table-body');
    table.innerHTML = '';

    curtains.forEach((curtain) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td class="py-2 px-4 flex justify-center items-center">
            ${curtain.image ? `<img src="${curtain.image}" class="w-16 h-16 object-cover">` : ''}
            </td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="code" data-id="${curtain.id}">${curtain.code}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="name" data-id="${curtain.id}">${curtain.name}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-select="color_id" data-id="${curtain.id}">${curtain.color}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-select="fabrictype_id" data-id="${curtain.id}">${curtain.fabric}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-select="curtaintype_id" data-id="${curtain.id}">${curtain.curtain}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="purchaseprice" data-id="${curtain.id}">${curtain.purchaseprice}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="sellingprice" data-id="${curtain.id}">${curtain.sellingprice}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-column="length" data-id="${curtain.id}">${curtain.length}</td>
            <td style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600" data-select="supplier_id" data-id="${curtain.id}">${curtain.supplier}</td>
            <td style="white-space: nowrap;" style="white-space: nowrap;" class="py-3 px-5 border-b-2 border-gray-600 w-64" data-column="date" data-id="${curtain.id}">${curtain.date}</td>
        `;
        table.appendChild(row);

        row.querySelectorAll('[data-column]').forEach((cell) => {
            cell.addEventListener('dblclick', () => {
                makeCellEditable(cell);
            });
        });

        row.querySelectorAll('[data-select]').forEach((cell) => {
            cell.addEventListener('dblclick', () => {
                makeCellEditableSelect(cell, colors, fabrictypes, curtaintypes, suppliers);
            });
        });

        row.querySelectorAll('[data-img]').forEach((cell) => {
            cell.addEventListener('dblclick', () => {
                makeImageEditable(cell);
            });
        });
    });
}