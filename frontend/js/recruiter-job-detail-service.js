// ==================== Recruiter Job Detail Service ====================
// Handles job detail display and editing for recruiters

let currentJob = null;
let currentCompanyId = null;
let allCategories = [];
let allLocations = [];
let allSkills = [];
let allBenefits = [];
let editFormSkills = [];
let editFormBenefits = [];
let descriptionEditor = null; // Quill editor instance

// ==================== Quill Editor Setup ====================

function initializeQuillEditor() {
    if (descriptionEditor) return; // Already initialized
    
    try {
        descriptionEditor = new Quill('#edit-description-editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            },
            placeholder: 'Nhập mô tả công việc...'
        });
        console.log('Quill editor initialized successfully');
    } catch (error) {
        console.error('Error initializing Quill editor:', error);
    }
}

// ==================== Helper Functions ====================

// Convert datetime-local (YYYY-MM-DDTHH:mm) to UTC ISO string
// Input: 2025-11-30T06:00 (user's local time)
// Output: 2025-11-30T06:00:00Z (as if they entered UTC time)
function localDatetimeToUTC(datetimeLocalValue) {
    // Parse the datetime-local value
    const [datePart, timePart] = datetimeLocalValue.split('T');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');
    
    // Create a date object treating the input as UTC
    const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);
    
    return date.toISOString();
}

// ==================== API Functions ====================

// Get job detail
async function getJobDetail(jobId) {
    try {
        const url = API_CONFIG.JOBS.GET_MY_JOB.replace(':jobId', jobId);
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
        const url = API_CONFIG.JOBS.UPDATE_MY_JOB.replace(':jobId', jobId);
        console.log('Updating job at:', url);
        console.log('Job data:', jobData);

        const response = await authService.apiRequest(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });

        if (!response) {
            console.error('No response from server');
            return {
                success: false,
                message: 'Không có phản hồi từ máy chủ'
            };
        }

        if (!response.ok) {
            let errorMessage = 'Cập nhật thất bại';
            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (e) {
                console.error('Could not parse error response:', e);
            }
            return {
                success: false,
                message: errorMessage
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
            message: 'Lỗi kết nối: ' + error.message
        };
    }
}

