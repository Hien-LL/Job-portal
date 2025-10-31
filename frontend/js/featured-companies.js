// Load featured companies from API
        async function loadFeaturedCompanies() {
            try {
                const url = buildCompleteUrl(API_CONFIG.COMPANIES.LIST, {}, { sort: 'followerCount,desc' });
                const response = await fetch(url);
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

            // Show max 4 companies on homepage
            const displayCompanies = companies.slice(0, 4);
            
            grid.innerHTML = displayCompanies.map(company => {
                // Format company size
                const companySizeText = formatCompanySize(company.size_min, company.size_max);
                
                // Get company logo or use default
                const logoUrl = company.logoUrl ? 
                    window.APP_CONFIG.API_BASE + company.logoUrl : null;

                return `
                    <div class="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition cursor-pointer" 
                         onclick="viewCompany('${company.slug}', ${company.id})">
                        <div class="w-16 h-16 bg-gray-100 rounded mx-auto mb-4 flex items-center justify-center">
                            ${logoUrl ? 
                                `<img src="${logoUrl}" alt="${company.name}" class="w-full h-full object-contain rounded">` :
                                `<span class="text-2xl">🏢</span>`
                            }
                        </div>
                        <div class="flex items-center justify-center gap-1 mb-1">
                            <h3 class="font-semibold text-gray-900 text-sm">${company.name}</h3>
                            ${company.verified ? 
                                '<span class="inline-block w-3 h-3 bg-blue-500 rounded-full" title="Công ty đã xác thực"></span>' : 
                                ''
                            }
                        </div>
                        <p class="text-gray-600 text-xs mb-2">${companySizeText}</p>
                        <p class="text-gray-600 text-xs mb-3">${company.followerCount} người theo dõi</p>
                        <a href="#" class="text-blue-600 text-xs font-semibold hover:underline" 
                           onclick="event.stopPropagation(); viewCompany('${company.slug}', ${company.id})">
                            Xem chi tiết →
                        </a>
                    </div>
                `;
            }).join('');
        }

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

        function viewCompany(slug, companyId) {
            window.location.href = `company-detail.html?slug=${slug}`;
        }

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
