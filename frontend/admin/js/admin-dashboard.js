/* File: frontend/admin/js/admin-dashboard.js */
document.addEventListener('DOMContentLoaded', function() {
    loadFragments().then(() => {
        // Tạm thời bỏ qua đăng nhập
        /*
        if (!authService.isAuthenticated()) {
            window.location.href = '../login.html'; // Sửa đường dẫn
            return;
        }
        */
        loadDashboardData();
    });
});
async function loadDashboardData() {
    showLoading();
    try {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const stats = { totalUsers: '1,234', totalCompanies: '567', totalJobs: '3,890', totalApplications: '10,420' };
        const userChartData = {
            labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6'],
            data: [120, 150, 110, 180, 210, 230]
        };
        const jobChartData = {
            labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6'],
            data: [300, 350, 280, 400, 410, 390]
        };
        const recentUsers = [
            { name: 'Nguyen Van A', role: 'Ứng viên', time: '2 giờ trước' },
            { name: 'recruiter@company.com', role: 'Nhà tuyển dụng', time: 'Hôm qua' },
            { name: 'Tran Thi B', role: 'Ứng viên', time: '2 ngày trước' }
        ];
        const recentJobs = [
            { title: 'Senior Frontend Developer', company: 'Tech Solutions Inc.', status: 'Đã đăng', statusClass: 'bg-green-100 text-green-800' },
            { title: 'UX/UI Designer (Remote)', company: 'Creative Agency', status: 'Chờ duyệt', statusClass: 'bg-yellow-100 text-yellow-800' }
        ];
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('total-companies').textContent = stats.totalCompanies;
        document.getElementById('total-jobs').textContent = stats.totalJobs;
        document.getElementById('total-applications').textContent = stats.totalApplications;
        renderUserChart(userChartData.labels, userChartData.data);
        renderJobChart(jobChartData.labels, jobChartData.data);
        displayRecentUsers(recentUsers);
        displayRecentJobs(recentJobs);
        showContent();
    } catch (error) { showError('Không thể tải dữ liệu dashboard.'); }
    finally { hideLoading(); }
}
function renderUserChart(labels, data) {
    const ctx = document.getElementById('userChart').getContext('2d');
    new Chart(ctx, { type: 'line', data: { labels: labels, datasets: [{ label: 'Người dùng mới', data: data, borderColor: 'rgba(59, 130, 246, 1)', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } } });
}
function renderJobChart(labels, data) {
    const ctx = document.getElementById('jobChart').getContext('2d');
    new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Tin tuyển dụng mới', data: data, backgroundColor: 'rgba(22, 163, 74, 0.7)', borderColor: 'rgba(22, 163, 74, 1)', borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } } });
}
function displayRecentUsers(users) {
    const list = document.getElementById('recent-users-list'); list.innerHTML = ''; 
    if (!users || users.length === 0) { list.innerHTML = '<p class="p-6 text-gray-500">Không có người dùng mới.</p>'; return; }
    list.innerHTML = users.map(user => `<div class="p-4 flex justify-between items-center hover:bg-gray-50"><div><p class="font-medium text-sm text-gray-900">${user.name}</p><p class="text-xs text-gray-500">Vai trò: ${user.role}</p></div><span class="text-xs text-gray-500 flex-shrink-0">${user.time}</span></div>`).join('');
}
function displayRecentJobs(jobs) {
    const list = document.getElementById('recent-jobs-list'); list.innerHTML = '';
    if (!jobs || jobs.length === 0) { list.innerHTML = '<p class="p-6 text-gray-500">Không có tin tuyển dụng mới.</p>'; return; }
    list.innerHTML = jobs.map(job => `<div class="p-4 flex justify-between items-center hover:bg-gray-50"><div><p class="font-medium text-sm text-gray-900">${job.title}</p><p class="text-xs text-gray-500">${job.company}</p></div><span class="px-2 py-0.5 ${job.statusClass} rounded text-xs font-semibold">${job.status}</span></div>`).join('');
}
function showLoading() { hideElement('dashboard-content'); showElement('loading-state'); hideElement('error-state'); }
function hideLoading() { hideElement('loading-state'); }
function showContent() { hideElement('loading-state'); hideElement('error-state'); showElement('dashboard-content'); }
function showError(message) { hideElement('loading-state'); hideElement('dashboard-content'); const errorText = document.getElementById('error-text'); if (errorText) errorText.textContent = message; showElement('error-state'); }