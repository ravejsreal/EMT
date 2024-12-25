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
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileOverlay = document.querySelector('.mobile-overlay');
const sidebar = document.querySelector('.sidebar');

// Theme and Language Management
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';

// Add to the top with other variables
let yearFolders = {};

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
        organizeInvoicesByYear();
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

    // Get current year
    const currentYear = new Date().getFullYear();

    // Create invoice elements
    invoices.forEach(invoice => {
        const invoiceYear = new Date(invoice.date).getFullYear();
        const invoiceElement = createInvoiceElement(invoice);
        
        // Add to all invoices only if it's from current year
        if (invoiceYear === currentYear) {
            allInvoicesList.appendChild(invoiceElement.cloneNode(true));
        }
        
        // Add to respective status list
        if (invoice.status === 'paid' && invoiceYear === currentYear) {
            paidInvoicesList.appendChild(invoiceElement.cloneNode(true));
        } else if (invoice.status === 'unpaid' && invoiceYear === currentYear) {
            unpaidInvoicesList.appendChild(invoiceElement.cloneNode(true));
        }
    });

    // Update the headers to indicate current year
    document.querySelector('#all-invoices .page-header h1').textContent = `All Invoices (${currentYear})`;
    document.querySelector('#paid-invoices .page-header h1').textContent = `Paid Invoices (${currentYear})`;
    document.querySelector('#unpaid-invoices .page-header h1').textContent = `Unpaid Invoices (${currentYear})`;
}

function createInvoiceElement(invoice) {
    const div = document.createElement('div');
    div.className = 'invoice-item';
    div.innerHTML = `
        <div class="invoice-item-content">
            <div class="invoice-details">
                <div class="invoice-section">
                    <div class="invoice-section-title">Invoice Info</div>
                    <div class="invoice-section-content">
                        <div>Invoice #${invoice.number}</div>
                        <div>${new Date(invoice.date).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="invoice-section">
                    <div class="invoice-section-title">Customer</div>
                    <div class="invoice-section-content">
                        <div>#${invoice.customerNumber}</div>
                        <div>${invoice.beneficiary}</div>
                    </div>
                </div>
                <div class="invoice-section">
                    <div class="invoice-section-title">Amount</div>
                    <div class="invoice-section-content">
                        <div class="amount">$${parseFloat(invoice.amount).toLocaleString()}</div>
                    </div>
                </div>
            </div>
            <div class="invoice-actions">
                <select class="status-select" data-id="${invoice.id}" aria-label="Change invoice status">
                    <option value="unpaid" ${invoice.status === 'unpaid' ? 'selected' : ''}>Unpaid</option>
                    <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
                </select>
                <button class="delete-btn" data-id="${invoice.id}" title="Delete Invoice" aria-label="Delete invoice">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        </div>
    `;

    // Add touch-friendly event handlers
    const statusSelect = div.querySelector('.status-select');
    const deleteBtn = div.querySelector('.delete-btn');

    // Make sure events work on touch devices
    statusSelect.addEventListener('touchend', function(e) {
        e.stopPropagation();
    });

    deleteBtn.addEventListener('touchend', function(e) {
        e.stopPropagation();
        e.preventDefault();
        const invoiceId = parseInt(this.getAttribute('data-id'));
        if (confirm(translations[currentLanguage].delete_confirmation)) {
            invoices = invoices.filter(inv => inv.id !== invoiceId);
            saveInvoices();
            updateInvoiceLists();
        }
    });

    // Add status change handler
    statusSelect.addEventListener('change', function(e) {
        e.stopPropagation();
        const invoiceId = parseInt(this.getAttribute('data-id'));
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            invoice.status = this.value;
            saveInvoices();
            updateInvoiceLists();
        }
    });

    return div;
}

// Add new function to organize invoices by year
function organizeInvoicesByYear() {
    yearFolders = {};
    invoices.forEach(invoice => {
        const year = new Date(invoice.date).getFullYear();
        if (!yearFolders[year]) {
            yearFolders[year] = {
                all: [],
                paid: [],
                unpaid: []
            };
        }
        yearFolders[year].all.push(invoice);
        if (invoice.status === 'paid') {
            yearFolders[year].paid.push(invoice);
        } else {
            yearFolders[year].unpaid.push(invoice);
        }
    });

    // Sort invoices by number within each folder
    Object.keys(yearFolders).forEach(year => {
        ['all', 'paid', 'unpaid'].forEach(status => {
            yearFolders[year][status].sort((a, b) => {
                return parseInt(a.number) - parseInt(b.number);
            });
        });
    });

    updateYearFolders();
}

// Add function to update year folders display
function updateYearFolders() {
    const foldersContainer = document.querySelector('.folders-container');
    foldersContainer.innerHTML = '';

    Object.keys(yearFolders)
        .sort((a, b) => b - a) // Sort years in descending order
        .forEach(year => {
            const folderElement = createYearFolderElement(year, yearFolders[year]);
            foldersContainer.appendChild(folderElement);
        });
}

