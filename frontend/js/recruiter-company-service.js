// ==================== Recruiter Company Management Service ====================
// Handles company management operations (CRUD)

// ==================== API Functions ====================

// Get list of my companies - ✅ ĐÃ SỬA
async function getMyCompanies() {
    try {
        const url = buildApiUrl(API_CONFIG.COMPANIES.MY_COMPANIES_LIST);
        console.log('Fetching companies from:', url);

        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Get companies response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || []
        };
    } catch (error) {
        console.error('Get Companies API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.',
            data: []
        };
    }
}

// Update company information - ✅ ĐÃ SỬA
async function updateCompany(companyId, companyData) {
    try {
        const url = buildApiUrl(API_CONFIG.COMPANIES.UPDATE_MY_COMPANY, { companyId });
        console.log('Updating company at:', url);
        console.log('Company data:', companyData);

        const response = await authService.apiRequest(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(companyData)
        });

        if (!response || !response.ok) {
            const data = await response.json();
            return {
                success: false,
                message: data.message || 'Cập nhật thất bại'
            };
        }

        const data = await response.json();
        console.log('Update company response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data
        };
    } catch (error) {
        console.error('Update Company API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.'
        };
    }
}

// Upload company logo - ✅ ĐÃ SỬA
async function uploadCompanyLogo(companyId, logoFile) {
    try {
        const url = buildApiUrl(API_CONFIG.COMPANIES.UPLOAD_LOGO, { companyId });
        console.log('Uploading logo to:', url);

        const formData = new FormData();
        formData.append('logo', logoFile);

        // ✅ SỬA: Dùng authService.getToken() cho FormData upload
        const token = authService.getToken();
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
                // No Content-Type for FormData - browser auto-sets with boundary
            },
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                message: data.message || 'Upload thất bại'
            };
        }

        const data = await response.json();
        console.log('Upload logo response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data
        };
    } catch (error) {
        console.error('Upload Logo API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.'
        };
    }
}

// ==================== UI Functions ====================

// ❌ XÓA: showError() - Dùng showErrorToast() từ utils.js
// ❌ XÓA: showSuccess() - Dùng showSuccessToast() từ utils.js

