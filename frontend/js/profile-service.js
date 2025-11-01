        let userProfile = null;
        let userSkills = [];
        let userResumes = [];
        let allAvailableSkills = []; // Store all available skills from public API
        let currentEditingSkillSlug = null; // Track which skill is being edited

        // Load all profile data
        async function loadProfile() {
            try {
                showLoading();
                
                // Check authentication
                if (!authService.isAuthenticated()) {
                    window.location.href = 'login.html';
                    return false;
                }

                // Load all data in parallel
                const [profileResponse, skillsResponse, resumesResponse, availableSkillsResponse] = await Promise.all([
                    loadUserProfile(),
                    loadUserSkills(),
                    loadUserResumes(),
                    loadAvailableSkills()
                ]);

                if (profileResponse && skillsResponse && resumesResponse && availableSkillsResponse) {
                    displayProfile();
                    hideLoading();
                    return true;
                } else {
                    showError();
                    return false;
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                showError();
                return false;
            }
        }

        // Load user profile data
        async function loadUserProfile() {
            try {
                const url = buildApiUrl(API_CONFIG.USERS.GET_PROFILE);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.success) {
                    userProfile = result.data;
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error loading user profile:', error);
                return false;
            }
        }

        // Load user skills
        async function loadUserSkills() {
            try {
                const url = buildApiUrl(API_CONFIG.USERS.GET_SKILLS);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.success) {
                    userSkills = result.data;
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error loading user skills:', error);
                return false;
            }
        }

        // Load user resumes
        async function loadUserResumes() {
            try {
                const url = buildCompleteUrl(API_CONFIG.RESUMES.LIST, {}, { isDefault: true });
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.success) {
                    userResumes = result.data;
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error loading user resumes:', error);
                return false;
            }
        }

        // Load all available skills from public API
        async function loadAvailableSkills() {
            try {
                const url = buildApiUrl(API_CONFIG.SKILLS.LIST);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.success) {
                    allAvailableSkills = result.data;
                    populateSkillSelect();
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error loading available skills:', error);
                return false;
            }
        }

        // Display profile data
        function displayProfile() {
            // User profile info
            if (userProfile) {
                // Update sidebar elements (if they exist from fragment)
                const sidebarUserName = document.getElementById('sidebar-user-name');
                if (sidebarUserName) {
                    sidebarUserName.textContent = userProfile.name || 'Chưa cập nhật';
                }
                
                const sidebarUserEmail = document.getElementById('sidebar-user-email');
                if (sidebarUserEmail) {
                    sidebarUserEmail.textContent = userProfile.email || 'Chưa cập nhật';
                }

                // Update main profile elements
                document.getElementById('main-user-name').textContent = userProfile.name || 'Chưa cập nhật';
                
                // Update user info card elements
                document.getElementById('info-name').textContent = userProfile.name || 'Chưa cập nhật';
                document.getElementById('info-email').textContent = userProfile.email || 'Chưa cập nhật';
                document.getElementById('info-headline').textContent = userProfile.headline || 'Chưa cập nhật';
                
                // Update header phone and address
                document.getElementById('phone-text').textContent = userProfile.phone || 'Chưa cập nhật';
                document.getElementById('address-text').textContent = userProfile.address || 'Chưa cập nhật';
                
                // Headline
                const headlineElement = document.getElementById('user-headline');
                if (headlineElement) {
                    if (userProfile.headline) {
                        headlineElement.textContent = userProfile.headline;
                    } else {
                        headlineElement.textContent = 'Senior Frontend Developer';
                    }
                }
                
                // Avatar - update main avatar and sidebar avatar if they exist
                const mainAvatar = document.getElementById('main-avatar');
                if (mainAvatar) {
                    if (userProfile.avatarUrl) {
                        mainAvatar.src = window.APP_CONFIG.API_BASE + userProfile.avatarUrl;
                    } else {
                        mainAvatar.src = 'https://via.placeholder.com/80/6B7280/FFFFFF?text=' + (userProfile.name ? userProfile.name.charAt(0) : 'U');
                    }
                }

                const sidebarAvatar = document.getElementById('sidebar-user-avatar');
                if (sidebarAvatar) {
                    if (userProfile.avatarUrl) {
                        sidebarAvatar.src = window.APP_CONFIG.API_BASE + userProfile.avatarUrl;
                    } else {
                        sidebarAvatar.src = 'https://via.placeholder.com/80/6B7280/FFFFFF?text=' + (userProfile.name ? userProfile.name.charAt(0) : 'U');
                    }
                }

                // Summary - use default if not available
                const summaryElement = document.getElementById('user-summary');
                if (userProfile.summary) {
                    summaryElement.innerHTML = DOMPurify.sanitize(marked.parse(userProfile.summary));
                } else {
                    summaryElement.textContent = 'Chưa có giới thiệu bản thân.';
                }
            }

            // Display skills
            displaySkills();

            // Display experience and education from resumes
            displayExperienceAndEducation();
        }

        // Display skills as tags with delete buttons
        function displaySkills() {
            const skillsContainer = document.getElementById('skills-container');
            const noSkillsElement = document.getElementById('no-skills');

            if (userSkills.length === 0) {
                skillsContainer.classList.add('hidden');
                noSkillsElement.classList.remove('hidden');
                return;
            }

            skillsContainer.classList.remove('hidden');
            noSkillsElement.classList.add('hidden');

            skillsContainer.innerHTML = userSkills.map(skill => `
                <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    ${skill.name}
                    <button onclick="deleteSkillDirect('${skill.slug}')" class="text-blue-600 hover:text-blue-900 transition" title="Xóa kỹ năng">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </span>
            `).join('');
        }

        // Display experience and education from resume data
        function displayExperienceAndEducation() {
            displayExperience();
            displayEducation();
        }

        // Display experience
        function displayExperience() {
            const experienceContainer = document.getElementById('experience-container');
            const noExperienceElement = document.getElementById('no-experience');

            // Get all experiences from all resumes
            let allExperiences = [];
            userResumes.forEach(resume => {
                if (resume.experiences) {
                    allExperiences = allExperiences.concat(resume.experiences);
                }
            });

            if (allExperiences.length === 0) {
                experienceContainer.classList.add('hidden');
                noExperienceElement.classList.remove('hidden');
                return;
            }

            experienceContainer.classList.remove('hidden');
            noExperienceElement.classList.add('hidden');

            experienceContainer.innerHTML = allExperiences.map(exp => `
                <div class="border-l-4 border-blue-500 pl-4">
                    <div class="flex items-start justify-between mb-2">
                        <div>
                            <h3 class="font-semibold text-gray-900">${exp.position}</h3>
                            <p class="text-blue-600 font-medium">${exp.company}</p>
                        </div>
                        <div class="text-right text-sm text-gray-500">
                            <p>${formatDate(exp.startDate)} - ${exp.current ? 'Hiện tại' : formatDate(exp.endDate)}</p>
                            ${exp.current ? '<span class="text-green-600 text-xs">● Đang làm việc</span>' : ''}
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm">${exp.description || 'Chưa có mô tả công việc'}</p>
                </div>
            `).join('');
        }

        // Display education
        function displayEducation() {
            const educationContainer = document.getElementById('education-container');
            const noEducationElement = document.getElementById('no-education');

            // Get all educations from all resumes
            let allEducations = [];
            userResumes.forEach(resume => {
                if (resume.educations) {
                    allEducations = allEducations.concat(resume.educations);
                }
            });

            if (allEducations.length === 0) {
                educationContainer.classList.add('hidden');
                noEducationElement.classList.remove('hidden');
                return;
            }

            educationContainer.classList.remove('hidden');
            noEducationElement.classList.add('hidden');

            educationContainer.innerHTML = allEducations.map(edu => `
                <div class="border-l-4 border-green-500 pl-4">
                    <div class="flex items-start justify-between mb-2">
                        <div>
                            <h3 class="font-semibold text-gray-900">${edu.degree || 'Chưa cập nhật'}</h3>
                            <p class="text-green-600 font-medium">${edu.school || 'Chưa cập nhật'}</p>
                        </div>
                        <div class="text-right text-sm text-gray-500">
                            <p>${edu.startDate ? formatDate(edu.startDate) : 'Chưa cập nhật'} - ${edu.endDate ? formatDate(edu.endDate) : 'Hiện tại'}</p>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm">Chuyên ngành: ${edu.major || 'Chưa cập nhật'}</p>
                </div>
            `).join('');
        }

        // Format date
        function formatDate(dateString) {
            if (!dateString) return 'Chưa cập nhật';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                month: '2-digit',
                year: 'numeric'
            });
        }

        // Get file type name
        function getFileTypeName(fileType) {
            switch (fileType) {
                case 'PORTFOLIO': return 'Portfolio';
                case 'CV': return 'CV';
                case 'CERTIFICATE': return 'Chứng chỉ';
                default: return 'Tài liệu';
            }
        }

        // UI helper functions
        function showLoading() {
            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('profile-content').classList.add('hidden');
            document.getElementById('error-state').classList.add('hidden');
        }

        function hideLoading() {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('profile-content').classList.remove('hidden');
            document.getElementById('error-state').classList.add('hidden');
        }

        function showError() {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('profile-content').classList.add('hidden');
            document.getElementById('error-state').classList.remove('hidden');
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadFragments().then(() => {
                setupAvatarUpload();
                loadProfile().then(() => {
                    // After profile loads, call sidebar functions to populate sidebar
                    if (typeof loadSidebarUserInfo === 'function') {
                        loadSidebarUserInfo();
                    }
                    if (typeof highlightActiveMenu === 'function') {
                        highlightActiveMenu();
                    }
                });
            });
        });

        // Setup avatar upload handler
        function setupAvatarUpload() {
            const avatarFileInput = document.getElementById('avatar-file-input');
            avatarFileInput.addEventListener('change', async function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Validate file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                        showErrorToast('Kích thước ảnh không được vượt quá 5MB', 3000);
                        avatarFileInput.value = '';
                        return;
                    }

                    // Show loading state
                    const avatar = document.getElementById('main-avatar');
                    const originalSrc = avatar.src;
                    
                    // Upload avatar
                    const uploadSuccess = await uploadAvatar(file);
                    if (uploadSuccess) {
                        // Update avatar display immediately
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            avatar.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                        
                        // Also update sidebar avatar if it exists
                        const sidebarAvatar = document.getElementById('sidebar-user-avatar');
                        if (sidebarAvatar) {
                            sidebarAvatar.src = avatar.src;
                        }
                        
                        showSuccessNotificationBanner('Tải lên ảnh đại diện thành công ✓', 3000);
                    } else {
                        avatar.src = originalSrc;
                    }
                    
                    // Clear file input
                    avatarFileInput.value = '';
                }
            });
        }

        // Open edit profile modal
        function openEditProfileModal() {
            if (!userProfile) return;

            // Populate form with current data
            document.getElementById('edit-name').value = userProfile.name || '';
            document.getElementById('edit-phone').value = userProfile.phone || '';
            document.getElementById('edit-address').value = userProfile.address || '';
            document.getElementById('edit-headline').value = userProfile.headline || '';

            document.getElementById('edit-profile-modal').classList.remove('hidden');
        }

        // Close edit profile modal
        function closeEditProfileModal() {
            document.getElementById('edit-profile-modal').classList.add('hidden');
        }

        // Open edit summary modal
        function openEditSummaryModal() {
            if (!userProfile) return;

            // Populate textarea with current summary
            document.getElementById('edit-summary-textarea').value = userProfile.summary || '';
            
            // Update preview
            updateEditSummaryPreview();

            document.getElementById('edit-summary-modal').classList.remove('hidden');
        }

        // Close edit summary modal
        function closeEditSummaryModal() {
            document.getElementById('edit-summary-modal').classList.add('hidden');
        }

        // Save profile changes
        async function saveProfile() {
            try {
                const name = document.getElementById('edit-name').value.trim();
                const phone = document.getElementById('edit-phone').value.trim();
                const address = document.getElementById('edit-address').value.trim();
                const headline = document.getElementById('edit-headline').value.trim();

                // Validation
                if (!name) {
                    showErrorToast('Vui lòng nhập họ và tên', 3000);
                    return;
                }

                // Update profile
                const updateSuccess = await updateProfile({
                    name,
                    phone,
                    address,
                    headline
                });

                if (updateSuccess) {
                    closeEditProfileModal();
                    showSuccessNotificationBanner('Cập nhật hồ sơ thành công ✓', 5000);
                    // Reload page after notification
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                }
            } catch (error) {
                console.error('Error saving profile:', error);
                showErrorToast('Có lỗi xảy ra khi lưu hồ sơ', 4000);
            }
        }

        // Upload avatar
        async function uploadAvatar(file) {
            try {
                const url = buildApiUrl(API_CONFIG.USERS.UPLOAD_AVATAR);
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    showErrorToast(errorData.message || 'Lỗi khi tải lên ảnh', 4000);
                    return false;
                }

                const result = await response.json();
                if (result.success) {
                    // Update userProfile with new avatar
                    userProfile.avatarUrl = result.data.avatarUrl;
                    showSuccessNotificationBanner('Tải lên ảnh đại diện thành công ✓', 3000);
                    return true;
                } else {
                    showErrorToast(result.message || 'Lỗi khi tải lên ảnh', 4000);
                    return false;
                }
            } catch (error) {
                console.error('Error uploading avatar:', error);
                showErrorToast('Lỗi khi tải lên ảnh', 4000);
                return false;
            }
        }

        // Update profile
        async function updateProfile(profileData) {
            try {
                const url = buildApiUrl(API_CONFIG.USERS.UPDATE_PROFILE);
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(profileData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    showErrorToast(errorData.message || 'Lỗi khi cập nhật hồ sơ', 4000);
                    return false;
                }

                const result = await response.json();
                if (result.success) {
                    userProfile = result.data;
                    return true;
                } else {
                    showErrorToast(result.message || 'Lỗi khi cập nhật hồ sơ', 4000);
                    return false;
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showErrorToast('Lỗi khi cập nhật hồ sơ', 4000);
                return false;
            }
        }

        // Populate skill select dropdown with available skills
        function populateSkillSelect() {
            const skillSelect = document.getElementById('skill-select');
            
            // Filter out skills that are already added
            const addedSkillSlugs = userSkills.map(s => s.slug);
            const availableSkillsNotAdded = allAvailableSkills.filter(s => !addedSkillSlugs.includes(s.slug));
            
            // Clear existing options except the default one
            skillSelect.innerHTML = '<option value="">-- Chọn kỹ năng --</option>';
            
            availableSkillsNotAdded.forEach(skill => {
                const option = document.createElement('option');
                option.value = skill.slug;
                option.textContent = skill.name;
                skillSelect.appendChild(option);
            });
        }

        // Open add skill modal
        function openAddSkillModal() {
            populateSkillSelect();
            document.getElementById('skill-select').value = '';
            document.getElementById('add-skill-modal').classList.remove('hidden');
        }

        // Close add skill modal
        function closeAddSkillModal() {
            document.getElementById('add-skill-modal').classList.add('hidden');
        }

        // Save new skill
        async function saveSkill() {
            try {
                const skillSlug = document.getElementById('skill-select').value.trim();

                if (!skillSlug) {
                    showErrorToast('Vui lòng chọn kỹ năng', 3000);
                    return;
                }

                const url = buildApiUrl(API_CONFIG.USERS.ADD_SKILL, { skillSlug });
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    showErrorToast(errorData.message || 'Lỗi khi thêm kỹ năng', 3000);
                    return;
                }

                const result = await response.json();
                if (result.success) {
                    showSuccessToast('Thêm kỹ năng thành công ✓', 2000);
                    closeAddSkillModal();
                    // Reload skills
                    await loadUserSkills();
                    displaySkills();
                } else {
                    showErrorToast(result.message || 'Lỗi khi thêm kỹ năng', 3000);
                }
            } catch (error) {
                console.error('Error saving skill:', error);
                showErrorToast('Lỗi khi thêm kỹ năng', 3000);
            }
        }

        // Open edit skill modal
        function openEditSkillModal(skillSlug, skillName) {
            currentEditingSkillSlug = skillSlug;
            document.getElementById('delete-skill-name').textContent = skillName;
            document.getElementById('edit-skill-modal').classList.remove('hidden');
        }

        // Close edit skill modal
        function closeEditSkillModal() {
            currentEditingSkillSlug = null;
            document.getElementById('edit-skill-modal').classList.add('hidden');
        }

        // Delete skill directly from tag
        async function deleteSkillDirect(skillSlug) {
            if (!confirm('Bạn có chắc chắn muốn xóa kỹ năng này?')) {
                return;
            }
            await performDeleteSkill(skillSlug);
        }

        // Confirm delete from modal
        async function confirmDeleteSkill() {
            if (!currentEditingSkillSlug) {
                showErrorToast('Lỗi: Không thể xác định kỹ năng cần xóa', 3000);
                return;
            }
            await performDeleteSkill(currentEditingSkillSlug);
        }

        // Perform the actual delete operation
        async function performDeleteSkill(skillSlug) {
            try {
                const url = buildApiUrl(API_CONFIG.USERS.DELETE_SKILL, { skillSlug });
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    showErrorToast(errorData.message || 'Lỗi khi xóa kỹ năng', 3000);
                    return;
                }

                const result = await response.json();
                if (result.success) {
                    showSuccessToast('Xóa kỹ năng thành công ✓', 2000);
                    closeEditSkillModal();
                    // Reload skills
                    await loadUserSkills();
                    displaySkills();
                } else {
                    showErrorToast(result.message || 'Lỗi khi xóa kỹ năng', 3000);
                }
            } catch (error) {
                console.error('Error deleting skill:', error);
                showErrorToast('Lỗi khi xóa kỹ năng', 3000);
            }
        }

        // Close modal when clicking outside
        document.addEventListener('click', function(event) {
            const addSkillModal = document.getElementById('add-skill-modal');
            const editSkillModal = document.getElementById('edit-skill-modal');
            const editProfileModal = document.getElementById('edit-profile-modal');
            
            if (event.target === addSkillModal) {
                closeAddSkillModal();
            }
            if (event.target === editSkillModal) {
                closeEditSkillModal();
            }
            if (event.target === editProfileModal) {
                closeEditProfileModal();
            }
            const editSummaryModal = document.getElementById('edit-summary-modal');
            if (event.target === editSummaryModal) {
                closeEditSummaryModal();
            }
        });

        // Insert markdown syntax in summary textarea
        function insertSummaryMarkdown(before, after) {
            const textarea = document.getElementById('edit-summary-textarea');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end) || 'text';
            
            const beforeText = textarea.value.substring(0, start);
            const afterText = textarea.value.substring(end);
            
            textarea.value = beforeText + before + selectedText + after + afterText;
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
            
            updateEditSummaryPreview();
        }

        // Update markdown preview for edit summary modal
        function updateEditSummaryPreview() {
            const summaryText = document.getElementById('edit-summary-textarea').value;
            const previewElement = document.getElementById('summary-preview');
            
            if (summaryText) {
                const htmlContent = DOMPurify.sanitize(marked.parse(summaryText));
                previewElement.innerHTML = htmlContent;
            } else {
                previewElement.innerHTML = '<p class="text-gray-400 italic">Sẽ hiển thị ở đây</p>';
            }
        }

        // Save summary changes
        async function saveSummary() {
            try {
                const summary = document.getElementById('edit-summary-textarea').value.trim();

                // Update profile with summary only
                const updateSuccess = await updateProfile({
                    summary
                });

                if (updateSuccess) {
                    closeEditSummaryModal();
                    showSuccessNotificationBanner('Cập nhật giới thiệu thành công ✓', 5000);
                    // Reload page after notification
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                }
            } catch (error) {
                console.error('Error saving summary:', error);
                showErrorToast('Có lỗi xảy ra khi lưu giới thiệu', 4000);
            }
        }

        // Add event listener for summary textarea to update preview
        document.addEventListener('DOMContentLoaded', function() {
            const summaryTextarea = document.getElementById('edit-summary-textarea');
            if (summaryTextarea) {
                summaryTextarea.addEventListener('input', updateEditSummaryPreview);
            }
        }, { once: true });
