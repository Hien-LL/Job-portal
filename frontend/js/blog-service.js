        let currentPage = 1;
        let currentCategory = 'all';
        let currentSearch = '';
        let totalPages = 1;
        
        // Sample blog data (replace with API calls)
        const blogPosts = [
            {
                id: 1,
                title: "10 Kỹ năng IT được săn đón nhất năm 2024",
                excerpt: "Khám phá những kỹ năng công nghệ thông tin được các nhà tuyển dụng tìm kiếm nhiều nhất trong năm 2024, từ AI/ML đến cloud computing.",
                category: "market-trends",
                categoryName: "Xu hướng thị trường",
                author: "Nguyễn Văn A",
                publishedAt: "2024-01-15",
                readTime: "5 phút",
                imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
                tags: ["IT", "Kỹ năng", "2024"],
                isPopular: true
            },
            {
                id: 2,
                title: "Cách viết CV gây ấn tượng với nhà tuyển dụng",
                excerpt: "Hướng dẫn chi tiết cách viết CV chuyên nghiệp, nổi bật và thu hút sự chú ý của nhà tuyển dụng trong vòng 30 giây đầu tiên.",
                category: "career-tips",
                categoryName: "Lời khuyên nghề nghiệp",
                author: "Trần Thị B",
                publishedAt: "2024-01-12",
                readTime: "7 phút",
                imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop",
                tags: ["CV", "Tuyển dụng", "Nghề nghiệp"],
                isPopular: true
            },
            {
                id: 3,
                title: "5 Câu hỏi phỏng vấn thường gặp và cách trả lời",
                excerpt: "Tổng hợp những câu hỏi phỏng vấn phổ biến nhất và gợi ý cách trả lời thông minh, thuyết phục để ghi điểm với nhà tuyển dụng.",
                category: "interview-tips",
                categoryName: "Phỏng vấn",
                author: "Lê Văn C",
                publishedAt: "2024-01-10",
                readTime: "6 phút",
                imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
                tags: ["Phỏng vấn", "Tuyển dụng", "Kỹ năng"],
                isPopular: false
            },
            {
                id: 4,
                title: "Bảng lương IT Việt Nam 2024: Cập nhật mới nhất",
                excerpt: "Khảo sát mức lương của các vị trí IT tại Việt Nam năm 2024, từ junior đến senior, giúp bạn đàm phán lương hiệu quả.",
                category: "salary-guide",
                categoryName: "Hướng dẫn lương",
                author: "Phạm Thị D",
                publishedAt: "2024-01-08",
                readTime: "10 phút",
                imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
                tags: ["Lương", "IT", "Việt Nam"],
                isPopular: true
            },
            {
                id: 5,
                title: "Remote Work: Xu hướng làm việc từ xa sau đại dịch",
                excerpt: "Phân tích xu hướng làm việc từ xa, những lợi ích và thách thức, cũng như cách thích ứng với môi trường làm việc mới.",
                category: "market-trends",
                categoryName: "Xu hướng thị trường",
                author: "Hoàng Văn E",
                publishedAt: "2024-01-05",
                readTime: "8 phút",
                imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
                tags: ["Remote", "Làm việc", "Xu hướng"],
                isPopular: false
            },
            {
                id: 6,
                title: "Chuyển đổi ngành nghề: Bí quyết thành công",
                excerpt: "Hướng dẫn chi tiết cách chuyển đổi ngành nghề một cách hiệu quả, từ việc chuẩn bị kỹ năng đến tìm kiếm cơ hội mới.",
                category: "career-tips",
                categoryName: "Lời khuyên nghề nghiệp",
                author: "Ngô Thị F",
                publishedAt: "2024-01-03",
                readTime: "9 phút",
                imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
                tags: ["Chuyển nghề", "Nghề nghiệp", "Phát triển"],
                isPopular: false
            },
            {
                id: 7,
                title: "Cách tạo dựng personal brand như một lập trình viên",
                excerpt: "Xây dựng brand cá nhân mạnh mẽ trên GitHub, LinkedIn và các nền tảng khác để thu hút các cơ hội việc làm tốt hơn.",
                category: "career-tips",
                categoryName: "Lời khuyên nghề nghiệp",
                author: "Bùi Văn G",
                publishedAt: "2024-01-01",
                readTime: "8 phút",
                imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
                tags: ["Personal Brand", "Phát triển", "Lập trình viên"],
                isPopular: true
            },
            {
                id: 8,
                title: "AI và Machine Learning: Tương lai của tuyển dụng IT",
                excerpt: "Khám phá cách AI đang thay đổi quy trình tuyển dụng, từ sàng lọc CV tự động đến phỏng vấn video được phân tích bằng AI.",
                category: "market-trends",
                categoryName: "Xu hướng thị trường",
                author: "Đỗ Thị H",
                publishedAt: "2023-12-28",
                readTime: "7 phút",
                imageUrl: "https://images.unsplash.com/photo-1677442d019cecf74d53055c5623c2a5cac3d694?w=600&h=400&fit=crop",
                tags: ["AI", "Machine Learning", "Tuyển dụng"],
                isPopular: false
            },
            {
                id: 9,
                title: "Chuẩn bị 30 ngày trước cuộc phỏng vấn kỹ thuật",
                excerpt: "Lộ trình chi tiết 30 ngày để chuẩn bị cho một cuộc phỏng vấn kỹ thuật, bao gồm thuật toán, hệ thống thiết kế và coding interview.",
                category: "interview-tips",
                categoryName: "Phỏng vấn",
                author: "Vũ Văn I",
                publishedAt: "2023-12-25",
                readTime: "12 phút",
                imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
                tags: ["Phỏng vấn", "Kỹ thuật", "Chuẩn bị"],
                isPopular: true
            },
            {
                id: 10,
                title: "Lương DevOps Engineer: Bí mật của mức giá cao",
                excerpt: "Phân tích chi tiết về mức lương các DevOps Engineer, những yếu tố ảnh hưởng và cách đàm phán để nhận được mức giá tốt nhất.",
                category: "salary-guide",
                categoryName: "Hướng dẫn lương",
                author: "Trần Văn J",
                publishedAt: "2023-12-22",
                readTime: "11 phút",
                imageUrl: "https://images.unsplash.com/photo-1551439773-97769c5ef4d5?w=600&h=400&fit=crop",
                tags: ["Lương", "DevOps", "Đàm phán"],
                isPopular: false
            },
            {
                id: 11,
                title: "Tại sao bạn nên học React trong năm 2024",
                excerpt: "Tìm hiểu lý do React vẫn là framework được săn đón nhất, các dự án đang sử dụng nó và tại sao bạn nên học nó ngay.",
                category: "market-trends",
                categoryName: "Xu hướng thị trường",
                author: "Lý Thị K",
                publishedAt: "2023-12-20",
                readTime: "6 phút",
                imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
                tags: ["React", "JavaScript", "Web Development"],
                isPopular: false
            },
            {
                id: 12,
                title: "Salary Negotiation: Mẹo đàm phán lương thông minh",
                excerpt: "Hướng dẫn từng bước về cách đàm phán lương hiệu quả, những lỗi thường mắc phải và chiến lược để đạt được mục tiêu lương.",
                category: "salary-guide",
                categoryName: "Hướng dẫn lương",
                author: "Phan Văn L",
                publishedAt: "2023-12-18",
                readTime: "9 phút",
                imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
                tags: ["Lương", "Đàm phán", "Bí quyết"],
                isPopular: true
            },
            {
                id: 13,
                title: "Behavior Interview: Cách trả lời câu hỏi về hành động",
                excerpt: "Phương pháp STAR để trả lời câu hỏi phỏng vấn hành vi (Behavior Interview), với ví dụ thực tế và các tips hữu ích.",
                category: "interview-tips",
                categoryName: "Phỏng vấn",
                author: "Đặng Thị M",
                publishedAt: "2023-12-15",
                readTime: "8 phút",
                imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
                tags: ["Phỏng vấn", "Behavior", "STAR Method"],
                isPopular: false
            },
            {
                id: 14,
                title: "Tối ưu hóa LinkedIn profile để thu hút recruiter",
                excerpt: "Các bước cụ thể để tối ưu hóa profile LinkedIn của bạn, giúp recruiter tìm thấy và liên hệ với bạn dễ dàng hơn.",
                category: "career-tips",
                categoryName: "Lời khuyên nghề nghiệp",
                author: "Võ Văn N",
                publishedAt: "2023-12-12",
                readTime: "7 phút",
                imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
                tags: ["LinkedIn", "Personal Branding", "Recruiter"],
                isPopular: true
            },
            {
                id: 15,
                title: "Khái quát về Data Science: Bắt đầu từ đâu?",
                excerpt: "Hướng dẫn cho người mới bắt đầu trong lĩnh vực Data Science, bao gồm kỹ năng cần thiết, con đường học tập và cơ hội công việc.",
                category: "market-trends",
                categoryName: "Xu hướng thị trường",
                author: "Cao Thị O",
                publishedAt: "2023-12-10",
                readTime: "10 phút",
                imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
                tags: ["Data Science", "Bắt đầu", "Kỹ năng"],
                isPopular: false
            }
        ];

        // ===== Init sau khi DOM sẵn sàng =====
