// ==================== Recruiter Company Detail - API Service ====================
// Handles all API calls for job management within company
// Exported functions: getCategories, getCompanyDetail, getCompanyJobs, createJob, deleteJob

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
 * Get company details - Get from recruiter's own companies list
 */
async function getCompanyDetail(companyId, token) {
    try {
        // Use my-companies endpoint to get recruiter's company
        const url = buildApiUrl(API_CONFIG.COMPANIES.MY_COMPANIES_LIST);
        console.log('Fetching recruiter companies from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Get companies response:', data);

        if (response.ok && data.success && data.data && Array.isArray(data.data)) {
            // Find company by ID
            const company = data.data.find(c => c.id == companyId);
            return {
                success: !!company,
                data: company || {}
            };
        }

        return {
            success: false,
            data: {}
        };
    } catch (error) {
        console.error('Get Company Detail API Error:', error);
        return {
            success: false,
            data: {}
        };
    }
}

/**
 * Get jobs for a company
 */
async function getCompanyJobs(companyId, token) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.GET_BY_COMPANY, { companyId });
        console.log('Fetching jobs from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Get jobs response:', data);
        console.log('Response status:', response.status, 'Success:', response.ok && data.success);

        if (response.ok && data.success) {
            const jobs = data.data?.content || data.data || [];
            console.log('Extracted jobs:', jobs);
            return {
                success: true,
                data: Array.isArray(jobs) ? jobs : []
            };
        }

        return {
            success: false,
            data: []
        };
    } catch (error) {
        console.error('Get Jobs API Error:', error);
        return {
            success: false,
            data: []
        };
    }
}

/**
 * Create new job
 */
async function createJob(companyId, jobData, token) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.CREATE_MY_COMPANY, { companyId });
        console.log('Creating job at:', url);
        console.log('Job data:', jobData);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobData)
        });

        const data = await response.json();
        console.log('Create job response:', data);

        return {
            success: response.ok && data.success,
            message: data.message,
            data: data.data
        };
    } catch (error) {
        console.error('Create Job API Error:', error);
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
