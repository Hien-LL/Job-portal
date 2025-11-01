// ==================== Recruiter Company Detail Service ====================
// Handles job management for recruiter's company (CRUD operations)

// ==================== Global Variables ====================
let currentCompanyId = null;
let allJobs = [];
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

// ==================== UI Functions ====================

/**
 * Populate categories dropdown
 */
function populateCategoriesDropdown() {
    const selectEl = document.getElementById('job-category-id');
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
 * Show error message
 */
function showError(message) {
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');

    setTimeout(() => {
        errorState.classList.add('hidden');
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 font-medium';
    successDiv.innerHTML = `<span>${message}</span>`;
    
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

/**
 * Format salary
 */
function formatSalary(salary) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(salary);
}

/**
 * Render job card
 */
function renderJobCard(job) {
    const statusClass = job.published ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700' : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700';
    const statusIcon = job.published ? '✓ Đã đăng' : '⏳ Nháp';
    
    return `
        <div class="job-card bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300">
            <!-- Status Badge -->
            <div class="h-1 bg-gradient-to-r ${job.published ? 'from-green-400 to-green-500' : 'from-yellow-400 to-yellow-500'}"></div>

            <div class="p-6">
                <!-- Job Header -->
                <div class="flex items-start justify-between gap-3 mb-4">
                    <h3 class="text-lg font-bold text-gray-900 flex-1 line-clamp-2">${job.title}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${statusClass}">
                        ${statusIcon}
                    </span>
                </div>

                <!-- Job Description -->
                <p class="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">${job.description}</p>

                <!-- Job Info Grid -->
                <div class="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2 text-gray-600">
                            <span class="text-base">💰</span>
                            <span>Lương</span>
                        </div>
                        <span class="text-gray-900 font-bold">${formatSalary(job.salaryMin)} - ${formatSalary(job.salaryMax)}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2 text-gray-600">
                            <span class="text-base">📍</span>
                            <span>Địa điểm</span>
                        </div>
                        <span class="text-gray-900 font-semibold">${job.location?.displayName || 'Không xác định'}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2 text-gray-600">
                            <span class="text-base">🎯</span>
                            <span>Cấp độ</span>
                        </div>
                        <span class="text-gray-900 font-semibold">${job.seniority}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2 text-gray-600">
                            <span class="text-base">📋</span>
                            <span>Loại</span>
                        </div>
                        <span class="text-gray-900 font-semibold">${job.employmentType}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2 text-gray-600">
                            <span class="text-base">🌐</span>
                            <span>Remote</span>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${job.isRemote ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}">
                            ${job.isRemote ? 'Có' : 'Không'}
                        </span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <a href="recruiter-job-detail.html?company-id=${currentCompanyId}&job-id=${job.id}" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2">
                        <span>👁</span> Xem
                    </a>
                    <button class="flex-1 delete-job-btn bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2" data-job-id="${job.id}">
                        <span>🗑</span> Xóa
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Load company detail and jobs
 */
async function loadCompanyDetailAndJobs() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showError('Vui lòng đăng nhập để xem chi tiết công ty');
            window.location.href = 'login.html';
            return;
        }

        // Get company ID from URL or sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        let companyId = urlParams.get('id') || sessionStorage.getItem('selectedCompanyId');
        
        if (!companyId) {
            showError('Không tìm thấy ID công ty');
            return;
        }

        currentCompanyId = companyId;
        
        // Set company id input safely
        const companyIdInput = document.getElementById('company-id-input');
        if (companyIdInput) {
            companyIdInput.value = companyId;
        }

        // Show loading
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.classList.remove('hidden');
        }

        // Load company detail
        const companyResult = await getCompanyDetail(companyId, token);
        if (companyResult.success && companyResult.data && companyResult.data.id) {
            const company = companyResult.data;
            renderCompanyHeader(company);
        } else {
            console.warn('Company detail not found or error:', companyResult);
        }

        // Load jobs
        const jobsResult = await getCompanyJobs(companyId, token);

        if (loadingState) {
            loadingState.classList.add('hidden');
        }

        if (jobsResult.success) {
            allJobs = jobsResult.data || [];
            const jobsContainer = document.getElementById('jobs-container');
            const emptyState = document.getElementById('empty-state');
            
            if (jobsContainer && emptyState) {
                if (allJobs.length > 0) {
                    jobsContainer.innerHTML = allJobs.map(job => renderJobCard(job)).join('');
                    emptyState.classList.add('hidden');
                    attachJobEventListeners();
                } else {
                    jobsContainer.innerHTML = '';
                    emptyState.classList.remove('hidden');
                }
            }
        } else {
            showError('Không thể tải danh sách tin tuyển dụng');
        }
    } catch (error) {
        console.error('Load company detail error:', error);
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.classList.add('hidden');
        }
        showError('Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

/**
 * Render company header
 */
function renderCompanyHeader(company) {
    if (!company) return;

    const nameEl = document.getElementById('company-name');
    const descEl = document.getElementById('company-description');
    const sizeEl = document.getElementById('company-size');
    const followersEl = document.getElementById('company-followers');
    const websiteLink = document.getElementById('company-website');
    
    if (nameEl) nameEl.textContent = company.name || '';
    if (descEl) descEl.textContent = company.description || '';
    
    if (websiteLink && company.website) {
        const website = company.website;
        websiteLink.href = website.startsWith('http') ? website : `https://${website}`;
        websiteLink.textContent = website;
    }

    if (sizeEl) sizeEl.textContent = `${company.size_min || 0} - ${company.size_max || 0} nhân viên`;
    if (followersEl) followersEl.textContent = `${company.followerCount || 0} người theo dõi`;

    // Load logo
    if (company.logoUrl) {
        const logoImg = document.getElementById('company-logo');
        const logoPlaceholder = document.getElementById('company-logo-placeholder');
        if (logoImg && logoPlaceholder) {
            logoImg.src = `${window.APP_CONFIG.API_BASE}${company.logoUrl}`;
            logoImg.classList.remove('hidden');
            logoPlaceholder.classList.add('hidden');
        }
    }
}

/**
 * Attach event listeners to job cards
 */
function attachJobEventListeners() {
    document.querySelectorAll('.delete-job-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const jobId = this.dataset.jobId;
            if (confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) {
                await handleDeleteJob(jobId);
            }
        });
    });
}

