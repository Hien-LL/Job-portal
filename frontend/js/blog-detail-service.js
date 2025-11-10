        let currentArticle = null;

        // Sample blog data with full content (same as blog.html - in real app, this would come from API)
        const blogPosts = [
            {
                id: 1,
                title: "10 Kỹ năng IT được săn đón nhất năm 2024",
                excerpt: "Khám phá những kỹ năng công nghệ thông tin được các nhà tuyển dụng tìm kiếm nhiều nhất trong năm 2024, từ AI/ML đến cloud computing.",
                content: `
                    <p>Trong thời đại công nghệ 4.0, ngành công nghệ thông tin đang phát triển với tốc độ chóng mặt. Các doanh nghiệp không ngừng tìm kiếm những nhân tài có kỹ năng phù hợp để đáp ứng nhu cầu chuyển đổi số.</p>
                    
                    <h2>1. Trí tuệ nhân tạo và Machine Learning</h2>
                    <p>AI và ML đang là xu hướng hàng đầu, với nhu cầu tuyển dụng tăng 300% so với năm trước. Các kỹ năng cần thiết bao gồm:</p>
                    <ul>
                        <li>Python, TensorFlow, PyTorch</li>
                        <li>Deep Learning và Neural Networks</li>
                        <li>Data Science và Analytics</li>
                        <li>Computer Vision và Natural Language Processing</li>
                    </ul>
                    
                    <h2>2. Cloud Computing</h2>
                    <p>Với sự bùng nổ của điện toán đám mây, các kỹ năng về AWS, Azure, Google Cloud Platform đang rất được săn đón.</p>
                    
                    <blockquote>
                        "Theo khảo sát của LinkedIn, nhu cầu tuyển dụng cho các vị trí Cloud Engineer tăng 250% trong năm 2024."
                    </blockquote>
                    
                    <h2>3. DevOps và Container Technology</h2>
                    <p>Docker, Kubernetes, Jenkins và các công cụ CI/CD đang trở thành kỹ năng bắt buộc cho nhiều vị trí IT.</p>
                    
                    <h2>4. Cybersecurity</h2>
                    <p>Với tình hình an ninh mạng ngày càng phức tạp, các chuyên gia bảo mật thông tin đang được săn đón với mức lương hấp dẫn.</p>
                    
                    <h2>5. Full-stack Development</h2>
                    <p>Khả năng phát triển cả frontend và backend giúp developer trở nên linh hoạt và có giá trị hơn trong mắt nhà tuyển dụng.</p>
                    
                    <h3>Lời khuyên cho người tìm việc</h3>
                    <p>Để chuẩn bị cho thị trường việc làm IT 2024, bạn nên:</p>
                    <ol>
                        <li>Xác định rõ định hướng nghề nghiệp</li>
                        <li>Đầu tư thời gian học các kỹ năng hot trend</li>
                        <li>Xây dựng portfolio ấn tượng</li>
                        <li>Tham gia các dự án thực tế</li>
                        <li>Networking và xây dựng mối quan hệ trong ngành</li>
                    </ol>
                `,
                category: "market-trends",
                categoryName: "Xu hướng thị trường",
                author: "Nguyễn Văn A",
                publishedAt: "2024-01-15",
                readTime: "5 phút",
                imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop",
                tags: ["IT", "Kỹ năng", "2024", "AI", "Cloud"]
            },
            {
                id: 2,
                title: "Cách viết CV gây ấn tượng với nhà tuyển dụng",
                excerpt: "Hướng dẫn chi tiết cách viết CV chuyên nghiệp, nổi bật và thu hút sự chú ý của nhà tuyển dụng trong vòng 30 giây đầu tiên.",
                content: `
                    <p>CV là tấm vé quan trọng giúp bạn có được cơ hội phỏng vấn. Một CV ấn tượng có thể quyết định 80% thành công trong quá trình tuyển dụng.</p>
                    
                    <h2>Nguyên tắc vàng khi viết CV</h2>
                    
                    <h3>1. Ngắn gọn và súc tích</h3>
                    <p>CV không nên quá 2 trang A4. Nhà tuyển dụng thường chỉ dành 30-60 giây để đọc lướt qua CV của bạn.</p>
                    
                    <h3>2. Sử dụng từ khóa phù hợp</h3>
                    <p>Đọc kỹ job description và sử dụng các từ khóa quan trọng trong CV để vượt qua hệ thống ATS (Applicant Tracking System).</p>
                    
                    <h2>Cấu trúc CV hiệu quả</h2>
                    
                    <h3>1. Thông tin cá nhân</h3>
                    <ul>
                        <li>Họ tên đầy đủ</li>
                        <li>Số điện thoại, email</li>
                        <li>Địa chỉ (chỉ cần quận/huyện, thành phố)</li>
                        <li>LinkedIn profile</li>
                        <li>Portfolio website (nếu có)</li>
                    </ul>
                    
                    <h3>2. Tóm tắt nghề nghiệp (Career Summary)</h3>
                    <p>2-3 câu ngắn gọn mô tả kinh nghiệm, kỹ năng và mục tiêu nghề nghiệp của bạn.</p>
                    
                    <blockquote>
                        Ví dụ: "Full-stack Developer với 3 năm kinh nghiệm phát triển ứng dụng web sử dụng React và Node.js. Có khả năng làm việc độc lập và teamwork hiệu quả. Mong muốn góp phần vào sự phát triển của công ty công nghệ hàng đầu."
                    </blockquote>
                    
                    <h3>3. Kinh nghiệm làm việc</h3>
                    <p>Liệt kê theo thứ tự thời gian ngược (mới nhất trước). Mỗi công việc bao gồm:</p>
                    <ul>
                        <li>Tên công ty và vị trí</li>
                        <li>Thời gian làm việc</li>
                        <li>Mô tả công việc và thành tích đạt được (sử dụng số liệu cụ thể)</li>
                    </ul>
                    
                    <h3>4. Học vấn</h3>
                    <p>Bằng cấp, trường học, năm tốt nghiệp. Nếu đã có kinh nghiệm, phần này có thể ngắn gọn.</p>
                    
                    <h3>5. Kỹ năng</h3>
                    <p>Chia thành các nhóm: Kỹ năng kỹ thuật, Ngôn ngữ lập trình, Công cụ, Soft skills.</p>
                    
                    <h2>Những lỗi thường gặp cần tránh</h2>
                    <ol>
                        <li>CV quá dài và rườm rà</li>
                        <li>Thiếu thông tin liên hệ</li>
                        <li>Không có tóm tắt nghề nghiệp</li>
                        <li>Liệt kê trách nhiệm thay vì thành tích</li>
                        <li>Không customize CV cho từng vị trí</li>
                        <li>Sử dụng font chữ kỳ lạ</li>
                        <li>Có lỗi chính tả</li>
                    </ol>
                    
                    <h2>Mẹo để CV nổi bật</h2>
                    <ul>
                        <li>Sử dụng số liệu cụ thể để mô tả thành tích</li>
                        <li>Thêm link đến portfolio hoặc GitHub</li>
                        <li>Sử dụng action verbs mạnh mẽ</li>
                        <li>Định dạng CV rõ ràng, dễ đọc</li>
                        <li>Customize CV cho từng vị trí ứng tuyển</li>
                    </ul>
                `,
                category: "career-tips",
                categoryName: "Lời khuyên nghề nghiệp",
                author: "Trần Thị B",
                publishedAt: "2024-01-12",
                readTime: "7 phút",
                imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=600&fit=crop",
                tags: ["CV", "Tuyển dụng", "Nghề nghiệp", "Hướng dẫn"]
            },
            {
                id: 3,
                title: "5 Câu hỏi phỏng vấn thường gặp và cách trả lời",
                excerpt: "Tổng hợp những câu hỏi phỏng vấn phổ biến nhất và gợi ý cách trả lời thông minh, thuyết phục để ghi điểm với nhà tuyển dụng.",
                content: `
                    <p>Phỏng vấn là bước quan trọng quyết định thành bại trong quá trình tuyển dụng. Việc chuẩn bị kỹ lưỡng cho các câu hỏi phỏng vấn sẽ giúp bạn tự tin hơn và ghi điểm trong mắt nhà tuyển dụng.</p>
                    
                    <h2>1. "Hãy giới thiệu về bản thân"</h2>
                    <p>Đây là câu hỏi mở đầu phổ biến nhất trong mọi cuộc phỏng vấn.</p>
                    
                    <h3>Cách trả lời hiệu quả:</h3>
                    <ul>
                        <li>Giới thiệu ngắn gọn về background và kinh nghiệm</li>
                        <li>Nhấn mạnh những thành tích nổi bật liên quan đến vị trí ứng tuyển</li>
                        <li>Thể hiện sự nhiệt tình với công việc và công ty</li>
                        <li>Thời gian trả lời: 1-2 phút</li>
                    </ul>
                    
                    <blockquote>
                        Ví dụ: "Tôi là một Full-stack Developer với 3 năm kinh nghiệm phát triển ứng dụng web. Trong công việc trước, tôi đã tham gia xây dựng hệ thống e-commerce xử lý 10,000+ giao dịch/ngày. Tôi đặc biệt quan tâm đến việc tối ưu hóa performance và user experience. Tôi rất hứng thú với cơ hội làm việc tại công ty và góp phần phát triển những sản phẩm công nghệ tiên tiến."
                    </blockquote>
                    
                    <h2>2. "Tại sao bạn muốn làm việc tại công ty chúng tôi?"</h2>
                    <p>Câu hỏi này kiểm tra mức độ hiểu biết và sự quan tâm thực sự của bạn đối với công ty.</p>
                    
                    <h3>Chiến lược trả lời:</h3>
                    <ul>
                        <li>Nghiên cứu kỹ về công ty, sản phẩm, văn hóa làm việc</li>
                        <li>Kết nối giá trị cá nhân với mission/vision của công ty</li>
                        <li>Đề cập đến cơ hội phát triển nghề nghiệp</li>
                        <li>Tránh nói về lương bổng trong câu trả lời này</li>
                    </ul>
                    
                    <h2>3. "Điểm mạnh và điểm yếu của bạn là gì?"</h2>
                    <p>Đây là câu hỏi "bẫy" phổ biến, yêu cầu sự cân bằng giữa tự tin và khiêm tốn.</p>
                    
                    <h3>Về điểm mạnh:</h3>
                    <ul>
                        <li>Chọn 2-3 điểm mạnh liên quan trực tiếp đến công việc</li>
                        <li>Đưa ra ví dụ cụ thể minh chứng</li>
                        <li>Tránh nói chung chung như "chăm chỉ", "có trách nhiệm"</li>
                    </ul>
                    
                    <h3>Về điểm yếu:</h3>
                    <ul>
                        <li>Chọn điểm yếu thật nhưng không ảnh hưởng nghiêm trọng đến công việc</li>
                        <li>Thể hiện bạn đang nỗ lực khắc phục</li>
                        <li>Biến điểm yếu thành cơ hội học hỏi</li>
                    </ul>
                    
                    <h2>4. "Bạn thấy mình ở đâu trong 5 năm tới?"</h2>
                    <p>Nhà tuyển dụng muốn biết tham vọng nghề nghiệp và mức độ cam kết lâu dài của bạn.</p>
                    
                    <h3>Cách tiếp cận:</h3>
                    <ul>
                        <li>Thể hiện tham vọng hợp lý và thực tế</li>
                        <li>Kết nối mục tiêu cá nhân với cơ hội phát triển tại công ty</li>
                        <li>Nhấn mạnh mong muốn đóng góp giá trị cho tổ chức</li>
                        <li>Tránh nói quá mơ hồ hoặc quá cụ thể</li>
                    </ul>
                    
                    <h2>5. "Bạn có câu hỏi gì cho chúng tôi?"</h2>
                    <p>Đây là cơ hội để bạn thể hiện sự quan tâm và chuẩn bị kỹ lưỡng.</p>
                    
                    <h3>Câu hỏi nên hỏi:</h3>
                    <ol>
                        <li>"Thách thức lớn nhất của vị trí này là gì?"</li>
                        <li>"Văn hóa làm việc của team như thế nào?"</li>
                        <li>"Cơ hội phát triển nghề nghiệp tại công ty ra sao?"</li>
                        <li>"Công ty có kế hoạch mở rộng/phát triển gì trong thời gian tới?"</li>
                        <li>"Tiêu chí đánh giá thành công trong vị trí này là gì?"</li>
                    </ol>
                    
                    <h3>Câu hỏi nên tránh:</h3>
                    <ul>
                        <li>Về lương bổng, phúc lợi (để dành cho vòng sau)</li>
                        <li>Về thời gian làm việc, nghỉ phép</li>
                        <li>Những thông tin có sẵn trên website công ty</li>
                    </ul>
                    
                    <h2>Mẹo chuẩn bị phỏng vấn hiệu quả</h2>
                    <ol>
                        <li><strong>Nghiên cứu công ty:</strong> Website, social media, tin tức gần đây</li>
                        <li><strong>Chuẩn bị câu chuyện:</strong> Sử dụng phương pháp STAR (Situation, Task, Action, Result)</li>
                        <li><strong>Luyện tập:</strong> Tập nói trước gương hoặc với bạn bè</li>
                        <li><strong>Chuẩn bị tài liệu:</strong> CV, portfolio, danh sách tham khảo</li>
                        <li><strong>Dress code:</strong> Ăn mặc phù hợp với văn hóa công ty</li>
                        <li><strong>Đến sớm:</strong> 10-15 phút trước giờ hẹn</li>
                    </ol>
                    
                    <h2>Ngôn ngữ cơ thể trong phỏng vấn</h2>
                    <ul>
                        <li>Bắt tay chắc chắn khi gặp nhà tuyển dụng</li>
                        <li>Giữ contact mắt tự nhiên</li>
                        <li>Ngồi thẳng lưng, thể hiện sự tự tin</li>
                        <li>Tránh cử chỉ làm mất tập trung (nghịch bút, nhìn điện thoại)</li>
                        <li>Mỉm cười phù hợp để tạo thiện cảm</li>
                    </ul>
                `,
                category: "interview-tips",
                categoryName: "Phỏng vấn",
                author: "Lê Văn C",
                publishedAt: "2024-01-10",
                readTime: "6 phút",
                imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop",
                tags: ["Phỏng vấn", "Tuyển dụng", "Kỹ năng", "Chuẩn bị"]
            },
            {
                id: 4,
                title: "Bảng lương IT Việt Nam 2024: Cập nhật mới nhất",
                excerpt: "Khảo sát mức lương của các vị trí IT tại Việt Nam năm 2024, từ junior đến senior, giúp bạn đàm phán lương hiệu quả.",
                content: `
                    <p>Thị trường IT Việt Nam năm 2024 tiếp tục có những biến động mạnh về mức lương. Với nhu cầu nhân lực công nghệ cao ngày càng tăng, mức lương IT đã có những bước tăng trưởng đáng kể so với các năm trước.</p>
                    
                    <h2>Tổng quan thị trường lương IT 2024</h2>
                    <p>Theo khảo sát từ các công ty tuyển dụng hàng đầu, mức lương IT tại Việt Nam năm 2024 tăng trung bình 15-25% so với năm 2023, đặc biệt trong các lĩnh vực AI, Cloud Computing và Cybersecurity.</p>
                    
                    <blockquote>
                        "Năm 2024 đánh dấu sự bùng nổ của ngành IT với mức lương trung bình cao nhất từ trước đến nay tại Việt Nam." - Báo cáo thị trường lao động IT 2024
                    </blockquote>
                    
                    <h2>Bảng lương chi tiết theo vị trí</h2>
                    
                    <h3>1. Software Developer</h3>
                    <ul>
                        <li><strong>Fresher/Junior (0-2 năm):</strong> 8-15 triệu VNĐ</li>
                        <li><strong>Mid-level (2-5 năm):</strong> 15-30 triệu VNĐ</li>
                        <li><strong>Senior (5+ năm):</strong> 30-60 triệu VNĐ</li>
                        <li><strong>Tech Lead/Architect:</strong> 50-100+ triệu VNĐ</li>
                    </ul>
                    
                    <h3>2. Data Science & AI/ML</h3>
                    <ul>
                        <li><strong>Junior Data Analyst:</strong> 10-18 triệu VNĐ</li>
                        <li><strong>Data Scientist:</strong> 20-45 triệu VNĐ</li>
                        <li><strong>ML Engineer:</strong> 25-50 triệu VNĐ</li>
                        <li><strong>AI Research Scientist:</strong> 40-80+ triệu VNĐ</li>
                    </ul>
                    
                    <h3>3. DevOps & Cloud</h3>
                    <ul>
                        <li><strong>DevOps Engineer (Junior):</strong> 12-20 triệu VNĐ</li>
                        <li><strong>DevOps Engineer (Senior):</strong> 25-45 triệu VNĐ</li>
                        <li><strong>Cloud Architect:</strong> 40-70 triệu VNĐ</li>
                        <li><strong>Site Reliability Engineer:</strong> 30-60 triệu VNĐ</li>
                    </ul>
                    
                    <h3>4. Cybersecurity</h3>
                    <ul>
                        <li><strong>Security Analyst:</strong> 15-25 triệu VNĐ</li>
                        <li><strong>Security Engineer:</strong> 20-40 triệu VNĐ</li>
                        <li><strong>Security Architect:</strong> 35-65 triệu VNĐ</li>
                        <li><strong>CISO:</strong> 60-120+ triệu VNĐ</li>
                    </ul>
                    
                    <h3>5. Mobile Development</h3>
                    <ul>
                        <li><strong>Mobile Developer (Junior):</strong> 8-16 triệu VNĐ</li>
                        <li><strong>Mobile Developer (Senior):</strong> 20-40 triệu VNĐ</li>
                        <li><strong>Mobile Architect:</strong> 35-60 triệu VNĐ</li>
                    </ul>
                    
                    <h2>Phân tích theo khu vực địa lý</h2>
                    
                    <h3>Hồ Chí Minh (Mức lương cao nhất)</h3>
                    <p>Là trung tâm công nghệ lớn nhất Việt Nam, mức lương IT tại TP.HCM cao hơn trung bình cả nước 20-30%.</p>
                    
                    <h3>Hà Nội</h3>
                    <p>Mức lương tương đương hoặc chỉ thấp hơn TP.HCM 5-10%, đặc biệt trong các công ty fintech và startup.</p>
                    
                    <h3>Đà Nẵng</h3>
                    <p>Mức lương thấp hơn 2 thành phố lớn khoảng 15-25%, nhưng chi phí sinh hoạt cũng thấp hơn đáng kể.</p>
                    
                    <h3>Các tỉnh thành khác</h3>
                    <p>Mức lương có thể thấp hơn 30-40% so với TP.HCM, nhưng vẫn hấp dẫn với cost of living thấp.</p>
                    
                    <h2>Yếu tố ảnh hưởng đến mức lương</h2>
                    
                    <h3>1. Kỹ năng công nghệ</h3>
                    <ul>
                        <li><strong>Hot skills (AI/ML, Blockchain, Cloud):</strong> Bonus 20-50%</li>
                        <li><strong>Legacy skills:</strong> Mức lương ổn định nhưng tăng trưởng chậm</li>
                        <li><strong>Full-stack capabilities:</strong> Premium 15-25%</li>
                    </ul>
                    
                    <h3>2. Loại hình công ty</h3>
                    <ul>
                        <li><strong>Big Tech (Google, Microsoft, etc.):</strong> Cao nhất, có thể gấp 2-3 lần mức trung bình</li>
                        <li><strong>Startup có funding:</strong> Lương competitive + equity</li>
                        <li><strong>Outsourcing companies:</strong> Mức lương ổn định, tăng đều</li>
                        <li><strong>Enterprise/Traditional:</strong> Thấp hơn nhưng ổn định, phúc lợi tốt</li>
                    </ul>
                    
                    <h3>3. Kinh nghiệm và chứng chỉ</h3>
                    <ul>
                        <li><strong>AWS/Azure/GCP certifications:</strong> Bonus 10-30%</li>
                        <li><strong>Scrum Master/PMP:</strong> Bonus 15-25%</li>
                        <li><strong>Kinh nghiệm quốc tế:</strong> Premium 25-50%</li>
                    </ul>
                    
                    <h2>Xu hướng lương 2024-2025</h2>
                    
                    <h3>Các vị trí hot nhất:</h3>
                    <ol>
                        <li><strong>AI/ML Engineer:</strong> Dự kiến tăng 30-40%</li>
                        <li><strong>Cloud Security Specialist:</strong> Tăng 25-35%</li>
                        <li><strong>Blockchain Developer:</strong> Tăng 20-30%</li>
                        <li><strong>IoT Engineer:</strong> Tăng 15-25%</li>
                    </ol>
                    
                    <h3>Dự báo thị trường:</h3>
                    <ul>
                        <li>Tiếp tục thiếu hụt nhân lực chất lượng cao</li>
                        <li>Mức lương sẽ tiếp tục tăng 15-20% năm 2025</li>
                        <li>Remote work sẽ tác động đến cơ cấu lương</li>
                        <li>Các kỹ năng soft skills ngày càng quan trọng</li>
                    </ul>
                    
                    <h2>Lời khuyên đàm phán lương</h2>
                    <ol>
                        <li><strong>Research kỹ:</strong> Sử dụng dữ liệu từ nhiều nguồn khác nhau</li>
                        <li><strong>Đánh giá toàn diện:</strong> Không chỉ base salary mà cả package</li>
                        <li><strong>Thời điểm phù hợp:</strong> Sau khi nhận offer hoặc performance review</li>
                        <li><strong>Chuẩn bị bằng chứng:</strong> Thành tích, kỹ năng mới, market data</li>
                        <li><strong>Có plan B:</strong> Chuẩn bị phương án thay thế</li>
                        <li><strong>Đàm phán win-win:</strong> Tìm giải pháp có lợi cho cả hai bên</li>
                    </ol>
                `,
                category: "salary-guide",
                categoryName: "Hướng dẫn lương",
                author: "Phạm Thị D",
                publishedAt: "2024-01-08",
                readTime: "10 phút",
                imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
                tags: ["Lương", "IT", "Việt Nam", "Khảo sát", "2024"]
            },
            {
                id: 5,
                title: "Remote Work: Xu hướng làm việc từ xa sau đại dịch",
                excerpt: "Phân tích xu hướng làm việc từ xa, những lợi ích và thách thức, cũng như cách thích ứng với môi trường làm việc mới.",
                content: `
                    <p>Đại dịch COVID-19 đã thay đổi hoàn toàn cách chúng ta nhìn nhận về công việc và không gian làm việc. Remote work từ một xu hướng mới mẻ đã trở thành "new normal" và tiếp tục phát triển mạnh mẽ trong năm 2024.</p>
                    
                    <h2>Thống kê Remote Work tại Việt Nam 2024</h2>
                    <p>Theo khảo sát mới nhất từ các công ty tuyển dụng hàng đầu:</p>
                    <ul>
                        <li>75% công ty IT cho phép làm việc từ xa ít nhất 2-3 ngày/tuần</li>
                        <li>45% công ty áp dụng fully remote cho một số vị trí</li>
                        <li>90% nhân viên IT mong muốn có sự linh hoạt trong cách thức làm việc</li>
                        <li>Remote job postings tăng 300% so với trước đại dịch</li>
                    </ul>
                    
                    <blockquote>
                        "Remote work không chỉ là xu hướng tạm thời, mà đã trở thành một phần không thể thiếu trong chiến lược nhân sự của các công ty hiện đại." - CEO của một startup công nghệ hàng đầu
                    </blockquote>
                    
                    <h2>Lợi ích của Remote Work</h2>
                    
                    <h3>Đối với nhân viên:</h3>
                    <ul>
                        <li><strong>Work-life balance:</strong> Linh hoạt thời gian, giảm stress đi lại</li>
                        <li><strong>Tiết kiệm chi phí:</strong> Không tốn phí đi lại, ăn uống, trang phục</li>
                        <li><strong>Môi trường thoải mái:</strong> Làm việc trong không gian quen thuộc</li>
                        <li><strong>Tăng năng suất:</strong> Ít bị gián đoạn, tập trung tốt hơn</li>
                        <li><strong>Cơ hội việc làm rộng hơn:</strong> Không bị giới hạn địa lý</li>
                    </ul>
                    
                    <h3>Đối với doanh nghiệp:</h3>
                    <ul>
                        <li><strong>Giảm chi phí vận hành:</strong> Văn phòng, điện nước, thiết bị</li>
                        <li><strong>Mở rộng nguồn nhân lực:</strong> Tuyển dụng từ mọi nơi</li>
                        <li><strong>Giữ chân nhân tài:</strong> Tăng sự hài lòng của nhân viên</li>
                        <li><strong>Tăng năng suất:</strong> Nhân viên làm việc hiệu quả hơn</li>
                        <li><strong>ESG compliance:</strong> Giảm carbon footprint</li>
                    </ul>
                    
                    <h2>Thách thức của Remote Work</h2>
                    
                    <h3>Thách thức cá nhân:</h3>
                    <ul>
                        <li><strong>Isolation và loneliness:</strong> Thiếu tương tác xã hội</li>
                        <li><strong>Work-life boundary:</strong> Khó tách biệt công việc và cuộc sống</li>
                        <li><strong>Self-discipline:</strong> Cần kỷ luật cao để duy trì năng suất</li>
                        <li><strong>Communication challenges:</strong> Giao tiếp qua digital tools</li>
                        <li><strong>Career development:</strong> Ít cơ hội networking và mentoring</li>
                    </ul>
                    
                    <h3>Thách thức tổ chức:</h3>
                    <ul>
                        <li><strong>Team cohesion:</strong> Xây dựng văn hóa team từ xa</li>
                        <li><strong>Performance management:</strong> Đánh giá hiệu suất làm việc</li>
                        <li><strong>Security risks:</strong> Bảo mật thông tin và dữ liệu</li>
                        <li><strong>Training và onboarding:</strong> Đào tạo nhân viên mới</li>
                        <li><strong>Innovation:</strong> Khuyến khích creativity và collaboration</li>
                    </ul>
                    
                    <h2>Các mô hình Remote Work phổ biến</h2>
                    
                    <h3>1. Fully Remote</h3>
                    <p>Nhân viên làm việc hoàn toàn từ xa, không có văn phòng cố định. Phù hợp với các vị trí technical, content, design.</p>
                    
                    <h3>2. Hybrid Work</h3>
                    <p>Kết hợp giữa làm việc tại văn phòng và từ xa (2-3 ngày office, 2-3 ngày WFH). Đây là mô hình được ưa chuộng nhất.</p>
                    
                    <h3>3. Remote-First</h3>
                    <p>Công ty thiết kế quy trình và văn hóa ưu tiên remote, văn phòng chỉ là optional.</p>
                    
                    <h3>4. Flexible Remote</h3>
                    <p>Nhân viên có thể chọn làm việc từ xa khi cần thiết, không có lịch trình cố định.</p>
                    
                    <h2>Tools và Technologies hỗ trợ Remote Work</h2>
                    
                    <h3>Communication & Collaboration:</h3>
                    <ul>
                        <li><strong>Video conferencing:</strong> Zoom, Google Meet, Microsoft Teams</li>
                        <li><strong>Instant messaging:</strong> Slack, Discord, Microsoft Teams Chat</li>
                        <li><strong>Project management:</strong> Jira, Trello, Asana, Monday.com</li>
                        <li><strong>Document collaboration:</strong> Google Workspace, Office 365</li>
                    </ul>
                    
                    <h3>Development & Technical:</h3>
                    <ul>
                        <li><strong>Version control:</strong> Git, GitHub, GitLab</li>
                        <li><strong>Cloud IDE:</strong> VS Code Online, CodeSandbox, Replit</li>
                        <li><strong>Virtual desktop:</strong> AWS WorkSpaces, Azure Virtual Desktop</li>
                        <li><strong>VPN & Security:</strong> NordLayer, ExpressVPN, Cisco AnyConnect</li>
                    </ul>
                    
                    <h2>Best Practices cho Remote Work thành công</h2>
                    
                    <h3>Cho nhân viên:</h3>
                    <ol>
                        <li><strong>Tạo workspace chuyên dụng:</strong> Không gian riêng cho công việc</li>
                        <li><strong>Xây dựng routine:</strong> Thời gian bắt đầu và kết thúc rõ ràng</li>
                        <li><strong>Đầu tư equipment:</strong> Bàn ghế ergonomic, màn hình phụ, headphone</li>
                        <li><strong>Regular breaks:</strong> Nghỉ ngơi đều đặn, tránh burnout</li>
                        <li><strong>Over-communicate:</strong> Giao tiếp nhiều hơn bình thường</li>
                        <li><strong>Continuous learning:</strong> Nâng cao kỹ năng digital collaboration</li>
                    </ol>
                    
                    <h3>Cho quản lý:</h3>
                    <ol>
                        <li><strong>Result-oriented management:</strong> Tập trung vào kết quả thay vì giờ làm</li>
                        <li><strong>Regular check-ins:</strong> 1-on-1 meetings định kỳ</li>
                        <li><strong>Clear expectations:</strong> Đặt mục tiêu và deadline rõ ràng</li>
                        <li><strong>Virtual team building:</strong> Tổ chức hoạt động gắn kết online</li>
                        <li><strong>Support equipment:</strong> Cung cấp tools và thiết bị cần thiết</li>
                        <li><strong>Mental health support:</strong> Quan tâm đến sức khỏe tinh thần nhân viên</li>
                    </ol>
                    
                    <h2>Tương lai của Remote Work tại Việt Nam</h2>
                    
                    <h3>Dự báo 2024-2025:</h3>
                    <ul>
                        <li>Hybrid work sẽ trở thành standard cho ngành IT</li>
                        <li>Đầu tư mạnh vào digital infrastructure</li>
                        <li>Pháp lý về remote work sẽ được hoàn thiện</li>
                        <li>Xuất hiện các coworking spaces chuyên nghiệp</li>
                        <li>Remote work sẽ mở rộng sang các ngành khác</li>
                    </ul>
                    
                    <h3>Cơ hội cho developers Việt Nam:</h3>
                    <ul>
                        <li>Làm việc cho các công ty quốc tế với mức lương USD</li>
                        <li>Tham gia các dự án global scale</li>
                        <li>Học hỏi từ các team đa văn hóa</li>
                        <li>Phát triển kỹ năng communication và collaboration</li>
                        <li>Cân bằng cuộc sống và sự nghiệp tốt hơn</li>
                    </ul>
                    
                    <h2>Kết luận</h2>
                    <p>Remote work đã trở thành một phần không thể thiếu của thị trường lao động hiện đại. Để thành công trong môi trường này, cả nhân viên và doanh nghiệp cần thích ứng, đầu tư vào công nghệ và phát triển các kỹ năng mới. Tương lai của công việc sẽ linh hoạt hơn, đa dạng hơn và tập trung vào hiệu quả thực sự.</p>
                `,
                category: "market-trends",
                categoryName: "Xu hướng thị trường",
                author: "Hoàng Văn E",
                publishedAt: "2024-01-05",
                readTime: "8 phút",
                imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop",
                tags: ["Remote", "Làm việc", "Xu hướng", "COVID-19", "Hybrid"]
            },
            {
                id: 6,
                title: "Chuyển đổi ngành nghề: Bí quyết thành công",
                excerpt: "Hướng dẫn chi tiết cách chuyển đổi ngành nghề một cách hiệu quả, từ việc chuẩn bị kỹ năng đến tìm kiếm cơ hội mới.",
                content: `
                    <p>Chuyển đổi ngành nghề là một quyết định quan trọng trong cuộc đời mỗi người. Với sự phát triển nhanh chóng của công nghệ và thay đổi của thị trường lao động, việc pivot career đã trở nên phổ biến hơn bao giờ hết, đặc biệt là việc chuyển sang ngành IT.</p>
                    
                    <h2>Tại sao nên cân nhắc chuyển đổi ngành nghề?</h2>
                    <p>Có nhiều lý do khiến một người quyết định thay đổi hướng nghề nghiệp:</p>
                    <ul>
                        <li><strong>Passion mới:</strong> Khám phá được đam mê thực sự</li>
                        <li><strong>Market demand:</strong> Ngành hiện tại đang suy thoái, cần tìm cơ hội mới</li>
                        <li><strong>Better compensation:</strong> Tìm kiếm mức lương và phúc lợi tốt hơn</li>
                        <li><strong>Work-life balance:</strong> Môi trường làm việc linh hoạt hơn</li>
                        <li><strong>Future-proofing:</strong> Chuẩn bị cho tương lai số hóa</li>
                        <li><strong>Personal growth:</strong> Thách thức bản thân với điều mới mẻ</li>
                    </ul>
                    
                    <blockquote>
                        "Việc chuyển đổi ngành nghề không phải là từ bỏ quá khứ, mà là đầu tư cho tương lai. Những kinh nghiệm và kỹ năng từ ngành cũ sẽ là lợi thế độc đáo trong ngành mới." - Career Coach chuyên nghiệp
                    </blockquote>
                    
                    <h2>Các bước chuẩn bị chuyển đổi ngành nghề</h2>
                    
                    <h3>Bước 1: Tự đánh giá và định hướng</h3>
                    <ul>
                        <li><strong>Skills audit:</strong> Liệt kê tất cả kỹ năng hiện có (technical & soft skills)</li>
                        <li><strong>Interest assessment:</strong> Xác định sở thích và đam mê thực sự</li>
                        <li><strong>Values clarification:</strong> Định nghĩa giá trị cốt lõi trong công việc</li>
                        <li><strong>Market research:</strong> Nghiên cứu ngành nghề mục tiêu</li>
                        <li><strong>Gap analysis:</strong> Xác định kỹ năng cần học thêm</li>
                    </ul>
                    
                    <h3>Bước 2: Xây dựng kế hoạch chi tiết</h3>
                    <ol>
                        <li><strong>Timeline:</strong> Đặt mốc thời gian cụ thể (6 tháng, 1 năm, 2 năm)</li>
                        <li><strong>Learning roadmap:</strong> Lộ trình học tập và phát triển kỹ năng</li>
                        <li><strong>Financial planning:</strong> Chuẩn bị tài chính cho thời gian transition</li>
                        <li><strong>Network building:</strong> Xây dựng mối quan hệ trong ngành mới</li>
                        <li><strong>Portfolio development:</strong> Tạo dựng portfolio chứng minh năng lực</li>
                    </ol>
                    
                    <h3>Bước 3: Skill Development</h3>
                    <ul>
                        <li><strong>Online courses:</strong> Coursera, Udemy, edX, Pluralsight</li>
                        <li><strong>Bootcamps:</strong> Các khóa học intensive 3-6 tháng</li>
                        <li><strong>Certifications:</strong> Lấy chứng chỉ được công nhận trong ngành</li>
                        <li><strong>Side projects:</strong> Làm dự án cá nhân để thực hành</li>
                        <li><strong>Mentorship:</strong> Tìm mentor từ ngành mục tiêu</li>
                    </ul>
                    
                    <h2>Chuyển sang ngành IT: Case Study phổ biến</h2>
                    
                    <h3>Từ Marketing sang UX/UI Design</h3>
                    <p><strong>Transferable skills:</strong> User research, customer insights, creativity, communication</p>
                    <p><strong>Skills cần học:</strong> Design tools (Figma, Sketch), prototyping, user testing, design principles</p>
                    <p><strong>Timeline:</strong> 6-12 tháng</p>
                    <p><strong>Entry path:</strong> Junior UX Designer → UX Designer → Senior UX Designer</p>
                    
                    <h3>Từ Finance sang Data Analytics</h3>
                    <p><strong>Transferable skills:</strong> Analytical thinking, attention to detail, Excel proficiency, business acumen</p>
                    <p><strong>Skills cần học:</strong> SQL, Python/R, data visualization (Tableau, Power BI), statistics</p>
                    <p><strong>Timeline:</strong> 8-15 tháng</p>
                    <p><strong>Entry path:</strong> Data Analyst → Senior Data Analyst → Data Scientist</p>
                    
                    <h3>Từ Engineering sang Software Development</h3>
                    <p><strong>Transferable skills:</strong> Problem-solving, logical thinking, mathematics, project management</p>
                    <p><strong>Skills cần học:</strong> Programming languages, software architecture, databases, frameworks</p>
                    <p><strong>Timeline:</strong> 12-18 tháng</p>
                    <p><strong>Entry path:</strong> Junior Developer → Mid-level Developer → Senior Developer</p>
                    
                    <h2>Chiến lược tìm kiếm việc làm khi chuyển ngành</h2>
                    
                    <h3>1. Crafting your story</h3>
                    <ul>
                        <li>Tạo narrative mạch lạc về lý do chuyển ngành</li>
                        <li>Nhấn mạnh transferable skills</li>
                        <li>Thể hiện passion và commitment với ngành mới</li>
                        <li>Chuẩn bị câu trả lời cho câu hỏi "Tại sao chuyển ngành?"</li>
                    </ul>
                    
                    <h3>2. Networking strategies</h3>
                    <ul>
                        <li><strong>Industry events:</strong> Tham gia conferences, meetups, workshops</li>
                        <li><strong>LinkedIn optimization:</strong> Update profile, engage với content ngành mới</li>
                        <li><strong>Informational interviews:</strong> Gặp gỡ professionals trong ngành</li>
                        <li><strong>Online communities:</strong> Tham gia groups, forums, Discord servers</li>
                        <li><strong>Alumni network:</strong> Kết nối với cựu sinh viên đang làm trong ngành</li>
                    </ul>
                    
                    <h3>3. Application strategy</h3>
                    <ul>
                        <li><strong>Target entry-level positions:</strong> Chấp nhận bắt đầu từ vị trí thấp hơn</li>
                        <li><strong>Apply early and often:</strong> Đừng chờ đợi perfect fit</li>
                        <li><strong>Leverage connections:</strong> Sử dụng network để có referrals</li>
                        <li><strong>Consider contract/freelance:</strong> Làm project để tích lũy kinh nghiệm</li>
                        <li><strong>Startup opportunities:</strong> Startup thường open-minded hơn với career changers</li>
                    </ul>
                    
                    <h2>Thách thức và cách vượt qua</h2>
                    
                    <h3>1. Ageism và experience bias</h3>
                    <p><strong>Solution:</strong> Nhấn mạnh maturity, work ethic và transferable skills. Tìm companies có culture inclusive.</p>
                    
                    <h3>2. Salary cut</h3>
                    <p><strong>Solution:</strong> Coi đây là investment, lên kế hoạch tài chính dài hạn. Negotiate based on total compensation package.</p>
                    
                    <h3>3. Impostor syndrome</h3>
                    <p><strong>Solution:</strong> Remember rằng mọi expert đều từng là beginner. Focus vào learning và growth mindset.</p>
                    
                    <h3>4. Technical skill gap</h3>
                    <p><strong>Solution:</strong> Đầu tư thời gian học tập, làm projects, tìm mentor. Practice daily và consistent.</p>
                    
                    <h2>Success stories từ Việt Nam</h2>
                    
                    <h3>Case 1: Teacher → Software Developer</h3>
                    <p>Cô giáo Toán 30 tuổi chuyển sang làm Developer sau 8 tháng học coding. Hiện đang làm Backend Developer với lương 25 triệu/tháng.</p>
                    
                    <h3>Case 2: Accountant → Data Analyst</h3>
                    <p>Kế toán viên 28 tuổi học thêm SQL và Python trong 6 tháng, chuyển sang làm Data Analyst tại fintech startup.</p>
                    
                    <h3>Case 3: Sales → Product Manager</h3>
                    <p>Sales Manager 35 tuổi leverage customer insights để chuyển sang Product Management, hiện leading product team tại e-commerce company.</p>
                    
                    <h2>Resources hữu ích cho career transition</h2>
                    
                    <h3>Learning platforms:</h3>
                    <ul>
                        <li><strong>Programming:</strong> freeCodeCamp, Codecademy, The Odin Project</li>
                        <li><strong>Data Science:</strong> Kaggle Learn, DataCamp, Coursera</li>
                        <li><strong>Design:</strong> Google UX Design Certificate, Adobe Creative Cloud</li>
                        <li><strong>Business/PM:</strong> Product School, Udacity Product Manager Nanodegree</li>
                    </ul>
                    
                    <h3>Vietnamese communities:</h3>
                    <ul>
                        <li>Kipalog - Developer community</li>
                        <li>Viblo - Tech knowledge sharing</li>
                        <li>Vietnam AI Community</li>
                        <li>Product Hunt Vietnam</li>
                        <li>UX Vietnam</li>
                    </ul>
                    
                    <h2>Timeline thực tế cho career transition</h2>
                    
                    <h3>Giai đoạn 1 (Tháng 1-3): Research và Planning</h3>
                    <ul>
                        <li>Self-assessment và career exploration</li>
                        <li>Industry research và informational interviews</li>
                        <li>Xây dựng learning plan và timeline</li>
                    </ul>
                    
                    <h3>Giai đoạn 2 (Tháng 4-9): Skill Building</h3>
                    <ul>
                        <li>Intensive learning và practice</li>
                        <li>Build portfolio projects</li>
                        <li>Networking và community engagement</li>
                    </ul>
                    
                    <h3>Giai đoạn 3 (Tháng 10-12): Job Search</h3>
                    <ul>
                        <li>CV rewrite và LinkedIn optimization</li>
                        <li>Interview preparation</li>
                        <li>Active job applications và networking</li>
                    </ul>
                    
                    <h2>Kết luận</h2>
                    <p>Chuyển đổi ngành nghề là một journey đầy thách thức nhưng cũng rất đáng giá. Với preparation kỹ lưỡng, mindset đúng đắn và persistent effort, bạn hoàn toàn có thể thành công trong ngành nghề mới. Hãy nhớ rằng success không đến trong một đêm - hãy kiên nhẫn với bản thân và enjoy the learning process.</p>
                `,
                category: "career-tips",
                categoryName: "Lời khuyên nghề nghiệp",
                author: "Ngô Thị F",
                publishedAt: "2024-01-03",
                readTime: "9 phút",
                imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
                tags: ["Chuyển nghề", "Nghề nghiệp", "Phát triển", "IT", "Kỹ năng"]
            }
        ];

