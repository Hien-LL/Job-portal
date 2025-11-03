let followedCompanies = [];

        // Load followed companies - ✅ ĐÃ SỬA
        async function loadFollowedCompanies() {
            try {
                showElement('loading');
                hideElement('content');
                hideElement('error-state');

                // ✅ SỬA: Dùng authService.requireAuth()
                if (!authService.requireAuth()) {
                    return;
                }

                const url = buildApiUrl(API_CONFIG.FOLLOW_COMPANY.LIST_FOLLOWED);
                
                // ✅ SỬA: Dùng authService.apiRequest()
                const response = await authService.apiRequest(url, {
                    method: 'GET'
                });

                if (!response || !response.ok) {
                    throw new Error('Failed to load followed companies');
                }

                const result = await response.json();
                if (result.success && result.data) {
                    followedCompanies = result.data;
                    displayFollowedCompanies();
                    
                    hideElement('loading');
                    showElement('content');
                } else {
                    throw new Error('Invalid response');
                }
            } catch (error) {
                console.error('Error loading followed companies:', error);
                hideElement('loading');
                showElement('error-state');
            }
        }

        // Display followed companies
        function displayFollowedCompanies() {
            const container = document.getElementById('companies-container');
            const emptyState = document.getElementById('empty-state');

            if (followedCompanies.length === 0) {
                hideElement(container);
                showElement(emptyState);
                return;
            }

            showElement(container);
            hideElement(emptyState);

            container.innerHTML = followedCompanies.map(company => {
                // ✅ SỬA: Dùng API_CONFIG.FILE_BASE_URL
                const logoUrl = company.logoUrl ? 
                    `${API_CONFIG.FILE_BASE_URL}${company.logoUrl}` : 
                    'https://via.placeholder.com/200/6B7280/FFFFFF?text=No+Logo';
                
                return `
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                        <!-- Company Logo -->
                        <div class="mb-4">
                            <img src="${logoUrl}" alt="${company.name}" class="w-full h-40 object-cover rounded-lg bg-gray-100" onerror="this.src='https://via.placeholder.com/200/6B7280/FFFFFF?text=No+Logo'">
                        </div>

                        <!-- Company Info -->
                        <div class="mb-4">
                            <div class="flex items-center gap-2 mb-2">
                                <h3 class="font-semibold text-gray-900 text-lg">${company.name}</h3>
                                ${company.verified ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>Đã xác thực</span>' : ''}
                            </div>
                            <p class="text-gray-600 text-sm">Slug: ${company.slug}</p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-2">
                            <a href="company-detail.html?slug=${company.slug}" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition text-center">
                                Xem chi tiết
                            </a>
                            <button onclick="unfollowCompany(${company.id}, this)" class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm font-medium hover:bg-gray-300 transition">
                                Bỏ theo dõi
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Unfollow company - ✅ ĐÃ SỬA
        async function unfollowCompany(companyId, buttonElement) {
            try {
                if (!confirm('Bạn có chắc chắn muốn bỏ theo dõi công ty này?')) {
                    return;
                }

                const url = buildApiUrl(API_CONFIG.FOLLOW_COMPANY.UNFOLLOW, { companyId });
                
                // ✅ SỬA: Dùng authService.apiRequest()
                const response = await authService.apiRequest(url, {
                    method: 'DELETE'
                });

                if (!response || !response.ok) {
                    throw new Error('Failed to unfollow company');
                }

                const result = await response.json();
                if (result.success) {
                    showSuccessToast('Bỏ theo dõi công ty thành công ✓', 2000);
                    // Reload companies list
                    loadFollowedCompanies();
                } else {
                    showErrorToast('Lỗi khi bỏ theo dõi công ty', 3000);
                }
            } catch (error) {
                console.error('Error unfollowing company:', error);
                showErrorToast('Lỗi khi bỏ theo dõi công ty', 3000);
            }
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', () => {
            loadFragments().then(() => {
                loadFollowedCompanies();

                // Highlight active menu
                if (typeof highlightActiveMenu === 'function') {
                    highlightActiveMenu();
                }
            });
        });