/**
 * Handle delete job
 */
async function handleDeleteJob(jobId) {
    try {
        const token = localStorage.getItem('access_token');
        const result = await deleteJob(currentCompanyId, jobId, token);

        if (result.success) {
            showSuccess('Xóa tin tuyển dụng thành công');
            // Reload jobs
            await loadCompanyDetailAndJobs();
        } else {
            showError(result.message || 'Không thể xóa tin tuyển dụng');
        }
    } catch (error) {
        console.error('Delete job error:', error);
        showError('Có lỗi xảy ra khi xóa');
    }
}

/**
 * Insert text at cursor position
 */
function insertTextAtCursor(textarea, beforeText, afterText = '') {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + beforeText + selectedText + afterText + text.substring(end);
    textarea.value = newText;
    
    // Move cursor
    const newCursorPos = start + beforeText.length + selectedText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    // Trigger input event for preview update
    textarea.dispatchEvent(new Event('input'));
}

/**
 * Open job modal
 */
function openJobModal() {
    const jobModal = document.getElementById('job-modal');
    const modalTitle = document.getElementById('modal-title');
    const jobForm = document.getElementById('job-form');
    const writePanel = document.getElementById('write-panel');
    const previewPanel = document.getElementById('preview-panel');
    const tabWrite = document.getElementById('tab-write');
    const tabPreview = document.getElementById('tab-preview');
    
    if (jobModal) jobModal.classList.remove('hidden');
    if (modalTitle) modalTitle.textContent = 'Tạo tin tuyển dụng';
    if (jobForm) jobForm.reset();
    
    // Reset to Write tab
    if (writePanel && previewPanel && tabWrite && tabPreview) {
        writePanel.classList.remove('hidden');
        previewPanel.classList.add('hidden');
        tabWrite.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        tabWrite.classList.remove('text-gray-600', 'border-transparent');
        tabPreview.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        tabPreview.classList.add('text-gray-600', 'border-transparent');
    }
    
    // Reset markdown preview
    const preview = document.getElementById('markdown-preview');
    if (preview) {
        preview.innerHTML = '<p class="text-gray-400 text-sm italic">Mô tả sẽ hiển thị ở đây...</p>';
    }
    
    // Populate categories dropdown
    populateCategoriesDropdown();
}

