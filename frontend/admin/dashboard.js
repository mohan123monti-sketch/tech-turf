// Dashboard Logic - MINIMALIST (NO ANIMATIONS, NO CHARTS, NO RECENT ACTIVITY)
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('tt_token');

    async function loadDashboardStats() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const stats = await response.json();

                // Display values directly - NO ANIMATION
                displayValue('kpi-revenue', stats.revenue || 0, true);
                displayValue('kpi-orders', stats.orders || 0);
                displayValue('kpi-users', stats.users || 0);
            } else {
                console.error('Failed to load statistics');
            }
        } catch (error) {
            console.error('Dashboard error:', error);
        }
    }

    // Simple display function - NO ANIMATION
    function displayValue(id, value, isCurrency = false) {
        const obj = document.getElementById(id);
        if (!obj) return;

        if (isCurrency) {
            obj.textContent = `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            obj.textContent = Number(value).toLocaleString();
        }
    }

    // Initial load
    loadDashboardStats();

    // Refresh every 30 seconds
    setInterval(loadDashboardStats, 30000);
});