// Delete job
async function deleteJob(jobId) {
    try {
        const url = API_CONFIG.JOBS.DELETE_MY_JOB.replace(':jobId', jobId);
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
        const url = API_CONFIG.CATEGORIES.LIST;
        const response = await authService.apiRequest(url, { method: 'GET' });

        if (!response || !response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Get Categories Error:', error);
        return [];
    }
}

// Get locations list
async function getLocations() {
    try {
        const url = buildApiUrl(API_CONFIG.LOCATIONS.LIST);
        const response = await fetch(url);

        if (!response.ok) throw new Error('Failed to fetch locations');

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Get Locations Error:', error);
        return [];
    }
}

// Get skills list
async function getSkills() {
    try {
        const url = buildApiUrl(API_CONFIG.SKILLS.LIST);
        const response = await fetch(url);

        if (!response.ok) throw new Error('Failed to fetch skills');

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Get Skills Error:', error);
        return [];
    }
}

// Get benefits list
async function getBenefits() {
    try {
        const url = buildApiUrl(API_CONFIG.BENEFITS.LIST);
        const response = await fetch(url);

        if (!response.ok) throw new Error('Failed to fetch benefits');

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Get Benefits Error:', error);
        return [];
    }
}

// ==================== UI Functions ====================

// Display job detail
function displayJobDetail(job) {
    if (!job) return;

    currentJob = job;
    currentCompanyId = job.company?.id;
    const locationText = job.isRemote ? 'Remote' : 
                (job.location?.displayName || 'Không xác định');

    // Title
    setTextContent('job-title', job.title || 'N/A');
    
    // Company logo
    const logoElement = document.getElementById('company-logo');

    if (logoElement) {
        if (job.company?.logoUrl) {
            logoElement.innerHTML = `<img src="${API_CONFIG.FILE_BASE_URL}${job.company.logoUrl}" alt="${job.company.name}" class="w-full h-full object-contain rounded">`;
        } else {
            logoElement.innerHTML = `<span class="text-2xl">${getCategoryIcon(job.category?.name)}</span>`;
        }
    }

    // Company
    setTextContent('job-company', job.company?.name || 'N/A');
    

    // Seniority
    setTextContent('job-seniority', job.seniority || 'N/A');

    // Location
    document.getElementById('job-location').textContent = `📍 ${locationText}`;
    

    setTextContent('job-posted-date', new Date(job.publishedAt).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false,
        timeZone: 'UTC'
    }));

    setTextContent('job-deadline', new Date(job.expiresAt).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false,
        timeZone: 'UTC'
    }));

    setTextContent('job-sidebar-seniority', job.seniority || 'Không yêu cầu'); 
    setTextContent('job-sidebar-location', locationText);
    setTextContent('job-sidebar-salary', formatSalaryRange(job.salaryMin, job.salaryMax) || 'N/A');
    setTextContent('job-sidebar-type', job.employmentType || 'N/A');
    setTextContent('job-salary-range-sidebar', `${formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}    `);
    setTextContent('job-experience', job.yearsOfExperience ? `${job.yearsOfExperience} Năm kinh nghiệm` : 'Không yêu cầu');
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

    // Description - Display HTML directly (from Quill editor)
    setHTMLContent('job-description', job.description || '<p>Không có mô tả</p>');

    // Expiry date
    const expiryDate = new Date(job.expiresAt).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false,
        timeZone: 'UTC'
    });
    setTextContent('job-expires-at', expiryDate);

    // Category
    setTextContent('job-category-name', job.category?.name || 'N/A');

    // Skills
    if (job.skills && job.skills.length > 0) {
        const skillsHTML = job.skills.map(skill => `
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                ${skill.name}
            </span>
        `).join('');
        document.getElementById('job-skills').innerHTML = skillsHTML;
    } else {
        const skillsSection = document.getElementById('skills-section');
        if (skillsSection) skillsSection.style.display = 'none';
    }

    // Benefits
    if (job.benefits && job.benefits.length > 0) {
        const benefitsHTML = job.benefits.map(benefit => `
            <div class="flex items-center gap-2 text-sm">
                <span class="text-green-500">✓</span>
                <span>${benefit.name}</span>
            </div>
        `).join('');
        document.getElementById('job-benefits').innerHTML = benefitsHTML;
    } else {
        const benefitsSection = document.getElementById('benefits-section');
        if (benefitsSection) benefitsSection.style.display = 'none';
    }

    // Hide loading, show content
    hideElement('loading-state');
    hideElement('error-state');
    showElement('job-content');
}

// Load job detail
async function loadJobDetail(showLoading = true) {
    try {
        if (!authService.requireAuth()) {
            return;
        }

        if (showLoading) {
            showElement('loading-state');
            hideElement('error-state');
            hideElement('job-content');
        }

        // Get job ID from URL
        const params = new URLSearchParams(window.location.search);
        const jobId = params.get('jobId');

        if (!jobId) {
            showElement('error-state');
            setTextContent('error-message', 'Không tìm thấy ID tin tuyển dụng');
            if (showLoading) hideElement('loading-state');
            return;
        }

        const result = await getJobDetail(jobId);

        if (showLoading) hideElement('loading-state');

        if (result.success && result.data) {
            displayJobDetail(result.data);
            // Load categories, locations, skills, and benefits for edit modal
            console.log('Loading form data...');
            allCategories = await getCategories();
            console.log('Categories loaded:', allCategories.length);
            allLocations = await getLocations();
            console.log('Locations loaded:', allLocations.length);
            allSkills = await getSkills();
            console.log('Skills loaded:', allSkills.length);
            allBenefits = await getBenefits();
            console.log('Benefits loaded:', allBenefits.length);
            
            console.log('Populating form...');
            populateEditForm();
            console.log('Form populated');
        } else {
            showElement('error-state');
            setTextContent('error-message', result.message || 'Không thể tải thông tin tin tuyển dụng');
            showErrorToast(result.message || 'Không thể tải thông tin tin tuyển dụng', 5000);
        }
    } catch (error) {
        console.error('Load job detail error:', error);
        if (showLoading) hideElement('loading-state');
        showElement('error-state');
        setTextContent('error-message', 'Có lỗi xảy ra. Vui lòng thử lại.');
        showErrorToast('Có lỗi xảy ra: ' + error.message, 5000);
    }
}

