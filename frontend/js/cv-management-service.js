let currentTab = 'all';
let resumes = [];
let editingResumeId = null;
let uploadingResumeId = null;
let experienceCounter = 0;
let educationCounter = 0;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadFragments().then(() => {
        // Add a small delay to ensure DOM is updated
        setTimeout(() => {
            initializePage();
        }, 100);
    });
});

async function initializePage() {
    // ✅ SỬA: Dùng authService.requireAuth() thay vì window.authUtils.isLoggedIn()
    if (!authService.requireAuth()) {
        return;
    }

    // Load user profile and populate sidebar
    await loadUserProfile();
    
    // Load sidebar user info from fragment
    if (typeof loadSidebarUserInfo === 'function') {
        loadSidebarUserInfo();
    }
    if (typeof highlightActiveMenu === 'function') {
        highlightActiveMenu();
    }
    
    await loadResumes();
}

// Load user profile data to populate sidebar - ✅ ĐÃ SỬA
let userProfile = null;
async function loadUserProfile() {
    try {
        const profileUrl = buildApiUrl(API_CONFIG.USERS.GET_PROFILE);
        const response = await authService.apiRequest(profileUrl, {
            method: 'GET'
        });

        if (response && response.ok) {
            const result = await response.json();
            
            if (result.success) {
                userProfile = result.data;
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error loading user profile:', error);
        return false;
    }
}

// Load all resumes - ✅ ĐÃ SỬA
async function loadResumes() {
    try {
        showLoading();
        const url = buildApiUrl(API_CONFIG.RESUMES.LIST);
        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (response && response.ok) {
            const result = await response.json();
            if (result.success) {
                resumes = result.data;
                displayResumes();
            }
        }
    } catch (error) {
        console.error('Error loading resumes:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Display resumes based on current tab
function displayResumes() {
  let filtered = resumes;
  if (currentTab === 'default') filtered = resumes.filter(r => r.isDefault);
  if (currentTab === 'files') filtered = resumes.filter(r => r.files && r.files.length > 0);
  renderResumeGrid(filtered);
}


// Tab switching
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab styles
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.className = 'py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700';
    });
    document.getElementById(`tab-${tab}`).className = 'py-4 px-6 text-sm font-medium text-blue-600 border-b-2 border-blue-600';
    
    displayResumes();
}

// Modal functions
function openCreateModal() {
    editingResumeId = null;
    document.getElementById('modal-title').textContent = 'Tạo CV mới';
    document.getElementById('submit-btn').textContent = 'Tạo CV';
    resetForm();
    document.getElementById('cv-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('cv-modal').classList.add('hidden');
    resetForm();
}

function resetForm() {
    document.getElementById('cv-form').reset();
    document.getElementById('experiences-container').innerHTML = '';
    document.getElementById('educations-container').innerHTML = '';
    experienceCounter = 0;
    educationCounter = 0;
    addExperience();
    addEducation();
}

// Add experience section
function addExperience() {
    const container = document.getElementById('experiences-container');
    const experienceHtml = `
        <div class="border border-gray-200 rounded-lg p-4" data-experience="${experienceCounter}">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-900">Kinh nghiệm ${experienceCounter + 1}</h4>
                <button type="button" onclick="removeExperience(${experienceCounter})" class="text-red-600 hover:text-red-700 text-sm">Xóa</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Công ty *</label>
                    <input type="text" name="experience_company_${experienceCounter}" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Vị trí *</label>
                    <input type="text" name="experience_position_${experienceCounter}" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                    <input type="date" name="experience_start_${experienceCounter}" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                    <input type="date" name="experience_end_${experienceCounter}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        <input type="checkbox" name="experience_current_${experienceCounter}" class="mr-2">
                        Đang làm việc tại đây
                    </label>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
                    <textarea name="experience_description_${experienceCounter}" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', experienceHtml);
    experienceCounter++;
}

function removeExperience(index) {
    document.querySelector(`[data-experience="${index}"]`).remove();
}

// Add education section
function addEducation() {
    const container = document.getElementById('educations-container');
    const educationHtml = `
        <div class="border border-gray-200 rounded-lg p-4" data-education="${educationCounter}">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-900">Học vấn ${educationCounter + 1}</h4>
                <button type="button" onclick="removeEducation(${educationCounter})" class="text-red-600 hover:text-red-700 text-sm">Xóa</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Trường *</label>
                    <input type="text" name="education_school_${educationCounter}" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Bằng cấp *</label>
                    <input type="text" name="education_degree_${educationCounter}" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Chuyên ngành</label>
                    <input type="text" name="education_major_${educationCounter}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                    <input type="date" name="education_start_${educationCounter}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                    <input type="date" name="education_end_${educationCounter}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', educationHtml);
    educationCounter++;
}

function removeEducation(index) {
    document.querySelector(`[data-education="${index}"]`).remove();
}

// Form submission - ✅ ĐÃ SỬA
document.getElementById('cv-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const resumeData = {
        title: document.getElementById('cv-title').value,
        summary: document.getElementById('cv-summary').value,
        isDefault: document.getElementById('cv-default').checked,
        experiences: [],
        educations: []
    };

    // Collect experiences
    for (let i = 0; i < experienceCounter; i++) {
        const company = formData.get(`experience_company_${i}`);
        if (company) {
            const experience = {
                company: company,
                position: formData.get(`experience_position_${i}`),
                startDate: formData.get(`experience_start_${i}`) + 'T00:00:00',
                endDate: formData.get(`experience_end_${i}`) ? formData.get(`experience_end_${i}`) + 'T00:00:00' : null,
                current: formData.get(`experience_current_${i}`) === 'on',
                description: formData.get(`experience_description_${i}`) || ''
            };
            resumeData.experiences.push(experience);
        }
    }

    // Collect educations
    for (let i = 0; i < educationCounter; i++) {
        const school = formData.get(`education_school_${i}`);
        if (school) {
            const education = {
                school: school,
                degree: formData.get(`education_degree_${i}`),
                major: formData.get(`education_major_${i}`) || '',
                startDate: formData.get(`education_start_${i}`) ? formData.get(`education_start_${i}`) + 'T00:00:00' : null,
                endDate: formData.get(`education_end_${i}`) ? formData.get(`education_end_${i}`) + 'T00:00:00' : null
            };
            resumeData.educations.push(education);
        }
    }

    try {
        const isEditing = editingResumeId !== null;
        let url;
        let method;
        
        if (isEditing) {
            url = buildApiUrl(API_CONFIG.RESUMES.GET_DETAIL, { resumeId: editingResumeId });
            method = 'PUT';
        } else {
            url = buildApiUrl(API_CONFIG.RESUMES.LIST);
            method = 'POST';
        }

        const response = await authService.apiRequest(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resumeData)
        });

        if (response && response.ok) {
            const result = await response.json();
            if (result.success) {
                closeModal();
                await loadResumes();
                showSuccessNotification(isEditing ? 'Cập nhật CV thành công!' : 'Tạo CV thành công!');
            }
        }
    } catch (error) {
        console.error('Error saving resume:', error);
        showError('Có lỗi xảy ra khi lưu CV');
    }
});

