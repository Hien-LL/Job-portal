        let isLoading = false;
        let currentFilters = {
            keyword: '',
            size: '',
            verified: false,
            sort: 'followerCount,desc'
        };

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadFragments().then(() => {
                loadFiltersFromUrl();
                loadCompanies();
                setupEventListeners();
            });
        });

        function setupEventListeners() {
            // Search input
            document.getElementById('search-company').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchCompanies();
                }
            });

            // Sort change
            document.getElementById('sort-companies').addEventListener('change', function() {
                currentFilters.sort = this.value;
                loadCompanies();
            });

            // Filter change
            document.getElementById('filter-verified').addEventListener('change', function() {
                currentFilters.verified = this.checked;
                loadCompanies();
            });

            // Size filter change
            document.getElementById('filter-size').addEventListener('change', function() {
                currentFilters.size = this.value;
                loadCompanies();
            });
        }

        // Load filters from URL parameters
        function loadFiltersFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            
            if (urlParams.has('keyword')) {
                currentFilters.keyword = urlParams.get('keyword');
                document.getElementById('search-company').value = currentFilters.keyword;
            }
            
            if (urlParams.has('size')) {
                currentFilters.size = urlParams.get('size');
                document.getElementById('filter-size').value = currentFilters.size;
            }
            
            if (urlParams.has('verified')) {
                currentFilters.verified = urlParams.get('verified') === 'true';
                document.getElementById('filter-verified').checked = currentFilters.verified;
            }
            
            if (urlParams.has('sort')) {
                currentFilters.sort = urlParams.get('sort');
                document.getElementById('sort-companies').value = currentFilters.sort;
            }
        }

        // Update URL with current filters
        function updateUrlWithFilters() {
            const params = new URLSearchParams();
            
            if (currentFilters.keyword) {
                params.set('keyword', currentFilters.keyword);
            }
            
            if (currentFilters.size) {
                params.set('size', currentFilters.size);
            }
            
            if (currentFilters.verified) {
                params.set('verified', 'true');
            }
            
            if (currentFilters.sort && currentFilters.sort !== 'followerCount,desc') {
                params.set('sort', currentFilters.sort);
            }
            
            const newUrl = params.toString() ? 
                `${window.location.pathname}?${params.toString()}` : 
                window.location.pathname;
            
            window.history.pushState({}, '', newUrl);
        }

        // Load companies
        async function loadCompanies() {
            if (isLoading) return;
            
            isLoading = true;
            showLoading();

            // Update URL with current filters
            updateUrlWithFilters();

            try {
                const queryParams = {
                    sort: currentFilters.sort
                };

                if (currentFilters.keyword) {
                    queryParams.keyword = currentFilters.keyword;
                }

                if (currentFilters.verified) {
                    queryParams.verified = 'true';
                }

                const url = buildCompleteUrl(API_CONFIG.COMPANIES.LIST, {}, queryParams);
                const response = await fetch(url);
                const result = await response.json();

                if (result.success && result.data) {
                    displayCompanies(result.data);
                    updateCompanyCount(result.data.length);
                    hideLoading();
                } else {
                    showError();
                }
            } catch (error) {
                console.error('Error loading companies:', error);
                showError();
            } finally {
                isLoading = false;
            }
        }

        // Display companies
        function displayCompanies(companies) {
            const grid = document.getElementById('companies-grid');
            const emptyState = document.getElementById('empty-state');

            // Filter by size if selected
            let filteredCompanies = companies;
            if (currentFilters.size) {
                filteredCompanies = filterCompaniesBySize(companies, currentFilters.size);
            }

            if (!filteredCompanies || filteredCompanies.length === 0) {
                grid.classList.add('hidden');
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            grid.classList.remove('hidden');

            grid.innerHTML = filteredCompanies.map(company => {
                const logoUrl = company.logoUrl ? 
                    window.APP_CONFIG.API_BASE + company.logoUrl : null;
                const companySizeText = formatCompanySize(company.size_min, company.size_max);

                return `
                    <div class="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all group">
                        <a href="company-detail.html?slug=${company.slug}" class="block">
                            <div class="flex items-start gap-4 mb-4">
                                <div class="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex-shrink-0 flex items-center justify-center p-3 group-hover:scale-105 transition-transform">
                                    ${logoUrl ? 
                                        `<img src="${logoUrl}" alt="${company.name}" class="w-full h-full object-contain">` :
                                        `<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                        </svg>`
                                    }
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-2">
                                        <h3 class="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">${company.name}</h3>
                                        ${company.verified ? 
                                            '<svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Công ty đã xác thực"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' : 
                                            ''
                                        }
                                    </div>
                                    <p class="text-gray-600 text-sm mb-1 flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                        </svg>
                                        <span>${companySizeText}</span>
                                    </p>
                                    <p class="text-gray-600 text-sm flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                        <span>${company.followerCount} người theo dõi</span>
                                    </p>
                                </div>
                            </div>

                            <div class="mb-4">
                                <p class="text-gray-600 text-sm line-clamp-3">${company.description || 'Chưa có mô tả công ty'}</p>
                            </div>
                        </a>

                        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                ${company.website ? 
                                    `<a href="${company.website}" target="_blank" class="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                                        </svg>
                                        <span class="truncate max-w-[150px]">${company.website.replace('https://', '').replace('http://', '')}</span>
                                    </a>` : 
                                    '<span class="text-gray-400">Chưa có website</span>'
                                }
                            </div>
                            <div class="flex gap-2">
                                ${authService.isAuthenticated() ? 
                                    `<button onclick="toggleFollowCompany(event, ${company.id})" class="text-sm px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all font-medium follow-btn-${company.id}">
                                        + Theo dõi
                                    </button>` : 
                                    ''
                                }
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            updateCompanyCount(filteredCompanies.length);

            // Check follow status for each company if user is authenticated
            if (authService.isAuthenticated()) {
                filteredCompanies.forEach(company => {
                    checkCompanyFollowStatus(company.id);
                });
            }
        }

        // Search companies
        function searchCompanies() {
            currentFilters.keyword = document.getElementById('search-company').value;
            currentFilters.size = document.getElementById('filter-size').value;
            currentFilters.verified = document.getElementById('filter-verified').checked;
            loadCompanies();
        }

        // Clear filters
        function clearFilters() {
            document.getElementById('search-company').value = '';
            document.getElementById('filter-size').selectedIndex = 0;
            document.getElementById('filter-verified').checked = false;
            document.getElementById('sort-companies').selectedIndex = 0;

            currentFilters = {
                keyword: '',
                size: '',
                verified: false,
                sort: 'followerCount,desc'
            };

            // Clear URL parameters
            window.history.pushState({}, '', window.location.pathname);

            loadCompanies();
        }

        // Filter companies by size
        function filterCompaniesBySize(companies, sizeRange) {
            if (!sizeRange) return companies;

            return companies.filter(company => {
                const min = company.size_min || 0;
                const max = company.size_max || 0;
                
                switch (sizeRange) {
                    case '1-10':
                        return (min >= 1 && max <= 10) || (min <= 10 && max >= 1);
                    case '11-50':
                        return (min >= 11 && max <= 50) || (min <= 50 && max >= 11);
                    case '51-200':
                        return (min >= 51 && max <= 200) || (min <= 200 && max >= 51);
                    case '201-500':
                        return (min >= 201 && max <= 500) || (min <= 500 && max >= 201);
                    case '500+':
                        return min >= 500 || max >= 500;
                    default:    
                        return true;
                }
            });
        }

        // View company detail
        function viewCompany(slug) {
            window.location.href = `company-detail.html?slug=${slug}`;
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

        function updateCompanyCount(count) {
            document.getElementById('total-companies').textContent = count;
        }

        function showLoading() {
            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('companies-grid').classList.add('hidden');
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('error-state').classList.add('hidden');
        }

        function hideLoading() {
            document.getElementById('loading').classList.add('hidden');
        }

        function showError() {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('companies-grid').classList.add('hidden');
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('error-state').classList.remove('hidden');
        }

        // Toggle follow company
        async function toggleFollowCompany(event, companyId) {
            event.stopPropagation();

            if (!authService.isAuthenticated()) {
                alert('Vui lòng đăng nhập để theo dõi công ty');
                window.location.href = 'login.html';
                return;
            }

            const btn = event.target;
            const isFollowing = btn.textContent.includes('Đã theo dõi');

            try {
                const endpoint = isFollowing ? 'UNFOLLOW' : 'FOLLOW';
                const method = isFollowing ? 'DELETE' : 'POST';
                const url = buildApiUrl(API_CONFIG.FOLLOW_COMPANY[endpoint], { companyId });

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    if (isFollowing) {
                        btn.textContent = '+ Theo dõi';
                        btn.classList.remove('bg-green-100', 'text-green-700');
                        btn.classList.add('bg-blue-100', 'text-blue-700');
                    } else {
                        btn.textContent = '✓ Đã theo dõi';
                        btn.classList.remove('bg-blue-100', 'text-blue-700');
                        btn.classList.add('bg-green-100', 'text-green-700');
                    }
                } else {
                    alert(result.message || 'Lỗi khi cập nhật trạng thái theo dõi');
                }
            } catch (error) {
                console.error('Error toggling follow:', error);
                alert('Lỗi khi cập nhật trạng thái theo dõi');
            }
        }

        // Check if user is following a company
        async function checkCompanyFollowStatus(companyId) {
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

                if (result.success && result.data) {
                    const btn = document.querySelector(`.follow-btn-${companyId}`);
                    if (btn) {
                        btn.textContent = '✓ Đã theo dõi';
                        btn.classList.remove('bg-blue-100', 'text-blue-700');
                        btn.classList.add('bg-green-100', 'text-green-700');
                    }
                }
            } catch (error) {
                console.error('Error checking follow status:', error);
            }
        }