// Populate edit form
function populateEditForm() {
    try {
        if (!currentJob) {
            console.error('currentJob is null or undefined');
            return;
        }

        console.log('Starting populateEditForm...');

        setElementValue('job-id-input', currentJob.id);
        setElementValue('company-id-input', currentCompanyId);
        setElementValue('edit-title', currentJob.title);
        setElementValue('edit-description', currentJob.description);
        setElementValue('edit-currency', currentJob.currency);
        setElementValue('edit-salary-min', currentJob.salaryMin);
        setElementValue('edit-salary-max', currentJob.salaryMax);
        setElementValue('edit-seniority', currentJob.seniority);
        setElementValue('edit-years-of-experience', currentJob.yearsOfExperience);
        setElementValue('edit-employment-type', currentJob.employmentType);
        
        const remoteCheckbox = document.getElementById('edit-is-remote');
        if (remoteCheckbox) remoteCheckbox.checked = currentJob.isRemote;

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

        // Populate locations
        const locationSelect = document.getElementById('edit-location-id');
        if (locationSelect) {
            locationSelect.innerHTML = '<option value="">-- Chọn địa điểm --</option>';
            allLocations.forEach(loc => {
                locationSelect.innerHTML += `<option value="${loc.id}">${loc.displayName}</option>`;
            });
            setElementValue('edit-location-id', currentJob.location?.id);
        }

        // Populate skills dropdown
        const skillsSelect = document.getElementById('edit-skills-select');
        if (skillsSelect) {
            skillsSelect.innerHTML = '<option value="">-- Chọn kỹ năng --</option>';
            allSkills.forEach(skill => {
                skillsSelect.innerHTML += `<option value="${skill.id}">${skill.name}</option>`;
            });
        }

        // Populate benefits dropdown
        const benefitsSelect = document.getElementById('edit-benefits-select');
        if (benefitsSelect) {
            benefitsSelect.innerHTML = '<option value="">-- Chọn quyền lợi --</option>';
            allBenefits.forEach(benefit => {
                benefitsSelect.innerHTML += `<option value="${benefit.id}">${benefit.name}</option>`;
            });
        }

        // Populate skills
        editFormSkills = (currentJob.skills || []).map(s => ({ id: s.id, name: s.name }));
        renderEditSkillsTags();

        // Populate benefits
        editFormBenefits = (currentJob.benefits || []).map(b => ({ id: b.id, name: b.name }));
        renderEditBenefitsTags();

        // Update salary mode display
        updateSalaryMode();
        
        console.log('populateEditForm completed successfully');
    } catch (error) {
        console.error('Error in populateEditForm:', error);
        showErrorToast('Lỗi khi tải biểu mẫu: ' + error.message, 3000);
    }
}

// Update salary mode based on checkbox
function updateSalaryMode() {
    const checkbox = document.getElementById('edit-salary-negotiable');
    const inputModeDiv = document.getElementById('salary-input-mode');
    
    if (!checkbox || !inputModeDiv) return;
    
    if (checkbox.checked) {
        // Negotiable mode - hide inputs
        inputModeDiv.style.display = 'none';
        setElementValue('edit-salary-min', 0);
        setElementValue('edit-salary-max', 0);
    } else {
        // Input mode - show inputs
        inputModeDiv.style.display = 'grid';
    }
}