// Edit resume - ✅ ĐÃ SỬA
async function editResume(resumeId) {
    try {
        const url = buildApiUrl(API_CONFIG.RESUMES.GET_DETAIL, { resumeId });
        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (response && response.ok) {
            const result = await response.json();
            if (result.success) {
                const resume = result.data;
                populateEditForm(resume);
                editingResumeId = resumeId;
                document.getElementById('modal-title').textContent = 'Chỉnh sửa CV';
                document.getElementById('submit-btn').textContent = 'Cập nhật CV';
                document.getElementById('cv-modal').classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading resume details:', error);
    }
}

function populateEditForm(resume) {
    document.getElementById('cv-title').value = resume.title;
    document.getElementById('cv-summary').value = resume.summary;
    document.getElementById('cv-default').checked = resume.isDefault;

    // Clear containers
    document.getElementById('experiences-container').innerHTML = '';
    document.getElementById('educations-container').innerHTML = '';
    experienceCounter = 0;
    educationCounter = 0;

    // Populate experiences
    if (resume.experiences && resume.experiences.length > 0) {
        resume.experiences.forEach(exp => {
            addExperience();
            const index = experienceCounter - 1;
            document.querySelector(`[name="experience_company_${index}"]`).value = exp.company;
            document.querySelector(`[name="experience_position_${index}"]`).value = exp.position;
            document.querySelector(`[name="experience_start_${index}"]`).value = exp.startDate ? exp.startDate.split('T')[0] : '';
            document.querySelector(`[name="experience_end_${index}"]`).value = exp.endDate ? exp.endDate.split('T')[0] : '';
            document.querySelector(`[name="experience_current_${index}"]`).checked = exp.current;
            document.querySelector(`[name="experience_description_${index}"]`).value = exp.description || '';
        });
    } else {
        addExperience();
    }

    // Populate educations
    if (resume.educations && resume.educations.length > 0) {
        resume.educations.forEach(edu => {
            addEducation();
            const index = educationCounter - 1;
            document.querySelector(`[name="education_school_${index}"]`).value = edu.school;
            document.querySelector(`[name="education_degree_${index}"]`).value = edu.degree;
            document.querySelector(`[name="education_major_${index}"]`).value = edu.major || '';
            document.querySelector(`[name="education_start_${index}"]`).value = edu.startDate ? edu.startDate.split('T')[0] : '';
            document.querySelector(`[name="education_end_${index}"]`).value = edu.endDate ? edu.endDate.split('T')[0] : '';
        });
    } else {
        addEducation();
    }
}

// File upload functions
function openUploadModal(resumeId) {
    uploadingResumeId = resumeId;
    document.getElementById('upload-modal').classList.remove('hidden');
}

function closeUploadModal() {
    document.getElementById('upload-modal').classList.add('hidden');
    document.getElementById('file-input').value = '';
}

// Upload file - ✅ ĐÃ SỬA
async function uploadFile() {
    const fileInput = document.getElementById('file-input');
    const fileType = document.getElementById('file-type').value;
    
    if (!fileInput.files[0]) {
        alert('Vui lòng chọn file');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        // ✅ SỬA: Dùng authService.getToken() thay vì localStorage
        const token = authService.getToken();
        const uploadUrl = buildApiUrl(API_CONFIG.RESUMES.UPLOAD, { resumeId: uploadingResumeId });
        
        const response = await fetch(`${uploadUrl}?fileType=${fileType}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // No Content-Type header - let browser set it automatically for FormData
            },
            body: formData
        });

        if (response && response.ok) {
            const result = await response.json();
            if (result.success) {
                closeUploadModal();
                await loadResumes();
                showSuccessNotification('Upload file thành công!');
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        showError('Có lỗi xảy ra khi upload file');
    }
}

// Delete file - ✅ ĐÃ SỬA
async function deleteFile(fileId) {
    if (!confirm('Bạn có chắc chắn muốn xóa file này?')) return;

    try {
        const url = buildApiUrl(API_CONFIG.RESUMES.DELETE_FILE, { fileId });
        const response = await authService.apiRequest(url, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            await loadResumes();
            showSuccessNotification('Xóa file thành công!');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        showError('Có lỗi xảy ra khi xóa file');
    }
}

// View resume details - ✅ ĐÃ SỬA
async function viewResumeDetails(resumeId) {
    try {
        const url = buildApiUrl(API_CONFIG.RESUMES.GET_DETAIL, { resumeId });
        const response = await authService.apiRequest(url, {
            method: 'GET'
        });

        if (response && response.ok) {
            const result = await response.json();
            if (result.success) {
                const resume = result.data;
                alert(`CV: ${resume.title}\n\nTóm tắt: ${resume.summary}\n\nKinh nghiệm: ${resume.experiences.length}\nHọc vấn: ${resume.educations.length}\nFile đính kèm: ${resume.files ? resume.files.length : 0}`);
            }
        }
    } catch (error) {
        console.error('Error loading resume details:', error);
    }
}

// Delete resume - ✅ ĐÃ SỬA
async function deleteResume(resumeId) {
    if (!confirm('Bạn có chắc chắn muốn xóa CV này?')) return;

    try {
        const url = buildApiUrl(API_CONFIG.RESUMES.GET_DETAIL, { resumeId });
        const response = await authService.apiRequest(url, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            await loadResumes();
            showSuccess('Xóa CV thành công!');
        }
    } catch (error) {
        console.error('Error deleting resume:', error);
        showError('Có lỗi xảy ra khi xóa CV');
    }
}

// Helper functions
function getFileTypeName(fileType) {
    switch (fileType) {
        case 'PORTFOLIO': return 'Portfolio';
        case 'CV': return 'CV';
        case 'CERTIFICATE': return 'Chứng chỉ';
        case 'TRANSCRIPT': return 'Bảng điểm';
        default: return 'Tài liệu';
    }
}

function getFileName(fileUrl) {
    if (!fileUrl) return 'file';
    
    // Extract filename from URL path
    const parts = fileUrl.split('/');
    const filename = parts[parts.length - 1];
    
    // If filename has UUID format, try to extract meaningful name
    if (filename.includes('-') && filename.length > 30) {
        // Extract file extension
        const extension = filename.split('.').pop();
        return `file.${extension}`;
    }
    
    return filename;
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
  const grid = document.getElementById('cv-grid');   // mới
    grid.classList.add('hidden');
    document.getElementById('empty-state').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showSuccess(message) {
    // Simple alert for now - could be enhanced with toast notifications
    alert(message);
}

function showError(message = 'Có lỗi xảy ra') {
    alert(message);
}

const ACCESS_KEY = "VuIGSYZypBKLZfbvJPNUkYKw85wHc4Zfp_18ea-xyGo";  // backend hoặc proxy  
const ENDPOINT = "https://api.unsplash.com/photos/random";

async function fetchOfficeImage() {
  const query = "office workspace desk laptop";
  const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${ACCESS_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Unsplash API error: ${resp.status}`);
  const data = await resp.json();
  // `data.urls` chứa các kích thước ảnh
  return data.urls.regular;  
}



// Utils nhỏ
// Mảng ảnh chủ đề văn phòng/làm việc
const PLACEHOLDER_IMAGES = [
    "img/o1.jpg",    
    "img/o2.jpg",
    "img/o3.jpg",
    "img/o4.jpg",
    "img/o5.jpg",
    "img/o6.jpg",
];

// Hàm lấy ảnh random
function getRandomPlaceholderImg() {
  const idx = Math.floor(Math.random() * PLACEHOLDER_IMAGES.length);
  return PLACEHOLDER_IMAGES[idx];
}

// Thiết lập biến
let PLACEHOLDER_IMG = getRandomPlaceholderImg();


// Khi load trang:
document.addEventListener('DOMContentLoaded', async () => {
  await initPlaceholder();
  await initializePage();  // phần của mày
});
function fmtDate(iso) {
  if (!iso) return "—";
  // cho phép backend trả ISO hoặc "YYYY-MM-DDTHH:mm:ss"
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function firstFile(resume) {
  return resume?.files?.length ? resume.files[0] : null;
}
function fileExt(url) {
  if (!url) return "";
  const n = url.split("?")[0].split("#")[0].split("/").pop();
  return (n.includes(".") ? n.split(".").pop() : "").toLowerCase();
}
function fileIcon(ext) {
  // svg inline theo loại
  const base = 'w-5 h-5';
  const pdf = `<svg class="${base} text-red-600" viewBox="0 0 20 20" fill="currentColor"><path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h9a2 2 0 002-2V7.5L10.5 2H4z"/><text x="6" y="15" font-size="7" fill="white">PDF</text></svg>`;
  const doc = `<svg class="${base} text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h9a2 2 0 002-2V7.5L10.5 2H4z"/><text x="6" y="15" font-size="7" fill="white">DOC</text></svg>`;
  const def = `<svg class="${base} text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h9a2 2 0 002-2V7.5L10.5 2H4z"/></svg>`;
  if (ext === "pdf") return pdf;
  if (["doc","docx"].includes(ext)) return doc;
  return def;
}

// CARD
function renderResumeCard(resume) {
  const f = firstFile(resume);
  const ext = fileExt(f?.fileUrl || "");
  const viewUrl = f ? `${API_CONFIG.FILE_BASE_URL}${f.fileUrl}` : null;

  return `
  <div class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <!-- Cover -->
    <div class="relative aspect-[16/9] bg-gray-100">
      <img src="${resume.coverUrl || getRandomPlaceholderImg()}" class="h-full w-full object-cover" alt="">
      ${resume.isDefault ? `
        <div class="absolute left-3 top-3">
          <span class="inline-flex items-center gap-2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow">
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Mặc định
          </span>
        </div>` : ``}
    </div>

    <!-- Body -->
    <div class="p-4">
      <div class="flex items-start gap-2">
        <div class="shrink-0" aria-hidden="true">${fileIcon(ext)}</div>
        <div class="min-w-0">
          <h3 class="text-base font-semibold text-gray-900 truncate" title="${resume.title}">
            ${resume.title}
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Ngày tạo: <span>${fmtDate(resume.createdAt || resume.createdDate)}</span>
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex flex-wrap gap-2">
        <button class="btn-soft gray" onclick="viewResumeDetails(${resume.id})" title="Xem chi tiết">
            <svg class="w-5 h-5 text-gray-600 hover:text-gray-800 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
            </svg>
        </button>

        <button class="btn-soft blue" onclick="editResume(${resume.id})">
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
        </button>
        ${viewUrl ? `
          <a class="btn-soft green" href="${viewUrl}" target="_blank" rel="noopener">
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </a>` : `
          <button class="btn-soft gray" onclick="openUploadModal(${resume.id})">
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
          </button>`}
        <button class="btn-soft red" onclick="deleteResume(${resume.id})">
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
      <div class="flex items-center gap-2 text-sm ${resume.isDefault ? 'text-green-700' : 'text-gray-600'}">
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        ${resume.isDefault ? 'CV mặc định' : 'CV thường'}
      </div>
      <a class="text-gray-500 hover:text-gray-700" href="${viewUrl || '#'}" ${viewUrl ? 'target="_blank" rel="noopener"' : ''} title="Mở">
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7h3a1 1 0 011 1v7a2 2 0 01-2 2H8a1 1 0 110-2h6V8a1 1 0 011-1z"/><path d="M7 3a1 1 0 011-1h7a1 1 0 011 1v7a1 1 0 11-2 0V5.414l-9.293 9.293a1 1 0 01-1.414-1.414L12.586 4H8a1 1 0 01-1-1z"/></svg>
      </a>
    </div>
  </div>`;
}

// Render grid
function renderResumeGrid(list) {
  const grid = document.getElementById('cv-grid');
  if (!list || list.length === 0) {
    grid.classList.add('hidden');
    document.getElementById('empty-state').classList.remove('hidden');
    return;
  }
  grid.innerHTML = list.map(renderResumeCard).join("");
  grid.classList.remove('hidden');
  document.getElementById('empty-state').classList.add('hidden');
}
