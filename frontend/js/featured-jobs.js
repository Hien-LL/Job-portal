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
                    <div class="col-span-full text-center py-8">
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
                    <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
                        <div class="flex gap-4 mb-4">
                            <div class="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                                ${companyLogo ? 
                                    `<img src="${window.APP_CONFIG.API_BASE + companyLogo}" alt="${job.company?.name}" class="w-full h-full object-contain rounded">` :
                                    `<span class="text-xl">${getDefaultCompanyIcon(job.category?.name)}</span>`
                                }
                            </div>
                            <div class="flex-1">
                                <h3 class="font-semibold text-gray-900 text-sm">${job.title}</h3>
                                <p class="text-gray-600 text-xs">${job.company?.name || 'Công ty không xác định'}</p>
                                ${job.company?.verified ? 
                                    '<span class="inline-block w-3 h-3 bg-blue-500 rounded-full ml-1" title="Công ty đã xác thực"></span>' : 
                                    ''
                                }
                            </div>
                        </div>
                        <div class="mb-3">
                            <p class="text-gray-600 text-xs mb-2">💰 ${salaryText}</p>
                            <p class="text-gray-600 text-xs mb-2">📍 ${locationText}</p>
                            <p class="text-gray-600 text-xs">⏰ ${publishedDate}</p>
                            ${job.seniority ? 
                                `<p class="text-gray-600 text-xs">👔 ${job.seniority}</p>` : 
                                ''
                            }
                        </div>
                        <div class="flex gap-2">
                            <a href="job-detail.html?slug=${job.slug}" class="flex-1 btn-outline text-sm py-2 text-center">
                                Chi tiết
                            </a>
                            <button class="flex-1 btn-primary text-sm py-2" onclick="applyToJob('${job.slug}', ${job.id})">
                                Ứng tuyển
                            </button>
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