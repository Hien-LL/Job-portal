// ==================== Recruiter Job Create/Edit Service ====================
// Handles job creation, editing, and form submission

let currentJob = null;
let allCategories = [];
let allLocations = [];
let allBenefits = [];
let allSkills = [];
let selectedBenefits = [];
let selectedSkills = [];
let isSavingDraft = false;

// ==================== API Functions ====================

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

// Get locations
async function getLocations() {
    try {
        const url = buildApiUrl(API_CONFIG.LOCATIONS.LIST);
        const response = await authService.apiRequest(url, { method: 'GET' });

        if (!response || !response.ok) throw new Error('Failed to fetch locations');

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Get Locations Error:', error);
        return [];
    }
}

// Get benefits
async function getBenefits() {
    try {
        const url = buildApiUrl(API_CONFIG.BENEFITS.LIST);
        const response = await authService.apiRequest(url, { method: 'GET' });

        if (!response || !response.ok) throw new Error('Failed to fetch benefits');

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Get Benefits Error:', error);
        return [];
    }
}

// Get skills
async function getSkills() {
    try {
        const url = buildApiUrl(API_CONFIG.SKILLS.LIST);
        const response = await authService.apiRequest(url, { method: 'GET' });

        if (!response || !response.ok) throw new Error('Failed to fetch skills');

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Get Skills Error:', error);
        return [];
    }
}

// Get job detail (for editing)
async function getJobDetail(jobId) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.GET_MY_JOB, { jobId });
        const response = await authService.apiRequest(url, { method: 'GET' });

        if (!response || !response.ok) throw new Error('Failed to fetch job');

        const data = await response.json();
        return {
            success: data.success,
            data: data.data || null
        };
    } catch (error) {
        console.error('Get Job Detail Error:', error);
        return {
            success: false,
            data: null
        };
    }
}

// Create job
async function createJob(jobData) {
    try {
        const url = buildApiUrl(API_CONFIG.JOBS.CREATE_MY_COMPANY);
        console.log('Creating job at:', url);
        console.log('Job data:', jobData);

        const response = await authService.apiRequest(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });

        if (!response || !response.ok) {
            const data = await response.json();
            return {
                success: false,
                message: data.message || 'Tạo tin tuyển dụng thất bại'
            };
        }

        const data = await response.json();
        console.log('Create job response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data
        };
    } catch (error) {
        console.error('Create Job Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.'
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
                message: data.message || 'Cập nhật tin tuyển dụng thất bại'
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
        console.error('Update Job Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.'
        };
    }
}

// ==================== UI Functions ====================

// Populate dropdowns
async function populateDropdowns() {
    try {
        allCategories = await getCategories();
        allLocations = await getLocations();
        allBenefits = await getBenefits();
        allSkills = await getSkills();

        // Populate categories
        const categorySelect = document.getElementById('job-category');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
            allCategories.forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
        }

        // Populate locations
        const locationSelect = document.getElementById('job-location');
        if (locationSelect) {
            locationSelect.innerHTML = '<option value="">Chọn địa điểm</option>';
            allLocations.forEach(loc => {
                locationSelect.innerHTML += `<option value="${loc.countryCode}">${loc.displayName}</option>`;
            });
        }

        // Render benefits checkboxes
        renderBenefits();

        // Render skills checkboxes
        renderSkills();

    } catch (error) {
        console.error('Error populating dropdowns:', error);
        showErrorToast('Lỗi tải dữ liệu', 3000);
    }
}

// Render benefits as checkboxes
function renderBenefits() {
    const container = document.getElementById('benefits-container');
    if (!container) return;

    container.innerHTML = allBenefits.map(benefit => `
        <label class="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
                type="checkbox" 
                class="benefit-checkbox w-4 h-4 border border-gray-300 rounded cursor-pointer"
                value="${benefit.id}"
                ${selectedBenefits.includes(benefit.id) ? 'checked' : ''}
            >
            <span class="text-sm font-medium text-gray-700">${benefit.name}</span>
        </label>
    `).join('');

    // Attach event listeners
    document.querySelectorAll('.benefit-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const id = parseInt(this.value);
            if (this.checked) {
                if (!selectedBenefits.includes(id)) selectedBenefits.push(id);
            } else {
                selectedBenefits = selectedBenefits.filter(b => b !== id);
            }
        });
    });
}

