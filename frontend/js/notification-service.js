// ========================= Notification Service for Job Portal =========================
class NotificationService {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this._badgeObserver = null;
  }

  // ------------------------------- API calls --------------------------------
  async loadNotifications() {
    try {
      if (!authService?.isAuthenticated()) return false;

      const url = buildApiUrl(API_CONFIG.NOTIFICATIONS.LIST);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const result = await response.json();
      if (result?.success && Array.isArray(result.data)) {
        this.notifications = result.data;
        this.updateUnreadCount();
        this.updateBadge();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading notifications:', err);
      return false;
    }
  }

  async markAsRead(notificationId) {
    try {
      if (!authService?.isAuthenticated()) return false;

      const url = buildApiUrl(API_CONFIG.NOTIFICATIONS.MARK_READ, { notificationId });
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return false;

      // Update local
      const n = this.notifications.find(n => n.id === notificationId);
      if (n && !n.readAt) {
        n.readAt = new Date().toISOString();
        this.updateUnreadCount();
        this.updateBadge();
      }
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }

  async markAllAsRead() {
    try {
      if (!authService?.isAuthenticated()) return false;

      const url = buildApiUrl(API_CONFIG.NOTIFICATIONS.MARK_ALL_READ);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return false;

      this.notifications.forEach(n => {
        if (!n.readAt) n.readAt = new Date().toISOString();
      });
      this.updateUnreadCount();
      this.updateBadge();
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }

  async getNotificationDetail(notificationId) {
    try {
      if (!authService?.isAuthenticated()) return null;

      const url = buildApiUrl(API_CONFIG.NOTIFICATIONS.GET_DETAIL, { notificationId });
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notification detail');

      const result = await response.json();
      if (result?.success && result.data) return result.data;
      return null;
    } catch (err) {
      console.error('Error loading notification detail:', err);
      return null;
    }
  }

  // ------------------------------- Local state --------------------------------
  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.readAt).length;
  }

  updateBadge() {
    const apply = () => {
      const badge = document.getElementById('notification-badge');
      if (!badge) return false;

      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 99 ? '99+' : String(this.unreadCount);
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
      return true;
    };

    // Try immediately
    if (apply()) return;

    // Observe DOM for header fragment injected later
    if (this._badgeObserver) return;
    this._badgeObserver = new MutationObserver(() => {
      if (apply()) {
        this._badgeObserver.disconnect();
        this._badgeObserver = null;
      }
    });
    this._badgeObserver.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }

  getUnreadNotifications() { return this.notifications.filter(n => !n.readAt); }
  getAllNotifications() { return this.notifications; }

  async initialize() {
    if (!authService?.isAuthenticated()) return;
    await this.loadNotifications();     // fetch + badge
    // Refresh
    setInterval(() => { this.loadNotifications(); }, 30000);
  }
}

// ------------------------------- Globals --------------------------------
const notificationService = new NotificationService();
let notifications = [];

