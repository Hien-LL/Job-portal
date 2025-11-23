// Global variables
        let currentJobSlug = '';
        let currentJobId = null;
        let currentCompanySlug = ''; // ✅ THÊM: Khai báo biến này
        let isJobSaved = false;
        let isJobApplied = false;
        

        function viewCompany(slug, companyId) {
            window.location.href = `company-detail.html?slug=${currentCompanySlug.replace(/"/g, '')}`;
        }

        // Get job slug from URL parameters
        function getJobSlugFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('slug') || urlParams.get('job');
        }

        // Load job detail from API
        async function loadJobDetail() {
            const jobSlug = getJobSlugFromURL();
            
            if (!jobSlug) {
                showError('Không tìm thấy thông tin việc làm');
                return;
            }

            try {
                const url = buildApiUrl(API_CONFIG.JOBS.GET_DETAIL, { jobSlug });
                const response = await fetch(url);
                
                if (!response.ok) {
                    console.error('API error:', response.status, response.statusText);
                    showError('Lỗi khi tải thông tin việc làm');
                    return;
                }
                
                const result = await response.json();

                if (result.success && result.data) {
                    displayJobDetail(result.data);
                    loadSimilarJobs(result.data.category?.slug);
                    
                    // Check if user has applied for this job (only if logged in)
                    if (authService.isAuthenticated()) {
                        checkJobApplied(result.data.id);
                        checkJobSaved(result.data.slug);
                    }
                    
                    hideLoading();
                } else {
                    console.error('Invalid API response:', result);
                    showError('Không tìm thấy việc làm này');
                }
            } catch (error) {
                console.error('Error loading job detail:', error);
                showError('Lỗi khi tải thông tin việc làm');
            }
        }

        // Display job detail
        function displayJobDetail(job) {
            // Store job info globally
            currentJobSlug = job.slug;
            currentJobId = job.id;
            currentCompanySlug = job.company?.slug;

            // Update page title
            document.title = `${job.title} - ${job.company?.name} | jobPortal`;

            // Job header
            document.getElementById('job-title').textContent = job.title;
            document.getElementById('company-name').textContent = job.company?.name || 'Công ty không xác định';
            
            if (job.company?.verified) {
                document.getElementById('company-verified').classList.remove('hidden');
            }

            // Company logo - ✅ SỬA: Dùng API_CONFIG.FILE_BASE_URL
            const logoElements = [
                document.getElementById('company-logo'),
                document.getElementById('company-sidebar-logo')
            ];
            
            logoElements.forEach(element => {
                if (job.company?.logoUrl) {
                    element.innerHTML = `<img src="${API_CONFIG.FILE_BASE_URL}${job.company.logoUrl}" alt="${job.company.name}" class="w-full h-full object-contain rounded">`;
                } else {
                    element.innerHTML = `<span class="text-2xl">${getCategoryIcon(job.category?.name)}</span>`;
                }
            });

            // Job info
            const locationText = job.isRemote ? 'Remote' : (job.location?.displayName || 'Không xác định');
            const salaryText = formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency);
            
            document.getElementById('job-location').textContent = `📍 ${locationText}`;
            document.getElementById('job-salary').textContent = `💰 ${salaryText}`;
            document.getElementById('job-type').textContent = `⏰ ${job.seniority || 'Toàn thời gian'}`;
            document.getElementById('published-date').textContent = formatPublishedDate(job.publishedAt);

            // Job description - Display HTML directly (from Quill editor)
            document.getElementById('job-description').innerHTML = job.description || '<p>Không có mô tả công việc</p>';

            // Job requirements (if available in API response)
            if (job.requirements) {
                document.getElementById('job-requirements').innerHTML = job.requirements;
            } else {
                // Hide requirements section if not available
                const reqSection = document.querySelector('.bg-white:has(#job-requirements)');
                if (reqSection) reqSection.style.display = 'none';
            }

            // Benefits
            if (job.benefits && job.benefits.length > 0) {
                const benefitsHTML = job.benefits.map(benefit => `
                    <div class="flex items-center gap-2 text-sm">
                        <span class="text-green-500">✓</span>
                        <span>${benefit.name}</span>
                    </div>
                `).join('');
                document.getElementById('job-benefits').innerHTML = benefitsHTML;
            } else {
                const benefitsSection = document.getElementById('benefits-section');
                if (benefitsSection) benefitsSection.style.display = 'none';
            }

            // Skills
            if (job.skills && job.skills.length > 0) {
                const skillsHTML = job.skills.map(skill => `
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        ${skill.name}
                    </span>
                `).join('');
                document.getElementById('job-skills').innerHTML = skillsHTML;
            } else {
                const skillsSection = document.getElementById('skills-section');
                if (skillsSection) skillsSection.style.display = 'none';
            }

            // Sidebar info
            document.getElementById('sidebar-published').textContent = formatPublishedDate(job.publishedAt);
            document.getElementById('sidebar-expires').textContent = job.expiresAt ? formatDate(job.expiresAt) : 'Không xác định';
            document.getElementById('sidebar-location').textContent = locationText;
            document.getElementById('sidebar-salary').textContent = salaryText;
            document.getElementById('sidebar-seniority').textContent = job.seniority || 'Không xác định';
            document.getElementById('sidebar-experience').textContent = job.yearsOfExperience ? job.yearsOfExperience + " Năm Kinh nghiệm" : 'Không yêu cầu';

            // Company info
            document.getElementById('company-sidebar-name').textContent = job.company?.name || 'Công ty không xác định';
            document.getElementById('company-size').textContent = formatCompanySize(job.company?.size_min, job.company?.size_max);
            
            if (job.company?.website) {
                const websiteLink = document.querySelector('#company-website a');
                websiteLink.href = job.company.website.startsWith('http') ? job.company.website : `https://${job.company.website}`;
                websiteLink.textContent = job.company.website;
            } else {
                const websiteSection = document.getElementById('company-website');
                if (websiteSection) websiteSection.style.display = 'none';
            }

            document.getElementById('company-followers').innerHTML = `
                <span>👥</span>
                <span>${job.company?.followerCount || 0} người theo dõi</span>
            `;

            // Apply button functionality will be set by updateApplyButton()
            // Initial state will be updated after checking application status
        }

        // Check if user has already applied for this job - ✅ ĐÃ SỬA
        async function checkJobApplied(jobId) {
            try {
                const url = API_CONFIG.JOBS.CHECK_APPLIED.replace(':jobId', jobId);
                const response = await authService.apiRequest(url, {
                    method: 'GET'
                });

                if (response && response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        isJobApplied = result.data === true;
                        updateApplyButton();
                    }
                }
            } catch (error) {
                console.error('Error checking application status:', error);
            }
        }

        // Check if user has saved this job - ✅ ĐÃ SỬA
        async function checkJobSaved(jobSlug) {
            try {
                const url = API_CONFIG.JOBS.CHECK_SAVED.replace(':jobSlug', jobSlug);
                const response = await authService.apiRequest(url, {
                    method: 'GET'
                });

                if (response && response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        isJobSaved = result.data === true;
                        updateSaveButton();
                    }
                }
            } catch (error) {
                console.error('Error checking saved job status:', error);
            }
        }

        // Update apply button based on application status
        function updateApplyButton() {
            const applyBtn = document.getElementById('apply-btn');
            
            if (isJobApplied) {
                applyBtn.textContent = 'Đã ứng tuyển';
                applyBtn.disabled = true;
                applyBtn.className = 'btn-secondary flex-1 btn-disabled';
                applyBtn.onclick = null;
                applyBtn.title = 'Bạn đã ứng tuyển công việc này';
            } else {
                applyBtn.textContent = 'Ứng tuyển ngay';
                applyBtn.disabled = false;
                applyBtn.className = 'btn-primary flex-1';
                applyBtn.onclick = () => applyToJob(currentJobSlug, currentJobId);
                applyBtn.title = 'Nhấn để ứng tuyển';
            }
        }

        // Load similar jobs
        async function loadSimilarJobs(categorySlug) {
            if (!categorySlug) return;

            try {
                const url = API_CONFIG.JOBS.GET_RELATED.replace(':categorySlug', categorySlug).replace(':jobSlug', currentJobSlug);
                const response = await authService.apiRequest(url, {
                    method: 'GET'
                });
                const result = await response.json();

                if (result.success && result.data && result.data.content) {
                    displaySimilarJobs(result.data.content.slice(0, 3));
                }
            } catch (error) {
                console.error('Error loading similar jobs:', error);
            }
        }

        // Display similar jobs
        function displaySimilarJobs(jobs) {
            const container = document.getElementById('similar-jobs');
            
            if (!jobs || jobs.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-sm">Không có việc làm tương tự</p>';
                return;
            }

            const html = jobs.map(job => `
                <div class="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition cursor-pointer" 
                     onclick="window.location.href='job-detail.html?slug=${job.slug}'">
                    <h4 class="font-medium text-gray-900 text-sm mb-1">${job.title}</h4>
                    <p class="text-gray-600 text-xs mb-2">${job.company?.name}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <span>💰 ${formatSalary(job.salaryMin, job.salaryMax)}</span>
                        <span>${formatPublishedDate(job.publishedAt)}</span>
                    </div>
                </div>
            `).join('');

            container.innerHTML = html;
        }

        // Utility functions - Delegated to markdown-service.js
        // These are wrappers for markdown-service functions to maintain backward compatibility
        const formatSalary = formatSalaryRange;
        const formatPublishedDate = formatPublishedDateRelative;
        const formatDate = formatDateDisplay;
        const formatCompanySize = formatCompanySizeDisplay;
        // Use parseMarkdown directly for formatting job descriptions
        function formatDescription(text) {
            return parseMarkdown(text);
        }

        function getCategoryIcon(categoryName) {
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

        function applyToJob(slug, jobId) {
            // Check if user is logged in - ✅ SỬA
            if (!authService.isAuthenticated()) {
                showErrorNotification('Vui lòng đăng nhập để ứng tuyển', 4000);
                setTimeout(() => authService.requireAuth(), 1000);
                return;
            }
            
            // Load resumes and show apply modal
            loadUserResumes().then(() => {
                openApplyModal(slug, jobId);
            });
        }

        // Load user resumes for selection - ✅ ĐÃ SỬA
        async function loadUserResumes() {
            try {
                const url = API_CONFIG.RESUMES.LIST;
                const response = await authService.apiRequest(url, {
                    method: 'GET'
                });

                if (!response || !response.ok) {
                    throw new Error('Failed to load resumes');
                }

                const result = await response.json();
                if (result.success && result.data) {
                    populateResumeSelect(result.data);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error loading resumes:', error);
                showErrorNotification('Lỗi khi tải danh sách CV', 4000);
                return false;
            }
        }

        // Populate resume select dropdown
        function populateResumeSelect(resumes) {
            const select = document.getElementById('resume-select');
            select.innerHTML = '<option value="">-- Chọn CV --</option>';

            if (resumes.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Bạn chưa có CV';
                option.disabled = true;
                select.appendChild(option);
                return;
            }

            resumes.forEach(resume => {
                const option = document.createElement('option');
                option.value = resume.id;
                option.textContent = `${resume.title}${resume.isDefault ? ' (Mặc định)' : ''}`;
                select.appendChild(option);
            });

            // Set default resume as selected
            const defaultResume = resumes.find(r => r.isDefault);
            if (defaultResume) {
                select.value = defaultResume.id;
            }
        }

        // Open apply modal
        function openApplyModal(slug, jobId) {
            currentJobSlug = slug;
            currentJobId = jobId;

            // Populate job info in modal
            setTextContent('modal-job-title', document.getElementById('job-title').textContent);
            setTextContent('modal-job-company', document.getElementById('company-name').textContent);

            // Clear form
            setElementValue('resume-select', '');
            setElementValue('cover-letter', '');
            setTextContent('cover-letter-count', '0/1000 ký tự');

            openModal('apply-modal');
        }

        // Close apply modal
        function closeApplyModal() {
            closeModal('apply-modal');
        }

        // Handle cover letter character count
        document.addEventListener('DOMContentLoaded', () => {
            const coverLetterInput = document.getElementById('cover-letter');
            if (coverLetterInput) {
                coverLetterInput.addEventListener('input', function() {
                    const count = this.value.length;
                    document.getElementById('cover-letter-count').textContent = `${count}/1000 ký tự`;
                    
                    if (count > 1000) {
                        this.value = this.value.substring(0, 1000);
                    }
                });
            }
        });

        // Submit application - ✅ ĐÃ SỬA
        async function submitApplication(event) { // ✅ THÊM event parameter
            try {
                const resumeId = getElementValue('resume-select');
                const coverLetter = getElementValue('cover-letter').trim();

                // Validation
                if (!resumeId) {
                    showErrorNotification('Vui lòng chọn CV', 4000);
                    return;
                }

                if (!currentJobId) {
                    showErrorNotification('Không có thông tin việc làm', 4000);
                    return;
                }

                // Show loading state
                const submitBtn =
                   event?.target
                    || document.getElementById('apply-submit-btn')
                    || document.getElementById('apply-btn');

                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang ứng tuyển...';

                const url = API_CONFIG.JOBS.APPLY.replace(':jobId', currentJobId);
                const response = await authService.apiRequest(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        resumeId: parseInt(resumeId),
                        coverLetter: coverLetter || ''
                    })
                });

                if (!response || !response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Ứng tuyển thất bại');
                }

                const result = await response.json();
                if (result.success) {
                    showSuccessNotification('Ứng tuyển thành công! Chúc bạn may mắn.', 5000);
                    closeApplyModal();
                    
                    // Update application status
                    isJobApplied = true;
                    updateApplyButton();
                } else {
                    throw new Error(result.message || 'Ứng tuyển thất bại');
                }
            } catch (error) {
                console.error('Error submitting application:', error);
                showErrorNotification(`Lỗi: ${error.message}`, 5000);
            } finally {
                const btn =
                    event?.target
                    || document.getElementById('apply-submit-btn')
                    || document.getElementById('apply-btn');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Ứng tuyển ngay';
                }
            }
        }

        function hideLoading() {
            hideElement('loading-container');
            showElement('job-detail-container');
        }

        function showError(message) {
            hideElement('loading-container');
            showElement('error-container');
            
            const errorTitle = document.querySelector('#error-container h2');
            const errorText = document.querySelector('#error-container p');
            
            if (message === 'Không tìm thấy thông tin việc làm') {
                errorTitle.textContent = 'Thiếu thông tin';
                errorText.textContent = 'Vui lòng truy cập từ trang tìm việc để xem chi tiết.';
            } else {
                errorTitle.textContent = 'Có lỗi xảy ra';
                errorText.textContent = message;
            }
        }

        // Toggle save job functionality - ✅ ĐÃ SỬA
        async function toggleSaveJob() {
            // ✅ SỬA: Dùng authService.requireAuth()
            if (!authService.isAuthenticated()) {
                showErrorNotification('Vui lòng đăng nhập để lưu việc làm', 4000);
                setTimeout(() => authService.requireAuth(), 1000);
                return;
            }

            if (!currentJobSlug) {
                showErrorNotification('Không thể lưu việc làm này', 4000);
                return;
            }

            try {
                const method = isJobSaved ? 'DELETE' : 'POST';
                // ✅ SỬA: Dùng buildApiUrl với API_CONFIG
                const endpoint = isJobSaved ? 
                    API_CONFIG.JOBS.UNSAVE : 
                    API_CONFIG.JOBS.SAVE;
                const url = endpoint.replace(':jobSlug', currentJobSlug);
                
                const response = await authService.apiRequest(url, {
                    method: method
                });

                if (!response || !response.ok) {
                    const result = await response.json();
                    throw new Error(result?.message || 'Failed to save/unsave job');
                }
                
                const result = await response.json();
                
                if (result.success) {
                    isJobSaved = !isJobSaved;
                    updateSaveButton();
                    showSuccessNotification(isJobSaved ? 'Đã lưu việc làm' : 'Đã bỏ lưu việc làm', 3000);
                } else {
                    throw new Error(result.message || 'Failed to save/unsave job');
                }
            } catch (error) {
                console.error('Error saving/unsaving job:', error);
                showErrorNotification(error.message || 'Có lỗi xảy ra khi lưu việc làm', 4000);
            }
        }

        // Update save button text and style
        function updateSaveButton() {
            const saveBtn = document.getElementById('save-job-btn');
            const saveText = document.getElementById('save-text');
            
            if (isJobSaved) {
                saveBtn.className = 'btn-secondary';
                saveText.textContent = 'Đã lưu';
            } else {
                saveBtn.className = 'btn-outline';
                saveText.textContent = 'Lưu việc làm';
            }
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', () => {
            loadJobDetail();

            // Add favorite functionality
            const favoriteBtn = document.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', function() {
                    this.classList.toggle('text-red-500');
                    this.textContent = this.classList.contains('text-red-500') ? '♥' : '♡';
                });
            }
        });
