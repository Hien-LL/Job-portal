// ==================== Recruiter Job Detail Service ====================
// Handles job detail display and editing for recruiters

let currentJob = null;
let currentCompanyId = null;
let allCategories = [];

// ==================== API Functions ====================

// Get job detail
async function getJobDetail(jobId) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.GET_MY_JOB, { jobId });
        console.log('Fetching job detail from:', url);

        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Get job detail response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || null
        };
    } catch (error) {
        console.error('Get Job Detail API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.',
            data: null
        };
    }
}

// Update job
async function updateJob(jobId, jobData) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.UPDATE_MY_JOB, { jobId });
        console.log('Updating job at:', url);
        console.log('Job data:', jobData);

        const response = await authService.apiRequest(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });

        if (!response || !response.ok) {
            const data = await response.json();
            return {
                success: false,
                message: data.message || 'Cập nhật thất bại'
            };
        }

        const data = await response.json();
        console.log('Update job response:', data);

        return {
            success: data.success,
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

// Delete job
async function deleteJob(jobId) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.DELETE_MY_JOB, { jobId });
        console.log('Deleting job:', url);

        const response = await authService.apiRequest(url, {
            method: 'DELETE'
        });

        if (!response || !response.ok) {
            const data = await response.json();
            return {
                success: false,
                message: data.message || 'Xóa thất bại'
            };
        }

        const data = await response.json();
        console.log('Delete job response:', data);

        return {
            success: data.success,
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

// Get categories
async function getCategories() {
    try {
        const url = buildApiUrl(API_CONFIG.CATEGORIES.LIST);
        const response = await authService.apiRequest(url, { method: 'GET' });

        if (!response || !response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Get Categories Error:', error);
        return [];
    }
}

// ==================== UI Functions ====================

// Display job detail
function displayJobDetail(job) {
    if (!job) return;

    currentJob = job;
    currentCompanyId = job.company?.id;

    // Title
    setTextContent('job-title', job.title || 'N/A');

    // Company
    setTextContent('job-company', job.company?.name || 'N/A');

    // Seniority
    setTextContent('job-seniority', job.seniority || 'N/A');

    // Location
    setTextContent('job-location', job.location?.displayName || 'N/A');

    // Status badge
    const statusBadge = document.getElementById('job-status');
    if (statusBadge) {
        if (job.published) {
            statusBadge.textContent = '✓ Đã xuất bản';
            statusBadge.className = 'px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border bg-green-100 text-green-700 border-green-300';
        } else {
            statusBadge.textContent = '📝 Nháp';
            statusBadge.className = 'px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border bg-yellow-100 text-yellow-700 border-yellow-300';
        }
    }

    // Salary
    const salaryDisplay = `${formatSalaryRange(job.salaryMin, job.salaryMax)} ${job.currency}`;
    setTextContent('job-salary-min', `${formatSalaryRange(job.salaryMin, job.salaryMin)} ${job.currency}`);
    setTextContent('job-salary-max', `${formatSalaryRange(job.salaryMax, job.salaryMax)} ${job.currency}`);

    // Employment type
    setTextContent('job-type', job.employmentType || 'N/A');

    // Remote
    setTextContent('job-remote', job.isRemote ? 'Có' : 'Không');

    // Description
    const descriptionHtml = parseMarkdown(job.description || '');
    setHTMLContent('job-description', descriptionHtml);

    // Expiry date
    const expiryDate = new Date(job.expiresAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    setTextContent('job-expires-at', expiryDate);

    // Category
    setTextContent('job-category-name', job.category?.name || 'N/A');

    // Hide loading, show content
    hideElement('loading-state');
    hideElement('error-state');
    showElement('job-content');
}

// Load job detail
async function loadJobDetail() {
    try {
        if (!authService.requireAuth()) {
            return;
        }

        showElement('loading-state');
        hideElement('error-state');
        hideElement('job-content');

        // Get job ID from URL
        const params = new URLSearchParams(window.location.search);
        const jobId = params.get('jobId');

        if (!jobId) {
            showElement('error-state');
            setTextContent('error-message', 'Không tìm thấy ID tin tuyển dụng');
            hideElement('loading-state');
            return;
        }

        const result = await getJobDetail(jobId);

        hideElement('loading-state');

        if (result.success && result.data) {
            displayJobDetail(result.data);
            // Load categories for edit modal
            allCategories = await getCategories();
            populateEditForm();
        } else {
            showElement('error-state');
            setTextContent('error-message', result.message || 'Không thể tải thông tin tin tuyển dụng');
            showErrorToast(result.message || 'Không thể tải thông tin tin tuyển dụng', 5000);
        }
    } catch (error) {
        console.error('Load job detail error:', error);
        hideElement('loading-state');
        showElement('error-state');
        setTextContent('error-message', 'Có lỗi xảy ra. Vui lòng thử lại.');
        showErrorToast('Có lỗi xảy ra. Vui lòng thử lại.', 5000);
    }
}

// Populate edit form
function populateEditForm() {
    if (!currentJob) return;

    setElementValue('job-id-input', currentJob.id);
    setElementValue('company-id-input', currentCompanyId);
    setElementValue('edit-title', currentJob.title);
    setElementValue('edit-description', currentJob.description);
    setElementValue('edit-salary-min', currentJob.salaryMin);
    setElementValue('edit-salary-max', currentJob.salaryMax);
    setElementValue('edit-seniority', currentJob.seniority);
    setElementValue('edit-employment-type', currentJob.employmentType);
    document.getElementById('edit-is-remote').checked = currentJob.isRemote;

    // Set expiry date - convert to datetime-local format
    if (currentJob.expiresAt) {
        const date = new Date(currentJob.expiresAt);
        const isoString = date.toISOString().slice(0, 16);
        setElementValue('edit-expires-at', isoString);
    }

    // Populate categories
    const categorySelect = document.getElementById('edit-category-id');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        allCategories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
        setElementValue('edit-category-id', currentJob.category?.id);
    }
}

// Open edit modal
function openEditModal() {
    if (!currentJob) return;
    openModal('edit-modal');
}

// Close edit modal
function closeEditModal() {
    closeModal('edit-modal');
}

// Handle edit form submit
async function handleEditSubmit(e) {
    e.preventDefault();

    if (!currentJob) return;

    const jobData = {
        title: getElementValue('edit-title'),
        description: getElementValue('edit-description'),
        salaryMin: parseInt(getElementValue('edit-salary-min')) || 0,
        salaryMax: parseInt(getElementValue('edit-salary-max')) || 0,
        seniority: getElementValue('edit-seniority'),
        employmentType: getElementValue('edit-employment-type'),
        categoryId: parseInt(getElementValue('edit-category-id')),
        isRemote: document.getElementById('edit-is-remote').checked,
        expiresAt: new Date(getElementValue('edit-expires-at')).toISOString()
    };

    // Validation
    if (!jobData.title.trim()) {
        showErrorToast('Vui lòng nhập tiêu đề', 3000);
        return;
    }

    if (!jobData.description.trim()) {
        showErrorToast('Vui lòng nhập mô tả', 3000);
        return;
    }

    if (jobData.salaryMin > jobData.salaryMax) {
        showErrorToast('Lương tối thiểu không được lớn hơn lương tối đa', 3000);
        return;
    }

    try {
        const submitBtn = document.querySelector('#edit-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Đang cập nhật...';
        }

        const result = await updateJob(currentJob.id, jobData);

        if (result.success) {
            showSuccessToast('Cập nhật tin tuyển dụng thành công!', 3000);
            closeEditModal();
            // Reload detail
            await loadJobDetail();
        } else {
            showErrorToast(result.message || 'Không thể cập nhật tin tuyển dụng', 3000);
        }
    } catch (error) {
        console.error('Submit error:', error);
        showErrorToast('Có lỗi xảy ra', 3000);
    } finally {
        const submitBtn = document.querySelector('#edit-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '✓ Cập nhật';
        }
    }
}

// Handle delete
async function handleDelete() {
    if (!currentJob) return;

    // Show confirmation
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa tin tuyển dụng "${currentJob.title}" không?`);
    if (!confirmed) return;

    try {
        const result = await deleteJob(currentJob.id);

        if (result.success) {
            showSuccessToast('Xóa tin tuyển dụng thành công!', 3000);
            setTimeout(() => {
                window.location.href = 'recruiter-jobs.html';
            }, 1500);
        } else {
            showErrorToast(result.message || 'Không thể xóa tin tuyển dụng', 3000);
        }
    } catch (error) {
        console.error('Delete error:', error);
        showErrorToast('Có lỗi xảy ra', 3000);
    }
}

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', function() {
    // Edit button
    const editBtn = document.getElementById('edit-job-btn');
    if (editBtn) {
        editBtn.addEventListener('click', openEditModal);
    }

    // Delete button
    const deleteBtn = document.getElementById('delete-job-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDelete);
    }

    // Edit form submit
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }

    // Close modal buttons
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    const editModal = document.getElementById('edit-modal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeEditModal);
    }

    // Close modal when clicking outside
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditModal();
            }
        });
    }

    // Load fragments then job detail
    loadFragments().then(() => {
        loadJobDetail();
    });
});
