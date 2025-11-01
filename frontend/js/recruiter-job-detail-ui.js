// ==================== Recruiter Job Detail - UI Service ====================
// Handles all UI rendering and data display for job detail
// Depends on: recruiter-job-detail-api.js, common-helpers.js

// ==================== Global Variables ====================
let currentJob = null;
let currentCompanyId = null;
let currentJobId = null;

// ==================== UI Functions ====================

/**
 * Show error message (alias to common-helpers)
 */
function showError(message) {
    showErrorNotification(message, 5000);
}

/**
 * Show success message (alias to common-helpers)
 */
function showSuccess(message) {
    showSuccessToast(message, 3000);
}

/**
 * Format salary - Local implementation for single salary values
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
        const token = getStoredToken();
        if (!token) {
            showError('Vui lòng đăng nhập để xem chi tiết tin tuyển dụng');
            redirectToUrl('login.html');
            return;
        }

        // Get company ID and job ID from URL
        const companyId = getUrlParameter('company-id');
        const jobId = getUrlParameter('job-id');

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
        showElement(loadingState);

        // Fetch job detail
        const jobResult = await getJobDetail(companyId, jobId, token);

        hideElement(loadingState);

        if (jobResult.success && jobResult.data) {
            currentJob = jobResult.data;
            renderJobDetail(jobResult.data);
            showElement(document.getElementById('job-content'));
        } else {
            showError('Không thể tải thông tin tin tuyển dụng');
        }
    } catch (error) {
        console.error('Load job detail error:', error);
        const loadingState = document.getElementById('loading-state');
        hideElement(loadingState);
        showError('Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

/**
 * Open edit modal
 */
function openEditModalInternal() {
    if (!currentJob) return;

    openModal('edit-modal');

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
function closeJobEditModal() {
    closeModal('edit-modal');
}

/**
 * Handle edit form submission
 */
async function handleEditFormSubmitInternal(e) {
    e.preventDefault();

    try {
        const token = getStoredToken();

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
            closeJobEditModal();
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
async function handleDeleteJobInternal() {
    if (!confirm('Bạn có chắc muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác.')) {
        return;
    }

    try {
        const token = getStoredToken();
        const result = await deleteJob(currentCompanyId, currentJobId, token);

        if (result.success) {
            showSuccess('Xóa tin tuyển dụng thành công');
            redirectToUrl(`recruiter-company-detail.html?id=${currentCompanyId}`, 1500);
        } else {
            showError(result.message || 'Không thể xóa tin tuyển dụng');
        }
    } catch (error) {
        console.error('Delete job error:', error);
        showError('Có lỗi xảy ra khi xóa');
    }
}
