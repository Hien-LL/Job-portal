// ==================== Recruiter Job Create/Edit Service ====================
// Handles job creation, editing, and form submission

let currentJob = null;
let allCategories = [];
let allLocations = [];
let allBenefits = [];
let allSkills = [];
let selectedBenefits = [];
let selectedSkills = [];
let isSavingDraft = false;
let descriptionEditor = null;

// ==================== Helper Functions ====================

// Convert datetime-local (YYYY-MM-DDTHH:mm) to UTC ISO string
// Input: 2025-11-30T06:00 (user's local time)
// Output: 2025-11-30T06:00:00Z (as if they entered UTC time)
function localDatetimeToUTC(datetimeLocalValue) {
    // Parse the datetime-local value
    const [datePart, timePart] = datetimeLocalValue.split('T');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');
    
    // Create a date object treating the input as UTC
    const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);
    
    return date.toISOString();
}

// ==================== Quill Editor ====================

function initializeDescriptionEditor() {
    if (descriptionEditor) return; // Already initialized

    descriptionEditor = new Quill('#job-description-editor', {
        theme: 'snow',
        placeholder: 'Viết mô tả chi tiết về công việc...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

// ==================== API Functions ====================

// Get categories
async function getCategories() {
  try {
    const response = await authService.apiRequest(API_CONFIG.CATEGORIES.LIST, { method: "GET" });

    if (!response || !response.ok)
      throw new Error("Failed to fetch categories");

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Get Categories Error:", error);
    return [];
  }
}

// Get locations
async function getLocations() {
  try {
    const response = await authService.apiRequest(API_CONFIG.LOCATIONS.LIST, { method: "GET" });

    if (!response || !response.ok) throw new Error("Failed to fetch locations");

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Get Locations Error:", error);
    return [];
  }
}

// Get benefits
async function getBenefits() {
  try {
    const response = await authService.apiRequest(API_CONFIG.BENEFITS.LIST, { method: "GET" });

    if (!response || !response.ok) throw new Error("Failed to fetch benefits");

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Get Benefits Error:", error);
    return [];
  }
}

// Get skills
async function getSkills() {
  try {
    const response = await authService.apiRequest(API_CONFIG.SKILLS.LIST, { method: "GET" });

    if (!response || !response.ok) throw new Error("Failed to fetch skills");

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Get Skills Error:", error);
    return [];
  }
}

// Get job detail (for editing)
async function getJobDetail(jobId) {
  try {
    const response = await authService.apiRequest(API_CONFIG.JOBS.GET_MY_JOB.replace(':jobId', jobId), { method: "GET" });

    if (!response || !response.ok) throw new Error("Failed to fetch job");

    const data = await response.json();
    return {
      success: data.success,
      data: data.data || null,
    };
  } catch (error) {
    console.error("Get Job Detail Error:", error);
    return {
      success: false,
      data: null,
    };
  }
}

// Create job
async function createJob(jobData) {
  try {
    console.log("Creating job at:", API_CONFIG.JOBS.CREATE_MY_COMPANY);
    console.log("Job data:", jobData);

    const response = await authService.apiRequest(API_CONFIG.JOBS.CREATE_MY_COMPANY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });

    if (!response || !response.ok) {
      const data = await response.json();
      return {
        success: false,
        message: data.message || "Tạo tin tuyển dụng thất bại",
      };
    }

    const data = await response.json();
    console.log("Create job response:", data);

    return {
      success: data.success,
      message: data.message,
      data: data.data,
    };
  } catch (error) {
    console.error("Create Job Error:", error);
    return {
      success: false,
      message: "Lỗi kết nối. Vui lòng thử lại sau.",
    };
  }
}

// Update job
async function updateJob(jobId, jobData) {
  try {
    const url = API_CONFIG.JOBS.UPDATE_MY_JOB.replace(':jobId', jobId);
    console.log("Updating job at:", url);
    console.log("Job data:", jobData);

    const response = await authService.apiRequest(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });

    if (!response || !response.ok) {
      const data = await response.json();
      return {
        success: false,
        message: data.message || "Cập nhật tin tuyển dụng thất bại",
      };
    }

    const data = await response.json();
    console.log("Update job response:", data);

    return {
      success: data.success,
      message: data.message,
      data: data.data,
    };
  } catch (error) {
    console.error("Update Job Error:", error);
    return {
      success: false,
      message: "Lỗi kết nối. Vui lòng thử lại sau.",
    };
  }
}

// ==================== UI Functions ====================

// Populate dropdowns
async function populateDropdowns() {
  try {
    allCategories = await getCategories();
    allLocations = await getLocations();
    allBenefits = await getBenefits();
    allSkills = await getSkills();

    // Populate categories
    const categorySelect = document.getElementById("job-category");
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
      allCategories.forEach((cat) => {
        categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
      });
    }

    // Populate locations
    const locationSelect = document.getElementById("job-location");
    if (locationSelect) {
      locationSelect.innerHTML = '<option value="">Chọn địa điểm</option>';
      allLocations.forEach((loc) => {
        locationSelect.innerHTML += `<option value="${loc.countryCode}">${loc.displayName}</option>`;
      });
    }

    // Render benefits checkboxes
    renderBenefits();

    // Render skills checkboxes
    renderSkills();
  } catch (error) {
    console.error("Error populating dropdowns:", error);
    showErrorToast("Lỗi tải dữ liệu", 3000);
  }
}

