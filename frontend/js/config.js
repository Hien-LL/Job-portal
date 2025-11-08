// ==================== API Configuration ====================
// Centralized API endpoint configuration for Job Portal
// All API calls should go through this config

const API_CONFIG = {
    // Base URL for all API requests
    BASE_URL: 'http://localhost:8080/api',
    FILE_BASE_URL: 'http://localhost:8080',

    // Authentication Endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        VERIFY_EMAIL: '/auth/verify-email',      // ✅ THÊM MỚI
        RESEND_OTP: '/auth/resend-otp',          // ✅ THÊM MỚI
    },
    
    // User Endpoints
    USERS: {
        GET_PROFILE: '/users/me',
        GET_PROFILE_FULL: '/users/profile/me',
        UPDATE_PROFILE: '/users/profile/me',
        UPLOAD_AVATAR: '/users/avatar',
        GET_SKILLS: '/users/skills',
        ADD_SKILL: '/users/skills/:skillSlug',
        DELETE_SKILL: '/users/skills/:skillSlug',
        UPDATE_SKILL_YEARS: '/users/skills/:skillSlug',
        PROFILE_DETAIL: '/public/users/{id}',
        SKILLS: '/public/skills/{userId}',
    },
    
    // Jobs Endpoints
    JOBS: {
        LIST: '/jobs',
        GET_DETAIL: '/jobs/:jobSlug',
        GET_BY_COMPANY: '/companies/jobs/:companyId',
        CHECK_APPLIED: '/applications/isApplied/:jobId',
        APPLY: '/applications/:jobId/apply',
        GET_RELATED: '/jobs?category.slug=:categorySlug&perPage=3&published=true',
        CREATE_MY_COMPANY: '/jobs/my-company/create',
        GET_MY_JOBS: '/jobs/my-company/jobs',
        GET_MY_JOB: '/jobs/my-company/job/:jobId',
        UPDATE_MY_JOB: '/jobs/my-company/job/:jobId',
        DELETE_MY_JOB: '/jobs/my-company/job/:jobId',
        SAVE: '/saved-jobs/:jobSlug/save',
        UNSAVE: '/saved-jobs/:jobSlug/unsave',
        CHECK_SAVED: '/saved-jobs/:jobSlug/is-saved',
        SAVED_JOBS_LIST: '/saved-jobs/saved-jobs/list',  
    },
    
    // Resume/CV Endpoints
    RESUMES: {
        LIST: '/resumes',
        GET_DETAIL: '/resumes/:resumeId',
        UPLOAD: '/resumes/:resumeId/upload',
        DELETE_FILE: '/resumes/files/:fileId',  // ✅ THÊM MỚI
        DEFAULT: '/public/resumes/{userId}',
    },
    
    // Applications Endpoints
    APPLICATIONS: {
        LIST: '/applications/my-applications',
        GET_DETAIL: '/applications/candidate-info/:applicationId',
        GET_CANDIDATE_INFO: '/applications/candidate-info/:applicationId',
        GET_TIMELINE: '/applications/:applicationId/timeline',
        UPDATE_STATUS: '/applications/:applicationId/change-status',
        GET_MY_APPLICATIONS: '/applications/my-company/applications',
        GET_STATUSES: '/application-statuses',
    },
    
    // Companies Endpoints
    COMPANIES: {
        LIST: '/companies/list',
        GET_DETAIL: '/companies/:slug',
        GET_DETAIL_BY_ID: '/companies/detail/:companyId',
        CREATE: '/companies',
        MY_COMPANY_DETAILS: '/companies/my-company/details',
        UPDATE_MY_COMPANY: '/companies/my-company/details',
        UPLOAD_LOGO: '/companies/my-company/upload-logo',
        UPLOAD_BACKGROUND: '/companies/my-company/upload-background',
    },
    
    // Follow/Unfollow Companies Endpoints
    FOLLOW_COMPANY: {
        LIST_FOLLOWED: '/follow-company/followed-companies',
        FOLLOW: '/follow-company/:companyId/follow',
        UNFOLLOW: '/follow-company/:companyId/unfollow',
        CHECK_STATUS: '/follow-company/:companyId/is-following',
    },
    
    // Skills Endpoints
    SKILLS: {
        LIST: '/skills/list',
    },
    
    // Locations Endpoints
    LOCATIONS: {
        LIST: '/locations/list',
    },
    
    // Benefits Endpoints
    BENEFITS: {
        LIST: '/benefits/list',
    },
    
    // Categories Endpoints
    CATEGORIES: {
        LIST: '/categories',
    },
    
    // Notifications Endpoints
    NOTIFICATIONS: {
        LIST: '/notifications',
        GET_DETAIL: '/notifications/:notificationId',
        MARK_READ: '/notifications/:notificationId/read',
        MARK_ALL_READ: '/notifications/mark-all-read',
    },
    
    // Password Reset Endpoints
    PASSWORD: {
        SEND_OTP: '/password/otp/send',
        RESET: '/password/reset',
    },
};

// ==================== Utility Functions ====================

/**
 * Build full API URL with path parameters
 * @param {string} path - API path from config
 * @param {object} params - Path parameters (e.g., { id: 123 })
 * @returns {string} Full API URL
 */
function buildApiUrl(path, params = {}) {
    let url = path;
    
    // Replace all :paramName with actual values
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });
    
    return `${API_CONFIG.BASE_URL}${url}`;
}

/**
 * Build query parameters from object
 * @param {object} params - Query parameters
 * @returns {string} Query string
 */
function buildQueryString(params = {}) {
    const query = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            query.append(key, params[key]);
        }
    });
    
    return query.toString();
}

/**
 * Build complete URL with query parameters
 * @param {string} path - API path
 * @param {object} pathParams - Path parameters
 * @param {object} queryParams - Query parameters
 * @returns {string} Complete URL
 */
function buildCompleteUrl(path, pathParams = {}, queryParams = {}) {
    let url = buildApiUrl(path, pathParams);
    const queryString = buildQueryString(queryParams);
    
    if (queryString) {
        url += `?${queryString}`;
    }
    
    return url;
}

// ==================== Export ====================
// Make config available globally
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.buildApiUrl = buildApiUrl;
    window.buildQueryString = buildQueryString;
    window.buildCompleteUrl = buildCompleteUrl;
}

// ❌ XÓA DÒNG NÀY - Đã deprecated, dùng API_CONFIG.FILE_BASE_URL
// window.APP_CONFIG = {
//   API_BASE: "http://localhost:8080"
// };

