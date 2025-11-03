/**
 * Load HTML fragment and insert into target element
 * Usage: <div data-fragment="fragments/header.html"></div>
 * For header: <div data-fragment="fragments/header.html" data-header-type="auto"></div>
 * data-header-type can be: "auto" (detect from user_type), "candidate", "recruiter", or default "header.html"
 */


async function loadFragments() {
    const fragments = document.querySelectorAll('[data-fragment]');
    
    for (let fragment of fragments) {
        let path = fragment.getAttribute('data-fragment');
        
        // Handle header auto-detection
        if (path === 'fragments/header.html') {
            const headerType = fragment.getAttribute('data-header-type') || 'auto';
            
            if (headerType === 'auto') {
                // ✅ SỬA: Dùng authService thay vì localStorage trực tiếp
                const userType = authService.getUserType();
                if (userType === 'recruiter') {
                    path = 'fragments/header-recruiter.html';
                } else if (userType === 'candidate') {
                    path = 'fragments/header-candidate.html';
                }
                // If no user_type, use default header.html
            } else if (headerType === 'recruiter') {
                path = 'fragments/header-recruiter.html';
            } else if (headerType === 'candidate') {
                path = 'fragments/header-candidate.html';
            }
        }
        
        try {
            const response = await fetch(path);
            if (response.ok) {
                const html = await response.text();
                fragment.innerHTML = html;
            } else {
                console.error('Failed to load fragment: ' + path);
            }
        } catch (error) {
            console.error('Error loading fragment ' + path + ':', error);
        }
    }

    // After fragments are loaded, update auth status
    updateAuthUI();
}

// Update UI based on authentication status
function updateAuthUI() {
    // Check if auth elements exist (header is loaded)
    const loggedInMenu = document.getElementById('logged-in-menu');
    const notLoggedInMenu = document.getElementById('not-logged-in-menu');
    
    if (!loggedInMenu || !notLoggedInMenu) {
        // Header not loaded yet, try again after delay
        setTimeout(updateAuthUI, 100);
        return;
    }

    // ✅ SỬA: Dùng authService thay vì localStorage trực tiếp
    const isLoggedIn = authService.isAuthenticated();
    
    if (isLoggedIn) {
        // Show logged in menu
        loggedInMenu.classList.remove('hidden');
        loggedInMenu.classList.add('flex');
        notLoggedInMenu.classList.add('hidden');

        // Setup user menu
        setupUserMenu();
    } else {
        // Show not logged in menu
        notLoggedInMenu.classList.remove('hidden');
        loggedInMenu.classList.add('hidden');
    }
}

// Setup user menu functionality
function setupUserMenu() {
    const userMenuTrigger = document.getElementById('user-menu-trigger');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (userMenuTrigger && userDropdown) {
        // Remove existing event listeners by cloning elements
        const newUserMenuTrigger = userMenuTrigger.cloneNode(true);
        userMenuTrigger.parentNode.replaceChild(newUserMenuTrigger, userMenuTrigger);
        
        // Toggle dropdown
        newUserMenuTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!newUserMenuTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    // Logout functionality
    if (logoutBtn) {
        // Remove existing event listeners by cloning element
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        
        newLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // ✅ SỬA: Gọi authService.logout() thay vì function riêng
            logout();
        });
    }
}

// Logout function - ✅ SỬA: Đơn giản hóa, delegate sang authService
async function logout() {
    await authService.logout();
    console.log('User logged out');
    // Redirect to homepage
    window.location.href = 'index.html';
}

// Load fragments when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadFragments();
        startTokenExpirationCheck();
    });
} else {
    loadFragments();
    startTokenExpirationCheck();
}

// Mobile menu toggle
document.addEventListener('click', function(e) {
    if (e.target.closest('.mobile-menu-trigger')) {
        console.log('Mobile menu toggled');
    }
});

// Favorite toggle
document.addEventListener('click', function(e) {
    if (e.target.closest('.favorite-btn')) {
        const btn = e.target.closest('.favorite-btn');
        btn.classList.toggle('text-red-500');
    }
});

// Auth protection for protected pages - ✅ SỬA: Dùng authService
function requireAuth() {
    return authService.requireAuth();
}

// Start periodic token expiration check
let tokenCheckInterval;

function startTokenExpirationCheck() {
    // Check every 30 seconds
    tokenCheckInterval = setInterval(() => {
        // ✅ SỬA: Dùng authService
        if (authService.isAuthenticated()) {
            checkTokenExpiration();
        }
    }, 30000);
}

function stopTokenExpirationCheck() {
    if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
        tokenCheckInterval = null;
    }
}

// Check token expiration (12 hours)
function checkTokenExpiration() {
    const loginExpiry = localStorage.getItem('login_expiry');
    const accessToken = authService.getToken();
    
    if (!loginExpiry || !accessToken) {
        return;
    }
    
    const currentTime = Date.now();
    const expiryTime = parseInt(loginExpiry);
    
    // If current time has passed expiry time, token is expired
    if (currentTime > expiryTime) {
        // Token expired, clear auth data
        authService.clearAuthData();
        
        // Show expiration modal or redirect
        showTokenExpirationModal();
    }
}

// Show token expiration modal
function showTokenExpirationModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('token-expiration-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="token-expiration-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Phiên đăng nhập hết hạn</h3>
                <p class="text-gray-600 text-sm mb-4">Phiên làm việc của bạn đã hết hạn. Bạn có muốn tiếp tục sử dụng?</p>
                <div class="flex gap-3">
                    <button id="refresh-token-btn" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                        Tiếp tục
                    </button>
                    <button id="logout-modal-btn" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    document.getElementById('refresh-token-btn').addEventListener('click', handleRefreshToken);
    document.getElementById('logout-modal-btn').addEventListener('click', () => {
        document.getElementById('token-expiration-modal').remove();
        logout();
    });
}

// Handle refresh token - ✅ SỬA: Dùng authService
async function handleRefreshToken() {
    try {
        const refreshed = await authService.refreshToken();
        
        if (refreshed) {
            // Remove modal
            const modal = document.getElementById('token-expiration-modal');
            if (modal) {
                modal.remove();
            }
            
            console.log('Token refreshed successfully');
        } else {
            throw new Error('Refresh token expired');
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        
        // Remove modal and logout
        const modal = document.getElementById('token-expiration-modal');
        if (modal) {
            modal.remove();
        }
        
        if (typeof showErrorToast === 'function') {
            showErrorToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 3000);
        }
        logout();
    }
}

// Export functions for global use - ✅ SỬA: Sử dụng authService
window.authUtils = {
    logout,
    requireAuth,
    apiRequest: (endpoint, options) => authService.apiRequest(endpoint, options), // Delegate to authService
    updateAuthUI,
    checkTokenExpiration,
    handleRefreshToken,
    clearAuthData: () => authService.clearAuthData(), // Delegate to authService
    startTokenExpirationCheck,
    stopTokenExpirationCheck,
    isLoggedIn: () => authService.isAuthenticated() // Delegate to authService
};