// Render skills tags
function renderEditSkillsTags() {
    const container = document.getElementById('edit-skills-container');
    if (!container) return;
    
    container.innerHTML = editFormSkills.map((skill, idx) => `
        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            ${skill.name}
            <button type="button" data-index="${idx}" class="remove-skill text-lg hover:text-red-600">×</button>
        </span>
    `).join('');

    // Add remove event listeners
    document.querySelectorAll('.remove-skill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.index);
            editFormSkills.splice(idx, 1);
            renderEditSkillsTags();
        });
    });
}

// Render benefits tags
function renderEditBenefitsTags() {
    const container = document.getElementById('edit-benefits-container');
    if (!container) return;
    
    container.innerHTML = editFormBenefits.map((benefit, idx) => `
        <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            ${benefit.name}
            <button type="button" data-index="${idx}" class="remove-benefit text-lg hover:text-red-600">×</button>
        </span>
    `).join('');

    // Add remove event listeners
    document.querySelectorAll('.remove-benefit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.index);
            editFormBenefits.splice(idx, 1);
            renderEditBenefitsTags();
        });
    });
}

// Open edit modal
function openEditModal() {
    if (!currentJob) return;
    // Use the global function that handles overflow
    if (window.handleOpenEditModal) {
        window.handleOpenEditModal();
    } else {
        openModal('edit-modal');
    }
}

// Close edit modal
function closeEditModal() {
    // Use the global function that handles overflow
    if (window.handleCloseEditModal) {
        window.handleCloseEditModal();
    } else {
        closeModal('edit-modal');
    }
}

// Handle edit form submit
async function handleEditSubmit(e) {
    e.preventDefault();

    if (!currentJob) return;

    // Validate expiry date
    const expiryDateValue = getElementValue('edit-expires-at');
    if (!expiryDateValue) {
        showErrorToast('Vui lòng chọn ngày hết hạn', 3000);
        return;
    }

    const salaryMin = parseInt(getElementValue('edit-salary-min')) || 0;
    const salaryMax = parseInt(getElementValue('edit-salary-max')) || 0;

    // Convert datetime-local to UTC ISO string
    const expiresAtISO = localDatetimeToUTC(expiryDateValue);

    // Remove duplicates from arrays
    const uniqueSkillIds = [...new Set(editFormSkills.map(s => s.id))];
    const uniqueBenefitIds = [...new Set(editFormBenefits.map(b => b.id))];

    const jobData = {
        title: getElementValue('edit-title'),
        description: getElementValue('edit-description'),
        currency: getElementValue('edit-currency'),
        salaryMin: salaryMin,
        salaryMax: salaryMax,
        seniority: getElementValue('edit-seniority'),
        yearsOfExperience: parseInt(getElementValue('edit-years-of-experience')) || 0,
        employmentType: getElementValue('edit-employment-type'),
        categoryId: parseInt(getElementValue('edit-category-id')),
        locationId: parseInt(getElementValue('edit-location-id')),
        isRemote: document.getElementById('edit-is-remote').checked,
        expiresAt: expiresAtISO,
        skillIds: uniqueSkillIds,
        benefitIds: uniqueBenefitIds
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

    if (jobData.currency === '') {
        showErrorToast('Vui lòng chọn tiền tệ', 3000);
        return;
    }

    // Salary validation - only check for negative and max > min
    if (salaryMin < 0 || salaryMax < 0) {
        showErrorToast('Lương không được là số âm', 3000);
        return;
    }
    
    if (salaryMin > salaryMax) {
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
            // Reload detail after a short delay (without showing loading)
            setTimeout(async () => {
                console.log('Reloading job detail...');
                await loadJobDetail(false);
                console.log('Job detail reloaded');
            }, 500);
        } else {
            showErrorToast(result.message || 'Không thể cập nhật tin tuyển dụng', 3000);
            // Reset button on error
            const btn = document.querySelector('#edit-form button[type="submit"]');
            if (btn) {
                btn.disabled = false;
                btn.textContent = '✓ Cập nhật';
            }
        }
    } catch (error) {
        console.error('Submit error:', error);
        showErrorToast('Có lỗi xảy ra: ' + error.message, 3000);
        // Reset button on error
        const btn = document.querySelector('#edit-form button[type="submit"]');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '✓ Cập nhật';
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

// Update salary mode for info modal
function updateInfoSalaryMode() {
    const checkbox = document.getElementById('edit-info-salary-negotiable');
    const inputModeDiv = document.getElementById('salary-input-mode');
    
    if (!checkbox || !inputModeDiv) return;
    
    if (checkbox.checked) {
        // Negotiable mode - hide inputs
        inputModeDiv.style.display = 'none';
        setElementValue('edit-info-salary-min', 0);
        setElementValue('edit-info-salary-max', 0);
    } else {
        // Input mode - show inputs
        inputModeDiv.style.display = 'grid';
    }
}

// Render modal skills tags
function renderModalSkillsTags() {
    const container = document.getElementById('edit-skills-modal-container');
    if (!container) return;
    
    container.innerHTML = editFormSkills.map((skill, idx) => `
        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            ${skill.name}
            <button type="button" data-index="${idx}" class="remove-modal-skill text-lg hover:text-red-600">×</button>
        </span>
    `).join('');

    document.querySelectorAll('.remove-modal-skill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.index);
            editFormSkills.splice(idx, 1);
            renderModalSkillsTags();
        });
    });
}

