// ==================== Recruiter Applications Management Service ====================
// Handles recruiter's applications listing, filtering, and management

let allApplications = [];
let filteredApplications = [];
let applicationStatuses = [];

// Pagination state
let currentPage = 1;
let itemsPerPage = 5;
let totalPages = 1;
let totalElements = 0;

// Filter state
let applicationFilters = {
    keyword: '',
    status: 'all'
};

// ==================== Helper Functions ====================

// Build full image URL
function buildFullImageUrl(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return API_CONFIG.FILE_BASE_URL + imagePath;
}

// ==================== API Functions ====================

// Get application statuses
async function getApplicationStatuses() {
    try {
        const url = buildApiUrl(API_CONFIG.APPLICATIONS.GET_STATUSES);
        console.log('Fetching application statuses from:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Application statuses response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || []
        };
    } catch (error) {
        console.error('Get Application Statuses Error:', error);
        
        // Mock statuses
        return {
            success: true,
            message: 'Mock data',
            data: [
                { code: 'APPLIED', name: 'Đã ứng tuyển' },
                { code: 'REVIEWED', name: 'Đang xem xét' },
                { code: 'INTERVIEWED', name: 'Phỏng vấn' },
                { code: 'OFFERED', name: 'Đề nghị nhận việc' },
                { code: 'REJECTED', name: 'Từ chối' }
            ]
        };
    }
}

// Get my company's applications
async function getMyApplications(page = 1) {
    try {
        const url = buildApiUrl(API_CONFIG.APPLICATIONS.GET_MY_APPLICATIONS) + `?page=${page - 1}`;
        console.log('Fetching applications from:', url);

        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Get applications response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || null
        };
    } catch (error) {
        console.error('Get Applications API Error:', error);
        
        // MOCK DATA FOR TESTING
        console.log('Using mock data for testing...');
        const mockData = [
            {
                id: 1,
                applicationStatus: { code: 'APPLIED', name: 'Đã ứng tuyển' },
                appliedAt: new Date().toISOString(),
                coverLetter: 'Tôi rất hứng thú với vị trí này',
                resumeId: 2,
                jobId: 3,
                jobTitle: 'Tuyển Senior UX/UI Design',
                userId: 1,
                userFullName: 'Quản trị viên',
                avatarUrl: 'https://ui-avatars.com/api/?name=Quản+trị+viên'
            }
        ];
        
        return {
            success: true,
            message: 'Mock data',
            data: {
                content: mockData,
                totalPages: 1,
                totalElements: 1,
                number: 0,
                size: 5,
                numberOfElements: 1
            }
        };
    }
}

// Get application candidate info
async function getApplicationDetail(applicationId) {
    try {
        const url = buildApiUrl(API_CONFIG.APPLICATIONS.GET_CANDIDATE_INFO, { applicationId });
        console.log('Fetching candidate info from:', url);

        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Get candidate info response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || null
        };
    } catch (error) {
        console.error('Get Candidate Info Error:', error);
        return {
            success: false,
            message: 'Không thể tải thông tin ứng viên'
        };
    }
}

// Get application timeline
async function getApplicationTimeline(applicationId) {
    try {
        const url = buildApiUrl(API_CONFIG.APPLICATIONS.GET_TIMELINE, { applicationId });
        console.log('Fetching application timeline from:', url);

        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Get timeline response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || []
        };
    } catch (error) {
        console.error('Get Timeline Error:', error);
        return {
            success: false,
            message: 'Không thể tải lịch sử trạng thái',
            data: []
        };
    }
}

// Update application status
async function updateApplicationStatus(applicationId, newStatusCode, note) {
    try {
        const url = buildApiUrl(API_CONFIG.APPLICATIONS.UPDATE_STATUS, { applicationId });
        console.log('Updating application status:', url);

        const response = await authService.apiRequest(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                newStatusCode: newStatusCode,
                note: note
            })
        });

        if (!response || !response.ok) {
            const data = await response.json();
            return {
                success: false,
                message: data.message || 'Cập nhật thất bại'
            };
        }

        const data = await response.json();
        console.log('Update status response:', data);

        return {
            success: data.success,
            message: data.message
        };
    } catch (error) {
        console.error('Update Status Error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại sau.'
        };
    }
}

// ==================== UI Functions ====================

