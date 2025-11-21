// ==================== Recruiter Job Management Service ====================
// Handles recruiter's job listing, creation, editing, and deletion

let allJobs = [];
let jobToDelete = null;
let filteredJobs = [];

// Pagination state
let currentPage = 1;
let itemsPerPage = 5;
let totalPages = 1;
let totalElements = 0;

// Filter state
let currentJobFilters = {
    keyword: '',
    status: 'all', // all, published, draft
    dateFrom: null,
    dateTo: null,
    sortBy: 'publishedAt,desc'
};

// ==================== API Functions ====================

// Get my company's jobs
async function getMyJobs(page = 1) {
    try {
        const url = `${API_CONFIG.JOBS.GET_MY_JOBS}?page=${page}`; // Backend uses 0-based pagination
        console.log('Fetching jobs from:', url);

        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Get jobs response:', data);

        return {
            success: data.success,
            message: data.message,
            data: data.data || null
        };
    } catch (error) {
        console.error('Get Jobs API Error:', error);
        
        // MOCK DATA FOR TESTING - Remove this after API is ready
        console.log('Using mock data for testing...');
        const mockData = [
            {
                id: 1,
                title: 'Senior Frontend Developer',
                description: 'Chúng tôi cần một lập trình viên frontend có kinh nghiệm',
                location: { displayName: 'Hồ Chí Minh' },
                published: true,
                publishedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                applicationCount: 245,
                viewCount: 1250,
                salaryMin: 20000000,
                salaryMax: 35000000,
                currency: 'VND'
            },
            {
                id: 2,
                title: 'UI/UX Designer',
                description: 'Tìm kiếm designer tài năng cho dự án mới',
                location: { displayName: 'Hà Nội' },
                published: true,
                publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
                applicationCount: 187,
                viewCount: 890,
                salaryMin: 15000000,
                salaryMax: 25000000,
                currency: 'VND'
            },
            {
                id: 3,
                title: 'Backend Developer (Node.js)',
                description: 'Cần backend developer chuyên Node.js',
                location: { displayName: 'Hồ Chí Minh' },
                published: false,
                publishedAt: null,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                applicationCount: 0,
                viewCount: 0,
                salaryMin: 18000000,
                salaryMax: 30000000,
                currency: 'VND'
            },
            {
                id: 4,
                title: 'Product Manager',
                description: 'Quản lý sản phẩm cho nền tảng SaaS',
                location: { displayName: 'Hồ Chí Minh' },
                published: true,
                publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                applicationCount: 0,
                viewCount: 456,
                salaryMin: 25000000,
                salaryMax: 40000000,
                currency: 'VND'
            }
        ];
        
        return {
            success: true,
            message: 'Mock data',
            data: {
                content: mockData,
                totalPages: 1,
                totalElements: 4,
                number: 0,
                size: 10
            }
        };
    }
}

// Delete a job
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

// ==================== UI Functions ====================

