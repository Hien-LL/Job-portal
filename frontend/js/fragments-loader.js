/**
 * Load HTML fragment and insert into target element
 * Usage: <div data-fragment="fragments/header.html"></div>
 */
async function loadFragments() {
    const fragments = document.querySelectorAll('[data-fragment]');
    
    for (let fragment of fragments) {
        const path = fragment.getAttribute('data-fragment');
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

    // Check token expiration first
    checkTokenExpiration();

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('access_token') && localStorage.getItem('user_id');
    
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
        // Toggle dropdown
        userMenuTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Logout function
async function logout() {
    try {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Call logout API
            await fetch('http://localhost:8080/api/auth/logout', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout API error:', error);
    }
    
    // Clear all auth data regardless of API response
    clearAuthData();
    
    console.log('User logged out');
    
    // Redirect to homepage
    window.location.href = 'index.html';
}

// Clear authentication data
function clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('login_time');
}

// Check token expiration (5 minutes = 300000ms)
function checkTokenExpiration() {
    const loginTime = localStorage.getItem('login_time');
    const accessToken = localStorage.getItem('access_token');
    
    if (!loginTime || !accessToken) {
        return;
    }
    
    const currentTime = Date.now();
    const tokenAge = currentTime - parseInt(loginTime);
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // If token is older than 5 minutes, show expiration modal
    if (tokenAge >= fiveMinutes) {
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

// Handle refresh token
async function handleRefreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
        logout();
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken: refreshToken
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.data) {
                // Update tokens
                localStorage.setItem('access_token', result.data.accessToken);
                if (result.data.refreshToken) {
                    localStorage.setItem('refresh_token', result.data.refreshToken);
                }
                localStorage.setItem('login_time', Date.now().toString());
                
                // Remove modal
                const modal = document.getElementById('token-expiration-modal');
                if (modal) {
                    modal.remove();
                }
                
                console.log('Token refreshed successfully');
            } else {
                throw new Error('Invalid refresh response');
            }
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
        
        alert('Không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại.');
        logout();
    }
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

// Auth protection for protected pages
function requireAuth() {
    const isLoggedIn = localStorage.getItem('access_token') && localStorage.getItem('user_id');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// API helper function
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`http://localhost:8080/api${endpoint}`, finalOptions);
        
        // Handle unauthorized - token might be expired
        if (response.status === 401) {
            const refreshToken = localStorage.getItem('refresh_token');
            
            // Try to refresh token first
            if (refreshToken) {
                try {
                    const refreshResponse = await fetch('http://localhost:8080/api/auth/refresh', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            refreshToken: refreshToken
                        })
                    });
                    
                    if (refreshResponse.ok) {
                        const refreshResult = await refreshResponse.json();
                        
                        if (refreshResult.success && refreshResult.data) {
                            // Update tokens
                            localStorage.setItem('access_token', refreshResult.data.accessToken);
                            if (refreshResult.data.refreshToken) {
                                localStorage.setItem('refresh_token', refreshResult.data.refreshToken);
                            }
                            localStorage.setItem('login_time', Date.now().toString());
                            
                            // Retry original request with new token
                            finalOptions.headers['Authorization'] = `Bearer ${refreshResult.data.accessToken}`;
                            return await fetch(`http://localhost:8080/api${endpoint}`, finalOptions);
                        }
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                }
            }
            
            // If refresh failed or no refresh token, logout
            logout();
            return null;
        }

        return response;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Start periodic token expiration check
let tokenCheckInterval;

function startTokenExpirationCheck() {
    // Check every 30 seconds
    tokenCheckInterval = setInterval(() => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
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

// Export functions for global use
window.authUtils = {
    logout,
    requireAuth,
    apiRequest,
    updateAuthUI,
    checkTokenExpiration,
    handleRefreshToken,
    clearAuthData,
    startTokenExpirationCheck,
    stopTokenExpirationCheck,
    isLoggedIn: () => !!(localStorage.getItem('access_token') && localStorage.getItem('user_id'))
};
