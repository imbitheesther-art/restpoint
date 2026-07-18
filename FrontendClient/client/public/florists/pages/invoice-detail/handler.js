const getPageData = () => {
    try {
        const stored = localStorage.getItem('floristPageData');
        if (!stored) return null;
        localStorage.removeItem('floristPageData');
        return JSON.parse(stored);
    } catch (error) {
        console.warn('Failed to read florist page data', error);
        return null;
    }
};

const initializePage = (args) => {
    if (!args) {
        args = getPageData() || {};
    }
    if (args.id) {
        populateInvoice(args.id);
    }
};

if (window.ipcRenderer && typeof window.ipcRenderer.on === 'function') {
    window.ipcRenderer.on('page-data', (event, args) => initializePage(args));
}

initializePage();
