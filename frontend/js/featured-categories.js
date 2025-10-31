// Load featured categories from API
        async function loadFeaturedCategories() {
            try {
                const url = buildCompleteUrl(API_CONFIG.CATEGORIES.LIST, {}, { sort: 'jobCount,desc' });
                const response = await fetch(url);
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

            // Show max 4 categories on homepage (top categories by job count)
            const displayCategories = categories.slice(0, 4);
            
            grid.innerHTML = displayCategories.map(category => {
                // Get category icon based on name
                const categoryIcon = getCategoryIcon(category.name);

                return `
                    <div class="bg-white rounded-lg p-6 text-center hover:shadow-md transition border border-gray-100 cursor-pointer" 
                         onclick="viewCategory('${category.slug}', ${category.id})">
                        <div class="text-3xl mb-3">${categoryIcon}</div>
                        <h3 class="font-semibold text-gray-900 text-sm mb-1">${category.name}</h3>
                        <p class="text-gray-600 text-xs">Xem việc làm →</p>
                    </div>
                `;
            }).join('');
        }

        function getCategoryIcon(categoryName) {
            // Map category names to appropriate emojis
            const categoryIcons = {
                // Tech/Programming
                'Digital Marketing': '📊',
                'Lập trình Backend': '⚙️',
                'Lập trình Frontend': '💻',
                'Lập trình Fullstack': '🔧',
                'Phát triển phần mềm': '💻',
                'Web Development': '🌐',
                'Mobile Development': '📱',
                'Game Development': '🎮',
                'Embedded Systems': '🔌',
                'DevOps': '⚡',
                'Cloud Engineering': '☁️',
                'System Administration': '🖥️',
                'Database Administration': '🗄️',
                
                // Testing
                'Automation Testing': '🤖',
                'Manual Testing': '🔍',
                
                // Data & AI
                'Phân tích dữ liệu (Data Analysis)': '📈',
                'Khoa học dữ liệu (Data Science)': '🔬',
                'Machine Learning': '🧠',
                'Deep Learning': '🤖',
                'AI Engineering': '🧠',
                'Data Engineering': '🏗️',
                'Big Data': '📊',
                'Business Intelligence': '📊',
                
                // Marketing
                'Content Marketing': '✍️',
                'SEO / SEM': '🔍',
                'Social Media Marketing': '📱',
                'Email Marketing': '📧',
                'Brand Management': '🏷️',
                'Public Relations (PR)': '📢',
                
                // Design
                'UI/UX Design': '🎨',
                'Graphic Design': '🖌️',
                'Product Design': '🎨',
                '3D Modeling / Animation': '🎬',
                'Video Editing': '🎬',
                'Motion Graphic Design': '📹',
                
                // Business
                'Quản trị kinh doanh': '💼',
                'Quản lý dự án (Project Management)': '📋',
                'Khởi nghiệp / Startup': '🚀',
                'Phân tích kinh doanh (Business Analyst)': '📊',
                'Chăm sóc khách hàng': '👥',
                'Bán hàng (Sales)': '💰',
                'E-commerce': '🛒',
                'Logistics / Supply Chain': '📦',
                
                // Finance
                'Kế toán / Kiểm toán': '💰',
                'Phân tích tài chính': '📈',
                'Ngân hàng / Tín dụng': '🏦',
                'Đầu tư / Chứng khoán': '📊',
                'Bảo hiểm / Tài sản': '🛡️',
                
                // Education
                'Giảng dạy / Đào tạo': '🎓',
                'Phát triển chương trình học': '📚',
                'Tư vấn hướng nghiệp': '🎯',
                'Giáo dục trực tuyến (E-learning)': '💻',
                'Ngôn ngữ / Phiên dịch': '🗣️',
                
                // Engineering
                'Kỹ thuật cơ khí': '⚙️',
                'Điện - Điện tử': '⚡',
                'Tự động hóa (Automation)': '🤖',
                'Xây dựng / Kết cấu': '🏗️',
                'Kiến trúc / Thiết kế công trình': '🏛️',
                'Kỹ thuật ô tô': '🚗',
                'Kỹ thuật môi trường': '🌱',
                
                // Healthcare
                'Y tế / Điều dưỡng': '⚕️',
                'Dược phẩm / Hóa sinh': '💊',
                'Chẩn đoán hình ảnh': '🔬',
                'Quản lý bệnh viện': '🏥',
                'Thể dục / Dinh dưỡng': '💪',
                'Tư vấn sức khỏe': '❤️'
            };
            
            return categoryIcons[categoryName] || '💼';
        }

        function viewCategory(slug, categoryId) {
            console.log(`View category: ${slug} (ID: ${categoryId})`);
            // TODO: Redirect to job listing page with category filter
            alert(`Tính năng xem danh mục "${slug}" sẽ được triển khai soon!`);
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

