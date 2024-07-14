const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', (event) => {
    const curtains_btn = document.getElementById('curtains-id');
    const tulles_btn = document.getElementById('tulles-id');
    const laces_btn = document.getElementById('laces-id');
    const fittings_btn = document.getElementById('fittings-id');

    curtains_btn.addEventListener('click', () => {
        ipcRenderer.send('storage-page', 'curtains');
    });

    tulles_btn.addEventListener('click', () => {
        ipcRenderer.send('storage-page', 'tulles');
    });

    laces_btn.addEventListener('click', () => {
        ipcRenderer.send('storage-page', 'laces');
    });

    fittings_btn.addEventListener('click', () => {
        ipcRenderer.send('storage-page', 'fittings');
    });

    document.getElementById('back-btn').addEventListener('click', () => {
        ipcRenderer.send('back-to-main', null);
    });
});