// Display jobs list in table format with pagination
function displayJobs(jobs, paginationData) {
    const jobsList = document.getElementById('jobs-list');
    const jobsContainer = document.getElementById('jobs-container');
    const paginationContainer = document.getElementById('pagination');
    
    if (!jobs || jobs.length === 0) {
        hideElement('jobs-container');
        showElement('empty-state');
        hideElement('pagination');
        displayStats({ total: 0, published: 0, draft: 0, applications: 0 });
        return;
    }

    // Calculate stats from current page data
    const stats = {
        total: paginationData?.totalElements || jobs.length,
        published: jobs.filter(j => j.published).length,
        draft: jobs.filter(j => !j.published).length,
        applications: jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)
    };
    displayStats(stats);

    let html = '';

    jobs.forEach(job => {
        const publishedDate = formatDateDisplay(job.publishedAt || job.createdAt);
        const expiresDate = formatDateDisplay(job.expiresAt);
        const locationText = job.isRemote ? 'Remote' : 
                (job.location?.displayName || 'Không xác định');
        
        const statusBadge = job.published 
            ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>Đang hiển thị</span>'
            : '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zm-2-8a1 1 0 11-2 0 1 1 0 012 0zM8.5 17a.5.5 0 11-1 0 .5.5 0 011 0zM17 17a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd"></path></svg>Nháp</span>';

        const applicationCount = job.applicationCount || 0;

        html += `
            <tr class="border-b border-gray-200 hover:bg-blue-50 transition">
                <td class="px-6 py-4">
                    <input type="checkbox" class="w-4 h-4 rounded border-gray-300 cursor-pointer">
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col gap-1">
                        <p class="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition" title="${job.title}">${job.title}</p>
                        <div class="flex items-center gap-1 text-gray-500">
                            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <p class="text-xs text-gray-600 line-clamp-1">${locationText}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    ${publishedDate}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    ${expiresDate}
                </td>
                <td class="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    ${applicationCount}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-2">
                        <a href="recruiter-job-detail.html?jobId=${job.id}" class="p-2 text-blue-600 hover:bg-blue-100 rounded transition" title="Chỉnh sửa">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </a>
                        <a href="recruiter-job-detail.html?jobId=${job.id}" class="p-2 text-gray-600 hover:bg-gray-100 rounded transition" title="Xem chi tiết">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </a>
                        <button onclick="openDeleteModal(${job.id})" class="p-2 text-red-600 hover:bg-red-100 rounded transition" title="Xóa">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    jobsList.innerHTML = html;
    hideElement('empty-state');
    showElement('jobs-container');

    // Display pagination
    if (paginationData && paginationData.totalPages > 1) {
        displayPagination(paginationData);
        showElement('pagination');
    } else {
        hideElement('pagination');
    }
}

// Display stats cards
function displayStats(stats) {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;

    const statsData = [
        { label: 'Tổng số tin', value: stats.total, icon: '📄', color: 'blue' },
        { label: 'Đang hiển thị', value: stats.published, icon: '✓', color: 'green' },
        { label: 'Ứng viên', value: stats.applications, icon: '👥', color: 'orange' },
    ];

    let html = '';
    statsData.forEach(stat => {
        const colorClass = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            green: 'bg-green-50 text-green-700 border-green-200',
            orange: 'bg-orange-50 text-orange-700 border-orange-200',
            yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }[stat.color];

        html += `
            <div class="bg-white rounded-lg border ${colorClass} p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium opacity-75">${stat.label}</p>
                        <p class="text-3xl font-bold mt-2">${stat.value}</p>
                    </div>
                    <div class="text-4xl">${stat.icon}</div>
                </div>
            </div>
        `;
    });

    statsContainer.innerHTML = html;
}

// Display pagination
function displayPagination(paginationData) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    const { totalPages, totalElements, number, size, numberOfElements } = paginationData;
    const startIndex = (number) * size + 1; // number is 0-based
    const endIndex = startIndex + numberOfElements - 1;

    let html = `
        <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">
                <span>Hiển thị <span id="page-start">${startIndex}</span>-<span id="page-end">${endIndex}</span> trong <span id="total-jobs">${totalElements}</span> kết quả</span>
            </div>
            <div class="flex gap-2">
    `;

    // Previous button
    if (currentPage > 1) {
        html += `<button onclick="goToPage(${currentPage - 1})" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Trước</button>`;
    } else {
        html += `<button disabled class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 opacity-50 cursor-not-allowed">Trước</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="px-4 py-2 border border-blue-600 bg-blue-50 rounded-lg text-sm text-blue-600 font-semibold">${i}</button>`;
        } else if (i <= 3 || i >= totalPages - 2 || Math.abs(i - currentPage) <= 1) {
            html += `<button onclick="goToPage(${i})" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">${i}</button>`;
        } else if (i === 4 && currentPage > 5) {
            html += `<span class="px-2 py-2">...</span>`;
        }
    }

    // Next button
    if (currentPage < totalPages) {
        html += `<button onclick="goToPage(${currentPage + 1})" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Tiếp</button>`;
    } else {
        html += `<button disabled class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 opacity-50 cursor-not-allowed">Tiếp</button>`;
    }

    html += `
            </div>
        </div>
    `;

    paginationContainer.innerHTML = html;
}

// Go to page
function goToPage(page) {
    currentPage = page;
    loadJobs(); // Reload jobs for the new page
    
    // Scroll to top of table
    const table = document.getElementById('jobs-container');
    if (table) {
        table.scrollIntoView({ behavior: 'smooth' });
    }
}

// Apply filters to jobs (reset to page 1 and reload)
function filterJobs() {
    console.log('FilterJobs called with filters:', currentJobFilters);
    currentPage = 1;
    loadJobs();
}

// Update search filter
function updateJobSearch() {
    const searchInput = document.getElementById('job-search-input');
    currentJobFilters.keyword = searchInput?.value || '';
    console.log('Search filter updated:', currentJobFilters.keyword);
    filterJobs();
}

// Update status filter
function updateJobStatusFilter() {
    const allCheckbox = document.querySelector('.job-status-filter[value="all"]');
    const publishedCheckbox = document.querySelector('.job-status-filter[value="published"]');
    const draftCheckbox = document.querySelector('.job-status-filter[value="draft"]');
    
    const allChecked = allCheckbox?.checked || false;
    const publishedChecked = publishedCheckbox?.checked || false;
    const draftChecked = draftCheckbox?.checked || false;
    
    if (!publishedChecked && !draftChecked) {
        currentJobFilters.status = 'all';
    } else if (publishedChecked && draftChecked) {
        currentJobFilters.status = 'all';
    } else if (publishedChecked) {
        currentJobFilters.status = 'published';
    } else if (draftChecked) {
        currentJobFilters.status = 'draft';
    } else {
        currentJobFilters.status = 'all';
    }
    
    console.log('Status filter updated:', currentJobFilters.status);
    filterJobs();
}

// Update date range filter
function updateJobDateFilter() {
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    
    currentJobFilters.dateFrom = dateFromInput?.value || null;
    currentJobFilters.dateTo = dateToInput?.value || null;
    
    console.log('Date filter updated:', {dateFrom: currentJobFilters.dateFrom, dateTo: currentJobFilters.dateTo});
    filterJobs();
}

