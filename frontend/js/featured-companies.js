// Load featured companies from API
        async function loadFeaturedCompanies() {
            try {
                // ✅ SỬA: Đã dùng buildCompleteUrl và API_CONFIG (OK)
                const url = buildCompleteUrl(API_CONFIG.COMPANIES.LIST, {}, { sort: 'followerCount,desc' });
                const response = await fetch(url);
                
                // ✅ THÊM: Error handling
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success && result.data) {
                    displayFeaturedCompanies(result.data);
                } else {
                    showCompaniesError('Không thể tải công ty nổi bật');
                }
            } catch (error) {
                console.error('Error loading featured companies:', error);
                showCompaniesError('Lỗi kết nối. Vui lòng thử lại sau.');
            }
        }

        function displayFeaturedCompanies(companies) {
            const grid = document.getElementById('featured-companies-grid');
            
            if (!companies || companies.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <p class="text-gray-600 text-sm">Hiện tại chưa có công ty nổi bật</p>
                    </div>
                `;
                return;
            }

            // Show max 8 companies on homepage
            const displayCompanies = companies.slice(0, 8);
            
            grid.innerHTML = displayCompanies.map(company => {
                // Get job count
                const jobCount = company.jobCount || 0;
                
                // ✅ SỬA: Dùng API_CONFIG.FILE_BASE_URL thay vì window.APP_CONFIG.API_BASE
                const logoUrl = company.logoUrl ? 
                    `${API_CONFIG.FILE_BASE_URL}${company.logoUrl}` : null;

                return `
                    <a href="company-detail.html?slug=${company.slug}" 
                       class="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition group">
                        <div class="flex flex-col items-center text-center">
                            <!-- Company Logo (circular) -->
                            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-3 flex items-center justify-center overflow-hidden">
                                ${logoUrl ? 
                                    `<img src="${logoUrl}" alt="${company.name}" class="w-full h-full object-cover">` :
                                    `<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>`
                                }
                            </div>
                            
                            <!-- Company Name with Verified Badge -->
                            <div class="flex items-center gap-1 mb-2">
                                <h3 class="font-semibold text-gray-900 text-sm truncate max-w-[140px]">${company.name}</h3>
                                ${company.verified ? 
                                    '<svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Công ty đã xác thực"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' : 
                                    ''
                                }
                            </div>
                            
                            <!-- Job Count -->
                            <p class="text-blue-600 text-xs font-medium">${jobCount} việc làm đang tuyển</p>
                        </div>
                    </a>
                `;
            }).join('');
        }

        // ✅ XÓA: formatCompanySize() - không sử dụng trong file này
        // function formatCompanySize(sizeMin, sizeMax) {...}

        // ✅ XÓA: viewCompany() - không cần vì đã dùng href trực tiếp
        // function viewCompany(slug, companyId) {...}

        function showCompaniesError(message) {
            const grid = document.getElementById('featured-companies-grid');
            grid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-600 text-sm">${message}</p>
                    <button onclick="loadFeaturedCompanies()" class="mt-2 text-blue-600 text-sm hover:underline">
                        Thử lại
                    </button>
                </div>
            `;
        }
