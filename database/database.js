const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'development' 
    ? "./database.db"
    : path.join(process.resourcesPath, 'database.db')

let db;
try {
    console.log(process.env.NODE_ENV === 'development' ? 'Development mode' : 'Production mode');
    console.log(`Connecting to the database at ${dbPath}`);
    db = new Database(dbPath, { verbose: console.log });
    console.log('Connected to the database.');
} catch (err) {
    console.error(err.message);
}

function createCurtainsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS curtains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(25) NOT NULL,
            name VARCHAR(100) NOT NULL,
            color_id INTEGER,
            fabrictype_id INTEGER,
            curtaintype_id INTEGER,
            purchaseprice REAL NOT NULL,
            sellingprice REAL NOT NULL,
            length REAL NOT NULL,
            supplier_id INTEGER,
            date DATE NOT NULL,
            FOREIGN KEY (color_id) REFERENCES colors(id),
            FOREIGN KEY (fabrictype_id) REFERENCES fabrictypes(id),
            FOREIGN KEY (curtaintype_id) REFERENCES curtaintypes(id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        )`;
    try {
        db.prepare(query).run();
        console.log('Curtains table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createFittingsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS fittings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(25) NOT NULL,
            name VARCHAR(100) NOT NULL,
            color_id INTEGER,
            purchaseprice REAL NOT NULL,
            sellingprice REAL NOT NULL,
            count REAL NOT NULL,
            supplier_id INTEGER,
            date DATE NOT NULL,
            FOREIGN KEY (color_id) REFERENCES colors(id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        )`;
    try {
        db.prepare(query).run();
        console.log('Fittings table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createLacesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS laces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(25) NOT NULL,
            name VARCHAR(100) NOT NULL,
            color_id INTEGER,
            purchaseprice REAL NOT NULL,
            sellingprice REAL NOT NULL,
            length REAL NOT NULL,
            supplier_id INTEGER,
            date DATE NOT NULL,
            FOREIGN KEY (color_id) REFERENCES colors(id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        )`;
    try {
        db.prepare(query).run();
        console.log('Laces table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createTullesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS tulles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(25) NOT NULL,
            name VARCHAR(100) NOT NULL,
            color_id INTEGER,
            fabrictype_id INTEGER,
            tulletype_id INTEGER,
            purchaseprice REAL NOT NULL,
            sellingprice REAL NOT NULL,
            length REAL NOT NULL,
            supplier_id INTEGER,
            date DATE NOT NULL,
            FOREIGN KEY (color_id) REFERENCES colors(id),
            FOREIGN KEY (fabrictype_id) REFERENCES fabrictypes(id),
            FOREIGN KEY (tulletype_id) REFERENCES tulletypes(id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        )`;
    try {
        db.prepare(query).run();
        console.log('Tulles table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createOrdersTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            work_price REAL,
            discount REAL,
            prepayment REAL,
            phone_number VARCHAR(15)
        )`;
    try {
        db.prepare(query).run();
        console.log('Orders table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createColorsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS colors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL
        )`;
    try {
        db.prepare(query).run();
        console.log('Colors table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createSuppliersTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL
        )`;
    try {
        db.prepare(query).run();
        console.log('Suppliers table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createCurtainTypesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS curtaintypes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL
        )`;
    try {
        db.prepare(query).run();
        console.log('CurtainTypes table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createTulleTypesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS tulletypes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL
        )`;
    try {
        db.prepare(query).run();
        console.log('TulleTypes table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createFabricTypesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS fabrictypes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL
        )`;
    try {
        db.prepare(query).run();
        console.log('FabricTypes table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createOrderCurtainsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS order_curtains (
            order_id INTEGER,
            curtain_id INTEGER,
            quantity INTEGER NOT NULL,
            PRIMARY KEY (order_id, curtain_id),
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (curtain_id) REFERENCES curtains(id)
        )`;
    try {
        db.prepare(query).run();
        console.log('OrderCurtains table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createOrderTullesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS order_tulles (
            order_id INTEGER,
            tulle_id INTEGER,
            quantity INTEGER NOT NULL,
            PRIMARY KEY (order_id, tulle_id),
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (tulle_id) REFERENCES tulles(id)
        )`;
    try {
        db.prepare(query).run();
        console.log('OrderTulles table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createOrderLacesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS order_laces (
            order_id INTEGER,
            lace_id INTEGER,
            quantity INTEGER NOT NULL,
            PRIMARY KEY (order_id, lace_id),
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (lace_id) REFERENCES laces(id)
        )`;
    try {
        db.prepare(query).run();
        console.log('OrderLaces table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createOrderFittingsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS order_fittings (
            order_id INTEGER,
            fitting_id INTEGER,
            quantity INTEGER NOT NULL,
            PRIMARY KEY (order_id, fitting_id),
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (fitting_id) REFERENCES fittings(id)
        )`;
    try {
        db.prepare(query).run();
        console.log('OrderFittings table created or already exists.');
    } catch (err) {
        console.error(err.message);
    }
}

function createTables() {
    createColorsTable();
    createSuppliersTable();
    createCurtainTypesTable();
    createFabricTypesTable();
    createTulleTypesTable();
    createCurtainsTable();
    createTullesTable();
    createFittingsTable();
    createLacesTable();
    createOrdersTable();
    createOrderCurtainsTable();
    createOrderTullesTable();
    createOrderLacesTable();
    createOrderFittingsTable();
}

module.exports = {
    db,
    createTables
};