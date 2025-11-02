// Load featured jobs from API
        async function loadFeaturedJobs() {
            try {
                const url = buildCompleteUrl(API_CONFIG.JOBS.LIST, {}, { sort: 'title,desc', published: true, page: 1 });
                const response = await fetch(url);
                const result = await response.json();
                
                if (result.success && result.data && result.data.content) {
                    displayFeaturedJobs(result.data.content);
                } else {
                    showJobsError('Không thể tải việc làm nổi bật');
                }
            } catch (error) {
                console.error('Error loading featured jobs:', error);
                showJobsError('Lỗi kết nối. Vui lòng thử lại sau.');
            }
        }

        function displayFeaturedJobs(jobs) {
            const grid = document.getElementById('featured-jobs-grid');
            
            if (!jobs || jobs.length === 0) {
                grid.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-600 text-sm">Hiện tại chưa có việc làm nổi bật</p>
                    </div>
                `;
                return;
            }

            // Show max 6 jobs on homepage
            const displayJobs = jobs.slice(0, 6);
            
            grid.innerHTML = displayJobs.map(job => {
                // Format salary
                const salaryText = formatSalary(job.salaryMin, job.salaryMax);
                
                // Format location
                const locationText = job.isRemote ? 'Remote' : 
                    (job.location?.displayName || 'Không xác định');
                
                // Format published date
                const publishedDate = formatPublishedDate(job.publishedAt);
                
                // Get company logo or use default
                const companyLogo = job.company?.logoUrl;

                return `
                    <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                        <div class="flex gap-4">
                            <!-- Company Logo (circular) -->
                            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                ${companyLogo ? 
                                    `<img src="${window.APP_CONFIG.API_BASE + companyLogo}" alt="${job.company?.name}" class="w-full h-full object-cover">` :
                                    `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>`
                                }
                            </div>
                            
                            <!-- Job Info -->
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-gray-900 text-base mb-1 truncate">${job.title}</h3>
                                <div class="flex items-center gap-2 mb-2">
                                    <p class="text-gray-600 text-sm">${job.company?.name || 'Công ty không xác định'}</p>
                                    ${job.company?.verified ? 
                                        '<svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Công ty đã xác thực"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' : 
                                        ''
                                    }
                                </div>
                                
                                <!-- Job Details -->
                                <div class="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                                    <div class="flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        <span>${locationText}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <span>${salaryText}</span>
                                    </div>
                                    ${job.employmentType ? 
                                        `<div class="flex items-center gap-1">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                            </svg>
                                            <span>${job.employmentType}</span>
                                        </div>` : 
                                        ''
                                    }
                                    <div class="flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <span>${publishedDate}</span>
                                    </div>
                                </div>
                                
                                <!-- Action Button -->
                                <a href="job-detail.html?slug=${job.slug}" class="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                    Xem chi tiết →
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
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

        function getDefaultCompanyIcon(categoryName) {
            if (!categoryName) return '🏢';
            
            const categoryIcons = {
                'Digital Marketing': '📊',
                'Marketing': '📊', 
                'IT': '💻',
                'Technology': '💻',
                'Software': '⚙️',
                'Design': '🎨',
                'Sales': '🚀',
                'HR': '📱',
                'Finance': '💰',
                'Education': '🎓'
            };
            
            return categoryIcons[categoryName] || '🏢';
        }

        function applyToJob(slug, jobId) {
            // Check if user is logged in
            const token = localStorage.getItem('authToken');
            if (!token) {
                showErrorToast('Vui lòng đăng nhập để ứng tuyển', 3000);
                window.location.href = 'login.html';
                return;
            }
            
            // Redirect to job detail page or application form
            console.log(`Apply to job: ${slug} (ID: ${jobId})`);
            // TODO: Implement job application logic
            showErrorToast(`Tính năng ứng tuyển sẽ được triển khai sớm`, 3000);
        }

        function showJobsError(message) {
            const grid = document.getElementById('featured-jobs-grid');
            grid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-600 text-sm">${message}</p>
                    <button onclick="loadFeaturedJobs()" class="mt-2 text-blue-600 text-sm hover:underline">
                        Thử lại
                    </button>
                </div>
            `;
        }