// ==================== Recruiter Company Profile Service ====================
// Handles single company profile display and management

let currentCompany = null;
let descriptionEditor = null;

// ==================== Quill Editor ====================

function initializeDescriptionEditor() {
    if (descriptionEditor) return; // Already initialized

    descriptionEditor = new Quill('#edit-description-editor', {
        theme: 'snow',
        placeholder: 'Viết mô tả công ty...',
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
        }
    });
}

// ==================== API Functions ====================

// Get my company details - ✅ API MỚI
async function getMyCompany() {
    try {
        console.log('Fetching company from:', API_CONFIG.COMPANIES.MY_COMPANY_DETAILS);

        const response = await authService.apiRequest(API_CONFIG.COMPANIES.MY_COMPANY_DETAILS, {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Get company response:', data);

        // API trả về object trực tiếp, không phải array
        return {
            success: data.success,
            message: data.message,
            data: data.data || null
        };
    } catch (error) {
        console.error('Get Company API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.',
            data: null
        };
    }
}

// Update company information - ✅ API MỚI
async function updateCompany(companyData) {
    try {
        console.log('Updating company at:', API_CONFIG.COMPANIES.UPDATE_MY_COMPANY);
        console.log('Company data:', companyData);

        const response = await authService.apiRequest(API_CONFIG.COMPANIES.UPDATE_MY_COMPANY, {
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

// Upload company logo - ✅ API MỚI (không cần companyId)
async function uploadCompanyLogo(logoFile) {
    try {
        const url = buildApiUrl(API_CONFIG.COMPANIES.UPLOAD_LOGO);
        console.log('Uploading logo to:', url);

        const formData = new FormData();
        formData.append('logo', logoFile);

        const token = authService.getToken();
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
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

// ✅ THÊM MỚI: Upload company background image
async function uploadCompanyBackground(backgroundFile) {
    try {
        if (!backgroundFile) {
            return { success: false, message: 'Vui lòng chọn ảnh' };
        }

        if (backgroundFile.size > 5 * 1024 * 1024) {
            showErrorToast('Kích thước ảnh không được vượt quá 5MB', 3000);
            return { success: false, message: 'Kích thước ảnh quá lớn' };
        }

        const url = buildApiUrl(API_CONFIG.COMPANIES.UPLOAD_BACKGROUND);
        console.log('Uploading background to:', url);

        const formData = new FormData();
        formData.append('background', backgroundFile);

        const token = authService.getToken();
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
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
        console.log('Upload background response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data
        };
    } catch (error) {
        console.error('Upload Background API Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.'
        };
    }
}

// ==================== UI Functions ====================

// Display company profile
function displayCompanyProfile(company) {
    if (!company) return;

    currentCompany = company;

    // Update logo
    const logoUrl = company.logoUrl 
        ? `${API_CONFIG.FILE_BASE_URL}${company.logoUrl}` 
        : 'img/default-company-logo.png';
    
    const logoElement = document.getElementById('company-logo');
    if (logoElement) {
        logoElement.src = logoUrl;
        logoElement.alt = company.name;
    }

    // ✅ THÊM MỚI: Update background image
    const backgroundElement = document.getElementById('company-background');
    if (backgroundElement && company.backgroundImageUrl) {
        backgroundElement.src = `${API_CONFIG.FILE_BASE_URL}${company.backgroundImageUrl}`;
        backgroundElement.style.display = 'block';
    } else if (backgroundElement) {
        backgroundElement.style.display = 'none';
    }

    // Update company name
    setTextContent('company-name', company.name || 'Chưa có tên');

    // Update verified badge
    if (company.verified) {
        showElement('verified-badge');
    } else {
        hideElement('verified-badge');
    }

    // Update description
    setTextContent('company-description', company.description || 'Chưa có mô tả');
    
    // Update full description card
    const descriptionFull = document.getElementById('company-description-full');
    if (descriptionFull) {
        descriptionFull.innerHTML = company.description || 'Chưa có mô tả công ty.';
    }

    // Update size
    if (company.size_min && company.size_max) {
        setTextContent('company-size', `${company.size_min} - ${company.size_max} nhân viên`);
        setTextContent('company-size-detail', `${company.size_min} - ${company.size_max} nhân viên`);
    } else {
        setTextContent('company-size', 'Chưa cập nhật');
        setTextContent('company-size-detail', 'Chưa cập nhật');
    }

    // Update followers
    setTextContent('company-followers', `${company.followerCount || 0} người theo dõi`);

    // Update website
    const websiteElement = document.getElementById('company-website');
    if (websiteElement) {
        if (company.website) {
            const fullUrl = company.website.startsWith('http') 
                ? company.website 
                : `https://${company.website}`;
            websiteElement.href = fullUrl;
            websiteElement.textContent = company.website;
            websiteElement.classList.remove('hidden');
        } else {
            websiteElement.textContent = 'Chưa cập nhật';
            websiteElement.removeAttribute('href');
            websiteElement.classList.add('text-gray-500');
        }
    }

    // Show profile, hide loading/error
    hideElement('loading');
    hideElement('error-message');
    showElement('company-profile');
}

// Load company profile
async function loadCompanyProfile() {
    try {
        // Check authentication
        if (!authService.requireAuth()) {
            return;
        }

        showElement('loading');
        hideElement('error-message');
        hideElement('company-profile');

        const result = await getMyCompany();

        hideElement('loading');

        if (result.success && result.data) {
            displayCompanyProfile(result.data);
        } else {
            showElement('error-message');
            setTextContent('error-text', result.message || 'Không thể tải thông tin công ty');
            showErrorToast(result.message || 'Không thể tải thông tin công ty', 5000);
        }
    } catch (error) {
        console.error('Load company profile error:', error);
        hideElement('loading');
        showElement('error-message');
        setTextContent('error-text', 'Có lỗi xảy ra. Vui lòng thử lại.');
        showErrorToast('Có lỗi xảy ra. Vui lòng thử lại.', 5000);
    }
}

// Open edit modal
function openEditModal() {
    if (!currentCompany) return;

    // Initialize Quill on first open
    initializeDescriptionEditor();

    setElementValue('edit-company-name', currentCompany.name || '');
    setElementValue('edit-size-min', currentCompany.size_min || '');
    setElementValue('edit-size-max', currentCompany.size_max || '');

    // Load description HTML into Quill editor
    descriptionEditor.root.innerHTML = currentCompany.description || '';

    openModal('edit-modal');
}

// Close edit modal
function closeEditModal() {
    closeModal('edit-modal');
    const form = document.getElementById('edit-company-form');
    if (form) form.reset();
}

// Handle logo upload
async function handleLogoUpload(file) {
    if (!currentCompany || !file) return;

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
        // API MỚI: không cần truyền companyId
        const result = await uploadCompanyLogo(file);

        if (result.success) {
            showSuccessToast('Tải lên logo thành công!', 3000);
            await loadCompanyProfile();
        } else {
            showErrorToast(result.message || 'Không thể tải lên logo', 3000);
        }
    } catch (error) {
        console.error('Upload logo error:', error);
        showErrorToast('Có lỗi xảy ra khi tải lên logo', 3000);
    }
}

// ✅ THÊM MỚI: Handle background upload
async function handleBackgroundUpload(file) {
    if (!currentCompany || !file) return;

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
        const result = await uploadCompanyBackground(file);

        if (result.success) {
            showSuccessToast('Tải lên ảnh bìa thành công!', 3000);
            await loadCompanyProfile();
        } else {
            showErrorToast(result.message || 'Không thể tải lên ảnh bìa', 3000);
        }
    } catch (error) {
        console.error('Upload background error:', error);
        showErrorToast('Có lỗi xảy ra khi tải lên ảnh bìa', 3000);
    }
}

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', function() {
    // Edit company button
    const editCompanyBtn = document.getElementById('edit-company-btn');
    if (editCompanyBtn) {
        editCompanyBtn.addEventListener('click', openEditModal);
    }

    // Logo upload overlay
    const logoUploadOverlay = document.getElementById('logo-upload-overlay');
    const logoUploadInput = document.getElementById('logo-upload-input');
    
    if (logoUploadOverlay && logoUploadInput) {
        logoUploadOverlay.addEventListener('click', function() {
            logoUploadInput.click();
        });

        logoUploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleLogoUpload(file);
            }
        });
    }

    // ✅ THÊM MỚI: Background upload overlay
    const backgroundUploadOverlay = document.getElementById('background-upload-overlay');
    const backgroundUploadInput = document.getElementById('background-upload-input');
    
    if (backgroundUploadOverlay && backgroundUploadInput) {
        backgroundUploadOverlay.addEventListener('click', function() {
            backgroundUploadInput.click();
        });

        backgroundUploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleBackgroundUpload(file);
            }
        });
    }

    // Edit form submit
    const editForm = document.getElementById('edit-company-form');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!currentCompany) return;

            const companyData = {
                name: getElementValue('edit-company-name'),
                description: descriptionEditor.root.innerHTML.replace(/<p><br><\/p>/g, ''),
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

                // API MỚI: không cần truyền companyId
                const result = await updateCompany(companyData);

                if (result.success) {
                    showSuccessToast('Cập nhật công ty thành công!', 3000);
                    closeEditModal();
                    await loadCompanyProfile();
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
                    submitBtn.textContent = 'Cập nhật';
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
    loadCompanyProfile();
});
