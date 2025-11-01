# JobPortal Frontend - Cấu Trúc Dự Án & Hướng Dẫn Phát Triển

**Cập nhật:** November 1, 2025  
**Status:** ✅ Production Ready

---

## 📋 Mục Lục

1. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
2. [Code Base Architecture](#code-base-architecture)
3. [Nguyên Tắc & Patterns](#nguyên-tắc--patterns)
4. [Best Practices](#best-practices)
5. [Quy Trình Thêm Feature Mới](#quy-trình-thêm-feature-mới)
6. [Naming Conventions](#naming-conventions)
7. [Common Helpers Reference](#common-helpers-reference)
8. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## 📁 Cấu Trúc Dự Án

```
frontend/
├── 📄 Trang Chủ
├── index.html
├── login.html
├── register.html
├── reset-request.html
├── reset-password.html
│
├── 📄 Trang Ứng Viên
├── profile.html                    # Hồ sơ cá nhân
├── cv-management.html              # Quản lý CV
├── applications.html               # Danh sách đơn ứng tuyển
├── application-detail.html         # Chi tiết đơn ứng tuyển
├── followed-companies.html         # Công ty theo dõi
├── job.html                        # Danh sách việc làm
├── job-detail.html                 # Chi tiết công việc
├── companies.html                  # Danh sách công ty
├── company-detail.html             # Chi tiết công ty
│
├── 📄 Trang Nhà Tuyển Dụng
├── recruiter-company.html
├── recruiter-company-detail.html
├── recruiter-job-detail.html
│
├── 📄 Trang Thông Tin
├── blog.html
├── blog-detail.html
├── about.html
├── contact.html
├── privacy-policy.html
├── terms.html
├── notification-detail.html
├── notifications.html
│
├── 📁 fragments/                    # Thành phần tái sử dụng
│   ├── header.html                 # Header chung
│   ├── header-candidate.html       # Header cho ứng viên
│   ├── header-recruiter.html       # Header cho recruiter
│   ├── footer.html                 # Footer chung
│   └── user-sidebar.html           # Sidebar người dùng
│
├── 📁 js/
│   ├── 🔧 Core & Configuration
│   ├── config.js                   # Cấu hình API & constants
│   ├── auth.js                     # Xác thực người dùng
│   ├── fragments-loader.js         # Load fragments động
│   │
│   ├── 📚 Utilities & Services
│   ├── markdown-service.js         # Xử lý Markdown, định dạng
│   ├── common-helpers.js           # 40+ hàm tiện ích chung ⭐
│   │
│   ├── 🔗 Feature Services (3-Layer Pattern)
│   ├── [feature]-api.js            # Layer 1: API calls
│   ├── [feature]-ui.js             # Layer 2: UI rendering
│   ├── [feature].js                # Layer 3: Event coordination
│   │   (hoặc [feature]-service.js nếu file đơn)
│   │
│   └── 📄 Feature Files Examples
│       ├── blog-detail-service.js
│       ├── blog-service.js
│       ├── job-detail-service.js
│       ├── job-service.js
│       ├── company-detail-service.js
│       ├── companies-service.js
│       ├── application-detail-service.js
│       ├── applications-service.js
│       ├── cv-management-service.js
│       ├── followed-companies-service.js
│       ├── saved-jobs-service.js
│       ├── profile-service.js
│       ├── notification-service.js
│       ├── notification-detail-service.js
│       ├── login-service.js
│       ├── register-service.js
│       ├── reset-request-service.js
│       ├── reset-password-service.js
│       ├── recruiter-company-detail-api.js
│       ├── recruiter-company-detail-ui.js
│       ├── recruiter-company-detail.js
│       ├── recruiter-job-detail-api.js
│       ├── recruiter-job-detail-ui.js
│       └── recruiter-job-detail.js
│
├── 📁 css/
│   ├── components.css              # CSS components
│   └── styles.css                  # CSS globals
│
├── 📁 img/                         # Hình ảnh
│
├── 📄 Config Files
├── tailwind.config.js
├── postcss.config.js
│
└── 📄 Documentation
    ├── PROJECT_STRUCTURE_AND_GUIDELINES.md (file này)
    ├── REFACTORING_COMPLETE_SUMMARY.md
    └── README.md
```

---

## 🏗️ Code Base Architecture

### **Dependency Flow (Chuỗi phụ thuộc)**

```
HTML Page
    ↓
1️⃣ fragments-loader.js      ← Load fragments động
    ↓
2️⃣ config.js                ← API config & URL builder
    ↓
3️⃣ auth.js                  ← Token & auth logic
    ↓
4️⃣ markdown-service.js      ← Formatting utilities
    ↓
5️⃣ common-helpers.js        ← 40+ general helpers ⭐
    ↓
6️⃣ [feature]-api.js         ← API layer
    ↓
7️⃣ [feature]-ui.js          ← UI layer
    ↓
8️⃣ [feature].js/service.js  ← Coordinator layer
```

### **Three-Layer Architecture (3-Tầng)**

Áp dụng cho các features phức tạp như recruiter company detail, job detail, etc.

```
┌──────────────────────────────────────────────────┐
│ HTML Page (recruiter-company-detail.html)        │
│ - Form inputs                                    │
│ - Modal containers                              │
│ - Display areas                                 │
└────────────────────┬─────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  LAYER 3: Coordinator   │
        │  recruiter-company-detail.js
        │ ├─ Event listeners
        │ ├─ Modal management
        │ ├─ Form submission
        │ └─ User interactions
        └────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼──────────┐       ┌─────▼────────┐
    │ LAYER 2: UI │       │ LAYER 2: UI  │
    │ -ui.js      │       │ -ui.js       │
    │ ├─ Render   │       │ ├─ Format    │
    │ ├─ Display  │       │ ├─ Template  │
    │ └─ Template │       │ └─ Structure │
    └───┬──────────┘       └─────┬────────┘
        │                        │
        └────────────┬───────────┘
                     │
            ┌────────▼──────────┐
            │  LAYER 1: API    │
            │  -api.js         │
            │ ├─ Fetch data
            │ ├─ Parse response
            │ ├─ Error handling
            │ └─ API calls
            └──────────────────┘
                     │
                     ▼
            API Server (8080)
```

---

## 🔑 Nguyên Tắc & Patterns

### **1. Separation of Concerns - 3-Tầng**

#### **Layer 1: API Service** (`[feature]-api.js`)

```javascript
// Pure API logic - dễ test

async function getCompanyDetail(companyId, token) {
    try {
        const url = buildApiUrl(API_CONFIG.COMPANIES.DETAIL, { id: companyId });
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            return handleApiError('getCompanyDetail', new Error('HTTP Error'));
        }
        
        const data = await response.json();
        return isApiResponseSuccess(data) 
            ? createApiResponse(true, data.data)
            : createApiResponse(false, null, data.message);
            
    } catch (error) {
        return handleApiError('getCompanyDetail', error);
    }
}
```

#### **Layer 2: UI Service** (`[feature]-ui.js`)

```javascript
// Pure rendering - dễ debug

function displayCompanyDetail(company) {
    const descriptionHtml = parseMarkdown(company.description);
    
    const html = `
        <div class="company-header">
            <h1>${company.name}</h1>
            <p class="text-gray-600">${company.industry}</p>
        </div>
        <div class="company-description">
            ${descriptionHtml}
        </div>
    `;
    
    setHtmlContent('company-detail-container', html);
}

function displayLoadingState() {
    showElement('loading-spinner');
    hideElement('company-detail-container');
}

function displayErrorState(message) {
    hideElement('loading-spinner');
    showErrorNotification(message);
}
```

#### **Layer 3: Coordinator** (`[feature].js`)

```javascript
// Event handlers & orchestration - dễ bảo trì

let companyId = null;
let currentToken = null;

document.addEventListener('DOMContentLoaded', async () => {
    companyId = getUrlParameter('id');
    currentToken = getStoredToken();
    
    if (!currentToken) {
        redirectToLoginIfNotAuthenticated();
        return;
    }
    
    await loadCompanyDetail();
});

async function loadCompanyDetail() {
    displayLoadingState();
    
    const result = await getCompanyDetail(companyId, currentToken);
    
    if (result.success) {
        displayCompanyDetail(result.data);
    } else {
        displayErrorState(result.message);
    }
}

document.getElementById('btn-edit-company').addEventListener('click', () => {
    openCompanyEditModal();
});

document.getElementById('form-company-edit').addEventListener('submit', handleEditSubmit);

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const formData = getFormData('form-company-edit');
    const result = await updateCompany(companyId, formData, currentToken);
    
    if (result.success) {
        showSuccessNotification('Cập nhật thành công');
        closeCompanyEditModal();
        await loadCompanyDetail();
    } else {
        showErrorNotification(result.message);
    }
}
```

---

### **2. Naming Conventions**

Tuân thủ naming giúp code dễ hiểu và dễ bảo trì.

| Pattern | Ý nghĩa | Ví dụ |
|---------|---------|-------|
| `loadXXXFromAPI()` | Fetch dữ liệu từ API | `loadJobDetailFromAPI()` |
| `loadXXX()` | Load (có thể caching) | `loadJobDetail()` |
| `fetchXXX()` | Fetch raw data | `fetchCompanies()` |
| `getXXX()` | Get từ local/memory | `getStoredToken()` |
| `renderXXX()` | Tạo HTML markup | `renderJobList(jobs)` |
| `displayXXX()` | Hiển thị trên DOM | `displayJobDetail(job)` |
| `handleXXXClick()` | Click event | `handleEditClick()` |
| `handleXXXChange()` | Change event | `handleInputChange()` |
| `handleXXXSubmit()` | Form submit | `handleJobFormSubmit(e)` |
| `openXXXModal()` | Mở modal | `openJobEditModal()` |
| `closeXXXModal()` | Đóng modal | `closeJobEditModal()` |
| `showXXX()` | Ẩn hiện element | `showLoadingSpinner()` |
| `hideXXX()` | Ẩn element | `hideLoadingSpinner()` |
| `toggleXXX()` | Toggle ẩn/hiện | `toggleJobFilters()` |
| `validateXXX()` | Validate dữ liệu | `validateJobForm()` |
| `formatXXX()` | Format dữ liệu | `formatSalary(1000000)` |
| `parseXXX()` | Parse dữ liệu | `parseMarkdown(text)` |

---

### **3. Error Handling Pattern**

Xử lý lỗi nhất quán trên toàn ứng dụng.

```javascript
// ✅ Standard API Response Format
{
    success: boolean,
    data: any | null,
    message: string
}

// ✅ Helper function trong common-helpers.js
function handleApiError(context, error) {
    console.error(`[${context}] API Error:`, error);
    return {
        success: false,
        data: null,
        message: error.message || 'Lỗi không xác định'
    };
}

// ✅ Usage trong service
catch (error) {
    return handleApiError('getCompanyDetail', error);
}

// ✅ User notification (không dùng alert!)
if (!result.success) {
    showErrorNotification(result.message, 4000);
}
```

---

### **4. Authentication Pattern**

```javascript
// ✅ Check authentication
if (!isAuthenticated()) {
    redirectToLoginIfNotAuthenticated();
    return;
}

// ✅ Get token (single source of truth)
const token = getStoredToken();

// ✅ Use token trong API
const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
});

// ✅ Clear on logout
function logout() {
    clearToken();
    redirectToUrl('/login');
}
```

---

### **5. DOM Manipulation Pattern**

```javascript
// ✅ Show/Hide (handles both CSS classes & inline styles)
showElement('loading-spinner');              // Removes 'hidden' class & clears display:none
hideElement('loading-spinner');              // Adds 'hidden' class & sets display:none
toggleElement('advanced-filters');           // Toggles visibility

// ✅ Text/HTML content
setTextContent('job-title', 'Senior Developer');
setHtmlContent('description', htmlMarkdown);
const value = getElementValue('search-input');

// ✅ Set input values
setElementValue('job-title-input', 'Developer');
const formData = getFormData('form-job-edit');  // Get all fields

// ✅ Modal management
openModal('confirm-delete-modal');
closeModal('confirm-delete-modal');
setupModalBackgroundClose('confirm-modal', () => {
    // Callback khi user click ngoài modal
});
```

---

### **6. API Configuration**

```javascript
// ✅ Define endpoints trong config.js
const API_CONFIG = {
    COMPANIES: {
        LIST: '/companies',
        CREATE: '/companies',
        DETAIL: '/companies/:id',
        UPDATE: '/companies/:id',
        DELETE: '/companies/:id'
    },
    JOBS: {
        LIST: '/jobs',
        DETAIL: '/jobs/:id'
    }
};

// ✅ Usage
const url = buildApiUrl(API_CONFIG.COMPANIES.DETAIL, { id: 123 });
// → http://localhost:8080/api/companies/123

// ✅ Query params
const url = buildApiUrl(
    API_CONFIG.JOBS.LIST, 
    {},
    { page: 1, limit: 20, search: 'developer' }
);
// → http://localhost:8080/api/jobs?page=1&limit=20&search=developer
```

---

### **7. Common Helpers Library** ⭐

40+ hàm tiện ích tập trung trong `common-helpers.js`

#### **Error & Notification (4 functions)**

```javascript
showErrorNotification(message, duration = 4000)
showSuccessNotification(message, duration = 3000)
showErrorToast(message, duration = 5000)
showSuccessToast(message, duration = 3000)
```

#### **API Response (3 functions)**

```javascript
handleApiError(context, error)           // Chuẩn hóa lỗi
createApiResponse(success, data, msg)    // Tạo response
isApiResponseSuccess(response)           // Validate response
```

#### **Authentication (8 functions)**

```javascript
getStoredToken()                         // Lấy token
saveToken(token)                         // Lưu token
clearToken()                             // Xóa token (logout)
isAuthenticated()                        // Check đã login
redirectToLoginIfNotAuthenticated()      // Guard
getSessionValue(key)                     // Lấy session
saveSessionValue(key, value)             // Lưu session
clearSessionValue(key)                   // Xóa session
```

#### **DOM Manipulation (8 functions)**

```javascript
showElement(element|id)                  // Hiện element
hideElement(element|id)                  // Ẩn element
toggleElement(element|id)                // Toggle ẩn/hiện
setTextContent(id, text)                 // Đặt text
setHtmlContent(id, html)                 // Đặt HTML
getElementValue(id)                      // Lấy giá trị
setElementValue(id, value)               // Đặt giá trị
```

#### **Modal (3 functions)**

```javascript
openModal(modalId)                       // Mở modal
closeModal(modalId)                      // Đóng modal
setupModalBackgroundClose(modalId, cb)   // Setup click-outside close
```

#### **Form & Validation (7 functions)**

```javascript
getFormData(form)                        // Lấy tất cả fields
resetForm(form)                          // Reset form
validateRequiredFields(fieldIds)         // Check required
isValidEmail(email)                      // Email validation
isValidPhoneVN(phone)                    // VN phone validation
isEmpty(value)                           // Generic empty check
```

#### **URL & Navigation (3 functions)**

```javascript
getUrlParameter(paramName)               // Lấy URL param
redirectToUrl(url, delay = 0)           // Navigate
reloadPage()                             // Refresh page
```

#### **Utilities (8 functions)**

```javascript
debounce(func, wait)                     // Debounce function
formatDateShort(dateString)              // Format: DD/MM/YYYY HH:MM
parseLocalDatetimeToISO(datetimeLocal)  // Convert to ISO
convertIsoToLocalDatetime(isoDatetime)  // Convert to local
formatBytes(bytes)                       // Format: 1.2 MB
copyToClipboard(text)                    // Copy to clipboard
generateUniqueId()                       // Generate unique ID
```

---

## 📊 Best Practices

### ✅ **DO - Làm điều này**

```javascript
// ✅ 1. Tách API logic từ UI
// api.js
async function getJobDetail(id, token) { ... }

// ui.js
function displayJobDetail(job) { ... }

// service.js
document.addEventListener('...', async () => {
    const data = await getJobDetail(id, token);
    displayJobDetail(data);
});

// ✅ 2. Dùng common-helpers
const token = getStoredToken();
showErrorNotification('Lỗi tải dữ liệu');
showElement('content-container');

// ✅ 3. Follow naming conventions
function handleEditClick() { ... }
function displayUserProfile(user) { ... }
function loadJobsFromAPI() { ... }

// ✅ 4. Xử lý error một cách nhất quán
if (!response.ok) {
    return handleApiError('getCompanyDetail', new Error('HTTP Error'));
}

// ✅ 5. Kiểm tra authentication trước
if (!isAuthenticated()) {
    redirectToLoginIfNotAuthenticated();
    return;
}

// ✅ 6. Validate input trước submit
if (!validateRequiredFields(['name', 'email'])) {
    showErrorNotification('Vui lòng điền đầy đủ thông tin');
    return;
}

// ✅ 7. Use API config
const url = buildApiUrl(API_CONFIG.JOBS.DETAIL, { id: jobId });

// ✅ 8. Comments cho logic phức tạp
// Kiểm tra xem công ty đã được save chưa
const isSaved = savedCompanies.includes(companyId);
```

### ❌ **DON'T - Không làm điều này**

```javascript
// ❌ 1. Không mix API + UI + Events
async function loadAndDisplay() {
    const data = await fetch(url);      // API
    const html = '<div>...</div>';      // UI
    document.getElementById('x').innerHTML = html;  // DOM
    document.getElementById('btn').addEventListener('click', ...);  // Event
}

// ❌ 2. Không hardcode URL API
const url = 'http://localhost:8080/api/jobs/123';

// ❌ 3. Không dùng alert() cho user messages
alert('Lỗi tải dữ liệu');  // ❌ BAD

// ❌ 4. Không lặp lại code
// Nếu hàm này dùng ở 2+ chỗ → extract ra common-helpers.js

// ❌ 5. Không bỏ qua error handling
async function getUser() {
    const response = await fetch(url);
    return response.json();  // ❌ Nếu error → crash
}

// ❌ 6. Để global variables vô tứ tự
globalVar = 123;  // ❌ BAD
let x = 1, y = 2, z = 3;  // ❌ Multiple declarations

// ❌ 7. Dùng var (dùng let/const)
var oldStyle = 123;  // ❌ Dùng let/const thay vì

// ❌ 8. Lấy token trực tiếp mỗi lần
const token = localStorage.getItem('access_token');  // ❌ Dùng getStoredToken()

// ❌ 9. Không comment cho code rõ ràng
// Comment chỉ cần khi logic phức tạp hoặc không rõ ràng

// ❌ 10. Test code hoặc console.log ở production
console.log('Debug info');  // ❌ Xóa trước khi commit
debugger;  // ❌ Xóa trước khi commit
```

---

## 🚀 Quy Trình Thêm Feature Mới

### **Scenario 1: Feature Đơn Giản (1 file)**

Ví dụ: Trang "Saved Jobs" - chỉ show list + no interactive features

```
1. Tạo file: saved-jobs-service.js
   ├─ API functions (loadSavedJobs)
   ├─ UI functions (displaySavedJobsList)
   └─ Event handlers (init, handleRemove)

2. Import trong HTML:
   <script src="js/common-helpers.js"></script>
   <script src="js/saved-jobs-service.js"></script>

3. Viết code:
   - Layer 1: Fetch API
   - Layer 2: Render HTML
   - Layer 3: Handle events

4. Test:
   - Check load data ✅
   - Check display ✅
   - Check error handling ✅
```

### **Scenario 2: Feature Phức Tạp (3 files)**

Ví dụ: Recruiter Company Detail - form, modal, markdown editor

```
1. Tạo 3 files:
   ├─ recruiter-company-detail-api.js      (Layer 1: API)
   ├─ recruiter-company-detail-ui.js       (Layer 2: UI)
   └─ recruiter-company-detail.js          (Layer 3: Coordinator)

2. Layer 1 (API):
   async function getCompanyDetail(id, token) { ... }
   async function updateCompany(id, data, token) { ... }
   async function deleteCompany(id, token) { ... }

3. Layer 2 (UI):
   function displayCompanyHeader(company) { ... }
   function displayCompanyForm(company) { ... }
   function displayLoadingState() { ... }

4. Layer 3 (Coordinator):
   document.addEventListener('DOMContentLoaded', init);
   async function init() { ... }
   function handleEditClick() { ... }
   function handleSaveClick() { ... }

5. Import trong HTML:
   <script src="js/common-helpers.js"></script>
   <script src="js/recruiter-company-detail-api.js"></script>
   <script src="js/recruiter-company-detail-ui.js"></script>
   <script src="js/recruiter-company-detail.js"></script>

6. Test kỹ:
   - Load data ✅
   - Display ✅
   - Form submission ✅
   - Modal open/close ✅
   - Error handling ✅
```

### **Step-by-Step Checklist**

- [ ] **Planning**
  - [ ] Xác định scope (API endpoints, UI components, interactions)
  - [ ] Quyết định 1 file hay 3 files
  - [ ] List các functions cần

- [ ] **Development**
  - [ ] Tạo file(s)
  - [ ] Implement Layer 1 (API)
  - [ ] Implement Layer 2 (UI)
  - [ ] Implement Layer 3 (Coordinator)
  - [ ] Import scripts trong HTML
  - [ ] Dùng common-helpers cho việc chung

- [ ] **Testing**
  - [ ] Load data từ API
  - [ ] Display data đúng
  - [ ] Form submit hoạt động
  - [ ] Error handling
  - [ ] Modal/UI interactions
  - [ ] Mobile responsive

- [ ] **Code Review**
  - [ ] Naming conventions ✅
  - [ ] No code duplication ✅
  - [ ] Error handling ✅
  - [ ] Comments cho logic phức tạp ✅
  - [ ] No console.log ✅

- [ ] **Documentation**
  - [ ] Thêm comments nếu cần
  - [ ] Update CHANGELOG nếu có

---

## 📝 Naming Conventions

### **File Naming**

```
[feature]-api.js           # Layer 1: API calls
[feature]-ui.js            # Layer 2: UI rendering
[feature].js               # Layer 3: Coordinator
[feature]-service.js       # Tất cả trong 1 file

Examples:
- job-detail-api.js
- job-detail-ui.js
- job-detail.js
- saved-jobs-service.js
```

### **Function Naming**

```javascript
// API functions
async function getCompanyDetail(id, token) { }
async function updateCompany(id, data, token) { }
async function deleteCompany(id, token) { }
async function createCompany(data, token) { }

// UI functions
function displayCompanyDetail(company) { }
function displayCompanyForm(company) { }
function displayLoadingState() { }
function displayErrorState(message) { }
function renderCompanyList(companies) { }

// Event handlers
function handleEditClick() { }
function handleSaveClick() { }
function handleDeleteClick() { }
function handleFormSubmit(e) { }

// Helper functions
function formatCompanyData(raw) { }
function validateCompanyForm(data) { }
function parseCompanyResponse(response) { }
```

### **Variable Naming**

```javascript
let currentCompanyId = null;
let isLoading = false;
let companyData = {};
const API_BASE_URL = 'http://localhost:8080/api';
const MODAL_ID = 'company-edit-modal';

// Avoid
let x = 123;        // ❌ Too vague
let temp = {};      // ❌ Not descriptive
let data = [];      // ❌ Too generic
```

### **CSS Class Naming**

```css
/* Utility/State classes */
.hidden              /* Hide element */
.loading             /* Loading state */
.error               /* Error state */
.active              /* Active state */

/* Component classes */
.company-card        /* Component */
.job-list-item       /* Sub-component */
.form-field          /* Form field */
.btn-primary         /* Button variant */
```

---

## 📚 Common Helpers Reference

### **Quick Reference**

```javascript
// 🔐 Authentication
const token = getStoredToken();
if (!isAuthenticated()) redirectToLoginIfNotAuthenticated();

// 📢 Notifications
showSuccessNotification('Thành công', 3000);
showErrorNotification('Lỗi xảy ra', 4000);
showSuccessToast('Copied!', 2000);
showErrorToast('Try again', 3000);

// 🎯 DOM
showElement('id-or-element');
hideElement('id');
toggleElement('id');
setTextContent('id', 'Hello');
setHtmlContent('id', '<p>HTML</p>');
const val = getElementValue('input-id');
setElementValue('input-id', 'value');

// 📋 Forms
const data = getFormData(formElement);  // {name: 'John', ...}
resetForm(formElement);
validateRequiredFields(['field1', 'field2']);
isValidEmail('test@example.com');

// 🔗 URL & Navigation
const page = getUrlParameter('page');
redirectToUrl('/dashboard', 500);
reloadPage();

// 🎪 Modals
openModal('modal-id');
closeModal('modal-id');
setupModalBackgroundClose('modal-id', () => { console.log('closed'); });

// 🛠️ Utilities
debounce(handleSearch, 300);
formatDateShort('2024-11-01T10:30:00');
formatBytes(1048576);  // '1.0 MB'
copyToClipboard('text-to-copy');
generateUniqueId();  // 'abc123xyz'

// 🔌 API Response
const response = createApiResponse(true, data, 'Success');
const response = handleApiError('context', error);
if (isApiResponseSuccess(response)) { ... }
```

---

## ❓ FAQ & Troubleshooting

### **Q: Làm sao để thêm feature mới?**

A: Follow "Quy Trình Thêm Feature Mới" ở trên. Tóm tắt:
1. Tạo file (1 hay 3 tùy complexity)
2. Implement 3 layers: API → UI → Coordinator
3. Import trong HTML theo thứ tự
4. Dùng common-helpers cho việc chung
5. Test kỹ

### **Q: Khi nào dùng 1 file vs 3 files?**

A:
- **1 file** (`-service.js`): Simple features (list display, no interactions)
- **3 files** (`-api.js`, `-ui.js`, `.js`): Complex features (forms, modals, multiple interactions)

### **Q: Làm sao fix lỗi "Element not showing"?**

A: Thường là:
1. Check element tồn tại trong DOM: `document.getElementById('id')`
2. Dùng `showElement()` thay vì `classList.remove('hidden')`
3. Check CSS không override `display: none`

### **Q: Cách test API layer?**

A:
```javascript
// Test trong browser console
const result = await getCompanyDetail(1, 'token');
console.log(result);  // {success: true, data: {...}}
```

### **Q: Làm sao handle token expiration?**

A:
```javascript
// API layer
if (response.status === 401) {
    clearToken();
    redirectToUrl('/login');
    return { success: false, message: 'Session expired' };
}
```

### **Q: Cách debug API call?**

A:
```javascript
// Trong browser DevTools
// 1. Open Network tab → Xem request/response
// 2. Check token trong: localStorage.getItem('access_token')
// 3. Check API response: response.json()
```

### **Q: common-helpers.js là gì?**

A: Thư viện 40+ hàm tiện ích tập trung, tránh lặp code. Include trong tất cả pages.

### **Q: Tại sao phải follow naming conventions?**

A: Để code dễ hiểu, dễ debug, dễ maintain. Team member khác sẽ biết function làm gì từ tên.

### **Q: Có cách nào track all API errors?**

A: Dùng `handleApiError()` trong Layer 1, tất cả errors sẽ có format nhất quán.

### **Q: Khi nào thêm comment?**

A: Thêm comment khi:
- Logic phức tạp & không rõ ràng
- Có edge cases
- Business logic đặc biệt
- Không thêm comment cho obvious code

### **Q: Làm sao test form validation?**

A:
```javascript
// HTML
<input id="email" type="email" required />

// Test
validateRequiredFields(['email']);  // false nếu trống
isValidEmail(getElementValue('email'));  // validate format
```

---

## 📞 Support

Nếu có thắc mắc hoặc cần help:
1. Check FAQ trên
2. Review code examples trong file này
3. Check common-helpers.js để xem available functions
4. Ask team lead

---

**Version:** 1.0  
**Last Updated:** November 1, 2025  
**Status:** ✅ Production Ready
