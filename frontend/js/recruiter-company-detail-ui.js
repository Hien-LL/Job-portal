// ==================== Recruiter Company Detail - UI Service ====================
// Handles all UI rendering and data display for job management
// Depends on: recruiter-company-detail-api.js, common-helpers.js

// ==================== Global Variables ====================
let currentCompanyId = null;
let allJobs = [];

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
        const token = getStoredToken();
        if (!token) {
            showError('Vui lòng đăng nhập để xem chi tiết công ty');
            redirectToUrl('login.html');
            return;
        }

        // Get company ID from URL or sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        let companyId = urlParams.get('id') || getSessionValue('selectedCompanyId');
        
        if (!companyId) {
            showError('Không tìm thấy ID công ty');
            return;
        }

        currentCompanyId = companyId;
        
        // Set company id input safely
        setElementValue('company-id-input', companyId);

        // Show loading
        showElement(document.getElementById('loading-state'));

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

        hideElement(document.getElementById('loading-state'));

        if (jobsResult.success) {
            allJobs = jobsResult.data || [];
            const jobsContainer = document.getElementById('jobs-container');
            const emptyState = document.getElementById('empty-state');
            
            if (jobsContainer && emptyState) {
                if (allJobs.length > 0) {
                    jobsContainer.innerHTML = allJobs.map(job => renderJobCard(job)).join('');
                    hideElement(emptyState);
                    attachJobEventListeners();
                } else {
                    jobsContainer.innerHTML = '';
                    showElement(emptyState);
                }
            }
        } else {
            showError('Không thể tải danh sách tin tuyển dụng');
        }
    } catch (error) {
        console.error('Load company detail error:', error);
        hideElement(document.getElementById('loading-state'));
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
        const token = getStoredToken();
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