// ================== Init (chuẩn như trang list) ==================
document.addEventListener('DOMContentLoaded', () => {
  // loadFragments xong rồi mới render nội dung
  loadFragments()
    .catch(err => console.error('Error loading fragments:', err))
    .finally(() => {
      loadArticle();
      bindDetailEvents();
    });
});

// ================== Helpers ==================
function getArticleIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('id');
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function viFullDate(dateString) {
  const d = new Date(dateString);
  if (isNaN(d)) return 'Không rõ';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function showError() {
  const loading = document.getElementById('loading-container');
  const error = document.getElementById('error-container');
  if (loading) loading.style.display = 'none';
  if (error) error.style.display = 'block';
}

function showArticle() {
  const loading = document.getElementById('loading-container');
  const article = document.getElementById('article-container');
  if (loading) loading.style.display = 'none';
  if (article) article.style.display = 'block';
}

// ================== Render ==================
function loadArticle() {
  const id = getArticleIdFromURL();
  if (!id) {
    showError();
    return;
  }

  const article = blogPosts.find(p => p.id === id);
  if (!article) {
    showError();
    return;
  }

  currentArticle = article;
  renderArticle(article);
  renderRelated(article);
  showArticle();
}

function renderArticle(article) {
  // Title tab
  document.title = `${article.title} - JobPortal Blog`;

  // Breadcrumb + header meta
  setText('breadcrumb-category', article.categoryName);
  setText('article-category', article.categoryName);
  setText('article-read-time', `${article.readTime} đọc`);
  setText('article-title', article.title);

  // Author
  const avatar = document.getElementById('author-avatar');
  if (avatar) avatar.textContent = article.author?.charAt(0) || '?';
  setText('article-author', article.author);
  setText('article-date', viFullDate(article.publishedAt));

  // Featured image
  const featured = document.getElementById('featured-image');
  if (featured) {
    featured.innerHTML = `
      <img src="${article.imageUrl}" alt="${escapeHtml(article.title)}"
           class="w-full h-full object-cover"/>
    `;
  }

  // Content (cho demo dùng innerHTML; khi dùng API Markdown thì render qua sanitizer)
  const content = document.getElementById('article-content');
  if (content) content.innerHTML = article.content;

  // Tags
  const tags = document.getElementById('article-tags');
  if (tags) {
    tags.innerHTML = (article.tags || [])
      .map(t => `<button class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition"
                      data-tag="${t}">#${t}</button>`)
      .join('');
  }
}

function renderRelated(current) {
  const sameCategory = blogPosts
    .filter(p => p.id !== current.id && p.category === current.category)
    .slice(0, 3);

  const box = document.getElementById('related-articles');
  if (!box) return;

  if (!sameCategory.length) {
    box.innerHTML = '<p class="text-gray-600 col-span-full text-center">Không có bài viết liên quan.</p>';
    return;
  }

  box.innerHTML = sameCategory.map(a => `
    <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
         onclick="openArticle(${a.id})">
      <div class="aspect-video bg-gray-200">
        <img src="${a.imageUrl}" alt="${escapeHtml(a.title)}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <span class="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium mb-2">
          ${a.categoryName}
        </span>
        <h4 class="font-semibold text-gray-900 mb-2 line-clamp-2">${a.title}</h4>
        <p class="text-gray-600 text-sm mb-2 line-clamp-2">${a.excerpt}</p>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>${a.author}</span>
          <span>${viFullDate(a.publishedAt)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ================== Events ==================
function bindDetailEvents() {
  // Tag click → về blog list với search theo tag
  const tagsBox = document.getElementById('article-tags');
  if (tagsBox) {
    tagsBox.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-tag]');
      if (!btn) return;
      const tag = btn.getAttribute('data-tag');
      // Điều hướng kèm query ?q=
      window.location.href = `blog.html?q=${encodeURIComponent(tag)}`;
    });
  }
}

// Related click
function openArticle(articleId) {
  window.location.href = `blog-detail.html?id=${articleId}`;
}

// ================== Share ==================
function shareOnFacebook() {
  if (!currentArticle) return;
  const url = encodeURIComponent(window.location.href);
  const quote = encodeURIComponent(currentArticle.title);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
  if (!currentArticle) return;
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`${currentArticle.title} - JobPortal`);
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
}

function shareOnLinkedIn() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    // Nếu đã có utils.showSuccessToast thì dùng, không thì fallback
    if (window?.utils?.showSuccessToast) {
      window.utils.showSuccessToast('Đã copy link bài viết!');
    } else {
      const n = document.createElement('div');
      n.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      n.textContent = 'Đã copy link bài viết!';
      document.body.appendChild(n);
      setTimeout(() => n.remove(), 2500);
    }
  });
}

// ================== Small utils ==================
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? '';
}

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}