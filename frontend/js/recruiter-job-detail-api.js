// ==================== Recruiter Job Detail - API Service ====================
// Handles all backend API communication for job detail operations
// Provides: getCategories, getJobDetail, updateJob, deleteJob

// ==================== Global Variables ====================
let allCategories = [];

// ==================== API Functions ====================

/**
 * Get categories list
 */
async function getCategories() {
    try {
        const url = buildApiUrl(API_CONFIG.CATEGORIES.LIST);
        console.log('Fetching categories from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Get categories response:', data);

        if (response.ok && data.success) {
            const categories = data.data || [];
            allCategories = Array.isArray(categories) ? categories : [];
            return {
                success: true,
                data: allCategories
            };
        }

        return {
            success: false,
            data: []
        };
    } catch (error) {
        console.error('Get Categories API Error:', error);
        return {
            success: false,
            data: []
        };
    }
}

/**
 * Get job detail
 */
async function getJobDetail(companyId, jobId, token) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.GET_MY_JOB, { companyId, jobId });
        console.log('Fetching job detail from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Get job detail response:', data);

        if (response.ok && data.success) {
            return {
                success: true,
                data: data.data || {}
            };
        }

        return {
            success: false,
            data: {}
        };
    } catch (error) {
        console.error('Get Job Detail API Error:', error);
        return {
            success: false,
            data: {}
        };
    }
}

/**
 * Update job
 */
async function updateJob(companyId, jobId, jobData, token) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.UPDATE_MY_JOB, { companyId, jobId });
        console.log('Updating job at:', url);
        console.log('Job data:', jobData);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobData)
        });

        const data = await response.json();
        console.log('Update job response:', data);

        return {
            success: response.ok && data.success,
            message: data.message,
            data: data.data
        };
    } catch (error) {
        console.error('Update Job API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.'
        };
    }
}

/**
 * Delete job
 */
async function deleteJob(companyId, jobId, token) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.DELETE_MY_COMPANY, { companyId, jobId });
        console.log('Deleting job at:', url);

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Delete job response:', data);

        return {
            success: response.ok && data.success,
            message: data.message
        };
    } catch (error) {
        console.error('Delete Job API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.'
        };
    }
}
