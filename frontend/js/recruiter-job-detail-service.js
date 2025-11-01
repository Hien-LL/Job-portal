// ==================== Recruiter Job Detail Service ====================
// Handles job detail view and editing for recruiter

// ==================== Global Variables ====================
let currentJob = null;
let currentCompanyId = null;
let currentJobId = null;
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

// ==================== UI Functions ====================

/**
 * Show error message
 */
function showError(message) {
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    
    if (errorState && errorMessage) {
        errorMessage.textContent = message;
        errorState.classList.remove('hidden');
    }

    setTimeout(() => {
        if (errorState) errorState.classList.add('hidden');
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg z-50 font-bold flex items-center gap-2';
    successDiv.innerHTML = `<span>✓</span> <span>${message}</span>`;
    
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

/**
 * Format salary - Delegated to markdown-service.js
 * Local implementation for single salary values
 */
function formatSalary(salary) {
    if (!salary) return 'Không xác định';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(salary);
}

/**
 * Format date - Delegated to markdown-service.js
 * Use formatDateDisplay from markdown-service
 */
const formatDate = formatDateDisplay;

/**
 * Populate categories dropdown
 */
function populateCategoriesDropdown() {
    const selectEl = document.getElementById('edit-category-id');
    if (!selectEl || allCategories.length === 0) return;

    // Clear existing options (keep the first placeholder)
    const placeholder = selectEl.querySelector('option[value=""]');
    selectEl.innerHTML = '';
    
    if (placeholder) {
        selectEl.appendChild(placeholder);
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- Chọn danh mục --';
        selectEl.appendChild(option);
    }

    // Add categories
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name || category.title || '';
        selectEl.appendChild(option);
    });
}

/**
 * Render job detail
 */
function renderJobDetail(job) {
    if (!job) return;

    currentJob = job;

    // Set values
    const titleEl = document.getElementById('job-title');
    const companyEl = document.getElementById('job-company');
    const seniorityEl = document.getElementById('job-seniority');
    const locationEl = document.getElementById('job-location');
    const statusEl = document.getElementById('job-status');
    const salaryMinEl = document.getElementById('job-salary-min');
    const salaryMaxEl = document.getElementById('job-salary-max');
    const typeEl = document.getElementById('job-type');
    const remoteEl = document.getElementById('job-remote');
    const descEl = document.getElementById('job-description');
    const expiresEl = document.getElementById('job-expires-at');
    const categoryEl = document.getElementById('job-category-name');

    if (titleEl) titleEl.textContent = job.title || '';
    if (companyEl) companyEl.textContent = job.company?.name || '';
    if (seniorityEl) seniorityEl.textContent = job.seniority || '';
    if (locationEl) locationEl.textContent = job.location?.displayName || '';
    
    // Status badge
    if (statusEl) {
        const statusClass = job.published ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700' : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700';
        const statusIcon = job.published ? '✓ Đã đăng' : '⏳ Nháp';
        statusEl.className = `px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border ${statusClass}`;
        statusEl.textContent = statusIcon;
    }

    if (salaryMinEl) salaryMinEl.textContent = formatSalary(job.salaryMin || 0);
    if (salaryMaxEl) salaryMaxEl.textContent = formatSalary(job.salaryMax || 0);
    if (typeEl) typeEl.textContent = job.employmentType || '';
    if (remoteEl) remoteEl.textContent = job.isRemote ? 'Có' : 'Không';
    if (descEl) descEl.innerHTML = (job.description || '').replace(/\n/g, '<br>');
    if (expiresEl) expiresEl.textContent = formatDate(job.expiresAt);
    if (categoryEl) categoryEl.textContent = job.category?.name || '';
}

/**
 * Load job detail
 */
async function loadJobDetail() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showError('Vui lòng đăng nhập để xem chi tiết tin tuyển dụng');
            window.location.href = 'login.html';
            return;
        }

        // Get company ID and job ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const companyId = urlParams.get('company-id');
        const jobId = urlParams.get('job-id');

        if (!companyId || !jobId) {
            showError('Không tìm thấy thông tin tin tuyển dụng');
            return;
        }

        currentCompanyId = companyId;
        currentJobId = jobId;

        // Set hidden inputs
        const companyIdInput = document.getElementById('company-id-input');
        const jobIdInput = document.getElementById('job-id-input');
        if (companyIdInput) companyIdInput.value = companyId;
        if (jobIdInput) jobIdInput.value = jobId;

        // Show loading
        const loadingState = document.getElementById('loading-state');
        if (loadingState) loadingState.classList.remove('hidden');

        // Fetch job detail
        const jobResult = await getJobDetail(companyId, jobId, token);

        if (loadingState) loadingState.classList.add('hidden');

        if (jobResult.success && jobResult.data) {
            currentJob = jobResult.data;
            renderJobDetail(jobResult.data);
            document.getElementById('job-content').classList.remove('hidden');
        } else {
            showError('Không thể tải thông tin tin tuyển dụng');
        }
    } catch (error) {
        console.error('Load job detail error:', error);
        const loadingState = document.getElementById('loading-state');
        if (loadingState) loadingState.classList.add('hidden');
        showError('Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

/**
 * Open edit modal
 */
function openEditModal() {
    if (!currentJob) return;

    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.remove('hidden');

    // Populate categories dropdown
    populateCategoriesDropdown();

    // Populate form
    document.getElementById('edit-title').value = currentJob.title || '';
    document.getElementById('edit-description').value = currentJob.description || '';
    document.getElementById('edit-salary-min').value = currentJob.salaryMin || '';
    document.getElementById('edit-salary-max').value = currentJob.salaryMax || '';
    document.getElementById('edit-seniority').value = currentJob.seniority || '';
    document.getElementById('edit-employment-type').value = currentJob.employmentType || '';
    document.getElementById('edit-is-remote').checked = currentJob.isRemote || false;
    
    // Set category ID if element exists
    const editCategoryId = document.getElementById('edit-category-id');
    if (editCategoryId && currentJob.categoryId) {
        editCategoryId.value = currentJob.categoryId;
    }
    
    // Format datetime for input
    if (currentJob.expiresAt) {
        const date = new Date(currentJob.expiresAt);
        const localDatetime = date.toISOString().slice(0, 16);
        document.getElementById('edit-expires-at').value = localDatetime;
    }
}

/**
 * Close edit modal
 */
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.add('hidden');
}

/**
 * Handle edit form submission
 */
async function handleEditFormSubmit(e) {
    e.preventDefault();

    try {
        const token = localStorage.getItem('access_token');

        const jobData = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            salaryMin: parseInt(document.getElementById('edit-salary-min').value),
            salaryMax: parseInt(document.getElementById('edit-salary-max').value),
            seniority: document.getElementById('edit-seniority').value,
            employmentType: document.getElementById('edit-employment-type').value,
            isRemote: document.getElementById('edit-is-remote').checked,
            categoryId: parseInt(document.getElementById('edit-category-id').value),
            expiresAt: document.getElementById('edit-expires-at').value + ':00',
        };

        console.log('Updating job with data:', jobData);

        const result = await updateJob(currentCompanyId, currentJobId, jobData, token);

        if (result.success) {
            showSuccess('Cập nhật tin tuyển dụng thành công');
            closeEditModal();
            await loadJobDetail();
        } else {
            showError(result.message || 'Không thể cập nhật tin tuyển dụng');
        }
    } catch (error) {
        console.error('Edit form error:', error);
        showError('Có lỗi xảy ra khi cập nhật');
    }
}

