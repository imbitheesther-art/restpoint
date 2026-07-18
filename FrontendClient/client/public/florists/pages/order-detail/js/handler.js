let operation_buttons = document.getElementById('operation-buttons')
let globalArgs = [];
function deleteOrderWrapper() {
    showConfirmation('Are you sure you want to delete this order?', deleteOrder)
}
function updateOrderWrapper() {
    showConfirmation('Are you sure you want to update this order?', updateOrder)
}

function removeBarcode() {
    document.getElementById('barcode-section').innerHTML = `
    <label>Barcode</label>
    <p>Will be generated automatically once saved</p>`
}


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
    globalArgs = args;

    if (args.showEditAndDelete) {
        operation_buttons.innerHTML +=
            `    
        <button id="edit-button" onclick="updateOrderWrapper()" class="edit-button">Update order</button>
        <button id="delete-button" onclick="deleteOrderWrapper()" class="delete-button">Delete order</button>
    `;

        const printLabelButton = document.getElementById('print-label-button');
        if (printLabelButton) {
            printLabelButton.addEventListener('click', () => {
                console.log('Print label clicked');
                productionSheetBtnHandler(currentOrderId);
            });
        }

        if (args.id) {
            populateOrder(args.id);
        }
    } else {
        removeBarcode();
        operation_buttons.innerHTML = `
            <button onclick="saveOrder(redirect=true)" class="save-button">Save order</button>
        `;

        const dateInput = document.querySelector('div[name="date-in-input"]');
        if (dateInput) dateInput.style.display = 'none';

        populateCustomers().then(defaultCustomer => {
            if (defaultCustomer)
                document.getElementById('orderID').value = getDynamicOrderID(defaultCustomer);
        });
    }
};

if (window.ipcRenderer && typeof window.ipcRenderer.on === 'function') {
    window.ipcRenderer.on('page-data', (event, args) => initializePage(args));
}

initializePage();