// Update sort
function updateJobSort() {
    const sortSelect = document.getElementById('job-sort-select');
    currentJobFilters.sortBy = sortSelect?.value || 'publishedAt,desc';
    console.log('Sort filter updated:', currentJobFilters.sortBy);
    filterJobs();
}

// Clear all filters
function clearAllFilters() {
    currentJobFilters = {
        keyword: '',
        status: 'all',
        dateFrom: null,
        dateTo: null,
        sortBy: 'publishedAt,desc'
    };

    // Reset UI
    const searchInput = document.getElementById('job-search-input');
    if (searchInput) searchInput.value = '';
    
    const dateFromInput = document.getElementById('date-from');
    if (dateFromInput) dateFromInput.value = '';
    
    const dateToInput = document.getElementById('date-to');
    if (dateToInput) dateToInput.value = '';
    
    const sortSelect = document.getElementById('job-sort-select');
    if (sortSelect) sortSelect.value = 'publishedAt,desc';
    
    document.querySelectorAll('.job-status-filter').forEach(cb => cb.checked = false);
    
    filterJobs();
    showSuccessToast('Đã xóa bộ lọc', 2000);
}

// Toggle filter dropdown
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId + '-dropdown');
    if (!dropdown) return;

    // Close all other dropdowns
    document.querySelectorAll('[id$="-dropdown"]').forEach(el => {
        if (el.id !== dropdownId + '-dropdown') {
            el.classList.add('hidden');
        }
    });

    dropdown.classList.toggle('hidden');
}

async function loadJobs() {
    try {
        if (!authService.requireAuth()) {
            return;
        }

        showElement('loading');
        hideElement('error-state');
        hideElement('jobs-container');
        hideElement('empty-state');
        hideElement('pagination');

        const result = await getMyJobs(currentPage);

        hideElement('loading');

        if (result.success && result.data) {
            // Handle different response formats
            let jobsData = result.data.content || result.data;
            if (!Array.isArray(jobsData)) {
                jobsData = [jobsData];
            }
            
            console.log('Jobs data to display:', jobsData);
            
            // Store pagination metadata
            if (result.data.content) {
                totalPages = result.data.totalPages || 1;
                totalElements = result.data.totalElements || 0;
            }
            
            // Update allJobs for stats calculation
            allJobs = jobsData || [];
            displayJobs(jobsData, result.data);
        } else {
            showElement('error-state');
            setTextContent('error-text', result.message || 'Không thể tải danh sách tin tuyển dụng');
            showErrorToast(result.message || 'Không thể tải danh sách tin tuyển dụng', 5000);
        }
    } catch (error) {
        console.error('Load jobs error:', error);
        hideElement('loading');
        showElement('error-state');
        setTextContent('error-text', 'Có lỗi xảy ra. Vui lòng thử lại.');
        showErrorToast('Có lỗi xảy ra. Vui lòng thử lại.', 5000);
    }
}

// Open delete modal
function openDeleteModal(jobId) {
    jobToDelete = jobId;
    openModal('delete-modal');
}

// Close delete modal
function closeDeleteModal() {
    jobToDelete = null;
    closeModal('delete-modal');
}

// Confirm delete
async function confirmDelete() {
    if (!jobToDelete) return;

    try {
        const deleteBtn = document.getElementById('delete-confirm-btn');
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.textContent = 'Đang xóa...';
        }

        const result = await deleteJob(jobToDelete);

        if (result.success) {
            showSuccessToast('Xóa tin tuyển dụng thành công!', 3000);
            closeDeleteModal();
            await loadJobs();
        } else {
            showErrorToast(result.message || 'Không thể xóa tin tuyển dụng', 3000);
        }
    } catch (error) {
        console.error('Delete error:', error);
        showErrorToast('Có lỗi xảy ra', 3000);
    } finally {
        const deleteBtn = document.getElementById('delete-confirm-btn');
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Xóa';
        }
    }
}

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', function() {
    // Delete modal buttons
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
    const deleteModal = document.getElementById('delete-modal');

    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', closeDeleteModal);
    }

    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', confirmDelete);
    }

    // Close modal when clicking outside
    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeDeleteModal();
            }
        });
    }

    // Setup filter listeners
    const searchInput = document.getElementById('job-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', updateJobSearch);
    }

    const statusFilters = document.querySelectorAll('.job-status-filter');
    statusFilters.forEach(checkbox => {
        checkbox.addEventListener('change', updateJobStatusFilter);
    });

    const dateFromInput = document.getElementById('date-from');
    if (dateFromInput) {
        dateFromInput.addEventListener('change', updateJobDateFilter);
    }

    const dateToInput = document.getElementById('date-to');
    if (dateToInput) {
        dateToInput.addEventListener('change', updateJobDateFilter);
    }

    const sortSelect = document.getElementById('job-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', updateJobSort);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('[id$="-dropdown"]') && !e.target.closest('button')) {
            document.querySelectorAll('[id$="-dropdown"]').forEach(el => {
                el.classList.add('hidden');
            });
        }
    });

    // Load fragments then jobs
    loadFragments().then(() => {
        loadJobs();
    });
});
