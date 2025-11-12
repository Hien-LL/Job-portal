/* File: frontend/admin/js/admin-notifications.js */
document.addEventListener('DOMContentLoaded', function() {
    loadFragments().then(() => {
        // Tạm thời vô hiệu hóa
        /*
        if (!authService.isAuthenticated()) {
            window.location.href = '../login.html'; // Sửa đường dẫn
            return;
        }
        */
        loadHistory();
        const form = document.getElementById('notification-form');
        form.addEventListener('submit', handleSendNotification);
    });
});
async function loadHistory() {
    showLoading();
    try {
        const mockHistory = [
            { id: 1, title: 'Hệ thống sẽ bảo trì', body: 'Hệ thống sẽ bảo trì từ 2AM - 3AM. Vui lòng...', target: 'ALL', sentAt: '2025-11-11T10:30:00Z' },
            { id: 2, title: 'Cập nhật chính sách mới', body: 'Chúng tôi vừa cập nhật chính sách bảo mật...', target: 'RECRUITER', sentAt: '2025-11-10T15:00:00Z' },
            { id: 3, title: 'Chào mừng người dùng mới', body: 'Cảm ơn bạn đã tham gia JobPortal...', target: 'CANDIDATE', sentAt: '2025-11-09T09:00:00Z' }
        ];
        await new Promise(resolve => setTimeout(resolve, 500)); 
        displayHistory(mockHistory);
        showContent();
    } catch (error) { showError('Không thể tải lịch sử thông báo.'); }
    finally { hideLoading(); }
}
function displayHistory(history) {
    const historyList = document.getElementById('history-list');
    const emptyState = document.getElementById('empty-state');
    historyList.innerHTML = '';
    if (history.length === 0) { showEmptyState(); return; }
    const targetMap = { 'ALL': 'Tất cả', 'CANDIDATE': 'Ứng viên', 'RECRUITER': 'Nhà tuyển dụng' };
    history.forEach(item => {
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.title}</td>
                <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title="${item.body}">${item.body}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">${targetMap[item.target] || 'Không rõ'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(item.sentAt)}</td>
            </tr>`;
        historyList.innerHTML += row;
    });
}
async function handleSendNotification(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const body = document.getElementById('body').value;
    const target = document.getElementById('target-group').value;
    const sendBtn = document.getElementById('send-btn');
    const successMessage = document.getElementById('success-message');
    if (!title || !body) { alert("Vui lòng nhập Tiêu đề và Nội dung."); return; }
    sendBtn.disabled = true; sendBtn.innerHTML = 'Đang gửi...';
    hideElement(successMessage);
    try {
        console.log('Đang gửi (giả lập):', { title, body, target });
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        showElement(successMessage);
        document.getElementById('notification-form').reset();
        loadHistory(); 
    } catch (error) { alert('Lỗi: ' + error.message); }
    finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> Gửi thông báo';
    }
}
function showLoading() { hideElement('error-state'); hideElement('empty-state'); showElement('loading'); }
function hideLoading() { hideElement('loading'); }
function showContent() { hideElement('loading'); hideElement('error-state'); hideElement('empty-state'); showElement('history-container'); }
function showEmptyState() { hideElement('loading'); hideElement('error-state'); hideElement('history-container'); showElement('empty-state'); }
function showError(message) { alert(message); }
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
window.handleSendNotification = handleSendNotification;
window.loadHistory = loadHistory;