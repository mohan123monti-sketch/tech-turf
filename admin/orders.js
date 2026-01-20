// Orders Page Logic
// Note: API_BASE_URL and window.showToast are provided by admin-layout.js

let orders = [];

async function loadOrders() {
    const token = localStorage.getItem('tt_token');
    try {
        const response = await fetch(`${window.API_BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        orders = await response.json();
        renderOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        window.showToast('Failed to load orders', 'error');
    }
}

function renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">No orders found.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const statusColors = {
            Pending: 'bg-yellow-500/10 text-yellow-500',
            Processing: 'bg-blue-500/10 text-blue-500',
            Shipped: 'bg-indigo-500/10 text-indigo-500',
            Delivered: 'bg-green-500/10 text-green-500',
            Cancelled: 'bg-red-500/10 text-red-500'
        };

        return `
            <tr class="hover:bg-gray-700/30 transition-colors">
                <td class="p-4 font-mono text-gray-400">#${order._id.slice(-6).toUpperCase()}</td>
                <td class="p-4">
                    <div class="font-medium">${order.user?.username || 'Guest'}</div>
                    <div class="text-xs text-gray-500">${order.user?.email || 'N/A'}</div>
                </td>
                <td class="p-4 text-gray-400">${new Date(order.createdAt).toLocaleDateString()}</td>
                <td class="p-4 font-bold">$${parseFloat(order.totalPrice).toFixed(2)}</td>
                <td class="p-4">
                    <span class="px-3 py-1 text-xs font-semibold rounded-full ${statusColors[order.status] || statusColors['Pending']}">
                        ${order.status}
                    </span>
                </td>
                <td class="p-4 text-right space-x-2">
                    <button onclick="viewOrder('${order._id}')" class="text-blue-400 hover:text-blue-300 text-sm font-medium">View Details</button>
                    <!-- Status update dropdown/modal action would go here -->
                </td>
            </tr>
        `;
    }).join('');
}

async function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem('tt_token');
    try {
        const response = await fetch(`${window.API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            window.showToast('Order status updated', 'success');
            loadOrders();
        } else {
            // Improved Error Handling: Parse server response for specific message
            try {
                const errorData = await response.json();
                window.showToast(errorData.message || 'Error updating order status', 'error');
            } catch (e) {
                window.showToast('Error updating order status (Unknown response format)', 'error');
            }
        }
    } catch (error) {
        console.error('Network error updating order:', error);
        window.showToast('Network error updating order', 'error');
    }
}

function viewOrder(orderId) {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    // Replaced alert() with a console log and a toast notification
    console.groupCollapsed(`Order Details: #${order._id.slice(-6).toUpperCase()}`);
    console.info('ID:', order._id);
    console.info('Customer:', order.user?.email || 'Guest');
    console.info('Total Price:', `$${parseFloat(order.totalPrice).toFixed(2)}`);
    console.info('Status:', order.status);
    console.info('Created At:', new Date(order.createdAt).toLocaleString());
    console.info('Items:', order.orderItems);
    console.groupEnd();

    // Use a toast to indicate details were logged
    window.showToast(`Details for Order #${order._id.slice(-6).toUpperCase()} logged to console.`, 'info');
}

document.addEventListener('DOMContentLoaded', loadOrders);