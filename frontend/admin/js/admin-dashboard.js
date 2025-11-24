/*
 * File: frontend/admin/js/admin-dashboard.js
 * Mục đích: Fetch data Dashboard (Stats + Recent Users + Recent Jobs)
 */

// Token thật của bạn
const HARDCODED_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBkZXYuY29tIiwidWlkIjoxLCJpc3MiOiJodHRwczovL2FwaS5qb2Jwb3J0YWwuZGV2IiwiaWF0IjoxNzY0MDA3OTQwLCJleHAiOjE3NjQwNTExNDB9.SuRHrNbYJMglI2HToocjdxuGvI2jdgYectYXy2GaqYshPIemHzKt3vu7HBNrnQ6RFbLJ1Two1DB_ESs96BZnog";
const API_BASE_URL = "https://jobportal.works/api";

document.addEventListener('DOMContentLoaded', function() {
    loadFragments().then(() => {
        loadDashboardData();
    });
});

async function loadDashboardData() {
    showLoading();

    try {
        console.log('🔄 Đang gọi đồng thời 3 API...');

        // Chuẩn bị Headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HARDCODED_TOKEN}`
        };

        // Gọi 3 API song song (Promise.all) để tiết kiệm thời gian
        const [statsRes, usersRes, jobsRes] = await Promise.all([
            // 1. API Thống kê tổng
            fetch(`${API_BASE_URL}/admins/stats`, { headers }),
            
            // 2. API Người dùng mới nhất (sort=createdAt,desc & perPage=5)
            fetch(`${API_BASE_URL}/users/list?page=1&perPage=5&sort=createdAt,desc`, { headers }),
            
            // 3. API Tin tuyển dụng mới nhất (sort=createdAt,desc & perPage=5)
            fetch(`${API_BASE_URL}/jobs?page=1&perPage=5&sort=createdAt,desc`, { headers })
        ]);

        // Xử lý kết quả
        let dashboardData = {};

        // --- Xử lý Stats ---
        if (statsRes.ok) {
            const statsJson = await statsRes.json();
            if (statsJson.success) dashboardData = { ...dashboardData, ...statsJson.data };
        }

        // --- Xử lý Recent Users ---
        if (usersRes.ok) {
            const usersJson = await usersRes.json();
            if (usersJson.success) {
                // API trả về Page object, danh sách nằm trong .content
                dashboardData.recentUsers = usersJson.data.content || usersJson.data; 
            }
        }

        // --- Xử lý Recent Jobs ---
        if (jobsRes.ok) {
            const jobsJson = await jobsRes.json();
            if (jobsJson.success) {
                dashboardData.recentJobs = jobsJson.data.content || jobsJson.data;
            }
        }

        console.log('✅ Dữ liệu tổng hợp:', dashboardData);
        renderDataToView(dashboardData);

    } catch (error) {
        console.error('❌ Lỗi kết nối:', error);
        useMockData(); // Fallback nếu lỗi
    } finally {
        hideLoading();
    }
}

/**
 * Hiển thị dữ liệu
 */
function renderDataToView(data) {
    // 1. Stats Cards
    // (Kiểm tra kỹ tên trường trong console log nếu số không hiện)
    document.getElementById('total-users').textContent = (data.totalUsers || data.userCount || 0).toLocaleString();
    document.getElementById('total-companies').textContent = (data.totalCompanies || data.companyCount || 0).toLocaleString();
    document.getElementById('total-jobs').textContent = (data.totalJobs || data.jobCount || 0).toLocaleString();
    document.getElementById('total-applications').textContent = (data.totalApplications || data.applicationCount || 0).toLocaleString();

    // 2. Charts (Nếu API stats trả về chartData thì vẽ, không thì vẽ mặc định hoặc ẩn)
    if (data.chartData) {
        renderUserChart(data.chartData.labels, data.chartData.users);
        renderJobChart(data.chartData.labels, data.chartData.jobs);
    } else {
        // Vẽ biểu đồ rỗng hoặc mẫu nếu chưa có API chart
        renderUserChart(['T2','T3','T4','T5','T6','T7','CN'], [0,0,0,0,0,0,0]);
        renderJobChart(['T2','T3','T4','T5','T6','T7','CN'], [0,0,0,0,0,0,0]);
    }

    // 3. Recent Lists
    if (data.recentUsers) displayRecentUsers(data.recentUsers);
    if (data.recentJobs) displayRecentJobs(data.recentJobs);

    showContent();
}