// Render modal benefits tags
function renderModalBenefitsTags() {
    const container = document.getElementById('edit-benefits-modal-container');
    if (!container) return;
    
    container.innerHTML = editFormBenefits.map((benefit, idx) => `
        <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            ${benefit.name}
            <button type="button" data-index="${idx}" class="remove-modal-benefit text-lg hover:text-red-600">×</button>
        </span>
    `).join('');

    document.querySelectorAll('.remove-modal-benefit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.index);
            editFormBenefits.splice(idx, 1);
            renderModalBenefitsTags();
        });
    });
}

// Handle Edit Info Submit
async function handleEditInfoSubmit() {
    if (!currentJob) return;

    const salaryMin = parseInt(getElementValue('edit-info-salary-min')) || 0;
    const salaryMax = parseInt(getElementValue('edit-info-salary-max')) || 0;
    const expiryDateValue = getElementValue('edit-info-expires-at');
    const isRemote = document.getElementById('edit-info-is-remote')?.checked || false;
    const locationId = parseInt(getElementValue('edit-info-location')) || 0;

    if (!expiryDateValue) {
        showErrorToast('Vui lòng chọn hạn nộp', 3000);
        return;
    }

    // Location is required only if not remote
    if (!isRemote && !locationId) {
        showErrorToast('Vui lòng chọn địa điểm (hoặc chọn Remote)', 3000);
        return;
    }

    // Convert datetime-local to UTC ISO string
    const expiresAtISO = localDatetimeToUTC(expiryDateValue);

    const jobData = {
        locationId: isRemote ? null : locationId,
        seniority: getElementValue('edit-info-seniority'),
        yearsOfExperience: parseInt(getElementValue('edit-info-experience')) || 0,
        currency: getElementValue('edit-info-currency'),
        salaryMin: salaryMin,
        salaryMax: salaryMax,
        isRemote: isRemote,
        expiresAt: expiresAtISO
    };

    if (salaryMin < 0 || salaryMax < 0) {
        showErrorToast('Lương không được là số âm', 3000);
        return;
    }
    
    if (salaryMin > salaryMax) {
        showErrorToast('Lương tối thiểu không được lớn hơn lương tối đa', 3000);
        return;
    }

    try {
        const result = await updateJob(currentJob.id, jobData);
        if (result.success) {
            showSuccessToast('Cập nhật thành công!', 3000);
            document.getElementById('edit-info-modal')?.classList.add('hidden');
            document.documentElement.style.overflow = '';
            setTimeout(() => loadJobDetail(false), 500);
        } else {
            showErrorToast(result.message || 'Cập nhật thất bại', 3000);
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorToast('Có lỗi xảy ra', 3000);
    }
}

// Handle Edit Title Submit
async function handleEditTitleSubmit() {
    if (!currentJob) return;

    const title = getElementValue('edit-title-input').trim();
    if (!title) {
        showErrorToast('Tiêu đề không được trống', 3000);
        return;
    }

    try {
        const result = await updateJob(currentJob.id, { title });
        if (result.success) {
            showSuccessToast('Cập nhật thành công!', 3000);
            document.getElementById('edit-title-modal')?.classList.add('hidden');
            document.documentElement.style.overflow = '';
            setTimeout(() => loadJobDetail(false), 500);
        } else {
            showErrorToast(result.message || 'Cập nhật thất bại', 3000);
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorToast('Có lỗi xảy ra', 3000);
    }
}

// Handle Edit Description Submit
async function handleEditDescriptionSubmit() {
    if (!currentJob) return;

    // Get HTML content from Quill editor
    let description = '';
    if (descriptionEditor) {
        const delta = descriptionEditor.getContents();
        description = descriptionEditor.root.innerHTML; // Get HTML
    } else {
        description = getElementValue('edit-description-input').trim();
    }
    
    // Remove Quill toolbar formatting from HTML (clean empty tags)
    description = description.replace(/<p><br><\/p>/g, '').trim();
    
    if (!description || description === '<p><br></p>') {
        showErrorToast('Mô tả không được trống', 3000);
        return;
    }

    try {
        const result = await updateJob(currentJob.id, { description });
        if (result.success) {
            showSuccessToast('Cập nhật thành công!', 3000);
            document.getElementById('edit-description-modal')?.classList.add('hidden');
            document.documentElement.style.overflow = '';
            setTimeout(() => loadJobDetail(false), 500);
        } else {
            showErrorToast(result.message || 'Cập nhật thất bại', 3000);
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorToast('Có lỗi xảy ra', 3000);
    }
}

// Handle Edit Skills Submit
async function handleEditSkillsSubmit() {
    if (!currentJob) return;

    // Remove duplicates from skills array
    const uniqueSkillIds = [...new Set(editFormSkills.map(s => s.id))];

    try {
        const result = await updateJob(currentJob.id, { 
            skillIds: uniqueSkillIds
        });
        if (result.success) {
            showSuccessToast('Cập nhật thành công!', 3000);
            document.getElementById('edit-skills-modal')?.classList.add('hidden');
            document.documentElement.style.overflow = '';
            setTimeout(() => loadJobDetail(false), 500);
        } else {
            showErrorToast(result.message || 'Cập nhật thất bại', 3000);
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorToast('Có lỗi xảy ra', 3000);
    }
}

// Handle Edit Benefits Submit
async function handleEditBenefitsSubmit() {
    if (!currentJob) return;

    // Remove duplicates from benefits array
    const uniqueBenefitIds = [...new Set(editFormBenefits.map(b => b.id))];

    try {
        const result = await updateJob(currentJob.id, { 
            benefitIds: uniqueBenefitIds
        });
        if (result.success) {
            showSuccessToast('Cập nhật thành công!', 3000);
            document.getElementById('edit-benefits-modal')?.classList.add('hidden');
            document.documentElement.style.overflow = '';
            setTimeout(() => loadJobDetail(false), 500);
        } else {
            showErrorToast(result.message || 'Cập nhật thất bại', 3000);
        }
    } catch (error) {
        console.error('Error:', error);
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

    // Skills dropdown - add on change
    const skillsSelect = document.getElementById('edit-skills-select');
    if (skillsSelect) {
        skillsSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const skillId = parseInt(e.target.value);
                const skill = allSkills.find(s => s.id === skillId);
                if (skill && !editFormSkills.some(s => s.id === skillId)) {
                    editFormSkills.push({ id: skill.id, name: skill.name });
                    renderEditSkillsTags();
                }
                e.target.value = '';
            }
        });
    }

    // Benefits dropdown - add on change
    const benefitsSelect = document.getElementById('edit-benefits-select');
    if (benefitsSelect) {
        benefitsSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const benefitId = parseInt(e.target.value);
                const benefit = allBenefits.find(b => b.id === benefitId);
                if (benefit && !editFormBenefits.some(b => b.id === benefitId)) {
                    editFormBenefits.push({ id: benefit.id, name: benefit.name });
                    renderEditBenefitsTags();
                }
                e.target.value = '';
            }
        });
    }

    // Salary negotiable checkbox
    const salaryNegotiableCheckbox = document.getElementById('edit-salary-negotiable');
    if (salaryNegotiableCheckbox) {
        salaryNegotiableCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Thỏa thuận mode - set to 0/0
                setElementValue('edit-salary-min', 0);
                setElementValue('edit-salary-max', 0);
            } else {
                // Input mode - clear for user entry
                setElementValue('edit-salary-min', '');
                setElementValue('edit-salary-max', '');
            }
            updateSalaryMode();
        });
    }

    // ==================== NEW: Individual Edit Modal Handlers ====================

    // Edit Info Button (Thông tin tuyển dụng)
    const editInfoBtn = document.getElementById('edit-info-btn');
    if (editInfoBtn) {
        editInfoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentJob) return;
            
            // Populate locations dropdown
            const locationSelect = document.getElementById('edit-info-location');
            if (locationSelect) {
                locationSelect.innerHTML = '<option value="">-- Chọn địa điểm --</option>';
                allLocations.forEach(loc => {
                    locationSelect.innerHTML += `<option value="${loc.id}">${loc.displayName}</option>`;
                });
            }
            
            // Populate form
            setElementValue('edit-info-location', currentJob.location?.id);
            setElementValue('edit-info-seniority', currentJob.seniority);
            setElementValue('edit-info-experience', currentJob.yearsOfExperience);
            setElementValue('edit-info-currency', currentJob.currency);
            setElementValue('edit-info-salary-min', currentJob.salaryMin);
            setElementValue('edit-info-salary-max', currentJob.salaryMax);
            
            // Set expires date
            if (currentJob.expiresAt) {
                const date = new Date(currentJob.expiresAt);
                const isoString = date.toISOString().slice(0, 16);
                setElementValue('edit-info-expires-at', isoString);
            }
            
            // Set checkboxes
            const salaryCheckbox = document.getElementById('edit-info-salary-negotiable');
            if (salaryCheckbox) {
                salaryCheckbox.checked = currentJob.salaryMin === 0 && currentJob.salaryMax === 0;
                // Trigger update salary mode to hide/show inputs
                updateInfoSalaryMode();
            }
            
            const remoteCheckbox = document.getElementById('edit-info-is-remote');
            if (remoteCheckbox) {
                remoteCheckbox.checked = currentJob.isRemote;
            }
            
            openModal('edit-info-modal');
        });
    }

    // Edit Title Button
    const editTitleBtn = document.getElementById('edit-title-btn');
    if (editTitleBtn) {
        editTitleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentJob) return;
            setElementValue('edit-title-input', currentJob.title);
            openModal('edit-title-modal');
            document.getElementById('edit-title-input')?.focus();
        });
    }

    // Edit Description Button
    const editDescriptionBtn = document.getElementById('edit-description-btn');
    if (editDescriptionBtn) {
        editDescriptionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentJob) return;
            
            // Initialize Quill editor on first open
            if (!descriptionEditor) {
                initializeQuillEditor();
            }
            
            // Set content in Quill editor
            if (descriptionEditor) {
                descriptionEditor.root.innerHTML = currentJob.description || '';
            } else {
                setElementValue('edit-description-input', currentJob.description);
            }
            
            openModal('edit-description-modal');
        });
    }

    // Edit Skills Button
    const editSkillsBtn = document.getElementById('edit-skills-btn');
    if (editSkillsBtn) {
        editSkillsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentJob) return;
            
            // Reset modal skills array
            editFormSkills = (currentJob.skills || []).map(s => ({ id: s.id, name: s.name }));
            renderModalSkillsTags();
            
            // Populate dropdown
            const skillsSelect = document.getElementById('edit-skills-modal-select');
            if (skillsSelect) {
                skillsSelect.innerHTML = '<option value="">-- Chọn kỹ năng --</option>';
                allSkills.forEach(skill => {
                    skillsSelect.innerHTML += `<option value="${skill.id}">${skill.name}</option>`;
                });
            }
            
            openModal('edit-skills-modal');
        });
    }

    // Edit Benefits Button
    const editBenefitsBtn = document.getElementById('edit-benefits-btn');
    if (editBenefitsBtn) {
        editBenefitsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentJob) return;
            
            // Reset modal benefits array
            editFormBenefits = (currentJob.benefits || []).map(b => ({ id: b.id, name: b.name }));
            renderModalBenefitsTags();
            
            // Populate dropdown
            const benefitsSelect = document.getElementById('edit-benefits-modal-select');
            if (benefitsSelect) {
                benefitsSelect.innerHTML = '<option value="">-- Chọn quyền lợi --</option>';
                allBenefits.forEach(benefit => {
                    benefitsSelect.innerHTML += `<option value="${benefit.id}">${benefit.name}</option>`;
                });
            }
            
            openModal('edit-benefits-modal');
        });
    }

    // ==================== Form Handlers ====================

    // Edit Info Form Submit
    const editInfoForm = document.getElementById('edit-info-form');
    if (editInfoForm) {
        editInfoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleEditInfoSubmit();
        });
    }

    // Edit Title Form Submit
    const editTitleForm = document.getElementById('edit-title-form');
    if (editTitleForm) {
        editTitleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleEditTitleSubmit();
        });
    }

    // Edit Description Form Submit
    const editDescriptionForm = document.getElementById('edit-description-form');
    if (editDescriptionForm) {
        editDescriptionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleEditDescriptionSubmit();
        });
    }

    // Edit Skills Form Submit
    const editSkillsForm = document.getElementById('edit-skills-form');
    if (editSkillsForm) {
        editSkillsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleEditSkillsSubmit();
        });
    }

    // Edit Benefits Form Submit
    const editBenefitsForm = document.getElementById('edit-benefits-form');
    if (editBenefitsForm) {
        editBenefitsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleEditBenefitsSubmit();
        });
    }

    // Skills dropdown in modal - add on change
    const skillsSelectModal = document.getElementById('edit-skills-modal-select');
    if (skillsSelectModal) {
        skillsSelectModal.addEventListener('change', (e) => {
            if (e.target.value) {
                const skillId = parseInt(e.target.value);
                const skill = allSkills.find(s => s.id === skillId);
                if (skill && !editFormSkills.some(s => s.id === skillId)) {
                    editFormSkills.push({ id: skill.id, name: skill.name });
                    renderModalSkillsTags();
                }
                e.target.value = '';
            }
        });
    }

    // Benefits dropdown in modal - add on change
    const benefitsSelectModal = document.getElementById('edit-benefits-modal-select');
    if (benefitsSelectModal) {
        benefitsSelectModal.addEventListener('change', (e) => {
            if (e.target.value) {
                const benefitId = parseInt(e.target.value);
                const benefit = allBenefits.find(b => b.id === benefitId);
                if (benefit && !editFormBenefits.some(b => b.id === benefitId)) {
                    editFormBenefits.push({ id: benefit.id, name: benefit.name });
                    renderModalBenefitsTags();
                }
                e.target.value = '';
            }
        });
    }

    // Salary negotiable checkbox in info modal
    const salaryCheckboxInfo = document.getElementById('edit-info-salary-negotiable');
    if (salaryCheckboxInfo) {
        salaryCheckboxInfo.addEventListener('change', (e) => {
            updateInfoSalaryMode();
        });
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
