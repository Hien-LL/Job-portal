let currentNotification = null;
let notificationId = null;

// Get notification ID from URL parameters
function getNotificationIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load notification detail from API
async function loadNotification() {
    try {
        showLoading();
        
        // Check authentication
        if (!authService.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Get notification ID from URL
        notificationId = getNotificationIdFromUrl();
        if (!notificationId) {
            showError();
            return;
        }

        // Use recruiter notification service
        const notification = await recruiterNotificationService.getNotificationDetail(notificationId);
        if (notification) {
            currentNotification = notification;
            displayNotification();
            
            // Auto mark as read if not already read
            if (!currentNotification.readAt) {
                setTimeout(() => {
                    markAsRead();
                }, 2000); // Mark as read after 2 seconds of viewing
            }
            
            hideLoading();
        } else {
            showError('Thông báo không tồn tại hoặc đã bị xóa');
        }
    } catch (error) {
        console.error('Error loading notification:', error);
        showError();
    }
}

// Display notification details
function displayNotification() {
    if (!currentNotification) return;

    // Update title
    document.getElementById('notification-title').textContent = currentNotification.title;
    
    // Update body
    document.getElementById('notification-body').innerHTML = formatNotificationBody(currentNotification.body);
    
    // Update created date
    document.getElementById('created-at').textContent = formatFullDate(currentNotification.createdAt);
    
    // Update notification ID
    document.getElementById('notification-id').textContent = currentNotification.id;
    
    // Update read status
    if (currentNotification.readAt) {
        document.getElementById('read-status').classList.remove('hidden');
        document.getElementById('unread-status').classList.add('hidden');
        document.getElementById('mark-read-btn').classList.add('hidden');
        document.getElementById('read-at-info').classList.remove('hidden');
        document.getElementById('read-at').textContent = `Đã đọc lúc ${formatFullDate(currentNotification.readAt)}`;
    } else {
        document.getElementById('read-status').classList.add('hidden');
        document.getElementById('unread-status').classList.remove('hidden');
        document.getElementById('mark-read-btn').classList.remove('hidden');
        document.getElementById('read-at-info').classList.add('hidden');
    }
}

// Format notification body with better formatting
function formatNotificationBody(body) {
    if (!body) return 'Không có nội dung';
    
    // Convert line breaks to HTML
    return body.replace(/\n/g, '<br>').replace(/\r/g, '');
}

// Format full date
function formatFullDate(dateString) {
    if (!dateString) return 'Không xác định';
    
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Mark notification as read
async function markAsRead() {
    if (!currentNotification || currentNotification.readAt) return;

    try {
        const success = await recruiterNotificationService.markAsRead(currentNotification.id);
        if (success) {
            // Update current notification
            currentNotification.readAt = new Date().toISOString();
            displayNotification();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// UI helper functions
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('notification-content').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('notification-content').classList.remove('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

function showError(message = null) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('notification-content').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
    
    if (message) {
        document.querySelector('#error-state p').textContent = message;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // ensure fragments available
    if (typeof loadFragments === 'function') {
        loadFragments().then(() => loadNotification()).catch(() => loadNotification());
    } else {
        loadNotification();
    }
});