// Render skills as checkboxes
function renderSkills() {
    const container = document.getElementById('skills-container');
    if (!container) return;

    container.innerHTML = allSkills.map(skill => `
        <label class="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
                type="checkbox" 
                class="skill-checkbox w-4 h-4 border border-gray-300 rounded cursor-pointer"
                value="${skill.id}"
                ${selectedSkills.includes(skill.id) ? 'checked' : ''}
            >
            <span class="text-sm font-medium text-gray-700">${skill.name}</span>
        </label>
    `).join('');

    // Attach event listeners
    document.querySelectorAll('.skill-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const id = parseInt(this.value);
            if (this.checked) {
                if (!selectedSkills.includes(id)) selectedSkills.push(id);
            } else {
                selectedSkills = selectedSkills.filter(s => s !== id);
            }
        });
    });
}

// Load job detail for editing
async function loadJobDetail() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');

    if (!jobId) return;

    try {
        const result = await getJobDetail(jobId);

        if (result.success && result.data) {
            currentJob = result.data;
            populateJobForm(result.data);
            setTextContent('page-title', 'Chỉnh sửa tin tuyển dụng');
            document.getElementById('submit-text').textContent = 'Cập nhật';
        }
    } catch (error) {
        console.error('Error loading job detail:', error);
        showErrorToast('Không thể tải thông tin tin tuyển dụng', 3000);
    }
}

// Populate form with job data
function populateJobForm(job) {
    setElementValue('job-id', job.id);
    setElementValue('job-title', job.title);
    setElementValue('job-description', job.description);
    setElementValue('job-category', job.category?.id);
    setElementValue('job-location', job.location?.countryCode);
    document.getElementById('job-remote').checked = job.isRemote;
    setElementValue('job-salary-min', job.salaryMin);
    setElementValue('job-salary-max', job.salaryMax);
    setElementValue('job-currency', job.currency);
    setElementValue('job-seniority', job.seniority);
    setElementValue('job-employment-type', job.employmentType);
    setElementValue('job-experience', job.yearsOfExperience);

    // Set expiry date - convert to datetime-local format
    if (job.expiresAt) {
        const date = new Date(job.expiresAt);
        const isoString = date.toISOString().slice(0, 16);
        setElementValue('job-expires-at', isoString);
    }

    // Select benefits
    if (job.benefits && job.benefits.length > 0) {
        selectedBenefits = job.benefits.map(b => b.id);
        renderBenefits();
    }

    // Select skills
    if (job.skills && job.skills.length > 0) {
        selectedSkills = job.skills.map(s => s.id);
        renderSkills();
    }
}

