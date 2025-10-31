        let currentApplicationId = null;

        // Get application ID from URL
        function getApplicationIdFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id');
        }

        // Load application detail
        async function loadApplicationDetail() {
            try {
                const appId = getApplicationIdFromURL();
                if (!appId) {
                    showError();
                    return;
                }

                currentApplicationId = appId;

                if (!authService.isAuthenticated()) {
                    window.location.href = 'login.html';
                    return;
                }

                const url = buildApiUrl(API_CONFIG.APPLICATIONS.GET_DETAIL, { applicationId: appId });
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to load application');
                }

                const result = await response.json();
                if (result.success && result.data) {
                    displayApplicationDetail(result.data);
                    loadApplicationTimeline(appId);
                    
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('content').classList.remove('hidden');
                } else {
                    throw new Error('Invalid response');
                }
            } catch (error) {
                console.error('Error loading application detail:', error);
                showError();
            }
        }

        // Display application detail
        function displayApplicationDetail(data) {
            // Candidate info
            document.getElementById('candidate-name').textContent = data.name || 'Chưa xác định';
            document.getElementById('candidate-headline').textContent = data.headline || 'Chưa xác định';
            document.getElementById('candidate-email').textContent = data.email || 'Chưa xác định';
            document.getElementById('candidate-phone').textContent = data.phone || 'Chưa xác định';
            document.getElementById('candidate-address').textContent = data.address || 'Chưa xác định';
            
            // Render summary with Markdown support
            if (data.summary) {
                const htmlContent = DOMPurify.sanitize(marked.parse(data.summary));
                document.getElementById('candidate-summary').innerHTML = htmlContent;
            } else {
                document.getElementById('candidate-summary').textContent = 'Chưa có tóm tắt';
            }
            
            if (data.avatarUrl) {
                document.getElementById('candidate-avatar').src = window.APP_CONFIG.API_BASE + data.avatarUrl;
            } else {
                document.getElementById('candidate-avatar').src = 'https://via.placeholder.com/128/6B7280/FFFFFF?text=' + (data.name ? data.name.charAt(0) : 'U');
            }

            // Cover letter
            if (data.coverLetter) {
                document.getElementById('cover-letter').textContent = data.coverLetter;
            }

            // Status
            const statusBadge = document.getElementById('status-badge');
            const statusClass = getStatusClass(data.status?.code);
            statusBadge.className = `inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusClass} w-full justify-center`;
            statusBadge.textContent = data.status?.name || 'Chưa xác định';

            // Applied date
            document.getElementById('applied-date').textContent = formatDate(data.appliedAt);

            // Skills
            if (data.skills && data.skills.length > 0) {
                document.getElementById('skills-container').innerHTML = data.skills.map(skill => `
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        ${skill.name}
                    </span>
                `).join('');
            } else {
                document.getElementById('skills-container').innerHTML = '<p class="text-gray-500 text-sm">Chưa có kỹ năng</p>';
            }

            // Resume info
            if (data.resume) {
                const resume = data.resume;
                document.getElementById('resume-title').textContent = resume.title || 'CV không có tiêu đề';
                document.getElementById('resume-summary').textContent = resume.summary || 'Chưa có mô tả';

                // Experience
                if (resume.experiences && resume.experiences.length > 0) {
                    document.getElementById('experience-container').innerHTML = resume.experiences.map(exp => `
                        <div class="border-l-4 border-blue-500 pl-4 pb-4">
                            <h4 class="font-semibold text-gray-900">${exp.position || 'Chưa xác định'}</h4>
                            <p class="text-blue-600 font-medium text-sm">${exp.company || 'Chưa xác định'}</p>
                            <p class="text-gray-600 text-xs mt-1">
                                ${formatDate(exp.startDate)} - ${exp.current ? 'Hiện tại' : formatDate(exp.endDate)}
                            </p>
                            ${exp.current ? '<span class="inline-block mt-2 text-green-600 text-xs font-medium">● Đang làm việc</span>' : ''}
                            <p class="text-gray-700 text-sm mt-2">${exp.description || 'Chưa có mô tả'}</p>
                        </div>
                    `).join('');
                } else {
                    document.getElementById('experience-container').innerHTML = '<p class="text-gray-500 text-sm">Chưa có kinh nghiệm</p>';
                }

                // Education
                if (resume.educations && resume.educations.length > 0) {
                    document.getElementById('education-container').innerHTML = resume.educations.map(edu => `
                        <div class="border-l-4 border-green-500 pl-4 pb-4">
                            <h4 class="font-semibold text-gray-900">${edu.degree || 'Chưa xác định'}</h4>
                            <p class="text-green-600 font-medium text-sm">${edu.school || 'Chưa xác định'}</p>
                            <p class="text-gray-600 text-xs mt-1">
                                ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}
                            </p>
                            <p class="text-gray-700 text-sm mt-2">Chuyên ngành: ${edu.major || 'Chưa xác định'}</p>
                        </div>
                    `).join('');
                } else {
                    document.getElementById('education-container').innerHTML = '<p class="text-gray-500 text-sm">Chưa có thông tin học vấn</p>';
                }

                // Files
                if (resume.files && resume.files.length > 0) {
                    document.getElementById('files-section').style.display = 'block';
                    document.getElementById('files-container').innerHTML = resume.files.map(file => `
                        <a href="${window.APP_CONFIG.API_BASE + file.fileUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition">
                            <svg class="w-5 h-5 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h6a1 1 0 10-1 1v12a1 1 0 11-2 0V4zm10 0a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2h-6a2 2 0 01-2-2V4zm4 10a1 1 0 100-2 1 1 0 000 2z"></path>
                            </svg>
                            <div>
                                <p class="text-sm font-medium text-gray-900">${file.fileType || 'Tệp'}</p>
                                <p class="text-xs text-gray-600">Tải lên ${formatDate(file.uploadedAt)}</p>
                            </div>
                            <svg class="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </a>
                    `).join('');
                }
            }

            // Job info (load from API)
            loadJobDetail(data.resume?.id || null);
        }

        // Load job detail
        async function loadJobDetail(resumeId) {
            try {
                // Get job ID from application (we'll need to store it)
                // For now, we can try to load it from the job API
                // This is a placeholder - actual implementation depends on API
            } catch (error) {
                console.error('Error loading job detail:', error);
            }
        }

        // Load application timeline
        async function loadApplicationTimeline(appId) {
            try {
                const url = buildApiUrl(API_CONFIG.APPLICATIONS.GET_TIMELINE, { applicationId: appId });
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) return;

                const result = await response.json();
                if (result.success && result.data) {
                    displayTimeline(result.data);
                }
            } catch (error) {
                console.error('Error loading timeline:', error);
            }
        }

        // Display timeline
        function displayTimeline(timeline) {
            const container = document.getElementById('timeline-container');
            
            if (timeline.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-sm">Chưa có thay đổi trạng thái</p>';
                return;
            }

            container.innerHTML = timeline.map((item, index) => `
                <div class="flex gap-4">
                    <div class="flex flex-col items-center">
                        <div class="w-3 h-3 bg-blue-600 rounded-full mt-1.5"></div>
                        ${index < timeline.length - 1 ? '<div class="w-0.5 h-16 bg-gray-200 mt-2"></div>' : ''}
                    </div>
                    <div class="pb-4">
                        <div class="flex gap-2 items-center">
                            <p class="font-medium text-gray-900">${item.oldStatusName}</p>
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                            <p class="font-medium text-gray-900">${item.newStatusName}</p>
                        </div>
                        <p class="text-gray-600 text-sm mt-1">${item.note || 'Không có ghi chú'}</p>
                        <p class="text-gray-500 text-xs mt-2">${formatDate(item.changedAt)}</p>
                    </div>
                </div>
            `).join('');
        }

        // Get status badge class
        function getStatusClass(statusCode) {
            const statusClasses = {
                'APPLIED': 'bg-blue-100 text-blue-800',
                'INTERVIEWED': 'bg-purple-100 text-purple-800',
                'OFFERED': 'bg-green-100 text-green-800',
                'REJECTED': 'bg-red-100 text-red-800'
            };
            return statusClasses[statusCode] || 'bg-gray-100 text-gray-800';
        }

        // Format date
        function formatDate(dateString) {
            if (!dateString) return 'Chưa xác định';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }

        // Show error
        function showError() {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('content').classList.add('hidden');
            document.getElementById('error-state').classList.remove('hidden');
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', () => {
            loadFragments().then(() => {
                loadApplicationDetail();
            });
        });