// Render company card - ✅ ĐÃ SỬA
function renderCompanyCard(company) {
    // ✅ SỬA: Dùng API_CONFIG.FILE_BASE_URL
    const logoUrl = company.logoUrl ? `${API_CONFIG.FILE_BASE_URL}${company.logoUrl}` : null;
    const hasLogo = logoUrl && logoUrl.trim() !== '';
    
    return `
        <div class="company-card bg-white rounded-xl shadow-md overflow-hidden">
            <!-- Logo Section with gradient overlay -->
            <div class="h-40 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative group overflow-hidden">
                ${hasLogo 
                    ? `<img src="${logoUrl}" alt="${company.name}" class="w-full h-full object-cover">`
                    : `<div class="text-white text-center">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>`
                }
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button class="upload-logo-btn bg-white text-gray-900 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105" data-company-id="${company.id}">
                        📤 Tải lên logo
                    </button>
                </div>
            </div>

            <!-- Content Section -->
            <div class="p-5">
                <!-- Header with badge -->
                <div class="flex items-start justify-between mb-3">
                    <h3 class="text-lg font-bold text-gray-900 flex-1">${company.name}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${company.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                        ${company.verified ? '✓ Xác thực' : '⏳ Chờ'}
                    </span>
                </div>

                <!-- Description -->
                <p class="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">${company.description || 'Chưa có mô tả'}</p>

                <!-- Company Info Grid -->
                <div class="space-y-3 mb-5 pb-5 border-b border-gray-200">
                    ${company.website ? `
                        <div class="flex items-center text-sm">
                            <span class="text-gray-500 w-24">🌐 Website:</span>
                            <a href="${company.website.startsWith('http') ? company.website : 'https://' + company.website}" target="_blank" class="text-blue-600 hover:underline truncate">${company.website}</a>
                        </div>
                    ` : ''}
                    ${company.size_min && company.size_max ? `
                        <div class="flex items-center text-sm">
                            <span class="text-gray-500 w-24">👥 Quy mô:</span>
                            <span class="text-gray-900 font-medium">${company.size_min} - ${company.size_max} nhân viên</span>
                        </div>
                    ` : ''}
                    <div class="flex items-center text-sm">
                        <span class="text-gray-500 w-24">❤️ Theo dõi:</span>
                        <span class="text-gray-900 font-medium">${company.followerCount || 0}</span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2">
                    <button class="flex-1 edit-btn bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:-translate-y-0.5" data-company-id="${company.id}">
                        ✎ Chỉnh sửa
                    </button>
                    <button class="flex-1 view-btn bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition transform hover:-translate-y-0.5" data-company-id="${company.id}">
                        → Chi tiết
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load companies - ✅ ĐÃ SỬA
async function loadCompanies() {
    try {
        // ✅ SỬA: Dùng authService.requireAuth()
        if (!authService.requireAuth()) {
            return;
        }

        showElement('loading-state');
        hideElement('error-state');
        hideElement('empty-state');

        const result = await getMyCompanies();

        hideElement('loading-state');

        if (result.success && result.data.length > 0) {
            const companiesContainer = document.getElementById('companies-container');
            if (companiesContainer) {
                companiesContainer.innerHTML = result.data.map(company => renderCompanyCard(company)).join('');
            }
            attachEventListeners();
        } else if (result.success && result.data.length === 0) {
            showElement('empty-state');
        } else {
            // ✅ SỬA: Dùng showErrorToast từ utils.js
            showErrorToast(result.message || 'Không thể tải danh sách công ty', 5000);
            showElement('error-state');
            setTextContent('error-message', result.message || 'Không thể tải danh sách công ty');
        }
    } catch (error) {
        console.error('Load companies error:', error);
        hideElement('loading-state');
        showErrorToast('Có lỗi xảy ra. Vui lòng thử lại.', 5000);
        showElement('error-state');
        setTextContent('error-message', 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

// Attach event listeners to dynamically created elements
function attachEventListeners() {
    // Edit button
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const companyId = this.dataset.companyId;
            openEditModal(companyId);
        });
    });

    // View button - For recruiters, go to company detail page
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const companyId = this.dataset.companyId;
            sessionStorage.setItem('selectedCompanyId', companyId);
            window.location.href = `recruiter-company-detail.html?companyId=${companyId}`;
        });
    });

    // Upload logo button
    document.querySelectorAll('.upload-logo-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const companyId = this.dataset.companyId;
            openLogoUploadDialog(companyId);
        });
    });
}

// Open edit modal
function openEditModal(companyId) {
    // Find company data from DOM
    const card = document.querySelector(`[data-company-id="${companyId}"]`).closest('.company-card');
    if (!card) return;
    
    const name = card.querySelector('h3')?.textContent || '';
    const description = card.querySelector('p')?.textContent || '';
    
    // Parse size from info
    const sizeElements = card.querySelectorAll('.flex.items-center.text-sm');
    let sizeMin = '';
    let sizeMax = '';
    
    sizeElements.forEach(el => {
        const label = el.querySelector('span:first-child')?.textContent;
        if (label && label.includes('Quy mô')) {
            const sizeText = el.querySelector('span:last-child')?.textContent || '';
            const match = sizeText.match(/(\d+)\s*-\s*(\d+)/);
            if (match) {
                sizeMin = match[1];
                sizeMax = match[2];
            }
        }
    });

    setElementValue('company-id-input', companyId);
    setElementValue('edit-company-name', name);
    setElementValue('edit-company-description', description);
    setElementValue('edit-size-min', sizeMin);
    setElementValue('edit-size-max', sizeMax);
    
    openModal('edit-modal');
}

// Close edit modal
function closeEditModal() {
    closeModal('edit-modal');
    const form = document.getElementById('edit-company-form');
    if (form) form.reset();
}

// Open logo upload dialog - ✅ ĐÃ SỬA
function openLogoUploadDialog(companyId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showErrorToast('Kích thước ảnh không được vượt quá 5MB', 3000);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showErrorToast('Vui lòng chọn file ảnh', 3000);
            return;
        }

        try {
            const uploadBtn = document.querySelector(`button.upload-logo-btn[data-company-id="${companyId}"]`);
            if (uploadBtn) {
                uploadBtn.disabled = true;
                uploadBtn.textContent = 'Đang tải lên...';
            }

            const result = await uploadCompanyLogo(companyId, file);

            if (result.success) {
                showSuccessToast('Tải lên logo thành công!', 3000);
                await loadCompanies();
            } else {
                showErrorToast(result.message || 'Không thể tải lên logo', 3000);
            }
        } catch (error) {
            console.error('Upload logo error:', error);
            showErrorToast('Có lỗi xảy ra khi tải lên logo', 3000);
        }
    };

    input.click();
}

// ==================== Event Listeners ====================

// Edit form submit - ✅ ĐÃ SỬA
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('edit-company-form');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const companyId = getElementValue('company-id-input');
            const companyData = {
                name: getElementValue('edit-company-name'),
                description: getElementValue('edit-company-description'),
                size_min: parseInt(getElementValue('edit-size-min')) || 0,
                size_max: parseInt(getElementValue('edit-size-max')) || 0
            };

            // Validation
            if (!companyData.name) {
                showErrorToast('Vui lòng nhập tên công ty', 3000);
                return;
            }

            if (companyData.size_min > companyData.size_max) {
                showErrorToast('Quy mô tối thiểu không được lớn hơn quy mô tối đa', 3000);
                return;
            }

            try {
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Đang cập nhật...';
                }

                const result = await updateCompany(companyId, companyData);

                if (result.success) {
                    showSuccessToast('Cập nhật công ty thành công!', 3000);
                    closeEditModal();
                    await loadCompanies();
                } else {
                    showErrorToast(result.message || 'Không thể cập nhật công ty', 3000);
                }
            } catch (error) {
                console.error('Update company error:', error);
                showErrorToast('Có lỗi xảy ra', 3000);
            } finally {
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Lưu thay đổi';
                }
            }
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

    // ==================== Initialize ====================
    loadCompanies();
});