/**
 * Close job modal
 */
function closeJobModal() {
    const jobModal = document.getElementById('job-modal');
    const jobForm = document.getElementById('job-form');
    
    if (jobModal) jobModal.classList.add('hidden');
    if (jobForm) jobForm.reset();
}

/**
 * Handle job form submission
 */
async function handleJobFormSubmit(e) {
    e.preventDefault();

    try {
        const token = localStorage.getItem('access_token');
        
        // Get form data
        const jobData = {
            title: document.getElementById('job-title').value,
            description: document.getElementById('job-description').value,
            salaryMin: parseInt(document.getElementById('job-salary-min').value),
            salaryMax: parseInt(document.getElementById('job-salary-max').value),
            seniority: document.getElementById('job-seniority').value,
            employmentType: document.getElementById('job-employment-type').value,
            isRemote: document.getElementById('job-is-remote').checked,
            categoryId: parseInt(document.getElementById('job-category-id').value),
            locationCountryCode: document.getElementById('job-location').value,
            expiresAt: document.getElementById('job-expires-at').value + ':00',
            currency: 'VND',
            benefitIds: [],
            skillIds: []
        };

        console.log('Creating job with data:', jobData);

        const result = await createJob(currentCompanyId, jobData, token);

        if (result.success) {
            showSuccess('Tạo tin tuyển dụng thành công');
            closeJobModal();
            await loadCompanyDetailAndJobs();
        } else {
            showError(result.message || 'Không thể tạo tin tuyển dụng');
        }
    } catch (error) {
        console.error('Submit job form error:', error);
        showError('Có lỗi xảy ra khi tạo tin tuyển dụng');
    }
}

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', async function() {
    // Load categories first
    const categoriesResult = await getCategories();
    if (categoriesResult.success) {
        console.log('Categories loaded:', allCategories);
    }

    // Create job button
    const createJobBtn = document.getElementById('create-job-btn');
    const emptyCreateJobBtn = document.getElementById('empty-create-job-btn');
    const closeJobModalBtn = document.getElementById('close-job-modal');
    const cancelJobModalBtn = document.getElementById('cancel-job-modal');
    const jobModal = document.getElementById('job-modal');
    const jobForm = document.getElementById('job-form');
    const jobDescriptionInput = document.getElementById('job-description');
    
    // Tab switching
    const tabWrite = document.getElementById('tab-write');
    const tabPreview = document.getElementById('tab-preview');
    const writePanel = document.getElementById('write-panel');
    const previewPanel = document.getElementById('preview-panel');

    // Formatting buttons
    const btnBold = document.getElementById('btn-bold');
    const btnItalic = document.getElementById('btn-italic');
    const btnUnderline = document.getElementById('btn-underline');
    const btnCode = document.getElementById('btn-code');
    const btnHeading = document.getElementById('btn-heading');
    const btnListUl = document.getElementById('btn-list-ul');
    const btnListOl = document.getElementById('btn-list-ol');
    const btnQuote = document.getElementById('btn-quote');
    const btnLink = document.getElementById('btn-link');
    const btnHr = document.getElementById('btn-hr');

    if (createJobBtn) createJobBtn.addEventListener('click', openJobModal);
    if (emptyCreateJobBtn) emptyCreateJobBtn.addEventListener('click', openJobModal);

    // Close modal
    if (closeJobModalBtn) closeJobModalBtn.addEventListener('click', closeJobModal);
    if (cancelJobModalBtn) cancelJobModalBtn.addEventListener('click', closeJobModal);

    // Close modal when clicking outside
    if (jobModal) {
        jobModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeJobModal();
            }
        });
    }

    // Formatting button events
    if (btnBold) {
        btnBold.addEventListener('click', (e) => {
            e.preventDefault();
            insertTextAtCursor(jobDescriptionInput, '**', '**');
        });
    }

    if (btnItalic) {
        btnItalic.addEventListener('click', (e) => {
            e.preventDefault();
            insertTextAtCursor(jobDescriptionInput, '_', '_');
        });
    }

    if (btnUnderline) {
        btnUnderline.addEventListener('click', (e) => {
            e.preventDefault();
            insertTextAtCursor(jobDescriptionInput, '~~', '~~');
        });
    }

    if (btnCode) {
        btnCode.addEventListener('click', (e) => {
            e.preventDefault();
            insertTextAtCursor(jobDescriptionInput, '`', '`');
        });
    }

    if (btnHeading) {
        btnHeading.addEventListener('click', (e) => {
            e.preventDefault();
            const start = jobDescriptionInput.selectionStart;
            const lineStart = jobDescriptionInput.value.lastIndexOf('\n', start - 1) + 1;
            jobDescriptionInput.setSelectionRange(lineStart, lineStart);
            insertTextAtCursor(jobDescriptionInput, '## ', '\n');
        });
    }

    if (btnListUl) {
        btnListUl.addEventListener('click', (e) => {
            e.preventDefault();
            insertTextAtCursor(jobDescriptionInput, '- ', '\n');
        });
    }

    if (btnListOl) {
        btnListOl.addEventListener('click', (e) => {
            e.preventDefault();
            insertTextAtCursor(jobDescriptionInput, '1. ', '\n');
        });
    }

    if (btnQuote) {
        btnQuote.addEventListener('click', (e) => {
            e.preventDefault();
            insertTextAtCursor(jobDescriptionInput, '> ', '\n');
        });
    }

    if (btnLink) {
        btnLink.addEventListener('click', (e) => {
            e.preventDefault();
            insertTextAtCursor(jobDescriptionInput, '[text](https://example.com)', '');
        });
    }

    if (btnHr) {
        btnHr.addEventListener('click', (e) => {
            e.preventDefault();
            insertTextAtCursor(jobDescriptionInput, '\n---\n', '');
        });
    }

    // Tab Write
    if (tabWrite) {
        tabWrite.addEventListener('click', function(e) {
            e.preventDefault();
            writePanel.classList.remove('hidden');
            previewPanel.classList.add('hidden');
            tabWrite.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
            tabWrite.classList.remove('text-gray-600', 'border-transparent');
            tabPreview.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
            tabPreview.classList.add('text-gray-600', 'border-transparent');
        });
    }

    // Tab Preview
    if (tabPreview) {
        tabPreview.addEventListener('click', function(e) {
            e.preventDefault();
            const text = jobDescriptionInput.value.trim();
            const preview = document.getElementById('markdown-preview');
            
            if (text.length > 0) {
                preview.innerHTML = parseMarkdown(text);
            } else {
                preview.innerHTML = '<p class="text-gray-400 text-sm italic">Nhập mô tả công việc để xem preview...</p>';
            }
            
            previewPanel.classList.remove('hidden');
            writePanel.classList.add('hidden');
            tabPreview.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
            tabPreview.classList.remove('text-gray-600', 'border-transparent');
            tabWrite.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
            tabWrite.classList.add('text-gray-600', 'border-transparent');
        });
    }

    // Markdown preview listener (realtime on write tab)
    if (jobDescriptionInput) {
        jobDescriptionInput.addEventListener('input', function() {
            // Only update if we're on preview tab
            if (!previewPanel.classList.contains('hidden')) {
                const preview = document.getElementById('markdown-preview');
                if (preview) {
                    const text = this.value.trim();
                    if (text.length > 0) {
                        preview.innerHTML = parseMarkdown(text);
                    } else {
                        preview.innerHTML = '<p class="text-gray-400 text-sm italic">Nhập mô tả công việc để xem preview...</p>';
                    }
                }
            }
        });
    }

    // Job form submission
    if (jobForm) jobForm.addEventListener('submit', handleJobFormSubmit);

    // Load company detail and jobs
    loadCompanyDetailAndJobs();
});
