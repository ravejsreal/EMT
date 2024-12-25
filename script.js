// User authentication data
const users = {
    'Ioan': 'ioanbarza',
    'Alex': 'alexbarza'
};

// Store invoices
let invoices = [];

// DOM Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const navLinks = document.querySelectorAll('.nav-links li');
const pages = document.querySelectorAll('.page');
const addInvoiceBtn = document.getElementById('add-invoice');
const invoiceModal = document.getElementById('invoice-modal');
const closeModal = document.querySelector('.close');
const invoiceForm = document.getElementById('invoice-form');
const logoutBtn = document.querySelector('.logout-btn');

// Theme and Language Management
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';

function updateLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        element.textContent = translations[lang][key];
    });
    updatePlaceholders(lang);
}

function updatePlaceholders(lang) {
    const placeholders = {
        en: {
            'invoice-number': 'Invoice Number',
            'customer-number': 'Customer Number',
            'client-name': 'Customer Name',
            'beneficiary': 'Beneficiary',
            'address': 'Address',
            'amount': 'Total Price'
        },
        de: {
            'invoice-number': 'Rechnungsnummer',
            'customer-number': 'Kundennummer',
            'client-name': 'Kundenname',
            'beneficiary': 'Begünstigter',
            'address': 'Adresse',
            'amount': 'Gesamtpreis'
        },
        ro: {
            'invoice-number': 'Număr Factură',
            'customer-number': 'Număr Client',
            'client-name': 'Nume Client',
            'beneficiary': 'Beneficiar',
            'address': 'Adresă',
            'amount': 'Preț Total'
        }
    };

    Object.keys(placeholders[lang]).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.placeholder = placeholders[lang][id];
        }
    });
}

function updateTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.content = theme === 'dark' ? '#1a1b1e' : '#f8f9fa';
    }
}

// Initialize language and theme selectors
document.getElementById('language-select').value = currentLanguage;
document.getElementById('dashboard-language-select').value = currentLanguage;
document.getElementById('theme-select').value = currentTheme;

// Add event listeners for language and theme changes
document.getElementById('language-select').addEventListener('change', (e) => {
    updateLanguage(e.target.value);
});

document.getElementById('dashboard-language-select').addEventListener('change', (e) => {
    updateLanguage(e.target.value);
});

document.getElementById('theme-select').addEventListener('change', (e) => {
    updateTheme(e.target.value);
});

// Login Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (users[username] === password) {
        loginContainer.classList.remove('active');
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        loadInvoices();
        document.getElementById('settings-username').value = username;
    } else {
        alert('Invalid credentials');
    }
});

// Navigation Handler
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const pageId = link.getAttribute('data-page');
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === pageId) {
                page.classList.add('active');
            }
        });
        
        updateInvoiceLists();
    });
});

// Modal Handlers
addInvoiceBtn.addEventListener('click', () => {
    invoiceModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    invoiceModal.classList.add('hidden');
});

// Invoice Form Handler
invoiceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newInvoice = {
        id: Date.now(),
        number: document.getElementById('invoice-number').value,
        customerNumber: document.getElementById('customer-number').value,
        beneficiary: document.getElementById('beneficiary').value,
        address: document.getElementById('address').value,
        amount: document.getElementById('amount').value,
        date: document.getElementById('invoice-date').value,
        status: document.getElementById('status').value
    };

    invoices.push(newInvoice);
    saveInvoices();
    updateInvoiceLists();
    invoiceModal.classList.add('hidden');
    invoiceForm.reset();
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    dashboardContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    loginContainer.classList.add('active');
    loginForm.reset();
});

// Helper Functions
function loadInvoices() {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
        invoices = JSON.parse(savedInvoices);
        updateInvoiceLists();
    }
}

function saveInvoices() {
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

function updateInvoiceLists() {
    const allInvoicesList = document.querySelector('#all-invoices .invoices-list');
    const paidInvoicesList = document.querySelector('#paid-invoices .invoices-list');
    const unpaidInvoicesList = document.querySelector('#unpaid-invoices .invoices-list');

    // Clear all lists
    allInvoicesList.innerHTML = '';
    paidInvoicesList.innerHTML = '';
    unpaidInvoicesList.innerHTML = '';

    // Create invoice elements
    invoices.forEach(invoice => {
        const invoiceElement = createInvoiceElement(invoice);
        
        // Add to all invoices
        allInvoicesList.appendChild(invoiceElement.cloneNode(true));
        
        // Add to respective status list
        if (invoice.status === 'paid') {
            paidInvoicesList.appendChild(invoiceElement.cloneNode(true));
        } else {
            unpaidInvoicesList.appendChild(invoiceElement.cloneNode(true));
        }
    });
}

function createInvoiceElement(invoice) {
    const div = document.createElement('div');
    div.className = 'invoice-item';
    div.innerHTML = `
        <div class="invoice-item-content">
            <div>
                <h3>Invoice #${invoice.number}</h3>
                <p>Customer #: ${invoice.customerNumber}</p>
                <p>Beneficiary: ${invoice.beneficiary}</p>
                <p>Address: ${invoice.address}</p>
                <p>Amount: $${invoice.amount}</p>
                <p>Date: ${invoice.date}</p>
            </div>
            <div class="invoice-actions">
                <select class="status-select" data-id="${invoice.id}">
                    <option value="unpaid" ${invoice.status === 'unpaid' ? 'selected' : ''}>Unpaid</option>
                    <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
                </select>
                <button class="delete-btn" data-id="${invoice.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    // Add status change handler
    const statusSelect = div.querySelector('.status-select');
    statusSelect.addEventListener('change', (e) => {
        const invoiceId = parseInt(e.target.getAttribute('data-id'));
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            invoice.status = e.target.value;
            saveInvoices();
            updateInvoiceLists();
        }
    });

    // Add delete handler
    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        const invoiceId = parseInt(e.target.closest('.delete-btn').getAttribute('data-id'));
        if (confirm(translations[currentLanguage].delete_confirmation)) {
            invoices = invoices.filter(inv => inv.id !== invoiceId);
            saveInvoices();
            updateInvoiceLists();
        }
    });

    return div;
}

// Initialize language and theme on page load
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage(currentLanguage);
    updateTheme(currentTheme);
}); 