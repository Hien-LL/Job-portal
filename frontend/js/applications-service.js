let currentPage = 1;
        let totalPages = 1;
        let currentStatusFilter = 'all';
        let applications = [];

        // Load applications
        async function loadApplications(page = 1, status = 'all') {
            try {
                showElement('loading');
                hideElement('content');
                hideElement('error-state');

                // ✅ SỬA: Dùng authService.requireAuth() thay vì kiểm tra thủ công
                if (!authService.requireAuth()) {
                    return;
                }

                // ✅ SỬA: Dùng authService.apiRequest() thay vì fetch trực tiếp
                const queryParams = { 
                    page: page - 1, 
                    perPage: 10 
                };
                const queryString = new URLSearchParams(queryParams).toString();
                const url = `${API_CONFIG.APPLICATIONS.LIST}?${queryString}`;

                const response = await authService.apiRequest(url, {
                    method: 'GET'
                });

                if (!response || !response.ok) {
                    throw new Error('Failed to load applications');
                }

                const result = await response.json();
                if (result.success && result.data) {
                    applications = result.data.content || [];
                    currentPage = page;
                    totalPages = result.data.totalPages || 1;
                    
                    displayApplications(status);
                    displayPagination();
                    
                    hideElement('loading');
                    showElement('content');
                } else {
                    throw new Error('Invalid response');
                }
            } catch (error) {
                console.error('Error loading applications:', error);
                hideElement('loading');
                showElement('error-state');
            }
        }

        // Display applications
        function displayApplications(statusFilter = 'all') {
            const container = document.getElementById('applications-container');
            const emptyState = document.getElementById('empty-state');

            // Filter applications by status
            let filteredApps = applications;
            if (statusFilter !== 'all') {
                filteredApps = applications.filter(app => app.applicationStatus?.code === statusFilter);
            }

            if (filteredApps.length === 0) {
                hideElement(container);
                showElement(emptyState);
                return;
            }

            showElement(container);
            hideElement(emptyState);

            container.innerHTML = filteredApps.map(app => {
                const statusClass = getStatusClass(app.applicationStatus?.code);
                const appliedDate = formatDate(app.appliedAt);

                return `
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer" onclick="viewApplicationDetail(${app.id})">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <h3 class="font-semibold text-gray-900">${app.jobTitle || 'Chưa xác định'}</h3>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                                        ${app.applicationStatus?.name || 'Chưa xác định'}
                                    </span>
                                </div>
                                <p class="text-gray-600 text-sm">${app.companyName || 'Công ty'}</p>
                                <p class="text-gray-500 text-xs mt-1">Ứng tuyển: ${appliedDate}</p>
                            </div>
                            <div class="text-right">
                                <button class="text-blue-600 hover:text-blue-700 font-medium text-sm" onclick="event.stopPropagation(); viewApplicationDetail(${app.id})">
                                    Xem chi tiết →
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Get status badge class
        function getStatusClass(statusCode) {
            const statusClasses = {
                'APPLIED': 'bg-blue-100 text-blue-800',
                'INTERVIEWED': 'bg-purple-100 text-purple-800',
                'OFFERED': 'bg-green-100 text-green-800',
                'REJECTED': 'bg-red-100 text-red-800'
            };
            return statusClasses[statusCode] || 'bg-gray-100 text-gray-800';
        }

        // Format date
        function formatDate(dateString) {
            if (!dateString) return 'Chưa xác định';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }

        // View application detail
        function viewApplicationDetail(applicationId) {
            window.location.href = `application-detail.html?id=${applicationId}`;
        }

        // Display pagination
        function displayPagination() {
            const container = document.getElementById('pagination');
            
            if (totalPages <= 1) {
                hideElement(container);
                return;
            }

            let html = '';
            
            // Previous button
            if (currentPage > 1) {
                html += `<button onclick="goToPage(${currentPage - 1})" class="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">Trước</button>`;
            }

            // Page numbers
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                if (i === currentPage) {
                    html += `<button class="px-3 py-2 bg-blue-600 text-white rounded">${i}</button>`;
                } else {
                    html += `<button onclick="goToPage(${i})" class="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">${i}</button>`;
                }
            }

            // Next button
            if (currentPage < totalPages) {
                html += `<button onclick="goToPage(${currentPage + 1})" class="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">Tiếp</button>`;
            }

            container.innerHTML = html;
            showElement(container);
        }

        // Go to page
        function goToPage(page) {
            loadApplications(page, currentStatusFilter);
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', () => {
            loadFragments().then(() => {
                loadApplications();

                // Setup status filter buttons
                document.querySelectorAll('.status-filter').forEach(btn => {
                    btn.addEventListener('click', function() {
                        currentStatusFilter = this.dataset.status;
                        
                        // Update active button
                        document.querySelectorAll('.status-filter').forEach(b => {
                            b.classList.remove('border-blue-600', 'text-blue-600');
                            b.classList.add('border-transparent', 'text-gray-600', 'hover:text-gray-900');
                        });
                        this.classList.remove('border-transparent', 'text-gray-600', 'hover:text-gray-900');
                        this.classList.add('border-blue-600', 'text-blue-600');
                        
                        // Reload with new filter
                        displayApplications(currentStatusFilter);
                    });
                });

                // Highlight active menu
                if (typeof highlightActiveMenu === 'function') {
                    highlightActiveMenu();
                }
            });
        });