// --- CÁC HÀM DISPLAY & HELPER (GIỮ NGUYÊN) ---

function useMockData() {
    // ... (Giữ nguyên nội dung hàm useMockData cũ của bạn) ...
    const mockData = {
        totalUsers: 1250, totalCompanies: 68, totalJobs: 450, totalApplications: 3200,
        chartData: { labels: ['T2', 'T3', 'T4', 'T5'], users: [50, 75, 60, 90], jobs: [20, 35, 25, 40] },
        recentUsers: [{ name: 'Nguyễn Văn A (Mock)', role: 'CANDIDATE', time: 'Vừa xong' }],
        recentJobs: [{ title: 'Java Dev (Mock)', company: 'FPT', status: 'PUBLISHED', statusClass: 'bg-green-100 text-green-800' }]
    };
    renderDataToView(mockData);
}

function displayRecentUsers(users) {
    const list = document.getElementById('recent-users-list');
    if(!list) return;
    if (!users || users.length === 0) { list.innerHTML = '<p class="p-6 text-gray-500">Không có dữ liệu.</p>'; return; }
    
    list.innerHTML = users.map(user => `
        <div class="p-4 flex justify-between items-center hover:bg-gray-50 border-b border-gray-100">
            <div>
                <p class="font-medium text-sm text-gray-900">${user.name || user.fullName || 'No Name'}</p>
                <p class="text-xs text-gray-500">${user.email}</p>
            </div>
            <span class="text-xs text-gray-500 flex-shrink-0">
                ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
            </span>
        </div>
    `).join('');
}

function displayRecentJobs(jobs) {
    const list = document.getElementById('recent-jobs-list');
    if(!list) return;
    if (!jobs || jobs.length === 0) { list.innerHTML = '<p class="p-6 text-gray-500">Không có dữ liệu.</p>'; return; }

    list.innerHTML = jobs.map(job => `
        <div class="p-4 flex justify-between items-center hover:bg-gray-50 border-b border-gray-100">
            <div>
                <p class="font-medium text-sm text-gray-900">${job.title}</p>
                <p class="text-xs text-gray-500">${job.company ? job.company.name : 'Công ty ẩn'}</p>
            </div>
            <span class="px-2 py-0.5 rounded text-xs font-semibold ${job.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                ${job.published ? 'Đã đăng' : 'Nháp'}
            </span>
        </div>
    `).join('');
}

function renderUserChart(labels, data) {
    const ctx = document.getElementById('userChart'); if(!ctx) return;
    if(window.myUserChart) window.myUserChart.destroy();
    window.myUserChart = new Chart(ctx.getContext('2d'), {
        type: 'line', data: { labels: labels, datasets: [{ label: 'Người dùng', data: data, borderColor: 'blue', fill: false }] }
    });
}
function renderJobChart(labels, data) {
    const ctx = document.getElementById('jobChart'); if(!ctx) return;
    if(window.myJobChart) window.myJobChart.destroy();
    window.myJobChart = new Chart(ctx.getContext('2d'), {
        type: 'bar', data: { labels: labels, datasets: [{ label: 'Tin tuyển dụng', data: data, backgroundColor: 'green' }] }
    });
}
function showLoading() { document.getElementById('loading-state').classList.remove('hidden'); document.getElementById('dashboard-content').classList.add('hidden'); }
function hideLoading() { document.getElementById('loading-state').classList.add('hidden'); }
function showContent() { document.getElementById('dashboard-content').classList.remove('hidden'); }