// Initialize page
async function initializePage() {
    try {
        if (!authService.requireAuth()) {
            return;
        }

        showElement('loading');
        hideElement('error-state');
        hideElement('job-form');

        await populateDropdowns();

        hideElement('loading');
        showElement('job-form');

        await loadJobDetail();

    } catch (error) {
        console.error('Initialize page error:', error);
        hideElement('loading');
        showElement('error-state');
        setTextContent('error-text', 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

// Validate form
function validateForm() {
    const title = getElementValue('job-title');
    const description = getElementValue('job-description');
    const category = getElementValue('job-category');
    const location = getElementValue('job-location');
    const salaryMin = parseInt(getElementValue('job-salary-min')) || 0;
    const salaryMax = parseInt(getElementValue('job-salary-max')) || 0;
    const seniority = getElementValue('job-seniority');
    const employmentType = getElementValue('job-employment-type');
    const expiresAt = getElementValue('job-expires-at');

    if (!title.trim()) {
        showErrorToast('Vui lòng nhập tiêu đề tin tuyển dụng', 3000);
        return false;
    }

    if (!description.trim()) {
        showErrorToast('Vui lòng nhập mô tả công việc', 3000);
        return false;
    }

    if (!category) {
        showErrorToast('Vui lòng chọn danh mục', 3000);
        return false;
    }

    if (!location) {
        showErrorToast('Vui lòng chọn địa điểm', 3000);
        return false;
    }

    if (salaryMin < 0 || salaryMax < 0) {
        showErrorToast('Lương không thể là số âm', 3000);
        return false;
    }

    if (salaryMin > salaryMax) {
        showErrorToast('Lương tối thiểu không được lớn hơn lương tối đa', 3000);
        return false;
    }

    if (!seniority) {
        showErrorToast('Vui lòng chọn cấp bậc', 3000);
        return false;
    }

    if (!employmentType) {
        showErrorToast('Vui lòng chọn hình thức làm việc', 3000);
        return false;
    }

    if (!expiresAt) {
        showErrorToast('Vui lòng chọn ngày hết hạn', 3000);
        return false;
    }

    return true;
}

// Get form data
function getFormData(publish = true) {
    return {
        title: getElementValue('job-title'),
        description: getElementValue('job-description'),
        categoryId: parseInt(getElementValue('job-category')),
        locationCountryCode: getElementValue('job-location'),
        isRemote: document.getElementById('job-remote').checked,
        salaryMin: parseInt(getElementValue('job-salary-min')) || 0,
        salaryMax: parseInt(getElementValue('job-salary-max')) || 0,
        currency: getElementValue('job-currency'),
        seniority: getElementValue('job-seniority'),
        employmentType: getElementValue('job-employment-type'),
        yearsOfExperience: parseInt(getElementValue('job-experience')) || 0,
        expiresAt: new Date(getElementValue('job-expires-at')).toISOString(),
        benefitIds: selectedBenefits,
        skillIds: selectedSkills
    };
}

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', function() {
    // Form submit
    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!validateForm()) return;

            try {
                const submitBtn = document.getElementById('publish-btn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Đang xử lý...';
                }

                const jobData = getFormData(true);
                let result;

                if (currentJob) {
                    result = await updateJob(currentJob.id, jobData);
                } else {
                    result = await createJob(jobData);
                }

                if (result.success) {
                    showSuccessToast(currentJob ? 'Cập nhật tin tuyển dụng thành công!' : 'Tạo tin tuyển dụng thành công!', 3000);
                    setTimeout(() => {
                        window.location.href = 'recruiter-job.html';
                    }, 1500);
                } else {
                    showErrorToast(result.message || 'Có lỗi xảy ra', 3000);
                }
            } catch (error) {
                console.error('Submit error:', error);
                showErrorToast('Có lỗi xảy ra', 3000);
            } finally {
                const submitBtn = document.getElementById('publish-btn');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = document.getElementById('submit-text').textContent;
                }
            }
        });
    }

    // Save draft button
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', async function() {
            if (!validateForm()) return;

            try {
                this.disabled = true;
                this.textContent = 'Đang lưu...';

                const jobData = getFormData(false);
                let result;

                if (currentJob) {
                    result = await updateJob(currentJob.id, jobData);
                } else {
                    result = await createJob(jobData);
                }

                if (result.success) {
                    showSuccessToast('Lưu nháp thành công!', 3000);
                } else {
                    showErrorToast(result.message || 'Có lỗi xảy ra', 3000);
                }
            } catch (error) {
                console.error('Save draft error:', error);
                showErrorToast('Có lỗi xảy ra', 3000);
            } finally {
                this.disabled = false;
                this.textContent = 'Lưu nháp';
            }
        });
    }

    // Initialize page
    loadFragments().then(() => {
        initializePage();
    });
});
