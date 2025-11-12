/* File: frontend/admin/js/admin-companies.js */
document.addEventListener('DOMContentLoaded', function() {
    loadFragments().then(() => {
        // Tạm thời vô hiệu hóa
        /*
        if (!authService.isAuthenticated()) {
            window.location.href = '../login.html'; // Sửa đường dẫn
            return;
        }
        */
        loadCompanies(1, '', 'all');
        const searchInput = document.getElementById('company-search-input');
        const verifiedFilter = document.getElementById('verified-filter');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadCompanies(1, searchInput.value, verifiedFilter.value);
            }, 500);
        });
        verifiedFilter.addEventListener('change', () => {
            loadCompanies(1, searchInput.value, verifiedFilter.value);
        });
    });
});
async function loadCompanies(page = 1, keyword = '', verifiedStatus = 'all') {
    showLoading();
    try {
        console.log(`Đang tải (giả lập) trang ${page} với từ khóa "${keyword}" và trạng thái "${verifiedStatus}"`);
        const mockCompanies = [
            { id: 1, name: 'Tech Solutions Inc.', website: 'techsolutions.com', verified: true, followerCount: 1200, slug: 'tech-solutions-inc' },
            { id: 2, name: 'Creative Agency', website: 'creative.vn', verified: false, followerCount: 300, slug: 'creative-agency' },
            { id: 3, name: 'Global Tech', website: 'globaltech.com', verified: true, followerCount: 5000, slug: 'global-tech' },
            { id: 4, name: 'FPT Software', website: 'fpt-software.com', verified: true, followerCount: 15000, slug: 'fpt-software' },
            { id: 5, name: 'Startup Mới', website: 'startup.io', verified: false, followerCount: 10, slug: 'startup-moi' },
        ];
        let filtered = mockCompanies.filter(c => c.name.toLowerCase().includes(keyword.toLowerCase()));
        if (verifiedStatus === 'true') { filtered = filtered.filter(c => c.verified === true); }
        else if (verifiedStatus === 'false') { filtered = filtered.filter(c => c.verified === false); }
        const mockPageData = { content: filtered.slice(0, 10), totalPages: 1, number: page - 1, first: page === 1, last: page === 1 };
        await new Promise(resolve => setTimeout(resolve, 500)); 
        displayCompanies(mockPageData.content || []);
        displayPagination(mockPageData);
        if (mockPageData.content.length === 0) { showEmptyState(); } else { showContent(); }
    } catch (error) { showError(error.message); }
    finally { hideLoading(); }
}
function displayCompanies(companies) {
    const companyList = document.getElementById('companies-list');
    companyList.innerHTML = '';
    if (companies.length === 0) { showEmptyState(); return; }
    companies.forEach(company => {
        const statusBadge = company.verified ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã xác thực</span>` : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ xác thực</span>`;
        const actionButton = company.verified ? `<button onclick="toggleVerify(${company.id}, false)" class="ml-4 text-yellow-600 hover:text-yellow-900 transition" title="Hủy xác thực">Hủy</button>` : `<button onclick="toggleVerify(${company.id}, true)" class="ml-4 text-green-600 hover:text-green-900 transition" title="Xác thực công ty này">Xác thực</button>`;
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${company.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div class="font-medium text-gray-900">${company.name}</div>
                    <div class="text-xs text-gray-500">${company.followerCount} theo dõi</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <a href="https://${company.website}" target="_blank" class="text-blue-600 hover:underline">${company.website}</a>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${statusBadge}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <a href="../company-detail.html?slug=${company.slug}" target="_blank" class="text-blue-600 hover:text-blue-900 transition" title="Xem chi tiết">Xem</a> ${actionButton}
                    <button onclick="deleteCompany(${company.id})" class="ml-4 text-red-600 hover:text-red-900 transition" title="Xóa công ty">Xóa</button>
                </td>
            </tr>`;
        companyList.innerHTML += row;
    });
}
function displayPagination(paginationData) {
    const { totalPages, number, first, last } = paginationData;
    const currentPage = number + 1;
    const paginationContainer = document.getElementById('pagination');
    if (totalPages <= 1) { paginationContainer.innerHTML = ''; hideElement(paginationContainer); return; }
    let paginationHtml = '<div class="flex items-center gap-2">';
    paginationHtml += `<button onclick="loadCompanies(${currentPage - 1}, document.getElementById('company-search-input').value, document.getElementById('verified-filter').value)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 ${first ? 'opacity-50 cursor-not-allowed' : ''}" ${first ? 'disabled' : ''}>&larr; Trước</button>`;
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button onclick="loadCompanies(${i}, document.getElementById('company-search-input').value, document.getElementById('verified-filter').value)" class="px-4 py-2 border ${i === currentPage ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg text-sm font-semibold">${i}</button>`;
    }
    paginationHtml += `<button onclick="loadCompanies(${currentPage + 1}, document.getElementById('company-search-input').value, document.getElementById('verified-filter').value)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 ${last ? 'opacity-50 cursor-not-allowed' : ''}" ${last ? 'disabled' : ''}>Sau &rarr;</button>`;
    paginationHtml += '</div>';
    paginationContainer.innerHTML = paginationHtml;
    showElement(paginationContainer);
}
function showLoading() { hideElement('error-state'); hideElement('empty-state'); hideElement('companies-container'); hideElement('pagination'); showElement('loading'); }
function hideLoading() { hideElement('loading'); }
function showContent() { hideElement('loading'); hideElement('error-state'); hideElement('empty-state'); showElement('companies-container'); showElement('pagination'); }
function showEmptyState() { hideElement('loading'); hideElement('error-state'); hideElement('companies-container'); hideElement('pagination'); showElement('empty-state'); }
function showError(message) { hideElement('loading'); hideElement('empty-state'); hideElement('companies-container'); hideElement('pagination'); document.getElementById('error-text').textContent = message || 'Đã có lỗi xảy ra.'; showElement('error-state'); }
async function toggleVerify(companyId, shouldVerify) {
    const action = shouldVerify ? 'Xác thực' : 'Hủy xác thực';
    if (!confirm(`(Thiết kế) Bạn có chắc muốn ${action} Công ty ID: ${companyId} không?`)) { return; }
    showSuccessToast(`(Giả lập) Đã ${action} công ty ${companyId}!`);
    loadCompanies(currentPage, document.getElementById('company-search-input').value, document.getElementById('verified-filter').value);
}
async function deleteCompany(companyId) {
    if (!confirm(`(Thiết kế) Bạn có chắc chắn muốn XÓA Công ty ID: ${companyId} không?`)) { return; }
    showSuccessToast(`(Giả lập) Đã xóa công ty ${companyId}!`);
    loadCompanies(currentPage, document.getElementById('company-search-input').value, document.getElementById('verified-filter').value);
}
function clearFilters() { document.getElementById('company-search-input').value = ''; document.getElementById('verified-filter').value = 'all'; loadCompanies(1, '', 'all'); }
window.loadCompanies = loadCompanies;
window.toggleVerify = toggleVerify;
window.deleteCompany = deleteCompany;
window.clearFilters = clearFilters;