function createYearFolderElement(year, folderData) {
    const div = document.createElement('div');
    div.className = 'year-folder';
    div.innerHTML = `
        <div class="folder-header">
            <i class="fas fa-folder"></i>
            <span>${year}</span>
            <span class="folder-count">(${folderData.all.length})</span>
            <button class="toggle-folder">
                <i class="fas fa-chevron-down"></i>
            </button>
        </div>
        <div class="folder-content">
            <div class="folder-tabs">
                <button class="folder-tab active" data-tab="all">
                    ${translations[currentLanguage].all_invoices} (${folderData.all.length})
                </button>
                <button class="folder-tab" data-tab="paid">
                    ${translations[currentLanguage].paid_invoices} (${folderData.paid.length})
                </button>
                <button class="folder-tab" data-tab="unpaid">
                    ${translations[currentLanguage].unpaid_invoices} (${folderData.unpaid.length})
                </button>
            </div>
            <div class="folder-invoices-list"></div>
        </div>
    `;

    // Add folder toggle functionality
    const header = div.querySelector('.folder-header');
    const content = div.querySelector('.folder-content');
    const toggleBtn = div.querySelector('.toggle-folder');

    header.addEventListener('click', () => {
        content.classList.toggle('open');
        toggleBtn.classList.toggle('open');
    });

    // Add tab switching functionality
    const tabs = div.querySelectorAll('.folder-tab');
    const invoicesList = div.querySelector('.folder-invoices-list');

    function updateTabContent(tabType) {
        invoicesList.innerHTML = '';
        folderData[tabType].forEach(invoice => {
            const invoiceElement = createInvoiceElement(invoice);
            invoicesList.appendChild(invoiceElement);
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateTabContent(tab.getAttribute('data-tab'));
        });
    });

    // Initialize with "all" tab
    updateTabContent('all');

    return div;
}

// Initialize language and theme on page load
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage(currentLanguage);
    updateTheme(currentTheme);
});

// Add these event listeners
mobileMenuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    mobileMenuToggle.innerHTML = sidebar.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

mobileOverlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    mobileOverlay.classList.remove('active');
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking a nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

// Add new features
function addAdvancedFeatures() {
    // Add invoice search functionality
    const searchBar = document.createElement('div');
    searchBar.className = 'search-bar';
    searchBar.innerHTML = `
        <input type="text" id="invoice-search" placeholder="${translations[currentLanguage].search_invoices}">
        <div class="search-filters">
            <select id="search-type">
                <option value="number" data-lang="invoice_number">Invoice Number</option>
                <option value="customer" data-lang="customer_number">Customer Number</option>
                <option value="beneficiary" data-lang="beneficiary">Beneficiary</option>
            </select>
            <button class="filter-btn" data-lang="filters">Filters</button>
        </div>
    `;
    
    document.querySelectorAll('.page-header').forEach(header => {
        const clone = searchBar.cloneNode(true);
        header.appendChild(clone);
    });

    // Add invoice statistics
    const statsSection = document.createElement('div');
    statsSection.className = 'invoice-stats';
    statsSection.innerHTML = `
        <div class="stat-card">
            <i class="fas fa-chart-line"></i>
            <div class="stat-content">
                <span class="stat-title" data-lang="total_amount">Total Amount</span>
                <span class="stat-value" id="total-amount">$0</span>
            </div>
        </div>
        <div class="stat-card">
            <i class="fas fa-file-invoice-dollar"></i>
            <div class="stat-content">
                <span class="stat-title" data-lang="pending_amount">Pending Amount</span>
                <span class="stat-value" id="pending-amount">$0</span>
            </div>
        </div>
        <div class="stat-card">
            <i class="fas fa-percentage"></i>
            <div class="stat-content">
                <span class="stat-title" data-lang="payment_rate">Payment Rate</span>
                <span class="stat-value" id="payment-rate">0%</span>
            </div>
        </div>
    `;

    document.querySelectorAll('.invoices-list').forEach(list => {
        const clone = statsSection.cloneNode(true);
        list.parentNode.insertBefore(clone, list);
    });

    // Add event listeners for search and filters
    document.querySelectorAll('#invoice-search').forEach(search => {
        search.addEventListener('input', filterInvoices);
    });
}

// Add invoice filtering functionality
function filterInvoices(e) {
    const searchTerm = e.target.value.toLowerCase();
    const searchType = e.target.parentNode.querySelector('#search-type').value;
    const invoicesList = e.target.closest('.page').querySelector('.invoices-list');
    const invoiceItems = invoicesList.querySelectorAll('.invoice-item');

    invoiceItems.forEach(item => {
        let searchValue = '';
        switch(searchType) {
            case 'number':
                searchValue = item.querySelector('div:contains("Invoice #")').textContent;
                break;
            case 'customer':
                searchValue = item.querySelector('div:contains("#")').textContent;
                break;
            case 'beneficiary':
                searchValue = item.querySelector('.invoice-section:nth-child(2)').textContent;
                break;
        }
        
        if (searchValue.toLowerCase().includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Add statistics update function
function updateStatistics() {
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const pendingAmount = invoices
        .filter(inv => inv.status === 'unpaid')
        .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const paymentRate = invoices.length ? 
        ((invoices.filter(inv => inv.status === 'paid').length / invoices.length) * 100).toFixed(1) : 0;

    document.querySelectorAll('#total-amount').forEach(el => {
        el.textContent = `$${totalAmount.toLocaleString()}`;
    });
    document.querySelectorAll('#pending-amount').forEach(el => {
        el.textContent = `$${pendingAmount.toLocaleString()}`;
    });
    document.querySelectorAll('#payment-rate').forEach(el => {
        el.textContent = `${paymentRate}%`;
    });
} 