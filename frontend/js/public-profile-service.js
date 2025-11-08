// Get user details
async function getUserDetails(userId) {
    try {
        const url = buildApiUrl(API_CONFIG.USERS.PROFILE_DETAIL.replace('{id}', userId));
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
        console.log('[getUserDetails] Response:', result);

        return {
            success: result.success,
            message: result.message,
            data: result.data || null
        };
    } catch (error) {
        console.error('[getUserDetails] Error:', error);
        handleApiError('getUserDetails', error);
        return {
            success: false,
            message: error.message,
            data: null
        };
    }
}

// Get user skills
async function getUserSkills(userId) {
    try {
        const url = buildApiUrl(API_CONFIG.USERS.SKILLS.replace('{userId}', userId));
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
        console.log('[getUserSkills] Response:', result);

        return {
            success: result.success,
            message: result.message,
            data: Array.isArray(result.data) ? result.data : []
        };
    } catch (error) {
        console.error('[getUserSkills] Error:', error);
        return {
            success: false,
            message: error.message,
            data: []
        };
    }
}

// Get user resume (default)
async function getUserResume(userId) {
    try {
        const url = buildApiUrl(API_CONFIG.RESUMES.DEFAULT.replace('{userId}', userId));
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
        console.log('[getUserResume] Response:', result);

        // API returns array, get first item
        const resume = Array.isArray(result.data) ? result.data[0] : result.data;
        
        return {
            success: result.success,
            message: result.message,
            data: resume || null
        };
    } catch (error) {
        console.error('[getUserResume] Error:', error);
        return {
            success: false,
            message: error.message,
            data: null
        };
    }
}

// Display user profile
function displayUserProfile(user) {
    console.log('[displayUserProfile] User:', user);

    setTextContent('user-name', user.name || 'N/A');
    setTextContent('user-headline', user.headline || 'Chưa cập nhật');
    setTextContent('user-email', user.email || 'N/A');
    setTextContent('user-phone', user.phone || 'Chưa cập nhật');
    setTextContent('user-address', user.address || 'Chưa cập nhật');

    // Set avatar
    const avatarImg = document.getElementById('user-avatar');
    if (user.avatarUrl) {
        avatarImg.src = `${API_CONFIG.FILE_BASE_URL}${user.avatarUrl}`;
    } else {
        avatarImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D1D5DB"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
    }

    // Show summary if available
    if (user.summary) {
        showElement('summary-section');
        const summaryDiv = document.getElementById('user-summary');
        summaryDiv.innerHTML = parseMarkdown(user.summary);
    }
}

// Display user skills
function displayUserSkills(skills) {
    console.log('[displayUserSkills] Skills:', skills);

    if (!skills || skills.length === 0) {
        hideElement('skills-section');
        return;
    }

    showElement('skills-section');
    const skillsContainer = document.getElementById('skills-container');
    skillsContainer.innerHTML = '';

    skills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium';
        skillTag.innerHTML = `
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            ${skill.name}
        `;
        skillsContainer.appendChild(skillTag);
    });
}

