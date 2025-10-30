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

            const token = authService.getToken();
            const response = await fetch('http://localhost:8080/api/notifications', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
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
            const token = authService.getToken();
            const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
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
            const token = authService.getToken();
            const response = await fetch('http://localhost:8080/api/notifications/mark-all-read', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
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

            const token = authService.getToken();
            const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
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