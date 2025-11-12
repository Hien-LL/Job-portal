/* File: frontend/admin/js/admin-jobs.js */
document.addEventListener('DOMContentLoaded', function() {
    loadFragments().then(() => {
        // Tạm thời vô hiệu hóa
        /*
        if (!authService.isAuthenticated()) {
            window.location.href = '../login.html'; // Sửa đường dẫn
            return;
        }
        */
        loadJobs(1, '', 'all');
        const searchInput = document.getElementById('job-search-input');
        const statusFilter = document.getElementById('status-filter');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadJobs(1, searchInput.value, statusFilter.value);
            }, 500);
        });
        statusFilter.addEventListener('change', () => {
            loadJobs(1, searchInput.value, statusFilter.value);
        });
    });
});
async function loadJobs(page = 1, keyword = '', statusFilter = 'all') {
    showLoading();
    try {
        console.log(`Đang tải (giả lập) trang ${page} với từ khóa "${keyword}" và trạng thái "${statusFilter}"`);
        const mockJobs = [
            { id: 1, title: 'Senior Frontend Developer', company: { name: 'Tech Solutions Inc.' }, published: true, applicationCount: 45, slug: 'senior-frontend-dev' },
            { id: 2, title: 'UX/UI Designer', company: { name: 'Creative Agency' }, published: false, applicationCount: 0, slug: 'ux-ui-designer' },
            { id: 3, title: 'Backend Developer (Java)', company: { name: 'Tech Solutions Inc.' }, published: true, applicationCount: 22, slug: 'backend-developer-java' },
            { id: 4, title: 'Data Scientist', company: { name: 'Global Tech' }, published: true, applicationCount: 10, slug: 'data-scientist' },
            { id: 5, title: 'Project Manager', company: { name: 'Creative Agency' }, published: false, applicationCount: 0, slug: 'project-manager' },
        ];
        let filtered = mockJobs.filter(j => j.title.toLowerCase().includes(keyword.toLowerCase()) || j.company.name.toLowerCase().includes(keyword.toLowerCase()));
        if (statusFilter === 'true') { filtered = filtered.filter(j => j.published === true); }
        else if (statusFilter === 'false') { filtered = filtered.filter(j => j.published === false); }
        const mockPageData = { content: filtered.slice(0, 10), totalPages: 1, number: page - 1, first: page === 1, last: page === 1 };
        await new Promise(resolve => setTimeout(resolve, 500)); 
        displayJobs(mockPageData.content || []);
        displayPagination(mockPageData);
        if (mockPageData.content.length === 0) { showEmptyState(); } else { showContent(); }
    } catch (error) { showError(error.message); }
    finally { hideLoading(); }
}
function displayJobs(jobs) {
    const jobList = document.getElementById('jobs-list');
    jobList.innerHTML = '';
    if (jobs.length === 0) { showEmptyState(); return; }
    jobs.forEach(job => {
        const statusBadge = job.published ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã đăng</span>` : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Nháp</span>`;
        const actionButton = job.published ? `<button onclick="togglePublish(${job.id}, false)" class="ml-4 text-yellow-600 hover:text-yellow-900 transition" title="Gỡ tin">Gỡ xuống</button>` : `<button onclick="togglePublish(${job.id}, true)" class="ml-4 text-green-600 hover:text-green-900 transition" title="Đăng tin này">Đăng</button>`;
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${job.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${job.company.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${statusBadge}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${job.applicationCount}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <a href="../job-detail.html?slug=${job.slug}" target="_blank" class="text-blue-600 hover:text-blue-900 transition" title="Xem chi tiết">Xem</a> ${actionButton}
                    <button onclick="deleteJob(${job.id})" class="ml-4 text-red-600 hover:text-red-900 transition" title="Xóa tin tuyển dụng">Xóa</button>
                </td>
            </tr>`;
        jobList.innerHTML += row;
    });
}
function displayPagination(paginationData) {
    const { totalPages, number, first, last } = paginationData;
    const currentPage = number + 1;
    const paginationContainer = document.getElementById('pagination');
    if (totalPages <= 1) { paginationContainer.innerHTML = ''; hideElement(paginationContainer); return; }
    let paginationHtml = '<div class="flex items-center gap-2">';
    paginationHtml += `<button onclick="loadJobs(${currentPage - 1}, document.getElementById('job-search-input').value, document.getElementById('status-filter').value)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 ${first ? 'opacity-50 cursor-not-allowed' : ''}" ${first ? 'disabled' : ''}>&larr; Trước</button>`;
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button onclick="loadJobs(${i}, document.getElementById('job-search-input').value, document.getElementById('status-filter').value)" class="px-4 py-2 border ${i === currentPage ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg text-sm font-semibold">${i}</button>`;
    }
    paginationHtml += `<button onclick="loadJobs(${currentPage + 1}, document.getElementById('job-search-input').value, document.getElementById('status-filter').value)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 ${last ? 'opacity-50 cursor-not-allowed' : ''}" ${last ? 'disabled' : ''}>Sau &rarr;</button>`;
    paginationHtml += '</div>';
    paginationContainer.innerHTML = paginationHtml;
    showElement(paginationContainer);
}
function showLoading() { hideElement('error-state'); hideElement('empty-state'); hideElement('jobs-container'); hideElement('pagination'); showElement('loading'); }
function hideLoading() { hideElement('loading'); }
function showContent() { hideElement('loading'); hideElement('error-state'); hideElement('empty-state'); showElement('jobs-container'); showElement('pagination'); }
function showEmptyState() { hideElement('loading'); hideElement('error-state'); hideElement('jobs-container'); hideElement('pagination'); showElement('empty-state'); }
function showError(message) { hideElement('loading'); hideElement('empty-state'); hideElement('jobs-container'); hideElement('pagination'); document.getElementById('error-text').textContent = message || 'Đã có lỗi xảy ra.'; showElement('error-state'); }
async function togglePublish(jobId, shouldPublish) {
    const action = shouldPublish ? 'Đăng' : 'Gỡ';
    if (!confirm(`(Thiết kế) Bạn có chắc muốn ${action} tin ID: ${jobId} không?`)) { return; }
    showSuccessToast(`(Giả lập) Đã ${action} tin ${jobId}!`);
    loadJobs(currentPage, document.getElementById('job-search-input').value, document.getElementById('status-filter').value);
}
async function deleteJob(jobId) {
    if (!confirm(`(Thiết kế) Bạn có chắc chắn muốn XÓA tin ID: ${jobId} không?`)) { return; }
    showSuccessToast(`(Giả lập) Đã xóa tin ${jobId}!`);
    loadJobs(currentPage, document.getElementById('job-search-input').value, document.getElementById('status-filter').value);
}
function clearFilters() { document.getElementById('job-search-input').value = ''; document.getElementById('status-filter').value = 'all'; loadJobs(1, '', 'all'); }
window.loadJobs = loadJobs;
window.togglePublish = togglePublish;
window.deleteJob = deleteJob;
window.clearFilters = clearFilters;