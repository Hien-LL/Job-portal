// ==================== Utility Functions ====================
// Centralized utility functions for DOM manipulation, notifications, forms, etc.

// ==================== DOM Helpers ====================

/**
 * Show element by ID
 * @param {string} id - Element ID
 */
function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.remove('hidden');
    }
}

// helper chung
function _el(target) {
  return typeof target === 'string' ? document.getElementById(target) : target;
}

/**
 * Hide element by ID
 * @param {string} id - Element ID
 */
function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * Toggle element visibility
 * @param {string} id - Element ID
 */
function toggleElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.toggle('hidden');
    }
}

/**
 * Show loading state
 * @param {string} id - Loading container element ID (default: 'loading-container')
 */
function showLoading(id = 'loading-container') {
    showElement(id);
}

/**
 * Hide loading state
 * @param {string} id - Loading container element ID (default: 'loading-container')
 */
function hideLoading(id = 'loading-container') {
    hideElement(id);
}


/**
 * Set text content of element
 * @param {string} id - Element ID
 * @param {string} text - Text content
 */
function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Set HTML content of element
 * @param {string} id - Element ID
 * @param {string} html - HTML content
 */
function setHTMLContent(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
    }
}

// ==================== Modal Helpers ====================

/**
 * Open modal by ID
 * @param {string} id - Modal ID
 */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close modal by ID
 * @param {string} id - Modal ID
 */
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// ==================== Form Helpers ====================

/**
 * Get value from input element
 * @param {string} id - Element ID
 * @returns {string} Input value
 */
function getElementValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

/**
 * Set value to input element
 * @param {string} id - Element ID
 * @param {string} value - Value to set
 */
function setElementValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value || '';
    }
}

/**
 * Clear form by ID
 * @param {string} formId - Form ID
 */
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// ==================== Notification Helpers ====================

/**
 * Show success toast notification
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showSuccessToast(message, duration = 3000) {
    showToast(message, 'success', duration);
}

/**
 * Show error toast notification
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showErrorToast(message, duration = 3000) {
    showToast(message, 'error', duration);
}

/**
 * Show info toast notification
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showInfoToast(message, duration = 3000) {
    showToast(message, 'info', duration);
}

/**
 * Generic toast notification function
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = `fixed top-4 right-4 z-[9999] px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${getToastColors(type)}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            ${icon}
            <p class="font-medium">${message}</p>
        </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);

    // Auto remove
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Get toast colors based on type
 * @param {string} type - Toast type
 * @returns {string} Tailwind classes
 */
function getToastColors(type) {
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-white'
    };
    return colors[type] || colors.info;
}

/**
 * Get toast icon based on type
 * @param {string} type - Toast type
 * @returns {string} SVG icon HTML
 */
function getToastIcon(type) {
    const icons = {
        success: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
        error: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
        info: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
        warning: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>`
    };
    return icons[type] || icons.info;
}

// ==================== URL Helpers ====================

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getUrlParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Update URL without page reload
 * @param {object} params - Parameters object
 */
function updateUrlParams(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', url);
}

// ==================== Date/Time Helpers ====================

/**
 * Format date to Vietnamese format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (DD/MM/YYYY)
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Format datetime to Vietnamese format
 * @param {string|Date} datetime - Datetime to format
 * @returns {string} Formatted datetime (DD/MM/YYYY HH:mm)
 */
function formatDateTime(datetime) {
    if (!datetime) return '';
    const d = new Date(datetime);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to calculate
 * @returns {string} Relative time string
 */
function getRelativeTime(date) {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDate(date);
}

// ==================== Number Helpers ====================

/**
 * Format number to Vietnamese currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    if (!num && num !== 0) return '';
    return new Intl.NumberFormat('vi-VN').format(num);
}

// ==================== Validation Helpers ====================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
    const re = /^(0|\+84)[0-9]{9,10}$/;
    return re.test(phone);
}

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @returns {boolean} True if not empty
 */
function isRequired(value) {
    return value !== null && value !== undefined && value.trim() !== '';
}

// ==================== Storage Helpers ====================

/**
 * Save to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * Get from localStorage
 * @param {string} key - Storage key
 * @returns {any} Stored value
 */
function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

/**
 * Remove from localStorage
 * @param {string} key - Storage key
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

// ==================== File Helpers ====================

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== String Helpers ====================

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncateString(str, maxLength) {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// helper chung
function _el(target) {
  return typeof target === 'string' ? document.getElementById(target) : target;
}

/**
 * Show element by ID or Element
 */
function showElement(target) {
  const element = _el(target);
  if (element) {
    element.classList.remove('hidden');
    // nếu trước đó có inline display:none thì bỏ luôn
    if (element.style.display === 'none') element.style.display = '';
  }
}

/**
 * Hide element by ID or Element
 */
function hideElement(target) {
  const element = _el(target);
  if (element) {
    element.classList.add('hidden');
    // optional: chặn layout nhấp nháy
    element.style.display = 'none';
  }
}

/**
 * Toggle element visibility by ID or Element
 */
function toggleElement(target) {
  const element = _el(target);
  if (element) {
    element.classList.toggle('hidden');
    if (element.style.display === 'none') element.style.display = '';
    else if (!element.classList.contains('hidden')) element.style.display = 'none';
  }
}


// ==================== Export ====================
// Make utilities available globally
if (typeof window !== 'undefined') {
    window.utils = {
        showElement,
        hideElement,
        toggleElement,
        showLoading,
        hideLoading,
        setTextContent,
        setHTMLContent,
        openModal,
        closeModal,
        getElementValue,
        setElementValue,
        clearForm,
        showSuccessToast,
        showErrorToast,
        showInfoToast,
        showToast,
        getUrlParameter,
        updateUrlParams,
        formatDate,
        formatDateTime,
        getRelativeTime,
        formatCurrency,
        formatNumber,
        isValidEmail,
        isValidPhone,
        isRequired,
        saveToStorage,
        getFromStorage,
        removeFromStorage,
        formatFileSize,
        truncateString,
        capitalizeFirst
    };
}

