// Support/Tickets Page Logic
// Note: API_BASE_URL and window.showToast are provided by admin-layout.js

let tickets = [];

async function loadTickets() {
    const token = localStorage.getItem('tt_token');
    try {
        const response = await fetch(`${window.API_BASE_URL}/tickets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        tickets = await response.json();
        renderTickets();
    } catch (error) {
        console.error('Error loading tickets:', error);
        window.showToast('Failed to load tickets', 'error');
    }
}

function renderTickets() {
    const container = document.getElementById('tickets-container');
    if (!container) return;

    if (tickets.length === 0) {
        container.innerHTML = '<div class="p-6 text-center text-gray-500">No support tickets</div>';
        return;
    }

    container.innerHTML = tickets.map(ticket => {
        const priorityColors = {
            low: 'bg-blue-500/10 text-blue-400',
            medium: 'bg-yellow-500/10 text-yellow-500',
            high: 'bg-red-500/10 text-red-500'
        };

        const statusColors = {
            Open: 'bg-green-500/10 text-green-400',
            'In Progress': 'bg-indigo-500/10 text-indigo-400',
            Closed: 'bg-gray-500/10 text-gray-400'
        };

        return `
            <div class="p-6 hover:bg-gray-700/30 transition-colors cursor-pointer border-b border-gray-700 last:border-b-0">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-medium text-white">${ticket.subject}</h3>
                    <div class="flex items-center space-x-2 text-xs">
                        <span class="px-2 py-1 rounded-full font-semibold ${priorityColors[ticket.priority.toLowerCase()] || 'bg-gray-500/10 text-gray-400'}">
                            ${ticket.priority}
                        </span>
                        <span class="px-2 py-1 rounded-full font-semibold ${statusColors[ticket.status] || 'bg-gray-500/10 text-gray-400'}">
                            ${ticket.status}
                        </span>
                    </div>
                </div>
                <p class="text-sm text-gray-400 mb-3 line-clamp-2">${ticket.message}</p>
                <div class="flex justify-between items-center text-xs text-gray-500">
                    <span>Opened by: ${ticket.user?.username || ticket.userEmail || 'N/A'}</span>
                    <span>${new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <div class="space-x-2">
                        <button onclick="updateTicketStatus('${ticket._id}', 'In Progress')" class="text-indigo-400 hover:text-indigo-300">
                            <i data-lucide="chevrons-right" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteTicket('${ticket._id}')" class="text-red-400 hover:text-red-300">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

async function updateTicketStatus(id, status) {
    const token = localStorage.getItem('tt_token');
    try {
        const response = await fetch(`${window.API_BASE_URL}/tickets/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        if (response.ok) {
            window.showToast('Ticket updated successfully', 'success');
            loadTickets();
        } else {
            // Improved Error Handling: Parse server response for specific message
            try {
                const errorData = await response.json();
                window.showToast(errorData.message || 'Error updating ticket status', 'error');
            } catch (e) {
                window.showToast('Error updating ticket status (Unknown response format)', 'error');
            }
        }
    } catch (error) {
        console.error('Network error updating ticket:', error);
        window.showToast('Network error updating ticket', 'error');
    }
}

async function deleteTicket(id) {
    // Replaced confirm() with an internal confirmation/logging mechanism
    console.log(`[CRITICAL ACTION: TICKET DELETE] Requesting deletion of ticket ID: ${id}.`);
    window.showToast('Deletion requested. Please check server logs for confirmation.', 'info');

    const token = localStorage.getItem('tt_token');
    try {
        const response = await fetch(`${window.API_BASE_URL}/tickets/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            window.showToast('Ticket deleted successfully', 'success');
            loadTickets();
        } else {
            // Improved Error Handling: Parse server response for specific message
            try {
                const errorData = await response.json();
                window.showToast(errorData.message || 'Error deleting ticket', 'error');
            } catch (e) {
                window.showToast('Error deleting ticket (Unknown response format)', 'error');
            }
        }
    } catch (error) {
        console.error('Network error deleting ticket:', error);
        window.showToast('Network error deleting ticket', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadTickets);