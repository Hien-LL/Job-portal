// ==================== Common Helpers - Shared Utilities ====================
// Centralized utilities for error handling, notifications, localStorage, and validation
// Used across all service files to reduce duplication

// ==================== Error Handling ====================

/**
 * Show error notification with auto-hide
 * @param {string} message - Error message to display
 * @param {number} duration - Duration in ms before auto-hide (default: 5000ms)
 */
function showErrorNotification(message, duration = 5000) {
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    
    if (errorState && errorMessage) {
        errorMessage.textContent = message;
        errorState.classList.remove('hidden');
    }

    if (duration > 0) {
        setTimeout(() => {
            if (errorState) errorState.classList.add('hidden');
        }, duration);
    }
}

/**
 * Show error notification as toast (floating element)
 * @param {string} message - Error message to display
 * @param {number} duration - Duration in ms before auto-remove (default: 5000ms)
 */
function showErrorToast(message, duration = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-2 pointer-events-auto';
    errorDiv.style.zIndex = '99999';
    errorDiv.innerHTML = `<span>✕</span> <span>${message}</span>`;
    
    document.body.appendChild(errorDiv);

    if (duration > 0) {
        setTimeout(() => {
            errorDiv.remove();
        }, duration);
    }
}

/**
 * Show success notification as toast
 * @param {string} message - Success message to display
 * @param {number} duration - Duration in ms before auto-remove (default: 3000ms)
 */
function showSuccessToast(message, duration = 3000) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-2 pointer-events-auto';
    successDiv.style.zIndex = '99999';
    successDiv.innerHTML = `<span>✓</span> <span>${message}</span>`;
    
    document.body.appendChild(successDiv);

    if (duration > 0) {
        setTimeout(() => {
            successDiv.remove();
        }, duration);
    }
}

/**
 * Show success notification in fixed element
 * @param {string} message - Success message to display
 * @param {number} duration - Duration in ms before auto-hide (default: 3000ms)
 */
function showSuccessNotification(message, duration = 3000) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-2 pointer-events-auto';
    successDiv.style.zIndex = '99999';
    successDiv.innerHTML = `<span>✓</span> <span>${message}</span>`;
    
    document.body.appendChild(successDiv);

    if (duration > 0) {
        setTimeout(() => {
            successDiv.remove();
        }, duration);
    }
}

// ==================== API Response Handling ====================

/**
 * Handle API error response with consistent format
 * @param {string} context - Context for error (e.g., "Fetch job detail")
 * @param {Error} error - Error object
 * @returns {Object} Standard error response
 */
function handleApiError(context, error) {
    console.error(`${context} API Error:`, error);
    return {
        success: false,
        message: `Lỗi ${context}. Vui lòng thử lại sau.`,
        data: null
    };
}

/**
 * Create standard API response format
 * @param {boolean} success - Success status
 * @param {any} data - Response data
 * @param {string} message - Response message
 * @returns {Object} Standard response object
 */
function createApiResponse(success, data = null, message = '') {
    return {
        success,
        data,
        message
    };
}

/**
 * Check if API response is successful
 * @param {Object} response - API response object
 * @returns {boolean} Whether response indicates success
 */
function isApiResponseSuccess(response) {
    return response && response.success === true;
}

// ==================== localStorage Helpers ====================

/**
 * Get token from localStorage
 * @returns {string|null} Access token or null if not found
 */
function getStoredToken() {
    return localStorage.getItem('access_token');
}

/**
 * Save token to localStorage
 * @param {string} token - Access token to save
 */
function saveToken(token) {
    if (token) {
        localStorage.setItem('access_token', token);
    }
}

/**
 * Clear token from localStorage
 */
function clearToken() {
    localStorage.removeItem('access_token');
}

/**
 * Get a value from sessionStorage
 * @param {string} key - Storage key
 * @returns {any} Stored value or null
 */
function getSessionValue(key) {
    const value = sessionStorage.getItem(key);
    try {
        return value ? JSON.parse(value) : null;
    } catch {
        return value;
    }
}

/**
 * Save a value to sessionStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
function saveSessionValue(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        sessionStorage.setItem(key, String(value));
    }
}

/**
 * Clear a value from sessionStorage
 * @param {string} key - Storage key
 */
function clearSessionValue(key) {
    sessionStorage.removeItem(key);
}

/**
 * Check if user is authenticated
 * @returns {boolean} Whether user has valid token
 */
function isAuthenticated() {
    return !!getStoredToken();
}

/**
 * Redirect to login if not authenticated
 */
function redirectToLoginIfNotAuthenticated() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// ==================== Form & Validation ====================

/**
 * Get form data as object
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Form data as key-value pairs
 */
function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

/**
 * Reset form to initial state
 * @param {HTMLFormElement} form - Form element
 */
function resetForm(form) {
    if (form) {
        form.reset();
    }
}

/**
 * Validate required fields in form
 * @param {Array<string>} fieldIds - Array of field IDs to validate
 * @returns {boolean} Whether all fields are filled
 */