document.addEventListener('DOMContentLoaded', () => {
  // loadFragments đã render header/footer/sidebar rồi mới chạy nội dung
  loadFragments()
    .catch(err => console.error('Error loading fragments:', err))
    .finally(() => {
      loadBlogPosts();      // nội dung chính
      loadPopularPosts();   // sidebar
      bindBlogEvents();     // gắn sự kiện sau cùng
    });
});


function bindBlogEvents() {
  console.log('Binding blog events...');
  
  // Enter trong ô search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') searchBlogs();
    });
  }

  // Nút filter category - gắn sự kiện click cho tất cả nút category-filter
  document.querySelectorAll('.category-filter').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const categoryValue = this.getAttribute('data-category') || 'all';
      filterByCategory(categoryValue, this);
    });
  });

  // Prev/Next pagination nếu cần (tuỳ m có id hay không)
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) prevBtn.addEventListener('click', () => changePage(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changePage(1));
}

        // Load blog posts
        function loadBlogPosts() {
            showLoading();
            
            // Simulate API call delay
            setTimeout(() => {
                const filteredPosts = filterPosts();
                displayBlogPosts(filteredPosts);
                updatePagination(filteredPosts.length);
                hideLoading();
            }, 500);
        }

        // Filter posts based on category and search
        function filterPosts() {
            let filtered = [...blogPosts];
            
            // Filter by category
            if (currentCategory !== 'all') {
                filtered = filtered.filter(post => post.category === currentCategory);
            }
            
            // Filter by search
            if (currentSearch) {
                filtered = filtered.filter(post => 
                    post.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
                    post.excerpt.toLowerCase().includes(currentSearch.toLowerCase()) ||
                    post.tags.some(tag => tag.toLowerCase().includes(currentSearch.toLowerCase()))
                );
            }
            
            return filtered;
        }

        // Display blog posts
        function displayBlogPosts(posts) {
            const container = document.getElementById('blog-posts');
            const noResults = document.getElementById('no-results');
            
            if (posts.length === 0) {
                hideElement(container);
                showElement(noResults);
                return;
            }
            
            hideElement(noResults);
            showElement(container);
            
            // Pagination
            const startIndex = (currentPage - 1) * 6;
            const endIndex = startIndex + 6;
            const paginatedPosts = posts.slice(startIndex, endIndex);
            
            setHTMLContent('blog-posts', paginatedPosts.map(post => {
                const publishedDate = formatDate(post.publishedAt);
                
                return `
                    <article class="blog-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div class="aspect-video bg-gray-200 overflow-hidden">
                            <img src="${post.imageUrl}" alt="${post.title}" 
                                 class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                        </div>
                        <div class="p-6">
                            <div class="flex items-center gap-3 mb-3">
                                <span class="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                    ${post.categoryName}
                                </span>
                                <span class="text-gray-500 text-xs">${post.readTime} đọc</span>
                            </div>
                            
                            <h2 class="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition cursor-pointer" 
                                onclick="openBlogPost(${post.id})">
                                ${post.title}
                            </h2>
                            
                            <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                                ${post.excerpt}
                            </p>
                            
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        ${post.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p class="text-gray-900 text-sm font-medium">${post.author}</p>
                                        <p class="text-gray-500 text-xs">${publishedDate}</p>
                                    </div>
                                </div>
                                
                                <button onclick="openBlogPost(${post.id})" 
                                        class="text-blue-600 text-sm font-medium hover:underline">
                                    Đọc thêm →
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            }).join(''));
        }

        // Load popular posts for sidebar
        function loadPopularPosts() {
            const popularContainer = document.getElementById('popular-posts');
            const popularPosts = blogPosts.filter(post => post.isPopular).slice(0, 3);
            
            popularContainer.innerHTML = popularPosts.map(post => {
                const publishedDate = formatDate(post.publishedAt);
                
                return `
                    <div class="cursor-pointer hover:bg-gray-50 p-2 rounded transition" onclick="openBlogPost(${post.id})">
                        <h4 class="font-medium text-gray-900 text-sm mb-1 line-clamp-2">${post.title}</h4>
                        <p class="text-gray-500 text-xs">${publishedDate} • ${post.readTime}</p>
                    </div>
                `;
            }).join('');
        }

        function filterByCategory(category, el) {
  currentCategory = category;
  currentPage = 1;

  // Update active button styles
  document.querySelectorAll('.category-filter').forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active', 'bg-blue-600', 'text-white');
      btn.classList.remove('bg-gray-200', 'text-gray-700');
    } else {
      btn.classList.remove('active', 'bg-blue-600', 'text-white');
      btn.classList.add('bg-gray-200', 'text-gray-700');
    }
  });

  loadBlogPosts();
}


        // Search blogs
        function searchBlogs() {
            currentSearch = document.getElementById('search-input').value.trim();
            currentPage = 1;
            loadBlogPosts();
        }

        // Pagination
        function changePage(direction) {
            const newPage = currentPage + direction;
            if (newPage >= 1 && newPage <= totalPages) {
                currentPage = newPage;
                loadBlogPosts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function updatePagination(totalItems) {
            totalPages = Math.ceil(totalItems / 6);
            const pagination = document.getElementById('pagination');
            
            if (totalPages <= 1) {
                hideElement(pagination);
                return;
            }
            
            showElement(pagination);
            
            // Update buttons
            document.getElementById('prev-btn').disabled = currentPage === 1;
            document.getElementById('next-btn').disabled = currentPage === totalPages;
            
            // Update page numbers
            const pageNumbers = document.getElementById('page-numbers');
            pageNumbers.innerHTML = '';
            
            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.className = `px-3 py-2 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-blue-600'}`;
                button.onclick = () => {
                    currentPage = i;
                    loadBlogPosts();
                };
                pageNumbers.appendChild(button);
            }
        }

        // Open blog post detail
        function openBlogPost(postId) {
            window.location.href = `blog-detail.html?id=${postId}`;
        }

        // Utility functions
        function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return 'Không rõ';
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7)  return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
  return `${Math.ceil(diffDays / 30)} tháng trước`;
}


        function showLoading() {
            showElement('loading-container');
            hideElement('blog-posts');
            hideElement('no-results');
        }

        function hideLoading() {
            hideElement('loading-container');
        }