// Display applications list
function displayApplications(applications, paginationData) {
    const container = document.getElementById('applications-container');
    
    if (!applications || applications.length === 0) {
        hideElement('applications-container');
        showElement('empty-state');
        hideElement('pagination');
        return;
    }

    let html = '';
    applications.forEach(app => {
        const statusColor = getStatusColor(app.applicationStatus.code);
        const appliedDate = formatDateDisplay(app.appliedAt);

        html += `
            <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition cursor-pointer" onclick="showApplicationDetail(${app.id})">
                <div class="flex items-start justify-between">
                    <div class="flex items-start gap-4 flex-1">
                        <!-- Avatar -->
                        <div class="flex-shrink-0">
                            <img 
                                src="${buildFullImageUrl(app.avatarUrl)}" 
                                alt="${app.userFullName}"
                                class="w-12 h-12 rounded-full object-cover border border-gray-200"
                                onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${app.userFullName}')"
                            >
                        </div>
                        
                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3 mb-1">
                                <h3 class="font-semibold text-gray-900 text-base">${app.userFullName}</h3>
                                <span class="px-2.5 py-1 ${statusColor} rounded-full text-xs font-semibold">
                                    ${app.applicationStatus.name}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">${app.jobTitle}</p>
                            <div class="flex items-center gap-4 text-sm text-gray-500">
                                <span>Ứng tuyển: ${appliedDate}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex items-center gap-2 ml-4">
                        <button onclick="event.stopPropagation(); showApplicationDetail(${app.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    hideElement('empty-state');
    showElement('applications-container');

    // Display pagination
    if (paginationData && paginationData.totalPages > 1) {
        displayPagination(paginationData);
        showElement('pagination');
    } else {
        hideElement('pagination');
    }
}

// Display pagination
function displayPagination(paginationData) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    const { totalPages, totalElements, number, size, numberOfElements } = paginationData;
    const startIndex = (number) * size + 1;
    const endIndex = startIndex + numberOfElements - 1;

    let html = `
        <div class="flex justify-between items-center w-full">
            <div class="text-sm text-gray-600">
                <span>Hiển thị <span id="page-start">${startIndex}</span>-<span id="page-end">${endIndex}</span> trong <span id="total-applicants">${totalElements}</span> ứng viên</span>
            </div>
            <div class="flex gap-2">
    `;

    // Previous button
    if (currentPage > 1) {
        html += `<button onclick="goToApplicationPage(${currentPage - 1})" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Trước</button>`;
    } else {
        html += `<button disabled class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 opacity-50 cursor-not-allowed">Trước</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="px-4 py-2 border border-blue-600 bg-blue-50 rounded-lg text-sm text-blue-600 font-semibold">${i}</button>`;
        } else if (i <= 3 || i >= totalPages - 2 || Math.abs(i - currentPage) <= 1) {
            html += `<button onclick="goToApplicationPage(${i})" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">${i}</button>`;
        } else if (i === 4 && currentPage > 5) {
            html += `<span class="px-2 py-2">...</span>`;
        }
    }

    // Next button
    if (currentPage < totalPages) {
        html += `<button onclick="goToApplicationPage(${currentPage + 1})" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Tiếp</button>`;
    } else {
        html += `<button disabled class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 opacity-50 cursor-not-allowed">Tiếp</button>`;
    }

    html += `
            </div>
        </div>
    `;

    document.getElementById('pagination').innerHTML = html;
}

// Get status color
function getStatusColor(code) {
    const colors = {
        'APPLIED': 'bg-blue-100 text-blue-700',
        'REVIEWED': 'bg-yellow-100 text-yellow-700',
        'INTERVIEWED': 'bg-purple-100 text-purple-700',
        'OFFERED': 'bg-green-100 text-green-700',
        'REJECTED': 'bg-red-100 text-red-700'
    };
    return colors[code] || 'bg-gray-100 text-gray-700';
}

