// Notification Service for Job Portal
class NotificationService {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
    }

    // Load notifications from API
    async loadNotifications() {
        try {
            if (!authService.isAuthenticated()) {
                return false;
            }

            const url = buildApiUrl(API_CONFIG.NOTIFICATIONS.LIST);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const result = await response.json();
            if (result.success && result.data) {
                this.notifications = result.data;
                this.updateUnreadCount();
                this.updateBadge();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error loading notifications:', error);
            return false;
        }
    }

    // Update unread count
    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.readAt).length;
    }

    // Update notification badge in header
    updateBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            const url = buildApiUrl(API_CONFIG.NOTIFICATIONS.MARK_READ, { notificationId });
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update local notification state
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification && !notification.readAt) {
                    notification.readAt = new Date().toISOString();
                    this.updateUnreadCount();
                    this.updateBadge();
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        try {
            const url = buildApiUrl(API_CONFIG.NOTIFICATIONS.MARK_ALL_READ);
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update all notifications as read
                this.notifications.forEach(notification => {
                    if (!notification.readAt) {
                        notification.readAt = new Date().toISOString();
                    }
                });
                this.updateUnreadCount();
                this.updateBadge();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    // Get unread notifications
    getUnreadNotifications() {
        return this.notifications.filter(n => !n.readAt);
    }

    // Get all notifications
    getAllNotifications() {
        return this.notifications;
    }

    // Get single notification detail
    async getNotificationDetail(notificationId) {
        try {
            if (!authService.isAuthenticated()) {
                return null;
            }

            const url = buildApiUrl(API_CONFIG.NOTIFICATIONS.GET_DETAIL, { notificationId });
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notification detail');
            }

            const result = await response.json();
            if (result.success && result.data) {
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error loading notification detail:', error);
            return null;
        }
    }

    // Initialize notification service (call this on page load)
    async initialize() {
        if (authService.isAuthenticated()) {
            await this.loadNotifications();
            
            // Auto-refresh every 30 seconds
            setInterval(() => {
                this.loadNotifications();
            }, 30000);
        }
    }
}

// Create global instance
const notificationService = new NotificationService();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth service to be loaded
    setTimeout(() => {
        if (typeof authService !== 'undefined') {
            notificationService.initialize();
        }
    }, 100);
});

let notifications = [];

// Load notifications from API
async function loadNotifications() {
    try {
        showLoading();
        
        // Check authentication
        if (!authService.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Use notification service
        const success = await notificationService.loadNotifications();
        if (success) {
            notifications = notificationService.getAllNotifications();
            displayNotifications();
            updateNotificationCount();
            hideLoading();
        } else {
            showError();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showError();
    }
}

// Display notifications
function displayNotifications() {
    const container = document.getElementById('notifications-list');
    
    if (!notifications || notifications.length === 0) {
        showEmptyState();
        return;
    }

    const html = notifications.map(notification => `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${!notification.readAt ? 'border-l-4 border-l-blue-500' : ''} hover:shadow-md transition-shadow cursor-pointer" onclick="goToNotificationDetail(${notification.id})">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <h3 class="font-semibold text-gray-900 ${!notification.readAt ? 'text-blue-900' : ''}">${notification.title}</h3>
                        ${!notification.readAt ? '<span class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
                    </div>
                    <div class="text-gray-700 mb-3">
                        <p class="notification-body-preview">${truncateText(notification.body, 120)}</p>
                        ${notification.body.length > 120 ? '<span class="text-blue-600 text-sm font-medium hover:text-blue-800">Xem thêm...</span>' : ''}
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                            </svg>
                            ${formatDate(notification.createdAt)}
                        </span>
                        ${notification.readAt ? `
                            <span class="flex items-center gap-1 text-green-600">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                Đã đọc
                            </span>
                        ` : ''}
                    </div>
                </div>
                ${!notification.readAt ? `
                    <button onclick="event.stopPropagation(); markAsRead(${notification.id})" class="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Đánh dấu đã đọc
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Không xác định';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Update notification count
function updateNotificationCount() {
    const unreadCount = notifications.filter(n => !n.readAt).length;
    const totalCount = notifications.length;
    
    document.getElementById('notification-count').textContent = 
        `${totalCount} thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`;
}

// Mark single notification as read
async function markAsRead(notificationId) {
    try {
        const success = await notificationService.markAsRead(notificationId);
        if (success) {
            // Update local display
            notifications = notificationService.getAllNotifications();
            displayNotifications();
            updateNotificationCount();
        } else {
            alert('Lỗi khi đánh dấu thông báo đã đọc');
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        alert('Lỗi khi đánh dấu thông báo đã đọc');
    }
}

// Mark all notifications as read
async function markAllAsRead() {
    const unreadCount = notifications.filter(n => !n.readAt).length;
    if (unreadCount === 0) {
        alert('Tất cả thông báo đã được đọc');
        return;
    }
    
    document.getElementById('mark-read-modal').classList.remove('hidden');
}

// Confirm mark all as read
async function confirmMarkAllRead() {
    try {
        closeMarkReadModal();
        
        const success = await notificationService.markAllAsRead();
        if (success) {
            // Update local display
            notifications = notificationService.getAllNotifications();
            displayNotifications();
            updateNotificationCount();
        } else {
            alert('Lỗi khi đánh dấu tất cả thông báo đã đọc');
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        alert('Lỗi khi đánh dấu tất cả thông báo đã đọc');
    }
}

// Close mark as read modal
function closeMarkReadModal() {
    document.getElementById('mark-read-modal').classList.add('hidden');
}

// UI helper functions
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('notifications-content').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('notifications-content').classList.remove('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

function showError() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('notifications-content').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
}

function showEmptyState() {
    document.getElementById('notifications-list').innerHTML = '';
    document.getElementById('empty-state').classList.remove('hidden');
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadFragments().then(() => {
        loadNotifications();
    });
});

// Truncate text function
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// Go to notification detail page
function goToNotificationDetail(notificationId) {
    window.location.href = `notification-detail.html?id=${notificationId}`;
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('mark-read-modal');
    if (event.target === modal) {
        closeMarkReadModal();
    }
});