// ------------------------------- Helpers --------------------------------
function hasEl(id) { return !!document.getElementById(id); }
function onListPage() { return hasEl('notifications-content') && hasEl('notifications-list'); }
// detail page dùng file khác, không check ở đây

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function formatDate(dateString) {
  if (!dateString) return 'Không xác định';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Không xác định';

  const now = new Date();
  const diffMs = Math.abs(now - date);
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ------------------------------- List page controllers (guarded) --------------------------------
async function loadNotifications() {
  if (!onListPage()) return;

  try {
    showLoading();
    if (!authService?.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    const success = await notificationService.loadNotifications();
    if (!success) { showError(); return; }

    notifications = notificationService.getAllNotifications();
    displayNotifications();
    updateNotificationCount();
    hideLoading();

    // badge may appear after fragments -> re-apply
    notificationService.updateBadge?.();
  } catch (err) {
    console.error('Error loading notifications:', err);
    showError();
  }
}

function displayNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  if (!Array.isArray(notifications) || notifications.length === 0) {
    showEmptyState();
    return;
  }

  const html = notifications.map(n => {
    const body = n?.body || '';
    return `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${!n.readAt ? 'border-l-4 border-l-blue-500' : ''} hover:shadow-md transition-shadow cursor-pointer"
           onclick="goToNotificationDetail(${n.id})">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-gray-900 ${!n.readAt ? 'text-blue-900' : ''}">${n.title || ''}</h3>
              ${!n.readAt ? '<span class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
            </div>
            <div class="text-gray-700 mb-3">
              <p class="notification-body-preview">${truncateText(body, 120)}</p>
              ${body.length > 120 ? '<span class="text-blue-600 text-sm font-medium hover:text-blue-800">Xem thêm...</span>' : ''}
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
                ${formatDate(n.createdAt)}
              </span>
              ${n.readAt ? `
                <span class="flex items-center gap-1 text-green-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Đã đọc
                </span>` : ''}
            </div>
          </div>
          ${!n.readAt ? `
            <button onclick="event.stopPropagation(); markAsRead(${n.id})" class="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Đánh dấu đã đọc
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function updateNotificationCount() {
  if (!hasEl('notification-count')) return;
  const unread = notifications.filter(n => !n.readAt).length;
  const total = notifications.length;
  document.getElementById('notification-count').textContent =
    `${total} thông báo${unread > 0 ? ` (${unread} chưa đọc)` : ''}`;
}

async function markAsRead(notificationId) {
  try {
    const success = await notificationService.markAsRead(notificationId);
    if (!success) { showErrorToast?.('Lỗi khi đánh dấu thông báo đã đọc', 3000); return; }
    notifications = notificationService.getAllNotifications();
    displayNotifications();
    updateNotificationCount();
  } catch (err) {
    console.error('Error marking notification as read:', err);
    showErrorToast?.('Lỗi khi đánh dấu thông báo đã đọc', 3000);
  }
}

async function markAllAsRead() {
  if (!onListPage()) return;
  const unread = notifications.filter(n => !n.readAt).length;
  if (unread === 0) { showErrorToast?.('Tất cả thông báo đã được đọc', 2000); return; }
  if (hasEl('mark-read-modal')) document.getElementById('mark-read-modal').classList.remove('hidden');
}

async function confirmMarkAllRead() {
  try {
    closeMarkReadModal();
    const success = await notificationService.markAllAsRead();
    if (!success) { showErrorToast?.('Lỗi khi đánh dấu tất cả thông báo đã đọc', 3000); return; }
    notifications = notificationService.getAllNotifications();
    displayNotifications();
    updateNotificationCount();
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    showErrorToast?.('Lỗi khi đánh dấu tất cả thông báo đã đọc', 3000);
  }
}

function closeMarkReadModal() {
  if (hasEl('mark-read-modal')) document.getElementById('mark-read-modal').classList.add('hidden');
}

function showLoading() {
  if (hasEl('loading')) document.getElementById('loading').classList.remove('hidden');
  if (hasEl('notifications-content')) document.getElementById('notifications-content').classList.add('hidden');
  if (hasEl('error-state')) document.getElementById('error-state').classList.add('hidden');
}

function hideLoading() {
  if (hasEl('loading')) document.getElementById('loading').classList.add('hidden');
  if (hasEl('notifications-content')) document.getElementById('notifications-content').classList.remove('hidden');
  if (hasEl('error-state')) document.getElementById('error-state').classList.add('hidden');
}

function showError() {
  if (hasEl('loading')) document.getElementById('loading').classList.add('hidden');
  if (hasEl('notifications-content')) document.getElementById('notifications-content').classList.add('hidden');
  if (hasEl('error-state')) document.getElementById('error-state').classList.remove('hidden');
}

function showEmptyState() {
  if (hasEl('notifications-list')) document.getElementById('notifications-list').innerHTML = '';
  if (hasEl('empty-state')) document.getElementById('empty-state').classList.remove('hidden');
}

function goToNotificationDetail(notificationId) {
  window.location.href = `notification-detail.html?id=${notificationId}`;
}

// ------------------------------- Init --------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Init service (badge + polling) trên mọi trang, không render list
  setTimeout(() => {
    if (typeof authService !== 'undefined') {
      notificationService.initialize();
    }
  }, 100);

  // Chỉ trang LIST mới render danh sách
  if (onListPage()) {
    const start = () => loadNotifications();
    if (typeof loadFragments === 'function') {
      loadFragments().then(start).catch(start);
    } else {
      start();
    }
  }
});

// Close modal when clicking outside (guard)
document.addEventListener('click', (event) => {
  const modal = document.getElementById('mark-read-modal');
  if (modal && event.target === modal) {
    closeMarkReadModal();
  }
});

// Expose some functions to global if bundler scopes them
window.markAsRead = window.markAsRead || markAsRead;
window.markAllAsRead = window.markAllAsRead || markAllAsRead;
window.confirmMarkAllRead = window.confirmMarkAllRead || confirmMarkAllRead;
window.closeMarkReadModal = window.closeMarkReadModal || closeMarkReadModal;
window.goToNotificationDetail = window.goToNotificationDetail || goToNotificationDetail;
