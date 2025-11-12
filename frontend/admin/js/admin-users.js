/* File: frontend/admin/js/admin-users.js */
document.addEventListener('DOMContentLoaded', function() {
    loadFragments().then(() => {
        // Tạm thời vô hiệu hóa kiểm tra đăng nhập
        /*
        if (!authService.isAuthenticated()) { 
            window.location.href = '../login.html'; // Sửa đường dẫn
            return;
        }
        */
        loadUsers(1, '');
        const searchInput = document.getElementById('user-search-input');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadUsers(1, searchInput.value);
            }, 500);
        });
    });
});
async function loadUsers(page = 1, keyword = '') {
    showLoading();
    try {
        console.log(`Đang tải (giả lập) trang ${page} với từ khóa "${keyword}"`);
        const mockUsers = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 + (page - 1) * 10, name: `Người Dùng Mẫu ${i + 1}`, email: `user${i + 1}@example.com`, phone: `090000000${i}`, address: '123 Đường ABC, Q1, TP. HCM' }));
        const filteredUsers = keyword ? mockUsers.filter(u => u.name.toLowerCase().includes(keyword.toLowerCase()) || u.email.toLowerCase().includes(keyword.toLowerCase())) : mockUsers.slice(0, 10);
        const mockPageData = { content: filteredUsers, totalPages: 3, number: page - 1, first: page === 1, last: page === 3 };
        await new Promise(resolve => setTimeout(resolve, 500)); 
        displayUsers(mockPageData.content || []);
        displayPagination(mockPageData);
        if (mockPageData.content.length === 0) { showEmptyState(); } else { showContent(); }
    } catch (error) { showError(error.message); }
    finally { hideLoading(); }
}
function displayUsers(users) {
    const userList = document.getElementById('users-list');
    userList.innerHTML = '';
    if (users.length === 0) { showEmptyState(); return; }
    users.forEach(user => {
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${user.name || '(Chưa cập nhật)'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${user.phone || '(Chưa cập nhật)'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onclick="viewUserDetails(${user.id})" class="text-blue-600 hover:text-blue-900 transition" title="Xem chi tiết">Xem</button>
                    <button onclick="editUserRoles(${user.id})" class="ml-4 text-indigo-600 hover:text-indigo-900 transition" title="Chỉnh sửa vai trò">Sửa vai trò</button>
                    <button onclick="deleteUser(${user.id})" class="ml-4 text-red-600 hover:text-red-900 transition" title="Xóa người dùng">Xóa</button>
                </td>
            </tr>`;
        userList.innerHTML += row;
    });
}
function displayPagination(paginationData) {
    const { totalPages, number, first, last } = paginationData;
    const currentPage = number + 1;
    const paginationContainer = document.getElementById('pagination');
    if (totalPages <= 1) { paginationContainer.innerHTML = ''; hideElement(paginationContainer); return; }
    let paginationHtml = '<div class="flex items-center gap-2">';
    paginationHtml += `<button onclick="loadUsers(${currentPage - 1}, document.getElementById('user-search-input').value)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 ${first ? 'opacity-50 cursor-not-allowed' : ''}" ${first ? 'disabled' : ''}>&larr; Trước</button>`;
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button onclick="loadUsers(${i}, document.getElementById('user-search-input').value)" class="px-4 py-2 border ${i === currentPage ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg text-sm font-semibold">${i}</button>`;
    }
    paginationHtml += `<button onclick="loadUsers(${currentPage + 1}, document.getElementById('user-search-input').value)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 ${last ? 'opacity-50 cursor-not-allowed' : ''}" ${last ? 'disabled' : ''}>Sau &rarr;</button>`;
    paginationHtml += '</div>';
    paginationContainer.innerHTML = paginationHtml;
    showElement(paginationContainer);
}
function showLoading() { hideElement('error-state'); hideElement('empty-state'); hideElement('users-container'); hideElement('pagination'); showElement('loading'); }
function hideLoading() { hideElement('loading'); }
function showContent() { hideElement('loading'); hideElement('error-state'); hideElement('empty-state'); showElement('users-container'); showElement('pagination'); }
function showEmptyState() { hideElement('loading'); hideElement('error-state'); hideElement('users-container'); hideElement('pagination'); showElement('empty-state'); }
function showError(message) { hideElement('loading'); hideElement('empty-state'); hideElement('users-container'); hideElement('pagination'); document.getElementById('error-text').textContent = message || 'Đã có lỗi xảy ra.'; showElement('error-state'); }
function viewUserDetails(userId) {
    window.open(`../public-profile.html?id=${userId}`, '_blank'); // Sửa đường dẫn
}
function editUserRoles(userId) { alert(`(Thiết kế) Chỉnh sửa vai trò cho User ID: ${userId}.`); }
async function deleteUser(userId) {
    if (confirm(`(Thiết kế) Bạn có chắc chắn muốn xóa Người dùng ID: ${userId} không?`)) {
        showSuccessToast('Xóa người dùng (giả lập) thành công!');
        loadUsers(currentPage, document.getElementById('user-search-input').value);
    }
}
function clearFilters() { document.getElementById('user-search-input').value = ''; loadUsers(1, ''); }
window.loadUsers = loadUsers;
window.viewUserDetails = viewUserDetails;
window.editUserRoles = editUserRoles;
window.deleteUser = deleteUser;
window.clearFilters = clearFilters;