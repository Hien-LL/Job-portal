/**
 * Authentication Utility Functions
 * For JobPortal Frontend
 */

const AUTH_CONFIG = {
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token',
        USER_ID: 'user_id',
        USER_TYPE: 'user_type',
        LOGIN_TIME: 'login_time',
        LOGIN_EXPIRY: 'login_expiry'
    },
    // Duration (ms) for login_time: 12 hours
    LOGIN_DURATION_MS: 12 * 60 * 60 * 1000
};

class AuthService {
    constructor() {
        // ✅ SỬA: Không cần hardcode baseURL nữa, dùng từ API_CONFIG
        // this.baseURL sẽ được lấy từ API_CONFIG.BASE_URL khi cần
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

    // Get stored user type
    getUserType() {
        return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_TYPE);
    }

    // Get login time
    getLoginTime() {
        const v = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LOGIN_TIME);
        return v ? parseInt(v, 10) : null;
    }

    // Store authentication data
    storeAuthData(data, userType = 'candidate') {
        try {
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, data.token);
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_ID, data.user.id.toString());
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_TYPE, userType);
            // Store login time as current timestamp
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LOGIN_TIME, Date.now().toString());
            // Store login expiry timestamp (ms). Set to now + LOGIN_DURATION_MS (12 hours)
            const expiry = Date.now() + AUTH_CONFIG.LOGIN_DURATION_MS;
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LOGIN_EXPIRY, expiry.toString());
            
            console.log('Auth data stored successfully', { userType });
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
    // NOTE: This method will NOT store auth data automatically anymore.
    // Callers should verify returned roles and then call `storeAuthData` with the appropriate userType.
    async login(email, password, userType = 'candidate') {
        try {
            const loginUrl = buildApiUrl(API_CONFIG.AUTH.LOGIN);
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    email, 
                    password,
                    user_type: userType // still sent to backend
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Return raw data; caller will decide whether to store it after role checks
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            } else {
                return {
                    success: false,
                    message: data.error?.message || data.message || 'Đăng nhập thất bại'
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

    // Logout (optional API call) - ✅ ĐÃ SỬA
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                // ✅ SỬA: Dùng config
                const logoutUrl = buildApiUrl(API_CONFIG.AUTH.LOGOUT);
                await fetch(logoutUrl, {
                    method: 'GET', // Hoặc POST tùy API của bạn
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

    // Make authenticated API request - ✅ ĐÃ SỬA
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
            // ✅ SỬA: Dùng API_CONFIG.BASE_URL thay vì this.baseURL
            const url = endpoint.startsWith('http') 
                ? endpoint 
                : `${API_CONFIG.BASE_URL}${endpoint}`;
                
            const response = await fetch(url, finalOptions);
            
            // Handle unauthorized
            if (response.status === 401) {
                // Try to refresh token first
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry request with new token
                    const newToken = this.getToken();
                    finalOptions.headers['Authorization'] = `Bearer ${newToken}`;
                    return await fetch(url, finalOptions);
                } else {
                    this.clearAuthData();
                    window.location.href = 'login.html';
                    return null;
                }
            }

            return response;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Refresh token (if needed) - ✅ ĐÃ SỬA
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.clearAuthData();
            return false;
        }

        try {
            const refreshUrl = buildApiUrl(API_CONFIG.AUTH.REFRESH);
            const response = await fetch(refreshUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Update tokens and expiry
                localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, data.data.token);
                if (data.data.refreshToken) {
                    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
                }
                localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LOGIN_TIME, Date.now().toString());
                const expiry = Date.now() + AUTH_CONFIG.LOGIN_DURATION_MS;
                localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LOGIN_EXPIRY, expiry.toString());
                
                console.log('Token refreshed successfully');
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

    // Get user profile - ✅ ĐÃ SỬA
    async getUserProfile() {
        try {
            const profileUrl = buildApiUrl(API_CONFIG.USERS.GET_PROFILE_FULL);
            const response = await this.apiRequest(profileUrl);
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