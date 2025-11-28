// ==================== Recruiter Overview Service ====================
// Handles recruiter dashboard overview and statistics

let dashboardStats = {
    totalJobs: 0,
    activeJobs: 0,
    newApplications: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    viewCount: 0,
    companyFollowers: 0
};

let recentJobs = [];
let recentApplications = [];

// ==================== API Functions ====================

// Get recruiter dashboard overview/statistics
// Endpoint: GET /recruiters/dashboard/overview
// Response: { success, message, data: { totalJobs, activeJobs, newApplications, ... } }
async function getDashboardOverview() {
    try {
        console.log('Fetching dashboard overview from:', '/recruiters/dashboard/overview');

        const response = await authService.apiRequest('/recruiters/dashboard/overview', {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dashboard overview response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || {}
        };
    } catch (error) {
        console.error('Get Dashboard Overview API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.',
            data: {}
        };
    }
}

// Get recent jobs posted by recruiter
// Endpoint: GET /recruiters/jobs/recent?limit=5
// Response: { success, message, data: [ { id, title, postedDate, status, applicantsCount }, ... ] }
async function getRecentJobs(limit = 5) {
    try {
        const url = `/recruiters/jobs/recent?limit=${limit}`;
        console.log('Fetching recent jobs from:', url);

        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Recent jobs response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || []
        };
    } catch (error) {
        console.error('Get Recent Jobs API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.',
            data: []
        };
    }
}

// Get recent applications
// Endpoint: GET /recruiters/applications/recent?limit=5&status=pending
// Response: { success, message, data: [ { id, jobTitle, candidateName, appliedDate, status }, ... ] }
async function getRecentApplications(limit = 5, status = 'pending') {
    try {
        const url = `/recruiters/applications/recent?limit=${limit}&status=${status}`;
        console.log('Fetching recent applications from:', url);

        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Recent applications response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || []
        };
    } catch (error) {
        console.error('Get Recent Applications API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.',
            data: []
        };
    }
}

// Get application statistics
// Endpoint: GET /recruiters/applications/statistics
// Response: { success, message, data: { total, pending, accepted, rejected, viewed } }
async function getApplicationStatistics() {
    try {
        console.log('Fetching application statistics from:', '/recruiters/applications/statistics');

        const response = await authService.apiRequest('/recruiters/applications/statistics', {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Application statistics response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || {}
        };
    } catch (error) {
        console.error('Get Application Statistics API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.',
            data: {}
        };
    }
}

// ==================== UI Functions ====================

// Display dashboard statistics
function displayDashboardStats(stats) {
    // Total Jobs
    const totalJobsEl = document.getElementById('total-jobs-count');
    if (totalJobsEl) totalJobsEl.textContent = stats.totalJobs || 0;

    const totalJobsDesc = document.getElementById('total-jobs-desc');
    if (totalJobsDesc) totalJobsDesc.textContent = `${stats.activeJobs || 0} tin đang hoạt động`;

    // New Applications
    const newAppsEl = document.getElementById('new-applications-count');
    if (newAppsEl) newAppsEl.textContent = stats.newApplications || 0;

    const newAppsDesc = document.getElementById('new-applications-desc');
    if (newAppsDesc) newAppsDesc.textContent = `${stats.pendingApplications || 0} chờ xử lý`;
    // Total Applicants 
    const totalViewDesc = document.getElementById('total-view-desc');
    if (totalViewDesc) totalViewDesc.textContent = `+${stats.companyFollowers || 0} lượt theo dõi công ty`;
}

// Display recent jobs
function displayRecentJobs(jobs) {
    const container = document.getElementById('recent-jobs-list');
    if (!container) return;

    if (!jobs || jobs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500 text-sm">Chưa có tin tuyển dụng nào</p>
            </div>
        `;
        return;
    }

    const html = jobs.map(job => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-6 py-4">
                <p class="font-medium text-gray-900">${job.title || 'N/A'}</p>
                <p class="text-xs text-gray-500">${job.postedDate || 'N/A'}</p>
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }">
                    ${job.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
                ${job.applicantsCount || 0} ứng viên
            </td>
            <td class="px-6 py-4">
                <a href="recruiter-job-detail.html?jobId=${job.id}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Xem chi tiết
                </a>
            </td>
        </tr>
    `).join('');

    container.innerHTML = html;
}

// Display recent applications
function displayRecentApplications(applications) {
    const container = document.getElementById('recent-applications-list');
    if (!container) return;

    if (!applications || applications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500 text-sm">Chưa có ứng tuyển nào</p>
            </div>
        `;
        return;
    }

    const html = applications.map(app => `
        <div class="flex items-center justify-between py-3 px-4 border-b hover:bg-gray-50">
            <div class="flex-1">
                <p class="font-medium text-gray-900">${app.candidateName || 'N/A'}</p>
                <p class="text-sm text-gray-600">${app.jobTitle || 'N/A'}</p>
                <p class="text-xs text-gray-500">${app.appliedDate || 'N/A'}</p>
            </div>
            <div class="flex items-center gap-3">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                }">
                    ${
                        app.status === 'pending' ? 'Chờ xử lý' :
                        app.status === 'accepted' ? 'Chấp nhận' :
                        'Từ chối'
                    }
                </span>
                <a href="recruiter-applications.html?applicationId=${app.id}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Xem
                </a>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Check authentication
        if (!authService.requireAuth()) {
            return;
        }

        showElement('loading-state');
        hideElement('dashboard-content');

        // Load overview stats
        const overviewResult = await getDashboardOverview();
        if (overviewResult.success && overviewResult.data) {
            dashboardStats = overviewResult.data;
            displayDashboardStats(dashboardStats);
        }

        // Load recent jobs
        const jobsResult = await getRecentJobs(5);
        if (jobsResult.success && jobsResult.data) {
            recentJobs = jobsResult.data;
            displayRecentJobs(jobsResult.data);
        }

        // Load recent applications
        const appsResult = await getRecentApplications(5, 'all');
        if (appsResult.success && appsResult.data) {
            recentApplications = appsResult.data;
            displayRecentApplications(appsResult.data);
        }

        hideElement('loading-state');
        showElement('dashboard-content');
    } catch (error) {
        console.error('Load dashboard data error:', error);
        hideElement('loading-state');
        showErrorToast('Có lỗi xảy ra khi tải dữ liệu', 5000);
    }
}

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', function() {
    // Load dashboard data
    loadDashboardData();

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDashboardData();
            showSuccessToast('Đã làm mới dữ liệu', 2000);
        });
    }

    // Load fragments
    loadFragments();
});

// Make functions globally accessible
window.loadDashboardData = loadDashboardData;
