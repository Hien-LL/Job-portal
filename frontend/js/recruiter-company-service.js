// ==================== Recruiter Company Management Service ====================
// Handles company management operations (CRUD)

// ==================== API Functions ====================

// Get list of my companies
async function getMyCompanies(token) {
    try {
        const url = buildApiUrl(API_CONFIG.COMPANIES.MY_COMPANIES_LIST);
        console.log('Fetching companies from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Get companies response:', data);

        return {
            success: response.ok && data.success,
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

// Update company information
async function updateCompany(companyId, companyData, token) {
    try {
        const url = buildApiUrl(API_CONFIG.COMPANIES.UPDATE_MY_COMPANY, { companyId });
        console.log('Updating company at:', url);
        console.log('Company data:', companyData);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(companyData)
        });

        const data = await response.json();
        console.log('Update company response:', data);

        return {
            success: response.ok && data.success,
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

// Upload company logo
async function uploadCompanyLogo(companyId, logoFile, token) {
    try {
        const url = buildApiUrl(API_CONFIG.COMPANIES.UPLOAD_LOGO, { companyId });
        console.log('Uploading logo to:', url);

        const formData = new FormData();
        formData.append('logo', logoFile);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        console.log('Upload logo response:', data);

        return {
            success: response.ok && data.success,
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

// Show error message
function showError(message) {
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');

    setTimeout(() => {
        errorState.classList.add('hidden');
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
    successDiv.innerHTML = `<span class="block sm:inline">${message}</span>`;
    
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Render company card
function renderCompanyCard(company) {
    const logoUrl = company.logoUrl ? `${window.APP_CONFIG.API_BASE}${company.logoUrl}` : null;
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
                <p class="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">${company.description}</p>

                <!-- Company Info Grid -->
                <div class="space-y-3 mb-5 pb-5 border-b border-gray-200">
                    <div class="flex items-center text-sm">
                        <span class="text-gray-500 w-24">🌐 Website:</span>
                        <a href="https://${company.website}" target="_blank" class="text-blue-600 hover:underline truncate">${company.website}</a>
                    </div>
                    <div class="flex items-center text-sm">
                        <span class="text-gray-500 w-24">👥 Quy mô:</span>
                        <span class="text-gray-900 font-medium">${company.size_min} - ${company.size_max} nhân viên</span>
                    </div>
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

// Load companies
async function loadCompanies() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showError('Vui lòng đăng nhập để xem công ty');
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('error-state').classList.add('hidden');
        document.getElementById('empty-state').classList.add('hidden');

        const result = await getMyCompanies(token);

        document.getElementById('loading-state').classList.add('hidden');

        if (result.success && result.data.length > 0) {
            const companiesContainer = document.getElementById('companies-container');
            companiesContainer.innerHTML = result.data.map(company => renderCompanyCard(company)).join('');
            
            attachEventListeners();
        } else if (result.success && result.data.length === 0) {
            document.getElementById('empty-state').classList.remove('hidden');
        } else {
            showError(result.message || 'Không thể tải danh sách công ty');
        }
    } catch (error) {
        console.error('Load companies error:', error);
        document.getElementById('loading-state').classList.add('hidden');
        showError('Có lỗi xảy ra. Vui lòng thử lại.');
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
            window.location.href = `recruiter-company-detail.html?id=${companyId}`;
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
    const token = localStorage.getItem('access_token');
    
    // Find company data from DOM
    const card = document.querySelector(`[data-company-id="${companyId}"]`).closest('.bg-white');
    const name = card.querySelector('h3').textContent;
    const description = card.querySelector('p').textContent;
    
    // Parse size from info
    const sizeText = Array.from(card.querySelectorAll('.flex')).find(el => 
        el.querySelector('span:first-child')?.textContent === '規模:'
    );

    document.getElementById('company-id-input').value = companyId;
    document.getElementById('edit-company-name').value = name;
    document.getElementById('edit-company-description').value = description;
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('edit-company-form').reset();
}

// Open logo upload dialog
function openLogoUploadDialog(companyId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            showError('Vui lòng đăng nhập');
            return;
        }

        try {
            const uploadBtn = document.querySelector(`[data-company-id="${companyId}"]`);
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Đang tải lên...';

            const result = await uploadCompanyLogo(companyId, file, token);

            if (result.success) {
                showSuccess('Tải lên logo thành công!');
                loadCompanies();
            } else {
                showError(result.message || 'Không thể tải lên logo');
            }
        } catch (error) {
            console.error('Upload logo error:', error);
            showError('Có lỗi xảy ra khi tải lên logo');
        }
    };

    input.click();
}

// ==================== Event Listeners ====================

// Edit form submit
document.getElementById('edit-company-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const token = localStorage.getItem('access_token');
    if (!token) {
        showError('Vui lòng đăng nhập');
        return;
    }

    const companyId = document.getElementById('company-id-input').value;
    const companyData = {
        name: document.getElementById('edit-company-name').value,
        description: document.getElementById('edit-company-description').value,
        size_min: parseInt(document.getElementById('edit-size-min').value),
        size_max: parseInt(document.getElementById('edit-size-max').value)
    };

    try {
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang cập nhật...';

        const result = await updateCompany(companyId, companyData, token);

        if (result.success) {
            showSuccess('Cập nhật công ty thành công!');
            closeEditModal();
            loadCompanies();
        } else {
            showError(result.message || 'Không thể cập nhật công ty');
        }
    } catch (error) {
        console.error('Update company error:', error);
        showError('Có lỗi xảy ra');
    }
});

// Close modal buttons
document.getElementById('close-modal').addEventListener('click', closeEditModal);
document.getElementById('cancel-modal').addEventListener('click', closeEditModal);

// Close modal when clicking outside
document.getElementById('edit-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

// ==================== Initialize ====================

document.addEventListener('DOMContentLoaded', function() {
    loadCompanies();
});
