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
                const result = await response.json();

                if (result.success && result.data) {
                    currentCompany = result.data;
                    displayCompanyDetail(result.data);
                    loadCompanyJobs(result.data.id);
                    
                    // Check follow status if user is authenticated
                    if (authService.isAuthenticated()) {
                        checkFollowStatus(result.data.id);
                    }
                    
                    hideLoading();
                } else {
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

            // Company logo
            const logoElement = document.getElementById('company-logo');
            if (company.logoUrl) {
                logoElement.innerHTML = `<img src="${window.APP_CONFIG.API_BASE + company.logoUrl}" alt="${company.name}" class="w-full h-full object-contain rounded-lg">`;
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
                jobsList.classList.add('hidden');
                noJobsElement.classList.remove('hidden');
                return;
            }

            noJobsElement.classList.add('hidden');
            jobsList.classList.remove('hidden');

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

        // Utility functions
        function formatCompanySize(sizeMin, sizeMax) {
            if (!sizeMin && !sizeMax) return 'Quy mô không xác định';
            if (sizeMin === 0 && sizeMax === 0) return 'Quy mô không xác định';
            
            if (sizeMin && sizeMax) {
                if (sizeMin === sizeMax) {
                    return `${sizeMin} nhân viên`;
                }
                return `${sizeMin} - ${sizeMax} nhân viên`;
            } else if (sizeMin) {
                return `Từ ${sizeMin} nhân viên`;
            } else {
                return `Lên đến ${sizeMax} nhân viên`;
            }
        }

        function formatSalary(min, max) {
            if (!min && !max) return 'Thỏa thuận';
            
            const formatAmount = (amount) => {
                if (amount >= 1000000) {
                    return (amount / 1000000).toFixed(0) + ' triệu';
                }
                return amount.toLocaleString('vi-VN');
            };

            if (min && max) {
                return `${formatAmount(min)} - ${formatAmount(max)}`;
            } else if (min) {
                return `Từ ${formatAmount(min)}`;
            } else {
                return `Lên đến ${formatAmount(max)}`;
            }
        }

        function formatPublishedDate(dateString) {
            if (!dateString) return 'Không xác định';
            
            const publishedDate = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - publishedDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Đăng hôm qua';
            if (diffDays < 7) return `Đăng ${diffDays} ngày trước`;
            if (diffDays < 30) return `Đăng ${Math.ceil(diffDays / 7)} tuần trước`;
            return `Đăng ${Math.ceil(diffDays / 30)} tháng trước`;
        }

        function updateJobsCount(count) {
            document.getElementById('jobs-count').textContent = `${count} việc làm`;
        }

        function hideLoading() {
            document.getElementById('loading-container').style.display = 'none';
            document.getElementById('company-detail-container').style.display = 'block';
        }

        function hideJobsLoading() {
            document.getElementById('jobs-loading').classList.add('hidden');
        }

        function showNoJobs() {
            document.getElementById('jobs-loading').classList.add('hidden');
            document.getElementById('jobs-list').classList.add('hidden');
            document.getElementById('no-jobs').classList.remove('hidden');
        }

        function showError(message) {
            document.getElementById('loading-container').style.display = 'none';
            document.getElementById('error-container').style.display = 'block';
            
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

        // Follow company
        async function followCompany() {
            if (!authService.isAuthenticated()) {
                alert('Vui lòng đăng nhập để theo dõi công ty');
                window.location.href = 'login.html';
                return;
            }

            if (!currentCompany) return;

            try {
                const url = buildApiUrl(API_CONFIG.FOLLOW_COMPANY.FOLLOW, { companyId: currentCompany.id });
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    isFollowing = true;
                    updateFollowButton();
                    alert(result.message || 'Theo dõi công ty thành công');
                } else {
                    alert(result.message || 'Lỗi khi theo dõi công ty');
                }
            } catch (error) {
                console.error('Error following company:', error);
                alert('Lỗi khi theo dõi công ty');
            }
        }

        // Unfollow company
        async function unfollowCompany() {
            if (!authService.isAuthenticated()) {
                alert('Vui lòng đăng nhập');
                return;
            }

            if (!currentCompany) return;

            try {
                const url = buildApiUrl(API_CONFIG.FOLLOW_COMPANY.UNFOLLOW, { companyId: currentCompany.id });
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    isFollowing = false;
                    updateFollowButton();
                    alert(result.message || 'Bỏ theo dõi công ty thành công');
                } else {
                    alert(result.message || 'Lỗi khi bỏ theo dõi công ty');
                }
            } catch (error) {
                console.error('Error unfollowing company:', error);
                alert('Lỗi khi bỏ theo dõi công ty');
            }
        }

        // Check if user is following company
        async function checkFollowStatus(companyId) {
            try {
                const url = buildApiUrl(API_CONFIG.FOLLOW_COMPANY.CHECK_STATUS, { companyId });
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

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