// Display resume/CV
function displayResume(resume) {
    console.log('[displayResume] Resume:', resume);

    if (!resume) {
        hideElement('cv-section');
        hideElement('experience-section');
        hideElement('education-section');
        hideElement('portfolio-section');
        return;
    }

    // Display CV title and summary
    if (resume.title || resume.summary) {
        showElement('cv-section');
        const cvContent = document.getElementById('cv-content');
        cvContent.innerHTML = '';

        if (resume.title) {
            const titleDiv = document.createElement('div');
            titleDiv.innerHTML = `
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${resume.title}</h3>
            `;
            cvContent.appendChild(titleDiv);
        }

        if (resume.summary) {
            const summaryDiv = document.createElement('div');
            summaryDiv.innerHTML = `
                <p class="text-gray-700">${parseMarkdown(resume.summary)}</p>
            `;
            cvContent.appendChild(summaryDiv);
        }
    }

    // Display experiences
    if (resume.experiences && resume.experiences.length > 0) {
        showElement('experience-section');
        const experienceContainer = document.getElementById('experience-container');
        experienceContainer.innerHTML = '';

        resume.experiences.forEach(exp => {
            const expDiv = document.createElement('div');
            expDiv.className = 'border-l-4 border-blue-500 pl-4';
            
            const startDate = formatDateDisplay(exp.startDate);
            const endDate = exp.current ? 'Hiện tại' : formatDateDisplay(exp.endDate);
            
            expDiv.innerHTML = `
                <h3 class="text-lg font-semibold text-gray-900">${exp.position}</h3>
                <p class="text-blue-600 font-medium">${exp.company}</p>
                <p class="text-sm text-gray-600 mb-2">${startDate} → ${endDate}</p>
                <p class="text-gray-700">${exp.description}</p>
            `;
            experienceContainer.appendChild(expDiv);
        });
    } else {
        hideElement('experience-section');
    }

    // Display educations
    if (resume.educations && resume.educations.length > 0) {
        showElement('education-section');
        const educationContainer = document.getElementById('education-container');
        educationContainer.innerHTML = '';

        resume.educations.forEach(edu => {
            const eduDiv = document.createElement('div');
            eduDiv.className = 'border-l-4 border-green-500 pl-4';
            
            const startDate = formatDateDisplay(edu.startDate);
            const endDate = edu.current ? 'Hiện tại' : formatDateDisplay(edu.endDate);
            
            eduDiv.innerHTML = `
                <h3 class="text-lg font-semibold text-gray-900">${edu.degree}</h3>
                <p class="text-green-600 font-medium">${edu.school}</p>
                <p class="text-sm text-gray-600 mb-2">${startDate} → ${endDate}</p>
                ${edu.description ? `<p class="text-gray-700">${edu.description}</p>` : ''}
            `;
            educationContainer.appendChild(eduDiv);
        });
    } else {
        hideElement('education-section');
    }

    // Display portfolio/files
    if (resume.files && resume.files.length > 0) {
        showElement('portfolio-section');
        const portfolioContainer = document.getElementById('portfolio-container');
        portfolioContainer.innerHTML = '';

        resume.files.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition';
            
            const fileName = file.fileUrl.split('/').pop();
            const fileType = file.fileType || 'File';
            const fileUrl = `${API_CONFIG.FILE_BASE_URL}${file.fileUrl}`;
            
            fileDiv.innerHTML = `
                <div class="flex items-center gap-3">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V9a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <div>
                        <p class="font-medium text-gray-900">${fileType}</p>
                        <p class="text-sm text-gray-600">${fileName}</p>
                    </div>
                </div>
                <a href="${fileUrl}" target="_blank" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    Tải xuống
                </a>
            `;
            portfolioContainer.appendChild(fileDiv);
        });
    } else {
        hideElement('portfolio-section');
    }
}

// Main load function
async function loadPublicProfile() {
    console.log('[loadPublicProfile] Starting...');

    // Get userId from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    console.log('[loadPublicProfile] userId:', userId);

    if (!userId) {
        showElement('error-state');
        setTextContent('error-text', 'Không tìm thấy ID ứng viên');
        hideElement('loading');
        return;
    }

    try {
        hideElement('error-state');

        // Load user details
        const userResult = await getUserDetails(userId);
        if (!userResult.success || !userResult.data) {
            throw new Error(userResult.message || 'Không thể tải thông tin ứng viên');
        }

        displayUserProfile(userResult.data);

        // Load skills
        const skillsResult = await getUserSkills(userId);
        if (skillsResult.success) {
            displayUserSkills(skillsResult.data);
        }

        // Load resume
        const resumeResult = await getUserResume(userId);
        if (resumeResult.success) {
            displayResume(resumeResult.data);
        }

        hideElement('loading');
        showElement('profile-content');
    } catch (error) {
        console.error('[loadPublicProfile] Error:', error);
        hideElement('loading');
        showElement('error-state');
        setTextContent('error-text', error.message || 'Có lỗi xảy ra khi tải hồ sơ');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DOMContentLoaded] Loading fragments...');
    loadFragments().then(() => {
        console.log('[DOMContentLoaded] Fragments loaded, loading profile...');
        loadPublicProfile();
    });
});
