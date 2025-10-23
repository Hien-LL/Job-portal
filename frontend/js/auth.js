/**
 * Authentication Utility Functions
 * For JobPortal Frontend
 */

const AUTH_CONFIG = {
    API_BASE_URL: 'http://localhost:8080/api',
    ENDPOINTS: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        PROFILE: '/user/profile'
    },
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token',
        USER_ID: 'user_id',
        LOGIN_TIME: 'login_time'
    }
};

class AuthService {
    constructor() {
        this.baseURL = AUTH_CONFIG.API_BASE_URL;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const userId = this.getUserId();
        return !!(token && userId);
    }

    // Get stored access token
    getToken() {
        return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    }

    // Get stored refresh token
    getRefreshToken() {
        return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    }

    // Get stored user ID
    getUserId() {
        return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_ID);
    }

    // Get login time
    getLoginTime() {
        return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LOGIN_TIME);
    }

    // Store authentication data
    storeAuthData(data) {
        try {
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, data.token);
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_ID, data.user.id.toString());
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LOGIN_TIME, new Date().toISOString());
            
            console.log('Auth data stored successfully');
            return true;
        } catch (error) {
            console.error('Error storing auth data:', error);
            return false;
        }
    }

    // Clear all auth data (logout)
    clearAuthData() {
        Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('Auth data cleared');
    }

    // Login API call
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}${AUTH_CONFIG.ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.storeAuthData(data.data);
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Đăng nhập thất bại'
                };
            }
        } catch (error) {
            console.error('Login API Error:', error);
            return {
                success: false,
                message: 'Lỗi kết nối. Vui lòng thử lại sau.'
            };
        }
    }

    // Logout (optional API call)
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                // Optional: Call logout API
                await fetch(`${this.baseURL}${AUTH_CONFIG.ENDPOINTS.LOGOUT}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout API Error:', error);
        } finally {
            this.clearAuthData();
        }
    }

    // Get authorization headers for API calls
    getAuthHeaders() {
        const token = this.getToken();
        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    }

    // Make authenticated API request
    async apiRequest(endpoint, options = {}) {
        const token = this.getToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
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
            const response = await fetch(`${this.baseURL}${endpoint}`, finalOptions);
            
            // Handle unauthorized
            if (response.status === 401) {
                this.clearAuthData();
                window.location.href = 'login.html';
                return null;
            }

            return response;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Refresh token (if needed)
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.clearAuthData();
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}${AUTH_CONFIG.ENDPOINTS.REFRESH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.storeAuthData(data.data);
                return true;
            } else {
                this.clearAuthData();
                return false;
            }
        } catch (error) {
            console.error('Refresh Token Error:', error);
            this.clearAuthData();
            return false;
        }
    }

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Get user profile
    async getUserProfile() {
        try {
            const response = await this.apiRequest(AUTH_CONFIG.ENDPOINTS.PROFILE);
            if (response && response.ok) {
                const data = await response.json();
                return data.success ? data.data : null;
            }
            return null;
        } catch (error) {
            console.error('Get Profile Error:', error);
            return null;
        }
    }
}

// Create global auth instance
const authService = new AuthService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService, authService, AUTH_CONFIG };
} else {
    window.authService = authService;
    window.AUTH_CONFIG = AUTH_CONFIG;
}