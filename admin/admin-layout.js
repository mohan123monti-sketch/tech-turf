// Admin Layout Logic
const API_BASE_URL = 'http://localhost:3001/api';

// --- Toast Notification System (Made global for module scripts) ---
window.showToast = function (message, type = 'info') {
    const toast = document.createElement('div');
    const typeClasses = {
        'success': 'bg-green-600',
        'error': 'bg-red-600',
        'info': 'bg-blue-600'
    };
    const colorClass = typeClasses[type] || typeClasses['info'];

    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${colorClass} transition-opacity duration-300 opacity-0 z-50`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

// Make API_BASE_URL global
window.API_BASE_URL = API_BASE_URL;

// --- Auth Check ---
function checkAuth() {
    const token = localStorage.getItem('tt_token');
    if (!token) {
        window.location.href = '../login.html';
        return null;
    }
    // In a real app, we would verify the token/role with the backend here
    return token;
}

// --- Sidebar Generation ---
function renderSidebar() {
    const sidebar = document.getElementById('sidebar-container');
    if (!sidebar) return;

    const menuItems = [
        { name: 'Dashboard', icon: 'layout-dashboard', href: 'dashboard.html' },
        { name: 'Products', icon: 'package', href: 'products.html' },
        { name: 'Orders', icon: 'shopping-cart', href: 'orders.html' },
        { name: 'Users', icon: 'users', href: 'users.html' },
        { name: 'Launches', icon: 'rocket', href: 'launches.html' },
        { name: 'Content', icon: 'file-text', href: 'content.html' },
        { name: 'Support', icon: 'life-buoy', href: 'support.html' },
        { name: 'Settings', icon: 'settings', href: 'settings.html' },
    ];

    const currentPath = window.location.pathname.split('/').pop();

    sidebar.innerHTML = `
        <div class="p-6">
            <h1 class="text-2xl font-bold text-white flex items-center">
                <i data-lucide="zap" class="w-6 h-6 mr-2 text-orange-500"></i> TechTurf
            </h1>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            ${menuItems.map(item => `
                <a href="${item.href}" class="nav-item flex items-center px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700/50 transition-colors group ${currentPath === item.href ? 'active' : ''}">
                    <i data-lucide="${item.icon}" class="w-5 h-5 mr-3 group-hover:text-white transition-colors"></i>
                    ${item.name}
                </a>
            `).join('')}
        </nav>
        <div class="p-4 border-t border-gray-700">
            <button id="logout-button" class="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors">
                <i data-lucide="log-out" class="w-4 h-4 mr-2"></i> Log Out
            </button>
        </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('tt_token');
        window.location.href = '../login.html';
    });
}

// --- Topbar Generation ---
function renderTopbar() {
    const topbar = document.getElementById('topbar-container');
    if (!topbar) return;

    const currentPath = window.location.pathname.split('/').pop();
    let title = 'Admin Dashboard';
    if (currentPath === 'products.html') title = 'Products & Inventory';
    else if (currentPath === 'orders.html') title = 'Orders & Requests';
    else if (currentPath === 'users.html') title = 'Team & Roles';
    else if (currentPath === 'launches.html') title = 'Aerospace Launches & Logs';
    else if (currentPath === 'content.html') title = 'Content Management System';
    else if (currentPath === 'support.html') title = 'Support Tickets';
    else if (currentPath === 'settings.html') title = 'System Settings';

    topbar.innerHTML = `
        <h2 class="text-xl font-semibold text-white" id="page-title">${title}</h2>
        <div class="flex items-center space-x-4">
            <button class="text-gray-400 hover:text-white transition-colors">
                <i data-lucide="bell" class="w-6 h-6"></i>
            </button>
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                AD
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}

// --- Core Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        renderSidebar();
        renderTopbar();
    }
});