const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', (event) => {
    const curtains_btn = document.getElementById('curtains-id');
    const tulles_btn = document.getElementById('tulles-id');
    const laces_btn = document.getElementById('laces-id');
    const fittings_btn = document.getElementById('fittings-id');
    const orders_btn = document.getElementById('orders-id');

    curtains_btn.addEventListener('click', () => {
        ipcRenderer.send('search-page', 'curtains');
    });

    tulles_btn.addEventListener('click', () => {
        ipcRenderer.send('search-page', 'tulles');
    });

    laces_btn.addEventListener('click', () => {
        ipcRenderer.send('search-page', 'laces');
    });

    fittings_btn.addEventListener('click', () => {
        ipcRenderer.send('search-page', 'fittings');
    });
    
    orders_btn.addEventListener('click', () => {
        ipcRenderer.send('search-page', 'order');
    })

    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });
});