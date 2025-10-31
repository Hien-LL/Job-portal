        let isLoading = false;
        let currentFilters = {
            search: '',
            size: '',
            verified: false,
            sort: 'followerCount,desc'
        };

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadFragments().then(() => {
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
        }

        // Load companies
        async function loadCompanies() {
            if (isLoading) return;
            
            isLoading = true;
            showLoading();

            try {
                const queryParams = {
                    sort: currentFilters.sort
                };

                if (currentFilters.search) {
                    queryParams.search = currentFilters.search;
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
                    `http://localhost:8080${company.logoUrl}` : null;
                const companySizeText = formatCompanySize(company.size_min, company.size_max);

                return `
                    <a href="company-detail.html?slug=${company.slug}" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                        <div class="flex items-start gap-4 mb-4">
                            <div class="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center cursor-pointer" 
                                 onclick="viewCompany('${company.slug}')">
                                ${logoUrl ? 
                                    `<img src="${logoUrl}" alt="${company.name}" class="w-full h-full object-contain rounded">` :
                                    `<span class="text-2xl">🏢</span>`
                                }
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1 cursor-pointer" onclick="viewCompany('${company.slug}')">
                                    <h3 class="font-bold text-gray-900">${company.name}</h3>
                                    ${company.verified ? 
                                        '<svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" title="Công ty đã xác thực"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' : 
                                        ''
                                    }
                                </div>
                                <p class="text-gray-600 text-sm mb-2">${companySizeText}</p>
                                <p class="text-gray-600 text-sm">👥 ${company.followerCount} người theo dõi</p>
                            </div>
                        </div>

                        <div class="mb-4 cursor-pointer" onclick="viewCompany('${company.slug}')">
                            <p class="text-gray-600 text-sm line-clamp-3">${company.description || 'Chưa có mô tả công ty'}</p>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                ${company.website ? 
                                    `<span>🌐 ${company.website}</span>` : 
                                    ''
                                }
                            </div>
                            <div class="flex gap-2">
                                ${authService.isAuthenticated() ? 
                                    `<button onclick="toggleFollowCompany(event, ${company.id})" class="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 follow-btn-${company.id}">
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
            currentFilters.search = document.getElementById('search-company').value;
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
                search: '',
                size: '',
                verified: false,
                sort: 'followerCount,desc'
            };

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
                        btn.classList.add('bg-gray-100', 'text-gray-700');
                    } else {
                        btn.textContent = '✓ Đã theo dõi';
                        btn.classList.remove('bg-gray-100', 'text-gray-700');
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
                );

                const result = await response.json();

                if (result.success && result.data) {
                    const btn = document.querySelector(`.follow-btn-${companyId}`);
                    if (btn) {
                        btn.textContent = '✓ Đã theo dõi';
                        btn.classList.remove('bg-gray-100', 'text-gray-700');
                        btn.classList.add('bg-green-100', 'text-green-700');
                    }
                }
            } catch (error) {
                console.error('Error checking follow status:', error);
            }
        }
