let currentCompany = null;
        let companyJobs = [];
        let isFollowing = false;

        // Get company slug from URL
        function getCompanySlugFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('slug');
        }

        // Load company detail
        async function loadCompanyDetail() {
            const companySlug = getCompanySlugFromURL();
            
            if (!companySlug) {
                showError('Không tìm thấy thông tin công ty');
                return;
            }

            try {
                const url = buildApiUrl(API_CONFIG.COMPANIES.GET_DETAIL, { slug: companySlug });
                const response = await fetch(url);
                
                if (!response.ok) {
                    console.error('API error:', response.status, response.statusText);
                    showError('Lỗi khi tải thông tin công ty');
                    return;
                }
                
                const result = await response.json();

                if (result.success && result.data) {
                    currentCompany = result.data;
                    displayCompanyDetail(result.data);
                    loadCompanyJobs(result.data.id);
                    
                    // Check follow status if user is authenticated - ✅ SỬA
                    if (authService.isAuthenticated()) {
                        checkFollowStatus(result.data.id);
                    }
                    
                    hideLoading();
                } else {
                    console.error('Invalid API response:', result);
                    showError('Không tìm thấy công ty này');
                }
            } catch (error) {
                console.error('Error loading company detail:', error);
                showError('Lỗi khi tải thông tin công ty');
            }
        }

        // Display company detail
        function displayCompanyDetail(company) {
            // Update page title
            document.title = `${company.name} - JobPortal`;

            // Company header
            document.getElementById('company-name').textContent = company.name;
            
            if (company.verified) {
                document.getElementById('company-verified').classList.remove('hidden');
            }

            // Company logo - ✅ SỬA
            const logoElement = document.getElementById('company-logo');
            if (company.logoUrl) {
                logoElement.innerHTML = `<img src="${API_CONFIG.FILE_BASE_URL}${company.logoUrl}" alt="${company.name}" class="w-full h-full object-contain rounded-lg">`;
            } else {
                logoElement.innerHTML = `<span class="text-4xl">🏢</span>`;
            }

            // Company info
            const companySizeText = formatCompanySize(company.size_min, company.size_max);
            document.getElementById('company-size').textContent = companySizeText;
            document.getElementById('company-followers').textContent = `${company.followerCount} người theo dõi`;

            // Website
            if (company.website) {
                const websiteLink = document.getElementById('company-website');
                websiteLink.href = company.website.startsWith('http') ? company.website : `https://${company.website}`;
                websiteLink.textContent = company.website;
            } else {
                document.getElementById('company-website-container').style.display = 'none';
            }

            // Company description
            document.getElementById('company-description').textContent = company.description || 'Chưa có mô tả công ty.';

            // Sidebar info
            document.getElementById('sidebar-company-size').textContent = companySizeText;
            document.getElementById('sidebar-followers').textContent = `${company.followerCount} người`;
            
            if (company.website) {
                const sidebarWebsiteLink = document.getElementById('sidebar-website');
                sidebarWebsiteLink.href = company.website.startsWith('http') ? company.website : `https://${company.website}`;
                sidebarWebsiteLink.textContent = company.website;
            } else {
                document.getElementById('sidebar-website-container').style.display = 'none';
            }
        }

        // Load company jobs
        async function loadCompanyJobs(companyId) {
            try {
                const url = buildApiUrl(API_CONFIG.JOBS.GET_BY_COMPANY, { companyId });
                const response = await fetch(url);
                const result = await response.json();

                if (result.success && result.data) {
                    companyJobs = result.data.content;
                    displayCompanyJobs(result.data.content);
                    updateJobsCount(result.data.totalElements);
                } else {
                    showNoJobs();
                }
            } catch (error) {
                console.error('Error loading company jobs:', error);
                showNoJobs();
            } finally {
                hideJobsLoading();
            }
        }

        // Display company jobs
        function displayCompanyJobs(jobs) {
            const jobsList = document.getElementById('jobs-list');
            const noJobsElement = document.getElementById('no-jobs');

            if (!jobs || jobs.length === 0) {
                hideElement(jobsList);
                showElement(noJobsElement);
                return;
            }

            hideElement(noJobsElement);
            showElement(jobsList);

            jobsList.innerHTML = jobs.map(job => {
                const salaryText = formatSalary(job.salaryMin, job.salaryMax);
                const locationText = job.isRemote ? 'Remote' : job.location?.displayName || 'Không xác định';
                const publishedDate = formatPublishedDate(job.publishedAt);

                return `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <h3 class="font-semibold text-gray-900 mb-1">${job.title}</h3>
                                <div class="flex items-center gap-4 text-sm text-gray-600">
                                    <span>💰 ${salaryText}</span>
                                    <span>📍 ${locationText}</span>
                                    <span>⏰ ${publishedDate}</span>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <a href="job-detail.html?slug=${job.slug}" class="text-blue-600 text-sm font-medium hover:underline">
                                    Xem chi tiết
                                </a>
                            </div>
                        </div>
                        
                        <div class="text-gray-600 text-sm mb-3 line-clamp-2">
                            ${job.description || 'Chưa có mô tả công việc'}
                        </div>

                        ${job.benefits && job.benefits.length > 0 ? `
                            <div class="flex flex-wrap gap-1">
                                ${job.benefits.slice(0, 3).map(benefit => `
                                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">✓ ${benefit.name}</span>
                                `).join('')}
                                ${job.benefits.length > 3 ? `<span class="text-gray-500 text-xs">+${job.benefits.length - 3} khác</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        // Utility functions - Delegated to markdown-service.js
        // These are wrappers for markdown-service functions to maintain backward compatibility
        const formatCompanySize = formatCompanySizeDisplay;
        const formatSalary = formatSalaryRange;
        const formatPublishedDate = formatPublishedDateRelative;

        function updateJobsCount(count) {
            document.getElementById('jobs-count').textContent = `${count} việc làm`;
        }

        function hideLoading() {
            hideElement('loading-container');
            showElement('company-detail-container');
        }

        function hideJobsLoading() {
            hideElement('jobs-loading');
        }

        function showNoJobs() {
            hideElement('jobs-loading');
            hideElement('jobs-list');
            showElement('no-jobs');
        }

        function showError(message) {
            hideElement('loading-container');
            showElement('error-container');
            
            const errorTitle = document.querySelector('#error-container h2');
            const errorText = document.querySelector('#error-container p');
            
            if (message === 'Không tìm thấy thông tin công ty') {
                errorTitle.textContent = 'Thiếu thông tin';
                errorText.textContent = 'Vui lòng truy cập từ danh sách công ty để xem chi tiết.';
            } else {
                errorTitle.textContent = 'Có lỗi xảy ra';
                errorText.textContent = message;
            }
        }

        // Follow company - ✅ ĐÃ SỬA
        async function followCompany() {
            // ✅ SỬA: Dùng authService.requireAuth()
            if (!authService.isAuthenticated()) {
                showErrorNotification('Vui lòng đăng nhập để theo dõi công ty', 4000);
                setTimeout(() => authService.requireAuth(), 1000);
                return;
            }

            if (!currentCompany) return;

            try {
                const url = buildApiUrl(API_CONFIG.FOLLOW_COMPANY.FOLLOW, { companyId: currentCompany.id });
                
                // ✅ SỬA: Dùng authService.apiRequest() thay vì fetch trực tiếp
                const response = await authService.apiRequest(url, {
                    method: 'POST'
                });

                if (!response || !response.ok) {
                    throw new Error('Failed to follow company');
                }

                const result = await response.json();

                if (result.success) {
                    isFollowing = true;
                    updateFollowButton();
                    showSuccessNotification(result.message || 'Theo dõi công ty thành công', 4000);
                } else {
                    showErrorNotification(result.message || 'Lỗi khi theo dõi công ty', 4000);
                }
            } catch (error) {
                console.error('Error following company:', error);
                showErrorNotification('Lỗi khi theo dõi công ty', 4000);
            }
        }

        // Unfollow company - ✅ ĐÃ SỬA
        async function unfollowCompany() {
            // ✅ SỬA: Dùng authService.isAuthenticated()
            if (!authService.isAuthenticated()) {
                showErrorNotification('Vui lòng đăng nhập', 4000);
                return;
            }

            if (!currentCompany) return;

            try {
                const url = buildApiUrl(API_CONFIG.FOLLOW_COMPANY.UNFOLLOW, { companyId: currentCompany.id });
                
                // ✅ SỬA: Dùng authService.apiRequest() thay vì fetch trực tiếp
                const response = await authService.apiRequest(url, {
                    method: 'DELETE'
                });

                if (!response || !response.ok) {
                    throw new Error('Failed to unfollow company');
                }

                const result = await response.json();

                if (result.success) {
                    isFollowing = false;
                    updateFollowButton();
                    showSuccessNotification(result.message || 'Bỏ theo dõi công ty thành công', 4000);
                } else {
                    showErrorNotification(result.message || 'Lỗi khi bỏ theo dõi công ty', 4000);
                }
            } catch (error) {
                console.error('Error unfollowing company:', error);
                showErrorNotification('Lỗi khi bỏ theo dõi công ty', 4000);
            }
        }

        // Check if user is following company - ✅ ĐÃ SỬA
        async function checkFollowStatus(companyId) {
            try {
                const url = buildApiUrl(API_CONFIG.FOLLOW_COMPANY.CHECK_STATUS, { companyId });
                
                // ✅ SỬA: Dùng authService.apiRequest() thay vì fetch trực tiếp
                const response = await authService.apiRequest(url, {
                    method: 'GET'
                });

                if (!response || !response.ok) return;

                const result = await response.json();

                if (result.success && result.data !== undefined) {
                    isFollowing = result.data;
                    updateFollowButton();
                }
            } catch (error) {
                console.error('Error checking follow status:', error);
            }
        }

        // Update follow button state
        function updateFollowButton() {
            const followBtn = document.getElementById('follow-btn');
            if (isFollowing) {
                followBtn.textContent = '✓ Đã theo dõi';
                followBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                followBtn.classList.add('bg-gray-400', 'hover:bg-gray-500');
                followBtn.onclick = unfollowCompany;
            } else {
                followBtn.textContent = '+ Theo dõi';
                followBtn.classList.remove('bg-gray-400', 'hover:bg-gray-500');
                followBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                followBtn.onclick = followCompany;
            }
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', () => {
            loadFragments().then(() => {
                loadCompanyDetail();
            });
        });
