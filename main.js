const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron');
const path = require('path');
const { db, createTables } = require('./database/database');

let win;

function createWindow() {
    win = new BrowserWindow({
        show: false,
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    createTables();

    win.loadFile(path.join(__dirname, 'index.html'));

    win.once('ready-to-show', () => {
        win.show();
    });

    win.on('closed', () => {
        win = null;
    });

    win.webContents.openDevTools();
}

app.on('ready', () => {
    createWindow();
    let menu = Menu.getApplicationMenu();

    const windowMenu = createWindowMenu();
    const newTab = createReferenceMenu();
    menu.append(newTab);
    menu.append(windowMenu);
    Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

function createReferenceMenu() {
    return new MenuItem({
        label: 'Довідники',
        submenu: [
            createReferenceMenuItem('Довідник кольорів', 'colors'),
            createReferenceMenuItem('Довідник постачальників', 'suppliers'),
            createReferenceMenuItem('Довідник типів тканин штор', 'curtaintypes'),
            createReferenceMenuItem('Довідник типів тканин тюлі', 'tulletypes'),
            createReferenceMenuItem('Довідник видів тканин', 'fabrictypes')
        ]
    });
}

function createWindowMenu() {
    return new MenuItem({
        label: 'Вікно',
        submenu: [
            {
                label: 'Головна',
                click: () => win.loadFile(path.join(__dirname, 'index.html'))
            },
            {
                label: 'Замовлення',
                click: () => win.loadFile(path.join(__dirname, 'pages/order.html'))
            },
            {
                label: 'Поступлення',
                click: () => win.loadFile(path.join(__dirname, 'pages/storage.html'))
            },
            {
                label: 'Звіти',
                click: () => win.loadFile(path.join(__dirname, 'pages/history.html'))
            },
            {
                label: 'Пошук',
                click: () => win.loadFile(path.join(__dirname, 'pages/search.html'))
            }
        ]
    })
}

function createReferenceMenuItem(label, type) {
    return {
        label: label,
        click: () => win.loadURL(`file://${path.join(__dirname, 'pages/references.html')}?type=${type}`)
    };
}

ipcMain.on('back-to-main', (event, arg) => {
    win.loadFile(path.join(__dirname, 'index.html'));
});

ipcMain.handle('check-reference', async (event, arg) => {
    let { type, name } = arg;
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const query = `SELECT name FROM ${type} WHERE name = ?`;
    try {
        const result = db.prepare(query).get(name);
        console.log(`Checking reference: ${result} ${name}`);
        return result !== undefined; 
    } catch (err) {
        throw new Error(err.message); 
    }
});

ipcMain.on('add-reference', (event, arg) => {
    let { type, name } = arg;
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const query = `INSERT INTO ${type} (name) VALUES (?)`;
    try {
        db.prepare(query).run(name);
        event.reply('reference-added', { type, name });
    } catch (err) {
        event.reply('reference-failed', err.message);
    }
});

ipcMain.on('get-references', (event, arg) => {
    const { type } = arg;
    const query = `SELECT * FROM ${type}`;
    try {
        const references = db.prepare(query).all();
        event.reply('references', { type, references });
    } catch (err) {
        event.reply('references-failed', err.message);
    }

});

ipcMain.on('delete-reference', (event, arg) => {
    const { id, type } = arg;
    const query = `DELETE FROM ${type} WHERE id = ?`;

    try {
        db.prepare(query).run(id);
        event.reply('reference-delete', { id, type });
    } catch (err) {
        event.reply('references-failed', err.message);
    }
});

ipcMain.on('storage-page', (event, arg) => {
    win.loadURL(`file://${path.join(__dirname, 'pages/storage/', `${arg}.html`)}`);
});

ipcMain.on('add-curtain', (event, arg) => {
    const { code, name, colorId, fabricTypeId, curtainTypeId, purchasePrice, sellingPrice, length, supplierId, date } = arg;

    const query = `
        INSERT INTO curtains (code, name, color_id, fabrictype_id, curtaintype_id, purchaseprice, sellingprice, length, supplier_id, date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
        db.prepare(query).run(code, name, colorId, fabricTypeId, curtainTypeId, purchasePrice, sellingPrice, length, supplierId, date);
        event.reply('curtain-added', { name });
    } catch (err) {
        event.reply('curtain-failed', err.message);
    }
});

ipcMain.on('get-curtains', (event) => {
    const query = `
        SELECT c.id, c.code, c.name, co.name as color, f.name as fabric, t.name as curtain, c.purchaseprice, c.sellingprice, c.length, s.name as supplier, c.date
        FROM curtains c
        JOIN colors co ON c.color_id = co.id
        JOIN fabrictypes f ON c.fabrictype_id = f.id
        JOIN curtaintypes t ON c.curtaintype_id = t.id
        JOIN suppliers s ON c.supplier_id = s.id`;

    try {
        const curtains = db.prepare(query).all();
        event.reply('curtains', curtains);
    } catch (err) {
        event.reply('curtain-failed', err.message);
    }
});

ipcMain.on('delete-curtain', (event, arg) => {
    const { id } = arg;
    const query = `DELETE FROM curtains WHERE id = ?`;

    try {
        db.prepare(query).run(id);
        event.reply('curtain-delete', { id });
    } catch (err) {
        event.reply('curtain-failed', err.message);
    }
});

ipcMain.on('add-tulle', (event, arg) => {
    const { code, name, colorId, fabricTypeId, tulleTypeId, purchasePrice, sellingPrice, length, supplierId, date } = arg;

    const query = `
        INSERT INTO tulles (code, name, color_id, fabrictype_id, tulletype_id, purchaseprice, sellingprice, length, supplier_id, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
        db.prepare(query).run(code, name, colorId, fabricTypeId, tulleTypeId, purchasePrice, sellingPrice, length, supplierId, date);
        event.reply('tulle-added', { name });
    } catch (err) {
        event.reply('tulle-failed', err.message);
    }
});

ipcMain.on('get-tulles', (event) => {
    const query = `
        SELECT t.id, t.code, t.name, co.name as color, f.name as fabric, tu.name as tulle, t.purchaseprice, t.sellingprice, t.length, s.name as supplier, t.date
        FROM tulles t
        JOIN colors co ON t.color_id = co.id
        JOIN fabrictypes f ON t.fabrictype_id = f.id
        JOIN tulletypes tu ON t.tulletype_id = tu.id
        JOIN suppliers s ON t.supplier_id = s.id`;

    try {
        const tulles = db.prepare(query).all();
        event.reply('tulles', tulles);
    } catch (err) {
        event.reply('tulle-failed', err.message);
    }
});

ipcMain.on('delete-tulle', (event, arg) => {
    const { id } = arg;
    const query = `DELETE FROM tulles WHERE id = ?`;

    try {
        db.prepare(query).run(id);
        event.reply('tulle-delete', { id });
    } catch (err) {
        event.reply('tulle-failed', err.message);
    }
});