// Show application detail modal
async function showApplicationDetail(applicationId) {
    try {
        openModal('application-detail-modal');
        
        const candidateResult = await getApplicationDetail(applicationId);
        const timelineResult = await getApplicationTimeline(applicationId);

        if (!candidateResult.success) {
            showErrorToast('Không thể tải thông tin ứng viên', 3000);
            return;
        }

        const candidate = candidateResult.data;
        const timeline = timelineResult.data || [];

        let html = `
            <!-- Candidate Info -->
            <div class="border-b border-gray-200 pb-6">
                <div class="flex items-start gap-4 mb-4">
                    <img 
                        src="${buildFullImageUrl(candidate.avatarUrl)}" 
                        alt="${candidate.name}"
                        class="w-16 h-16 rounded-full object-cover border border-gray-200"
                        onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${candidate.name}')"
                    >
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-900">${candidate.name}</h3>
                        <p class="text-gray-600">${candidate.headline || 'N/A'}</p>
                        <span class="inline-block mt-2 px-3 py-1 ${getStatusColor(candidate.status.code)} rounded-full text-xs font-semibold">
                            ${candidate.status.name}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Contact Info -->
            <div class="border-b border-gray-200 pb-6">
                <h4 class="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex gap-2">
                        <span class="text-gray-600">Email:</span>
                        <a href="mailto:${candidate.email}" class="text-blue-600 hover:underline">${candidate.email}</a>
                    </div>
                    <div class="flex gap-2">
                        <span class="text-gray-600">Điện thoại:</span>
                        <a href="tel:${candidate.phone}" class="text-blue-600 hover:underline">${candidate.phone || 'N/A'}</a>
                    </div>
                    <div class="flex gap-2">
                        <span class="text-gray-600">Địa chỉ:</span>
                        <span class="text-gray-900">${candidate.address || 'N/A'}</span>
                    </div>
                    <div class="flex gap-2">
                        <span class="text-gray-600">Ứng tuyển:</span>
                        <span class="text-gray-900">${formatDateDisplay(candidate.appliedAt)}</span>
                    </div>
                </div>
            </div>

            <!-- Cover Letter -->
            ${candidate.coverLetter ? `
            <div class="border-b border-gray-200 pb-6">
                <h4 class="font-semibold text-gray-900 mb-3">Thư xin việc</h4>
                <p class="text-sm text-gray-600 whitespace-pre-wrap">${candidate.coverLetter}</p>
            </div>
            ` : ''}

            <!-- Skills -->
            ${candidate.skills && candidate.skills.length > 0 ? `
            <div class="border-b border-gray-200 pb-6">
                <h4 class="font-semibold text-gray-900 mb-3">Kỹ năng</h4>
                <div class="flex flex-wrap gap-2">
                    ${candidate.skills.map(skill => `
                        <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            ${skill.name}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Timeline -->
            ${timeline.length > 0 ? `
            <div class="border-b border-gray-200 pb-6">
                <h4 class="font-semibold text-gray-900 mb-4">Lịch sử trạng thái</h4>
                <div class="space-y-4">
                    ${timeline.map(event => `
                        <div class="flex gap-4">
                            <div class="flex flex-col items-center">
                                <div class="w-3 h-3 bg-blue-600 rounded-full mt-1.5"></div>
                                <div class="w-0.5 h-12 bg-gray-300 mt-2"></div>
                            </div>
                            <div class="pb-4">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-semibold text-gray-900">
                                        ${event.oldStatusName} → ${event.newStatusName}
                                    </span>
                                    <span class="text-xs text-gray-500">${formatDateDisplay(event.changedAt)}</span>
                                </div>
                                ${event.note ? `<p class="text-sm text-gray-600 mt-1">${event.note}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Status Change -->
            <div class="pt-6">
                <h4 class="font-semibold text-gray-900 mb-3">Cập nhật trạng thái</h4>
                <div class="space-y-3">
                    <select id="new-status-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Chọn trạng thái mới</option>
                        ${applicationStatuses.map(status => `
                            <option value="${status.code}">${status.name}</option>
                        `).join('')}
                    </select>
                    <textarea id="status-note" placeholder="Ghi chú (tùy chọn)" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                    <button onclick="updateStatus(${applicationId})" class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
                        Cập nhật trạng thái
                    </button>
                </div>
            </div>
        `;

        document.getElementById('modal-body').innerHTML = html;
    } catch (error) {
        console.error('Show detail error:', error);
        showErrorToast('Có lỗi xảy ra', 3000);
    }
}

// Close application modal
function closeApplicationModal() {
    closeModal('application-detail-modal');
}

// Update application status
async function updateStatus(applicationId) {
    const newStatus = document.getElementById('new-status-select').value;
    const note = document.getElementById('status-note').value;

    if (!newStatus) {
        showErrorToast('Vui lòng chọn trạng thái', 3000);
        return;
    }

    try {
        const result = await updateApplicationStatus(applicationId, newStatus, note);
        
        if (result.success) {
            showSuccessToast('Cập nhật trạng thái thành công', 3000);
            closeApplicationModal();
            loadApplications();
        } else {
            showErrorToast(result.message || 'Cập nhật thất bại', 3000);
        }
    } catch (error) {
        console.error('Update error:', error);
        showErrorToast('Có lỗi xảy ra', 3000);
    }
}

// Apply filters
function filterApplications() {
    console.log('Filter applications:', applicationFilters);
    currentPage = 1;
    loadApplications();
}

// Update search
function updateApplicationSearch() {
    const searchInput = document.getElementById('applicant-search-input');
    applicationFilters.keyword = searchInput?.value || '';
    filterApplications();
}

// Update status filter
function updateApplicationStatusFilter(statusCode) {
    applicationFilters.status = statusCode;
    filterApplications();
}

// Toggle status dropdown
function toggleStatusDropdown() {
    const dropdown = document.getElementById('status-dropdown');
    dropdown.classList.toggle('hidden');
}

// Clear all filters
function clearAllApplicationFilters() {
    applicationFilters = {
        keyword: '',
        status: 'all'
    };

    const searchInput = document.getElementById('applicant-search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.app-status-filter').forEach(cb => cb.checked = false);
    
    filterApplications();
    showSuccessToast('Đã xóa bộ lọc', 2000);
}

// Go to page
function goToApplicationPage(page) {
    currentPage = page;
    loadApplications();
    
    const table = document.getElementById('applications-container');
    if (table) {
        table.scrollIntoView({ behavior: 'smooth' });
    }
}

// Load applications
async function loadApplications() {
    try {
        if (!authService.requireAuth()) {
            return;
        }

        showElement('loading');
        hideElement('error-state');
        hideElement('applications-container');
        hideElement('empty-state');
        hideElement('pagination');

        const result = await getMyApplications(currentPage);

        hideElement('loading');

        if (result.success && result.data) {
            let applicationsData = result.data.content || result.data;
            if (!Array.isArray(applicationsData)) {
                applicationsData = [applicationsData];
            }
            
            console.log('Applications data to display:', applicationsData);
            
            if (result.data.content) {
                totalPages = result.data.totalPages || 1;
                totalElements = result.data.totalElements || 0;
            }
            
            allApplications = applicationsData || [];
            displayApplications(applicationsData, result.data);
        } else {
            showElement('error-state');
            setTextContent('error-text', result.message || 'Không thể tải danh sách ứng viên');
            showErrorToast(result.message || 'Không thể tải danh sách ứng viên', 5000);
        }
    } catch (error) {
        console.error('Load applications error:', error);
        hideElement('loading');
        showElement('error-state');
        setTextContent('error-text', 'Có lỗi xảy ra. Vui lòng thử lại.');
        showErrorToast('Có lỗi xảy ra. Vui lòng thử lại.', 5000);
    }
}

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', function() {
    // Setup filter listeners
    const searchInput = document.getElementById('applicant-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', updateApplicationSearch);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('status-dropdown');
        if (dropdown && !e.target.closest('[id="status-dropdown"]') && !e.target.closest('button')) {
            dropdown.classList.add('hidden');
        }
    });

    // Load fragments then applications
    loadFragments().then(() => {
        // Load statuses first
        getApplicationStatuses().then(result => {
            applicationStatuses = result.data || [];
            
            // Build status filter dropdown
            const dropdown = document.getElementById('status-dropdown');
            if (dropdown && applicationStatuses.length > 0) {
                let html = `
                    <label class="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded mb-1">
                        <input type="radio" name="app-status" value="all" class="mr-2 app-status-filter" checked> Tất cả
                    </label>
                `;
                
                applicationStatuses.forEach(status => {
                    html += `
                        <label class="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded mb-1">
                            <input type="radio" name="app-status" value="${status.code}" class="mr-2 app-status-filter"> ${status.name}
                        </label>
                    `;
                });
                
                dropdown.innerHTML = html;
                
                document.querySelectorAll('.app-status-filter').forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        updateApplicationStatusFilter(e.target.value);
                    });
                });
            }
        });
        
        // Load applications
        loadApplications();
    });
});
