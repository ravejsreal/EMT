// User authentication data
const users = {
    'Ioan': 'ioanbarza',
    'Alex': 'alexbarza'
};

// Store invoices
let invoices = [];

// Add new variables
let orders = {
    new: [],
    working: [],
    finished: []
};

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
const addOrderBtn = document.getElementById('add-order');
const orderModal = document.getElementById('order-modal');

// Theme and Language Management
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';

// Add to the top with other variables
let yearFolders = {};

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        loginContainer.classList.remove('active');
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        document.getElementById('settings-username').value = loggedInUser;
        loadInvoices();
        loadOrders();
    }
});

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
        localStorage.setItem('loggedInUser', username);
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
    localStorage.removeItem('loggedInUser');
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
                    <div class="invoice-section-title" data-lang="invoice_info"></div>
                    <div class="invoice-section-content">
                        <div><span data-lang="invoice_number_prefix"></span>${invoice.number}</div>
                        <div>${new Date(invoice.date).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="invoice-section">
                    <div class="invoice-section-title" data-lang="customer"></div>
                    <div class="invoice-section-content">
                        <div><span data-lang="customer_number_prefix"></span>${invoice.customerNumber}</div>
                        <div>${invoice.beneficiary}</div>
                    </div>
                </div>
                <div class="invoice-section">
                    <div class="invoice-section-title" data-lang="amount"></div>
                    <div class="invoice-section-content">
                        <div class="amount">$${parseFloat(invoice.amount).toLocaleString()}</div>
                    </div>
                </div>
            </div>
            <div class="invoice-actions">
                <select class="status-select" data-id="${invoice.id}">
                    <option value="unpaid" ${invoice.status === 'unpaid' ? 'selected' : ''} data-lang="unpaid"></option>
                    <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''} data-lang="paid"></option>
                </select>
                ${getCurrentUser() === 'Alex' ? `
                    <button class="delete-btn" data-id="${invoice.id}">
                        <i class="fas fa-trash-alt"></i> <span data-lang="delete"></span>
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    // Update translations for the newly created element
    updateElementTranslations(div);
    return div;
}

// Add this new helper function
function updateElementTranslations(element) {
    element.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        el.textContent = translations[currentLanguage][key];
    });
}

// Add new function to organize invoices by year
function organizeInvoicesByYear() {
    const foldersContainer = document.querySelector('.folders-container');
    foldersContainer.innerHTML = '';
    
    const years = [...new Set(invoices.map(inv => new Date(inv.date).getFullYear()))];
    years.sort((a, b) => b - a);
    
    years.forEach(year => {
        const yearInvoices = invoices.filter(inv => new Date(inv.date).getFullYear() === year);
        
        const folderDiv = document.createElement('div');
        folderDiv.className = 'year-folder';
        folderDiv.innerHTML = `
            <div class="folder-header">
                <i class="fas fa-folder"></i>
                <span>${year}</span>
                <button class="toggle-folder">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="folder-content hidden">
                <div class="folder-tabs">
                    <button class="folder-tab active" data-tab="all">All Invoices</button>
                    <button class="folder-tab" data-tab="paid">Paid</button>
                    <button class="folder-tab" data-tab="unpaid">Unpaid</button>
                </div>
                <div class="folder-invoices-list"></div>
            </div>
        `;
        
        foldersContainer.appendChild(folderDiv);
        
        // Add event listeners
        const toggleBtn = folderDiv.querySelector('.toggle-folder');
        const folderContent = folderDiv.querySelector('.folder-content');
        const tabs = folderDiv.querySelectorAll('.folder-tab');
        const invoicesList = folderDiv.querySelector('.folder-invoices-list');
        
        toggleBtn.addEventListener('click', () => {
            folderContent.classList.toggle('hidden');
            toggleBtn.querySelector('i').classList.toggle('fa-chevron-down');
            toggleBtn.querySelector('i').classList.toggle('fa-chevron-up');
            
            if (!folderContent.classList.contains('hidden')) {
                updateFolderInvoices(yearInvoices, invoicesList, 'all');
            }
        });
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const status = tab.getAttribute('data-tab');
                updateFolderInvoices(yearInvoices, invoicesList, status);
            });
        });
    });
}

function updateFolderInvoices(yearInvoices, container, status) {
    container.innerHTML = '';
    const filteredInvoices = status === 'all' 
        ? yearInvoices 
        : yearInvoices.filter(inv => inv.status === status);
    
    filteredInvoices.forEach(invoice => {
        const invoiceElement = createInvoiceElement(invoice);
        container.appendChild(invoiceElement);
    });
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
    loadOrders();
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

// Load orders from localStorage
function loadOrders() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
    updateOrderLists();
}

// Save orders to localStorage
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Create order element
function createOrderElement(order, status) {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
        <div class="order-item-content">
            <div class="invoice-details">
                <div class="invoice-section">
                    <div class="invoice-section-title" data-lang="client_info">Client Info</div>
                    <div class="invoice-section-content">
                        <div class="client-name">${order.clientName}</div>
                        <div>${order.city}</div>
                        <div>${order.phone}</div>
                    </div>
                </div>
                <div class="invoice-section">
                    <div class="invoice-section-title" data-lang="appointment">Appointment</div>
                    <div class="invoice-section-content">
                        <div>${new Date(order.appointment).toLocaleString()}</div>
                    </div>
                </div>
                <div class="invoice-section">
                    <div class="invoice-section-title" data-lang="customer_request">Request</div>
                    <div class="invoice-section-content">
                        <div>${order.customerRequest}</div>
                    </div>
                </div>
            </div>
            <div class="invoice-actions">
                ${status === 'new' ? `
                    <button class="primary-btn start-work-btn" data-id="${order.id}" data-lang="start_work">
                        <i class="fas fa-play"></i> Start Work
                    </button>
                ` : status === 'working' ? `
                    <button class="primary-btn finish-order-btn" data-id="${order.id}" data-lang="finish_order">
                        <i class="fas fa-check"></i> Finish Order
                    </button>
                ` : ''}
                ${getCurrentUser() === 'Alex' ? `
                    <button class="delete-btn" data-id="${order.id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    // Add event listeners
    if (status === 'new') {
        div.querySelector('.start-work-btn').addEventListener('click', () => {
            moveOrderToWorking(order.id);
        });
    } else if (status === 'working') {
        div.querySelector('.finish-order-btn').addEventListener('click', () => {
            finishOrder(order.id);
        });
    }

    if (getCurrentUser() === 'Alex') {
        div.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm(translations[currentLanguage].delete_confirmation)) {
                deleteOrder(order.id, status);
            }
        });
    }

    return div;
}

