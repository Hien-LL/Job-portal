        // Job page global variables
        let currentPage = 1;
        let totalPages = 1;
        let isLoading = false;
        let currentFilters = {
            keyword: '',
            locations: [],
            skills: [],
            benefits: [],
            salaryMin: null,
            salaryMax: null,
            isRemote: null,
            sortBy: 'publishedAt,desc'
        };

        // API data cache
        let filtersData = {
            locations: [],
            skills: [],
            benefits: []
        };

        // Load filter data from APIs
        async function loadFiltersData() {
            try {
                // Load locations
                const locationsUrl = buildApiUrl(API_CONFIG.LOCATIONS.LIST);
                const locationsResponse = await fetch(locationsUrl);
                const locationsResult = await locationsResponse.json();
                if (locationsResult.success) {
                    filtersData.locations = locationsResult.data;
                    displayLocationFilters();
                }

                // Load skills
                const skillsUrl = buildApiUrl(API_CONFIG.SKILLS.LIST);
                const skillsResponse = await fetch(skillsUrl);
                const skillsResult = await skillsResponse.json();
                if (skillsResult.success) {
                    filtersData.skills = skillsResult.data;
                    displaySkillsFilters();
                }

                // Load benefits
                const benefitsUrl = buildApiUrl(API_CONFIG.BENEFITS.LIST);
                const benefitsResponse = await fetch(benefitsUrl);
                const benefitsResult = await benefitsResponse.json();
                if (benefitsResult.success) {
                    filtersData.benefits = benefitsResult.data;
                    displayBenefitsFilters();
                }
            } catch (error) {
                console.error('Error loading filters data:', error);
            }
        }

        // Display location filters
        function displayLocationFilters() {
            const container = document.getElementById('location-filters');
            const majorCities = filtersData.locations.filter(loc => 
                ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'].includes(loc.city)
            );
            
            const html = `
                <label class="flex items-center text-sm text-gray-700">
                    <input type="checkbox" value="remote" class="mr-2 rounded location-filter"> Remote
                </label>
                ${majorCities.map(location => `
                    <label class="flex items-center text-sm text-gray-700">
                        <input type="checkbox" value="${location.id}" class="mr-2 rounded location-filter"> 
                        ${location.displayName}
                    </label>
                `).join('')}
            `;
            container.innerHTML = html;

            // Add event listeners
            container.querySelectorAll('.location-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateLocationFilter);
            });
        }

        // Display skills filters with search
        function displaySkillsFilters() {
            const container = document.getElementById('skills-filters');
            const popularSkills = filtersData.skills.slice(0, 10); // Show first 10 skills initially
            
            displayFilteredSkills(popularSkills);

            // Add search functionality
            const searchInput = document.getElementById('skills-search');
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredSkills = filtersData.skills.filter(skill => 
                    skill.name.toLowerCase().includes(searchTerm)
                );
                displayFilteredSkills(filteredSkills.slice(0, 20)); // Limit to 20 results
            });
        }

        function displayFilteredSkills(skills) {
            const container = document.getElementById('skills-filters');
            const html = skills.map(skill => `
                <label class="flex items-center text-sm text-gray-700">
                    <input type="checkbox" value="${skill.id}" class="mr-2 rounded skill-filter"> 
                    ${skill.name}
                </label>
            `).join('');
            container.innerHTML = html;

            // Add event listeners
            container.querySelectorAll('.skill-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateSkillsFilter);
            });
        }

        // Display benefits filters
        function displayBenefitsFilters() {
            const container = document.getElementById('benefits-filters');
            const popularBenefits = filtersData.benefits.slice(0, 15); // Show first 15 benefits
            
            const html = popularBenefits.map(benefit => `
                <label class="flex items-center text-sm text-gray-700">
                    <input type="checkbox" value="${benefit.id}" class="mr-2 rounded benefit-filter"> 
                    ${benefit.name}
                </label>
            `).join('');
            container.innerHTML = html;

            // Add event listeners
            container.querySelectorAll('.benefit-filter').forEach(checkbox => {
                checkbox.addEventListener('change', updateBenefitsFilter);
            });
        }

        // Filter update functions
        function updateLocationFilter() {
            const selectedLocations = Array.from(document.querySelectorAll('.location-filter:checked'))
                .map(cb => cb.value);
            currentFilters.locations = selectedLocations;
            searchJobs();
        }

        function updateSkillsFilter() {
            const selectedSkills = Array.from(document.querySelectorAll('.skill-filter:checked'))
                .map(cb => cb.value);
            currentFilters.skills = selectedSkills;
            searchJobs();
        }

        function updateBenefitsFilter() {
            const selectedBenefits = Array.from(document.querySelectorAll('.benefit-filter:checked'))
                .map(cb => cb.value);
            currentFilters.benefits = selectedBenefits;
            searchJobs();
        }

        // Search jobs with filters
        async function searchJobs(page = 1) {
            if (isLoading) return;
            
            isLoading = true;
            currentPage = page;
            
            // Show loading state
            const jobsContainer = document.getElementById('job-listings');
            jobsContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p class="text-gray-600 text-sm mt-2">Đang tìm kiếm...</p>
                </div>
            `;

            try {
                const params = new URLSearchParams();
                params.append('page', page);
                params.append('perPage', 10);
                params.append('published', 'true');
                params.append('sort', currentFilters.sortBy);

                // Add filters
                if (currentFilters.keyword) {
                    params.append('keyword', currentFilters.keyword);
                }

                currentFilters.locations.forEach(loc => {
                    if (loc === 'remote') {
                        params.append('isRemote', 'true');
                    } else {
                        params.append('location.id[in][]', loc);
                    }
                });

                currentFilters.skills.forEach(skill => {
                    params.append('skills.id[in][]', skill);
                });

                currentFilters.benefits.forEach(benefit => {
                    params.append('benefits.id[in][]', benefit);
                });

                if (currentFilters.salaryMin) {
                    params.append('salaryMin[gte]', currentFilters.salaryMin);
                }

                const url = buildCompleteUrl(API_CONFIG.JOBS.LIST, {}, Object.fromEntries(params));
                const response = await fetch(url);
                const result = await response.json();

                if (result.success && result.data) {
                    displayJobs(result.data.content);
                    displayPagination(result.data);
                    updateJobCount(result.data.totalElements);
                } else {
                    showNoJobsMessage();
                }
            } catch (error) {
                console.error('Error searching jobs:', error);
                showErrorMessage();
            } finally {
                isLoading = false;
            }
        }

        // Display jobs
        function displayJobs(jobs) {
            const container = document.getElementById('job-listings');
            
            if (!jobs || jobs.length === 0) {
                showNoJobsMessage();
                return;
            }

            const html = jobs.map(job => {
                const salaryText = formatSalary(job.salaryMin, job.salaryMax);
                const locationText = job.isRemote ? 'Remote' : 
                    (job.location?.displayName || 'Không xác định');
                const publishedDate = formatPublishedDate(job.publishedAt);
                const companyLogo = job.company?.logoUrl;

                return `
                    <div class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                        <a href="job-detail.html?slug=${job.slug}" class="flex gap-4">
                            <div class="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                                ${companyLogo ? 
                                    `<img src="${window.APP_CONFIG.API_BASE + companyLogo}" alt="${job.company?.name}" class="w-full h-full object-contain rounded">` :
                                    `<span class="text-2xl">${getCategoryIcon(job.category?.name)}</span>`
                                }
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 class="font-bold text-gray-900">${job.title}</h3>
                                        <div class="flex items-center gap-1">
                                            <p class="text-gray-600 text-xs">${job.company?.name || 'Công ty không xác định'}</p>
                                            ${job.company?.verified ? 
                                                `<svg class="inline-block w-4 h-4 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20" title="Công ty đã xác thực">
                                                                                                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                                                                                </svg>` : 
                                                ''
                                            }
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-gray-600 text-xs">${publishedDate}</p>
                                        <button onclick="toggleSaveJob('${job.slug}', this)" class="text-gray-400 hover:text-red-500 text-lg save-job-btn" data-slug="${job.slug}">♡</button>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4 mb-3 text-xs text-gray-600">
                                    <span>📍 ${locationText}</span>
                                    <span>💰 ${salaryText}</span>
                                    <span>⏰ ${job.seniority || 'Toàn thời gian'}</span>
                                </div>
                                <div class="flex flex-wrap gap-2 mb-3">
                                    ${job.benefits ? job.benefits.slice(0, 3).map(benefit => 
                                        `<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">✓ ${benefit.name}</span>`
                                    ).join('') : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
        }

        // Utility functions (similar to index.html)
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

        function getCategoryIcon(categoryName) {
            // Same as index.html - return appropriate emoji based on category
            const categoryIcons = {
                'Digital Marketing': '📊',
                'Marketing': '📊', 
                'IT': '💻',
                'Technology': '💻',
                'Software': '⚙️',
                'Design': '🎨',
                'Sales': '🚀',
                'HR': '👔',
                'Finance': '💰',
                'Education': '🎓'
            };
            
            return categoryIcons[categoryName] || '🏢';
        }

        function displayPagination(data) {
            const container = document.getElementById('pagination');
            totalPages = data.totalPages;
            
            if (totalPages <= 1) {
                container.style.display = 'none';
                return;
            }

            let html = '';
            
            // Previous button
            if (currentPage > 1) {
                html += `<button onclick="searchJobs(${currentPage - 1})" class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Trước</button>`;
            }

            // Page numbers
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                if (i === currentPage) {
                    html += `<button class="px-3 py-2 bg-blue-600 text-white rounded text-sm">${i}</button>`;
                } else {
                    html += `<button onclick="searchJobs(${i})" class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">${i}</button>`;
                }
            }

            // Next button
            if (currentPage < totalPages) {
                html += `<button onclick="searchJobs(${currentPage + 1})" class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Tiếp</button>`;
            }

            container.innerHTML = html;
            container.style.display = 'flex';
        }

        function updateJobCount(total) {
            const countElement = document.querySelector('.text-sm.text-gray-600 span');
            if (countElement) {
                countElement.textContent = `${total} việc làm được tìm thấy`;
            }
        }

        function showNoJobsMessage() {
            const container = document.getElementById('job-listings');
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-600 text-sm">Không tìm thấy việc làm phù hợp</p>
                    <button onclick="clearAllFilters()" class="mt-2 text-blue-600 text-sm hover:underline">
                        Xóa bộ lọc
                    </button>
                </div>
            `;
        }

        function showErrorMessage() {
            const container = document.getElementById('job-listings');
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600 text-sm">Lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
                    <button onclick="searchJobs()" class="mt-2 text-blue-600 text-sm hover:underline">
                        Thử lại
                    </button>
                </div>
            `;
        }

        function viewJobDetail(slug, jobId) {
            console.log(`View job detail: ${slug} (ID: ${jobId})`);
            // TODO: Implement job detail page
            alert(`Tính năng xem chi tiết việc làm "${slug}" sẽ được triển khai soon!`);
        }

        function clearAllFilters() {
            // Reset all filters
            currentFilters = {
                keyword: '',
                locations: [],
                skills: [],
                benefits: [],
                salaryMin: null,
                salaryMax: null,
                isRemote: null,
                sortBy: 'publishedAt,desc'
            };

            // Clear all checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            
            // Clear search inputs
            document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
            
            // Reset sort dropdown
            document.querySelector('select').selectedIndex = 0;

            // Search again
            searchJobs(1);
        }

        // Save/Unsave job functionality
        async function toggleSaveJob(slug, buttonElement) {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert('Vui lòng đăng nhập để lưu việc làm');
                window.location.href = 'login.html';
                return;
            }

            try {
                const isSaved = buttonElement.classList.contains('text-red-500');
                const method = isSaved ? 'DELETE' : 'POST';
                const endpoint = isSaved ? `/jobs/${slug}/unsave` : `/jobs/${slug}/save`;

                const response = await window.authUtils.apiRequest(endpoint, {
                    method: method
                });

                if (response && response.ok) {
                    // Toggle button state
                    if (isSaved) {
                        buttonElement.classList.remove('text-red-500');
                        buttonElement.classList.add('text-gray-400');
                        buttonElement.textContent = '♡';
                        buttonElement.title = 'Lưu việc làm';
                    } else {
                        buttonElement.classList.remove('text-gray-400');
                        buttonElement.classList.add('text-red-500');
                        buttonElement.textContent = '♥';
                        buttonElement.title = 'Bỏ lưu việc làm';
                    }
                } else {
                    throw new Error('Failed to save/unsave job');
                }
            } catch (error) {
                console.error('Error saving/unsaving job:', error);
                alert('Có lỗi xảy ra khi lưu việc làm');
            }
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', () => {
            loadFiltersData();
            searchJobs(1);

            // Add search functionality
            const searchInputs = document.querySelectorAll('input[placeholder*="từ khóa"]');
            searchInputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    currentFilters.keyword = e.target.value;
                });
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        searchJobs(1);
                    }
                });
            });

            // Add search button functionality
            document.querySelectorAll('button').forEach(btn => {
                if (btn.textContent.includes('Tìm kiếm')) {
                    btn.addEventListener('click', () => searchJobs(1));
                }
                if (btn.textContent.includes('Áp dụng bộ lọc')) {
                    btn.addEventListener('click', () => searchJobs(1));
                }
            });

            // Add sort functionality
            const sortSelect = document.querySelector('select');
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    const value = e.target.value;
                    if (value.includes('Mới nhất')) currentFilters.sortBy = 'publishedAt,desc';
                    else if (value.includes('Lương cao')) currentFilters.sortBy = 'salaryMax,desc';
                    else if (value.includes('Lương thấp')) currentFilters.sortBy = 'salaryMin,asc';
                    else if (value.includes('Phù hợp')) currentFilters.sortBy = 'title,asc';
                    
                    searchJobs(1);
                });
            }
        });