// Render benefits as checkboxes
function renderBenefits() {
  const container = document.getElementById("benefits-dropdown");
  if (!container) return;

  container.innerHTML = allBenefits
    .map(
      (benefit) => `
        <label class="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
                type="checkbox" 
                class="benefit-checkbox w-4 h-4 border border-gray-300 rounded cursor-pointer"
                value="${benefit.id}"
                data-name="${benefit.name}"
                ${selectedBenefits.includes(benefit.id) ? "checked" : ""}
            >
            <span class="text-sm font-medium text-gray-700">${
              benefit.name
            }</span>
        </label>
    `
    )
    .join("");

  // Attach event listeners
  document.querySelectorAll(".benefit-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const id = parseInt(this.value);
      if (this.checked) {
        if (!selectedBenefits.includes(id)) selectedBenefits.push(id);
      } else {
        selectedBenefits = selectedBenefits.filter((b) => b !== id);
      }
      updateBenefitsDisplay();
    });
  });

  updateBenefitsDisplay();
}

// Update benefits display
function updateBenefitsDisplay() {
  const display = document.getElementById("benefits-selected");
  if (!display) return;

  // Remove duplicates
  const uniqueBenefitIds = [...new Set(selectedBenefits)];
  selectedBenefits = uniqueBenefitIds; // Update the global array to remove duplicates

  if (uniqueBenefitIds.length === 0) {
    document.getElementById("benefits-selected-text").textContent = "Chọn quyền lợi";
    display.innerHTML = "";
    return;
  }

  document.getElementById("benefits-selected-text").textContent = `Đã chọn ${uniqueBenefitIds.length} quyền lợi`;

  const selectedNames = uniqueBenefitIds.map(id => {
    const benefit = allBenefits.find(b => b.id === id);
    return benefit ? benefit.name : "";
  }).filter(name => name);

  display.innerHTML = selectedNames
    .map(name => `<span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">✓ ${name}</span>`)
    .join("");
}

// Render skills as checkboxes
function renderSkills() {
  const container = document.getElementById("skills-dropdown");
  if (!container) return;

  container.innerHTML = allSkills
    .map(
      (skill) => `
        <label class="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
                type="checkbox" 
                class="skill-checkbox w-4 h-4 border border-gray-300 rounded cursor-pointer"
                value="${skill.id}"
                data-name="${skill.name}"
                ${selectedSkills.includes(skill.id) ? "checked" : ""}
            >
            <span class="text-sm font-medium text-gray-700">${skill.name}</span>
        </label>
    `
    )
    .join("");

  // Attach event listeners
  document.querySelectorAll(".skill-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const id = parseInt(this.value);
      if (this.checked) {
        if (!selectedSkills.includes(id)) selectedSkills.push(id);
      } else {
        selectedSkills = selectedSkills.filter((s) => s !== id);
      }
      updateSkillsDisplay();
    });
  });

  updateSkillsDisplay();
}

// Update skills display
function updateSkillsDisplay() {
  const display = document.getElementById("skills-selected");
  if (!display) return;

  // Remove duplicates
  const uniqueSkillIds = [...new Set(selectedSkills)];
  selectedSkills = uniqueSkillIds; // Update the global array to remove duplicates

  if (uniqueSkillIds.length === 0) {
    document.getElementById("skills-selected-text").textContent = "Chọn kỹ năng";
    display.innerHTML = "";
    return;
  }

  document.getElementById("skills-selected-text").textContent = `Đã chọn ${uniqueSkillIds.length} kỹ năng`;

  const selectedNames = uniqueSkillIds.map(id => {
    const skill = allSkills.find(s => s.id === id);
    return skill ? skill.name : "";
  }).filter(name => name);

  display.innerHTML = selectedNames
    .map(name => `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">✓ ${name}</span>`)
    .join("");
}

