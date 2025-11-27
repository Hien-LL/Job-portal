// Load featured categories from API
        async function loadFeaturedCategories() {
            try {
                // ✅ SỬA: Dùng buildCompleteUrl với API_CONFIG
                const url = buildCompleteUrl(API_CONFIG.CATEGORIES.LIST, {}, { sort: 'jobCount,desc' });
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success && result.data) {
                    displayFeaturedCategories(result.data);
                } else {
                    showCategoriesError('Không thể tải danh mục nổi bật');
                }
            } catch (error) {
                console.error('Error loading featured categories:', error);
                showCategoriesError('Lỗi kết nối. Vui lòng thử lại sau.');
            }
        }
        function displayFeaturedCategories(categories) {
            const grid = document.getElementById('featured-categories-grid');
            
            if (!categories || categories.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <p class="text-gray-600 text-sm">Hiện tại chưa có danh mục nổi bật</p>
                    </div>
                `;
                return;
            }

        // Fake job count cho từng danh mục
        const fakeJobCountMap = {
            'Phân tích kinh doanh (Business Analyst)': 1251,
            'Lập trình Backend': 1125,
            'Kế toán / Kiểm toán': 1318,
            'Lập trình Fullstack': 992,
            'Kỹ thuật cơ khí': 1114,
            'Dịch vụ cộng đồng': 217,
            'Bán hàng (Sales)': 930
        };

        // Chỉ lấy 6 category nổi bật nhất
        const displayCategories = categories.slice(0, 6);
        
        grid.innerHTML = displayCategories.map(category => {
            
            const categoryIcon = getCategoryIcon(category.name);

            // Nếu API trả jobCount > 0 thì dùng thật  
            // Nếu không thì fake theo map, nếu không có trong map thì mặc định 20
            const jobCount =
                (typeof category.jobCount === 'number' && category.jobCount > 0)
                    ? category.jobCount
                    : (fakeJobCountMap[category.name] || 20);

            return `
                <a href="job.html?category=${category.slug}" 
                class="block bg-white rounded-lg p-5 hover:shadow-md hover:border-blue-500 transition border border-gray-200 group">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition">
                            ${categoryIcon}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-gray-900 text-sm mb-1 truncate">${category.name}</h3>
                            <p class="text-gray-500 text-xs">${jobCount} việc làm</p>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
        }

        function getCategoryIcon(categoryName) {
            // Map category names to appropriate SVG icons
            const iconMap = {
                'Digital Marketing': '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
                'Lập trình Backend': '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>',
                'Lập trình Frontend': '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>',
                'Lập trình Fullstack': '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>',
                'UI/UX Design': '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>',
                'Quản trị kinh doanh': '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
                'Phân tích dữ liệu (Data Analysis)': '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
                'Bán hàng (Sales)': '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            };
            
            // Return matched icon or default briefcase icon
            return iconMap[categoryName] || '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>';
        }

        function showCategoriesError(message) {
            const grid = document.getElementById('featured-categories-grid');
            grid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-600 text-sm">${message}</p>
                    <button onclick="loadFeaturedCategories()" class="mt-2 text-blue-600 text-sm hover:underline">
                        Thử lại
                    </button>
                </div>
            `;
        }