// Move order to working status
function moveOrderToWorking(orderId) {
    const orderIndex = orders.new.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        const order = orders.new.splice(orderIndex, 1)[0];
        orders.working.push(order);
        saveOrders();
        updateOrderLists();
    }
}

// Finish order and create invoice
function finishOrder(orderId) {
    const orderIndex = orders.working.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        const order = orders.working.splice(orderIndex, 1)[0];
        orders.finished.push(order);
        saveOrders();
        updateOrderLists();
        
        // Show invoice creation modal with pre-filled client info
        showInvoiceModal(order);
    }
}

// Show invoice modal with pre-filled info
function showInvoiceModal(order) {
    document.getElementById('invoice-modal').classList.remove('hidden');
    document.getElementById('beneficiary').value = order.clientName;
    document.getElementById('address').value = order.city;
    // Add other pre-filled fields as needed
}

// Get current user
function getCurrentUser() {
    return document.getElementById('settings-username').value;
}

// Update delete button visibility in invoices
function updateDeleteButtonVisibility() {
    const deleteButtons = document.querySelectorAll('.invoice-item .delete-btn');
    deleteButtons.forEach(btn => {
        if (getCurrentUser() !== 'Alex') {
            btn.style.display = 'none';
        }
    });
}

// Add invoice status filter handler
document.getElementById('invoice-status-filter').addEventListener('change', function(e) {
    const status = e.target.value;
    const invoicesList = document.querySelector('#all-invoices .invoices-list');
    const currentYear = new Date().getFullYear();

    invoicesList.innerHTML = '';
    
    invoices.forEach(invoice => {
        const invoiceYear = new Date(invoice.date).getFullYear();
        if (invoiceYear === currentYear) {
            if (status === 'all' || invoice.status === status) {
                const invoiceElement = createInvoiceElement(invoice);
                invoicesList.appendChild(invoiceElement);
            }
        }
    });
});

// Add event listeners
addOrderBtn.addEventListener('click', () => {
    orderModal.classList.remove('hidden');
});

// Close modal when clicking the close button
document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').classList.add('hidden');
    });
});

// Add order form handler
document.getElementById('order-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newOrder = {
        id: Date.now(),
        clientName: document.getElementById('client-name').value,
        city: document.getElementById('city').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        appointment: document.getElementById('appointment').value,
        notes: document.getElementById('notes').value,
        customerRequest: document.getElementById('customer-request').value,
        status: 'new'
    };

    orders.new.push(newOrder);
    saveOrders();
    updateOrderLists();
    
    // Close modal and reset form
    document.getElementById('order-modal').classList.add('hidden');
    this.reset();
});

// Update order lists function
function updateOrderLists() {
    // Update new orders
    const newOrdersList = document.querySelector('#new-orders .orders-list');
    newOrdersList.innerHTML = '';
    orders.new.forEach(order => {
        const orderElement = createOrderElement(order, 'new');
        newOrdersList.appendChild(orderElement);
    });

    // Update working orders
    const workingOrdersList = document.querySelector('#working-orders .orders-list');
    workingOrdersList.innerHTML = '';
    orders.working.forEach(order => {
        const orderElement = createOrderElement(order, 'working');
        workingOrdersList.appendChild(orderElement);
    });

    // Update finished orders
    const finishedOrdersList = document.querySelector('#finished-orders .orders-list');
    finishedOrdersList.innerHTML = '';
    orders.finished.forEach(order => {
        const orderElement = createOrderElement(order, 'finished');
        finishedOrdersList.appendChild(orderElement);
    });
}

// Delete order function
function deleteOrder(orderId, status) {
    if (status === 'new') {
        orders.new = orders.new.filter(order => order.id !== orderId);
    } else if (status === 'working') {
        orders.working = orders.working.filter(order => order.id !== orderId);
    } else if (status === 'finished') {
        orders.finished = orders.finished.filter(order => order.id !== orderId);
    }
    saveOrders();
    updateOrderLists();
} 