function validateRequiredFields(fieldIds) {
    for (let fieldId of fieldIds) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            return false;
        }
    }
    return true;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format (Vietnamese)
 * @param {string} phone - Phone to validate
 * @returns {boolean} Whether phone is valid
 */
function isValidPhoneVN(phone) {
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ==================== DOM Helpers ====================

/**
 * Show element by removing hidden class and inline display style
 * @param {HTMLElement|string} element - Element or element ID to show
 */
function showElement(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.remove('hidden');
        // Also remove inline display:none style if present
        if (el.style.display === 'none') {
            el.style.display = '';
        }
    }
}

/**
 * Hide element by adding hidden class and setting inline display style
 * @param {HTMLElement|string} element - Element or element ID to hide
 */
function hideElement(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.add('hidden');
        el.style.display = 'none';
    }
}

/**
 * Toggle element visibility
 * @param {HTMLElement|string} element - Element or element ID to toggle
 */
function toggleElement(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.toggle('hidden');
        if (el.style.display === 'none') {
            el.style.display = '';
        } else if (!el.classList.contains('hidden')) {
            el.style.display = 'none';
        }
    }
}

/**
 * Set element text content safely
 * @param {string} elementId - Element ID
 * @param {string} text - Text to set
 */
function setTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Set element HTML safely
 * @param {string} elementId - Element ID
 * @param {string} html - HTML to set
 */
function setHtmlContent(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Get element value
 * @param {string} elementId - Element ID
 * @returns {string} Element value
 */
function getElementValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value : '';
}

/**
 * Set element value
 * @param {string} elementId - Element ID
 * @param {string|number} value - Value to set
 */
function setElementValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value;
    }
}

// ==================== Modal Helpers ====================

/**
 * Open modal by ID
 * @param {string} modalId - Modal element ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

/**
 * Close modal by ID
 * @param {string} modalId - Modal element ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Setup modal background close behavior
 * @param {string} modalId - Modal element ID
 * @param {Function} onClose - Callback when closing
 */
function setupModalBackgroundClose(modalId, onClose) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(modalId);
                if (onClose) onClose();
            }
        });
    }
}

// ==================== URL & Navigation ====================

/**
 * Get URL parameter value
 * @param {string} paramName - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getUrlParameter(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

/**
 * Redirect to URL
 * @param {string} url - URL to redirect to
 * @param {number} delay - Delay in ms before redirect (default: 0)
 */
function redirectToUrl(url, delay = 0) {
    if (delay > 0) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    } else {
        window.location.href = url;
    }
}

/**
 * Reload current page
 */
function reloadPage() {
    window.location.reload();
}

// ==================== Utility Helpers ====================

/**
 * Debounce function to prevent rapid calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format date to DD/MM/YYYY HH:MM
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
function formatDateShort(dateString) {
    try {
        const date = new Date(dateString);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${hh}:${mins}`;
    } catch {
        return dateString;
    }
}

/**
 * Parse datetime-local input to ISO string with seconds
 * @param {string} datetimeLocal - Datetime-local input value
 * @returns {string} ISO datetime string with :00 seconds
 */
function parseLocalDatetimeToISO(datetimeLocal) {
    return datetimeLocal ? datetimeLocal + ':00' : '';
}

/**
 * Convert ISO datetime to local datetime format
 * @param {string} isoDatetime - ISO datetime string
 * @returns {string} Datetime-local format (YYYY-MM-DDTHH:MM)
 */
function convertIsoToLocalDatetime(isoDatetime) {
    try {
        const date = new Date(isoDatetime);
        return date.toISOString().slice(0, 16);
    } catch {
        return isoDatetime;
    }
}

/**
 * Check if value is empty/null/undefined
 * @param {any} value - Value to check
 * @returns {boolean} Whether value is empty
 */
function isEmpty(value) {
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Whether copy was successful
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateUniqueId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Show success notification banner
 * @param {string} message - Success message to display
 * @param {number} duration - Duration in ms before auto-hide (default: 5000ms)
 */
function showSuccessNotificationBanner(message, duration = 5000) {
    const notificationEl = document.getElementById('success-notification');
    const messageEl = document.getElementById('success-message');
    
    if (notificationEl && messageEl) {
        messageEl.textContent = message;
        notificationEl.classList.remove('hidden');
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                notificationEl.classList.add('hidden');
            }, duration);
        }
    }
}

/**
 * Hide success notification banner
 */
function hideSuccessNotification() {
    const notificationEl = document.getElementById('success-notification');
    if (notificationEl) {
        notificationEl.classList.add('hidden');
    }
}

/**
 * Show confirmation modal
 * @param {string} modalId - Modal element ID
 * @param {Function} onConfirm - Callback when confirmed
 */
function showConfirmationModal(modalId, onConfirm) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        const confirmBtn = modal.querySelector('.confirm-btn');
        if (confirmBtn) {
            const handler = () => {
                onConfirm();
                modal.classList.add('hidden');
                confirmBtn.removeEventListener('click', handler);
            };
            confirmBtn.addEventListener('click', handler);
        }
    }
}
