        let currentPage = 1;
        let totalPages = 1;
        let isLoading = false;
        let currentFilters = {
            keyword: '',
            location: '',
            companyName: '',
            remote: false,
            includeExpired: false
        };

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadFragments().then(() => {
                // Add a small delay to ensure DOM is updated
                setTimeout(() => {
                    initializePage();
                }, 100);
            });
        });

        async function initializePage() {
            if (!window.authUtils.isLoggedIn()) {
                window.location.href = 'login.html';
                return;
            }

            // Load user profile and populate sidebar
            await loadUserProfile();
            
            // Load sidebar user info from fragment
            if (typeof loadSidebarUserInfo === 'function') {
                loadSidebarUserInfo();
            }
            if (typeof highlightActiveMenu === 'function') {
                highlightActiveMenu();
            }
            
            await loadSavedJobs();
        }

        // Load user profile data to populate sidebar
        let userProfile = null;
        async function loadUserProfile() {
            try {
                const response = await window.authUtils.apiRequest('/users/me', {
                    method: 'GET'
                });

                if (response && response.ok) {
                    const result = await response.json();
                    
                    if (result.success) {
                        userProfile = result.data;
                        return true;
                    }
                }
                return false;
            } catch (error) {
                console.error('Error loading user profile:', error);
                return false;
            }
        }

        // Load saved jobs
        async function loadSavedJobs(page = 1) {
            if (isLoading) return;
            
            isLoading = true;
            currentPage = page;
            showLoading();

            try {
                const params = new URLSearchParams();
                params.append('page', page - 1); // API uses 0-based pagination
                params.append('size', 10);

                // Add filters
                if (currentFilters.keyword) {
                    params.append('keyword', currentFilters.keyword);
                }
                if (currentFilters.location) {
                    params.append('location', currentFilters.location);
                }
                if (currentFilters.companyName) {
                    params.append('companyName', currentFilters.companyName);
                }
                if (currentFilters.remote) {
                    params.append('remote', 'true');
                }
                if (!currentFilters.includeExpired) {
                    params.append('expiresAt', 'today');
                }

                const response = await window.authUtils.apiRequest(`/jobs/saved-jobs/list?${params.toString()}`, {
                    method: 'GET'
                });

                if (response && response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        displaySavedJobs(result.data.content);
                        displayPagination(result.data);
                        updateJobCount(result.data.totalElements);
                        hideLoading();
                    } else {
                        showEmpty();
                    }
                } else {
                    showError();
                }
            } catch (error) {
                console.error('Error loading saved jobs:', error);
                showError();
            } finally {
                isLoading = false;
            }
        }

        // Display saved jobs
        function displaySavedJobs(jobs) {
            const container = document.getElementById('saved-jobs-list');
            const emptyState = document.getElementById('empty-state');

            if (!jobs || jobs.length === 0) {
                hideElement(container);
                showElement(emptyState);
                return;
            }

            hideElement(emptyState);
            showElement(container);

            container.innerHTML = jobs.map(job => {
                const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.currency);
                const locationText = job.remote ? 'Remote' : job.location;
                const savedDate = formatSavedDate(job.savedAt);
                const isExpired = job.expired || (job.expiresAt && new Date(job.expiresAt) < new Date());

                return `
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${isExpired ? 'opacity-75' : ''}">
                        <div class="flex gap-4">
                            <div class="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                                ${job.companyLogoUrl ? 
                                    `<img src="http://localhost:8080${job.companyLogoUrl}" alt="${job.companyName}" class="w-full h-full object-contain rounded">` :
                                    `<span class="text-2xl">🏢</span>`
                                }
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 class="font-bold text-gray-900 ${isExpired ? 'line-through' : ''}">${job.title}</h3>
                                        <p class="text-gray-600 text-sm">${job.companyName}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-gray-500 text-xs">Đã lưu ${savedDate}</p>
                                        ${isExpired ? 
                                            '<span class="text-red-500 text-xs font-medium">Đã hết hạn</span>' :
                                            '<span class="text-green-500 text-xs font-medium">Còn hiệu lực</span>'
                                        }
                                    </div>
                                </div>
                                
                                <div class="flex items-center gap-4 mb-3 text-sm text-gray-600">
                                    <span>📍 ${locationText}</span>
                                    <span>💰 ${salaryText}</span>
                                    <span>👤 ${job.employmentType || 'Toàn thời gian'}</span>
                                </div>

                                ${isExpired ? 
                                    '<p class="text-red-600 text-sm mb-3">⚠️ Tin tuyển dụng này đã hết hạn</p>' : 
                                    job.expiresAt ? `<p class="text-gray-600 text-sm mb-3">📅 Hết hạn: ${formatDate(job.expiresAt)}</p>` : ''
                                }

                                <div class="flex gap-3">
                                    <a href="job-detail.html?slug=${job.slug}" class="text-blue-600 text-sm font-medium hover:underline">
                                        Xem chi tiết
                                    </a>
                                    ${!isExpired ? 
                                        `<button onclick="applyToJob('${job.slug}', ${job.jobId})" class="text-green-600 text-sm font-medium hover:underline">
                                            Ứng tuyển ngay
                                        </button>` : ''
                                    }
                                    <button onclick="unsaveJob('${job.slug}', this)" class="text-red-600 text-sm font-medium hover:underline">
                                        Bỏ lưu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Search saved jobs with filters
        function searchSavedJobs() {
            currentFilters.keyword = document.getElementById('search-keyword').value;
            currentFilters.location = document.getElementById('search-location').value;
            currentFilters.companyName = document.getElementById('search-company').value;
            currentFilters.remote = document.getElementById('filter-remote').checked;
            currentFilters.includeExpired = document.getElementById('filter-expired').checked;

            loadSavedJobs(1);
        }

        // Clear all filters
        function clearFilters() {
            document.getElementById('search-keyword').value = '';
            document.getElementById('search-location').value = '';
            document.getElementById('search-company').value = '';
            document.getElementById('filter-remote').checked = false;
            document.getElementById('filter-expired').checked = false;

            currentFilters = {
                keyword: '',
                location: '',
                companyName: '',
                remote: false,
                includeExpired: false
            };

            loadSavedJobs(1);
        }

        // Store job info for unsave confirmation
        let pendingUnsaveJob = { slug: null, buttonElement: null };

        // Show confirmation modal
        function showConfirmUnsaveModal(slug, buttonElement) {
            pendingUnsaveJob = { slug, buttonElement };
            const modal = document.getElementById('confirm-unsave-modal');
            if (modal) {
                modal.classList.remove('hidden');
            }
        }

        // Close confirmation modal
        function closeConfirmModal() {
            const modal = document.getElementById('confirm-unsave-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
            pendingUnsaveJob = { slug: null, buttonElement: null };
        }

        // Confirm and execute unsave
        async function confirmUnsaveJob() {
            if (pendingUnsaveJob.slug && pendingUnsaveJob.buttonElement) {
                await performUnsaveJob(pendingUnsaveJob.slug, pendingUnsaveJob.buttonElement);
            }
            closeConfirmModal();
        }

        // Unsave job - show beautiful modal
        function unsaveJob(slug, buttonElement) {
            showConfirmUnsaveModal(slug, buttonElement);
        }

        // Perform the actual unsave operation
        async function performUnsaveJob(slug, buttonElement) {
            try {
                const token = getStoredToken();
                if (!token) {
                    showErrorToast('Vui lòng đăng nhập', 3000);
                    return;
                }

                const url = `${API_CONFIG.BASE_URL}/jobs/${slug}/unsave`;
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result?.message || 'Failed to unsave job');
                }

                if (result.success) {
                    // Remove job card from UI
                    const jobCard = buttonElement.closest('.bg-white');
                    jobCard.remove();
                    
                    // Reload if no jobs left on current page
                    const remainingJobs = document.querySelectorAll('#saved-jobs-list .bg-white').length;
                    if (remainingJobs === 0) {
                        loadSavedJobs(currentPage);
                    } else {
                        // Update job count
                        const totalElement = document.getElementById('total-saved-jobs');
                        const currentTotal = parseInt(totalElement.textContent);
                        totalElement.textContent = currentTotal - 1;
                    }
                    showSuccessToast('Đã bỏ lưu việc làm ✓', 2000);
                } else {
                    throw new Error(result.message || 'Failed to unsave job');
                }
            } catch (error) {
                console.error('Error unsaving job:', error);
                showErrorToast(error.message || 'Có lỗi xảy ra khi bỏ lưu việc làm', 3000);
            }
        }

        // Apply to job
        function applyToJob(slug, jobId) {
            console.log(`Apply to job: ${slug} (ID: ${jobId})`);
            showErrorToast(`Tính năng ứng tuyển sẽ được triển khai sớm!`, 3000);
        }

        // Display pagination
        function displayPagination(data) {
            const container = document.getElementById('pagination');
            totalPages = data.totalPages;
            
            if (totalPages <= 1) {
                hideElement(container);
                return;
            }

            let html = '';
            
            // Previous button
            if (currentPage > 1) {
                html += `<button onclick="loadSavedJobs(${currentPage - 1})" class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Trước</button>`;
            }

            // Page numbers
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                if (i === currentPage) {
                    html += `<button class="px-3 py-2 bg-blue-600 text-white rounded text-sm">${i}</button>`;
                } else {
                    html += `<button onclick="loadSavedJobs(${i})" class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">${i}</button>`;
                }
            }

            // Next button
            if (currentPage < totalPages) {
                html += `<button onclick="loadSavedJobs(${currentPage + 1})" class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Tiếp</button>`;
            }

            setHtmlContent('pagination', html);
            showElement(container);
        }

        // Utility functions
        function formatSalary(min, max, currency = 'VND') {
            if (!min && !max) return 'Thỏa thuận';
            
            const formatAmount = (amount) => {
                if (amount >= 1000000) {
                    return (amount / 1000000).toFixed(0) + ' triệu';
                }
                return amount.toLocaleString('vi-VN');
            };

            if (min && max) {
                return `${formatAmount(min)} - ${formatAmount(max)} ${currency}`;
            } else if (min) {
                return `Từ ${formatAmount(min)} ${currency}`;
            } else {
                return `Lên đến ${formatAmount(max)} ${currency}`;
            }
        }

        function formatSavedDate(dateString) {
            if (!dateString) return 'Không xác định';
            
            const savedDate = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - savedDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'hôm qua';
            if (diffDays < 7) return `${diffDays} ngày trước`;
            if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
            return `${Math.ceil(diffDays / 30)} tháng trước`;
        }

        function formatDate(dateString) {
            if (!dateString) return 'Không xác định';
            
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        function updateJobCount(total) {
            document.getElementById('total-saved-jobs').textContent = total;
        }

        function showLoading() {
            showElement('loading');
            hideElement('saved-jobs-list');
            hideElement('empty-state');
        }

        function hideLoading() {
            hideElement('loading');
        }

        function showEmpty() {
            hideElement('loading');
            hideElement('saved-jobs-list');
            showElement('empty-state');
        }

        function showError() {
            hideElement('loading');
            showElement('saved-jobs-list');
            setHtmlContent('saved-jobs-list', `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div class="text-red-500 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
                    <p class="text-gray-600 mb-4">Vui lòng thử lại sau</p>
                    <button onclick="loadSavedJobs()" class="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition">
                        Thử lại
                    </button>
                </div>
            `);
        }

        // Add enter key search functionality
        document.addEventListener('DOMContentLoaded', function() {
            const searchInputs = ['search-keyword', 'search-location', 'search-company'];
            searchInputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            searchSavedJobs();
                        }
                    });
                }
            });
        });