// Toggle benefits dropdown
function toggleBenefitsDropdown() {
  const dropdown = document.getElementById("benefits-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
}

// Toggle skills dropdown
function toggleSkillsDropdown() {
  const dropdown = document.getElementById("skills-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
}

// Load job detail for editing
async function loadJobDetail() {
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("jobId");

  if (!jobId) return;

  try {
    const result = await getJobDetail(jobId);

    if (result.success && result.data) {
      currentJob = result.data;
      populateJobForm(result.data);
      setTextContent("page-title", "Chỉnh sửa tin tuyển dụng");
      document.getElementById("submit-text").textContent = "Cập nhật";
    }
  } catch (error) {
    console.error("Error loading job detail:", error);
    showErrorToast("Không thể tải thông tin tin tuyển dụng", 3000);
  }
}

// Populate form with job data
function populateJobForm(job) {
  setElementValue("job-id", job.id);
  setElementValue("job-title", job.title);
  
  // Initialize Quill and load description
  initializeDescriptionEditor();
  descriptionEditor.root.innerHTML = job.description || '';

  setElementValue("job-category", job.category?.id);
  setElementValue("job-location", job.location?.countryCode);
  document.getElementById("job-remote").checked = job.isRemote;
  setElementValue("job-salary-min", job.salaryMin);
  setElementValue("job-salary-max", job.salaryMax);
  setElementValue("job-currency", job.currency);
  setElementValue("job-seniority", job.seniority);
  setElementValue("job-employment-type", job.employmentType);
  setElementValue("job-experience", job.yearsOfExperience);

  // Set expiry date - convert to datetime-local format
  if (job.expiresAt) {
    const date = new Date(job.expiresAt);
    const isoString = date.toISOString().slice(0, 16);
    setElementValue("job-expires-at", isoString);
  }

  // Select benefits
  if (job.benefits && job.benefits.length > 0) {
    selectedBenefits = job.benefits.map((b) => b.id);
    renderBenefits();
  }

  // Select skills
  if (job.skills && job.skills.length > 0) {
    selectedSkills = job.skills.map((s) => s.id);
    renderSkills();
  }
}

// Initialize page
async function initializePage() {
  try {
    if (!authService.requireAuth()) {
      return;
    }

    showElement("loading");
    hideElement("error-state");
    hideElement("job-form");

    await populateDropdowns();

    // Initialize Quill editor
    initializeDescriptionEditor();

    hideElement("loading");
    showElement("job-form");

    await loadJobDetail();
  } catch (error) {
    console.error("Initialize page error:", error);
    hideElement("loading");
    showElement("error-state");
    setTextContent("error-text", "Có lỗi xảy ra. Vui lòng thử lại.");
  }
}

// Validate form
function validateForm() {
  const title = getElementValue("job-title");
  const descriptionContent = descriptionEditor.root.innerHTML.replace(/<p><br><\/p>/g, '');
  const category = getElementValue("job-category");
  const location = getElementValue("job-location");
  const salaryMin = parseInt(getElementValue("job-salary-min")) || 0;
  const salaryMax = parseInt(getElementValue("job-salary-max")) || 0;
  const seniority = getElementValue("job-seniority");
  const employmentType = getElementValue("job-employment-type");
  const expiresAt = getElementValue("job-expires-at");

  if (!title.trim()) {
    showErrorToast("Vui lòng nhập tiêu đề tin tuyển dụng", 3000);
    return false;
  }

  if (!descriptionContent.trim()) {
    showErrorToast("Vui lòng nhập mô tả công việc", 3000);
    return false;
  }

  if (!category) {
    showErrorToast("Vui lòng chọn danh mục", 3000);
    return false;
  }

  if (!location) {
    showErrorToast("Vui lòng chọn địa điểm", 3000);
    return false;
  }

  if (salaryMin < 0 || salaryMax < 0) {
    showErrorToast("Lương không thể là số âm", 3000);
    return false;
  }

  if (salaryMin > salaryMax) {
    showErrorToast("Lương tối thiểu không được lớn hơn lương tối đa", 3000);
    return false;
  }

  if (!seniority) {
    showErrorToast("Vui lòng chọn cấp bậc", 3000);
    return false;
  }

  if (!employmentType) {
    showErrorToast("Vui lòng chọn hình thức làm việc", 3000);
    return false;
  }

  if (!expiresAt) {
    showErrorToast("Vui lòng chọn ngày hết hạn", 3000);
    return false;
  }

  if (selectedBenefits.length === 0) {
    showErrorToast("Vui lòng chọn ít nhất một quyền lợi", 3000);
    return false;
  }

  if (selectedSkills.length === 0) {
    showErrorToast("Vui lòng chọn ít nhất một kỹ năng", 3000);
    return false;
  }

  return true;
}

// Get form data
function getFormData(publish = true) {
  // Convert datetime-local to UTC ISO string
  const expiresAtInput = getElementValue("job-expires-at"); // Format: YYYY-MM-DDTHH:mm
  const expiresAtISO = localDatetimeToUTC(expiresAtInput);

  // Remove duplicates from arrays
  const uniqueBenefits = [...new Set(selectedBenefits)];
  const uniqueSkills = [...new Set(selectedSkills)];

  return {
    title: getElementValue("job-title"),
    description: descriptionEditor.root.innerHTML.replace(/<p><br><\/p>/g, ''),
    categoryId: parseInt(getElementValue("job-category")),
    locationCountryCode: getElementValue("job-location"),
    isRemote: document.getElementById("job-remote").checked,
    salaryMin: parseInt(getElementValue("job-salary-min")) || 0,
    salaryMax: parseInt(getElementValue("job-salary-max")) || 0,
    currency: getElementValue("job-currency"),
    seniority: getElementValue("job-seniority"),
    employmentType: getElementValue("job-employment-type"),
    yearsOfExperience: parseInt(getElementValue("job-experience")) || 0,
    expiresAt: expiresAtISO,
    benefitIds: uniqueBenefits,
    skillIds: uniqueSkills,
  };
}

// ==================== Event Listeners ====================

document.addEventListener("DOMContentLoaded", function () {
  // Form submit
  const jobForm = document.getElementById("job-form");
  if (jobForm) {
    jobForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        const submitBtn = document.getElementById("publish-btn");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Đang xử lý...";
        }

        const jobData = getFormData(true);
        let result;

        if (currentJob) {
          result = await updateJob(currentJob.id, jobData);
        } else {
          result = await createJob(jobData);
        }

        if (result.success) {
          showSuccessToast(
            currentJob
              ? "Cập nhật tin tuyển dụng thành công!"
              : "Tạo tin tuyển dụng thành công!",
            3000
          );
          setTimeout(() => {
            window.location.href = "recruiter-job.html";
          }, 1500);
        } else {
          showErrorToast(result.message || "Có lỗi xảy ra", 3000);
        }
      } catch (error) {
        console.error("Submit error:", error);
        showErrorToast("Có lỗi xảy ra", 3000);
      } finally {
        const submitBtn = document.getElementById("publish-btn");
        if (submitBtn) {
          submitBtn.disabled = false;
          const submitText = document.getElementById("submit-text");
          submitBtn.textContent = submitText ? submitText.textContent : "Đăng tin";
        }
      }
    });
  }

  // Save draft button
  const saveDraftBtn = document.getElementById("save-draft-btn");
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", async function () {
      if (!validateForm()) return;

      try {
        this.disabled = true;
        this.textContent = "Đang lưu...";

        const jobData = getFormData(false);
        let result;

        if (currentJob) {
          result = await updateJob(currentJob.id, jobData);
        } else {
          result = await createJob(jobData);
        }

        if (result.success) {
          showSuccessToast("Lưu nháp thành công!", 3000);
        } else {
          showErrorToast(result.message || "Có lỗi xảy ra", 3000);
        }
      } catch (error) {
        console.error("Save draft error:", error);
        showErrorToast("Có lỗi xảy ra", 3000);
      } finally {
        this.disabled = false;
        this.textContent = "Lưu nháp";
      }
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", function(e) {
    const benefitsDropdown = document.getElementById("benefits-dropdown");
    const skillsDropdown = document.getElementById("skills-dropdown");
    const benefitsBtn = e.target.closest("[onclick*='toggleBenefitsDropdown']");
    const skillsBtn = e.target.closest("[onclick*='toggleSkillsDropdown']");

    // Close benefits dropdown if clicking outside
    if (benefitsDropdown && !benefitsBtn && !benefitsDropdown.contains(e.target)) {
      benefitsDropdown.classList.add("hidden");
    }

    // Close skills dropdown if clicking outside
    if (skillsDropdown && !skillsBtn && !skillsDropdown.contains(e.target)) {
      skillsDropdown.classList.add("hidden");
    }
  });

  // Initialize page
  loadFragments().then(() => {
    initializePage();
  });
});