/**
 * Handle delete job
 */
async function handleDeleteJob() {
    if (!confirm('Bạn có chắc muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác.')) {
        return;
    }

    try {
        const token = localStorage.getItem('access_token');
        const result = await deleteJob(currentCompanyId, currentJobId, token);

        if (result.success) {
            showSuccess('Xóa tin tuyển dụng thành công');
            setTimeout(() => {
                window.location.href = `recruiter-company-detail.html?id=${currentCompanyId}`;
            }, 1500);
        } else {
            showError(result.message || 'Không thể xóa tin tuyển dụng');
        }
    } catch (error) {
        console.error('Delete job error:', error);
        showError('Có lỗi xảy ra khi xóa');
    }
}

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', async function() {
    // Load categories first
    const categoriesResult = await getCategories();
    if (categoriesResult.success) {
        console.log('Categories loaded:', allCategories);
    }

    // Edit button
    const editJobBtn = document.getElementById('edit-job-btn');
    if (editJobBtn) editJobBtn.addEventListener('click', openEditModal);

    // Modal close buttons
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeEditModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeEditModal);

    // Close modal when clicking outside
    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditModal();
            }
        });
    }

    // Edit form submission
    const editForm = document.getElementById('edit-form');
    if (editForm) editForm.addEventListener('submit', handleEditFormSubmit);

    // Delete button
    const deleteJobBtn = document.getElementById('delete-job-btn');
    if (deleteJobBtn) deleteJobBtn.addEventListener('click', handleDeleteJob);

    // Load job detail
    loadJobDetail();
});
