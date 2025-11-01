// ==================== Recruiter Company Detail - Main Coordinator ====================
// Handles modal interactions, markdown toolbar, and main event orchestration
// Depends on: recruiter-company-detail-api.js, recruiter-company-detail-ui.js, common-helpers.js

// ==================== Markdown Toolbar Functions ====================

/**
 * Insert text at cursor position in textarea with optional prefix/suffix
 */
function insertMarkdownAtCursor(textarea, beforeText, afterText = '') {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + beforeText + selectedText + afterText + text.substring(end);
    textarea.value = newText;
    
    // Move cursor
    const newCursorPos = start + beforeText.length + selectedText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    // Trigger input event for preview update
    textarea.dispatchEvent(new Event('input'));
}

/**
 * Open job modal
 */
function openJobCreationModal() {
    const jobModal = document.getElementById('job-modal');
    const modalTitle = document.getElementById('modal-title');
    const jobForm = document.getElementById('job-form');
    const writePanel = document.getElementById('write-panel');
    const previewPanel = document.getElementById('preview-panel');
    const tabWrite = document.getElementById('tab-write');
    const tabPreview = document.getElementById('tab-preview');
    
    if (jobModal) jobModal.classList.remove('hidden');
    if (modalTitle) modalTitle.textContent = 'Tạo tin tuyển dụng';
    if (jobForm) jobForm.reset();
    
    // Reset to Write tab
    if (writePanel && previewPanel && tabWrite && tabPreview) {
        writePanel.classList.remove('hidden');
        previewPanel.classList.add('hidden');
        tabWrite.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        tabWrite.classList.remove('text-gray-600', 'border-transparent');
        tabPreview.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        tabPreview.classList.add('text-gray-600', 'border-transparent');
    }
    
    // Reset markdown preview
    const preview = document.getElementById('markdown-preview');
    if (preview) {
        preview.innerHTML = '<p class="text-gray-400 text-sm italic">Mô tả sẽ hiển thị ở đây...</p>';
    }
    
    // Populate categories dropdown
    populateCategoriesDropdown();
}

/**
 * Close job modal
 */
function closeJobCreationModal() {
    const jobModal = document.getElementById('job-modal');
    const jobForm = document.getElementById('job-form');
    
    if (jobModal) jobModal.classList.add('hidden');
    if (jobForm) jobForm.reset();
}

/**
 * Handle job form submission
 */
async function handleJobCreationSubmit(e) {
    e.preventDefault();

    try {
        const token = getStoredToken();
        
        // Get form data
        const jobData = {
            title: getElementValue('job-title'),
            description: getElementValue('job-description'),
            salaryMin: parseInt(getElementValue('job-salary-min')),
            salaryMax: parseInt(getElementValue('job-salary-max')),
            seniority: getElementValue('job-seniority'),
            employmentType: getElementValue('job-employment-type'),
            isRemote: document.getElementById('job-is-remote').checked,
            categoryId: parseInt(getElementValue('job-category-id')),
            locationCountryCode: getElementValue('job-location'),
            expiresAt: parseLocalDatetimeToISO(getElementValue('job-expires-at')),
            currency: 'VND',
            benefitIds: [],
            skillIds: []
        };

        console.log('Creating job with data:', jobData);

        const result = await createJob(currentCompanyId, jobData, token);

        if (result.success) {
            showSuccess('Tạo tin tuyển dụng thành công');
            closeJobCreationModal();
            await loadCompanyDetailAndJobs();
        } else {
            showError(result.message || 'Không thể tạo tin tuyển dụng');
        }
    } catch (error) {
        console.error('Submit job form error:', error);
        showError('Có lỗi xảy ra khi tạo tin tuyển dụng');
    }
}

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', async function() {
    // Load categories first
    const categoriesResult = await getCategories();
    if (categoriesResult.success) {
        console.log('Categories loaded:', allCategories);
    }

    // Get DOM elements
    const createJobBtn = document.getElementById('create-job-btn');
    const emptyCreateJobBtn = document.getElementById('empty-create-job-btn');
    const closeJobModalBtn = document.getElementById('close-job-modal');
    const cancelJobModalBtn = document.getElementById('cancel-job-modal');
    const jobModal = document.getElementById('job-modal');
    const jobForm = document.getElementById('job-form');
    const jobDescriptionInput = document.getElementById('job-description');
    
    // Tab switching elements
    const tabWrite = document.getElementById('tab-write');
    const tabPreview = document.getElementById('tab-preview');
    const writePanel = document.getElementById('write-panel');
    const previewPanel = document.getElementById('preview-panel');

    // Formatting toolbar buttons
    const btnBold = document.getElementById('btn-bold');
    const btnItalic = document.getElementById('btn-italic');
    const btnUnderline = document.getElementById('btn-underline');
    const btnCode = document.getElementById('btn-code');
    const btnHeading = document.getElementById('btn-heading');
    const btnListUl = document.getElementById('btn-list-ul');
    const btnListOl = document.getElementById('btn-list-ol');
    const btnQuote = document.getElementById('btn-quote');
    const btnLink = document.getElementById('btn-link');
    const btnHr = document.getElementById('btn-hr');

    // ==================== Create Job Button Events ====================
    if (createJobBtn) {
        createJobBtn.addEventListener('click', openJobCreationModal);
    }
    if (emptyCreateJobBtn) {
        emptyCreateJobBtn.addEventListener('click', openJobCreationModal);
    }

    // ==================== Modal Close Events ====================
    if (closeJobModalBtn) {
        closeJobModalBtn.addEventListener('click', closeJobCreationModal);
    }
    if (cancelJobModalBtn) {
        cancelJobModalBtn.addEventListener('click', closeJobCreationModal);
    }

    // Close modal when clicking outside modal content
    if (jobModal) {
        jobModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeJobCreationModal();
            }
        });
    }

    // ==================== Markdown Toolbar Button Events ====================
    
    if (btnBold) {
        btnBold.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdownAtCursor(jobDescriptionInput, '**', '**');
        });
    }

    if (btnItalic) {
        btnItalic.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdownAtCursor(jobDescriptionInput, '_', '_');
        });
    }

    if (btnUnderline) {
        btnUnderline.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdownAtCursor(jobDescriptionInput, '~~', '~~');
        });
    }

    if (btnCode) {
        btnCode.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdownAtCursor(jobDescriptionInput, '`', '`');
        });
    }

    if (btnHeading) {
        btnHeading.addEventListener('click', (e) => {
            e.preventDefault();
            const start = jobDescriptionInput.selectionStart;
            const lineStart = jobDescriptionInput.value.lastIndexOf('\n', start - 1) + 1;
            jobDescriptionInput.setSelectionRange(lineStart, lineStart);
            insertMarkdownAtCursor(jobDescriptionInput, '## ', '\n');
        });
    }

    if (btnListUl) {
        btnListUl.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdownAtCursor(jobDescriptionInput, '- ', '\n');
        });
    }

    if (btnListOl) {
        btnListOl.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdownAtCursor(jobDescriptionInput, '1. ', '\n');
        });
    }

    if (btnQuote) {
        btnQuote.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdownAtCursor(jobDescriptionInput, '> ', '\n');
        });
    }

    if (btnLink) {
        btnLink.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdownAtCursor(jobDescriptionInput, '[text](https://example.com)', '');
        });
    }

    if (btnHr) {
        btnHr.addEventListener('click', (e) => {
            e.preventDefault();
            insertMarkdownAtCursor(jobDescriptionInput, '\n---\n', '');
        });
    }

    // ==================== Tab Switching Events ====================
    
    if (tabWrite) {
        tabWrite.addEventListener('click', function(e) {
            e.preventDefault();
            writePanel.classList.remove('hidden');
            previewPanel.classList.add('hidden');
            tabWrite.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
            tabWrite.classList.remove('text-gray-600', 'border-transparent');
            tabPreview.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
            tabPreview.classList.add('text-gray-600', 'border-transparent');
        });
    }

    if (tabPreview) {
        tabPreview.addEventListener('click', function(e) {
            e.preventDefault();
            const text = jobDescriptionInput.value.trim();
            const preview = document.getElementById('markdown-preview');
            
            if (text.length > 0) {
                preview.innerHTML = parseMarkdown(text);
            } else {
                preview.innerHTML = '<p class="text-gray-400 text-sm italic">Nhập mô tả công việc để xem preview...</p>';
            }
            
            previewPanel.classList.remove('hidden');
            writePanel.classList.add('hidden');
            tabPreview.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
            tabPreview.classList.remove('text-gray-600', 'border-transparent');
            tabWrite.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
            tabWrite.classList.add('text-gray-600', 'border-transparent');
        });
    }

    // ==================== Markdown Preview Realtime Update ====================
    
    if (jobDescriptionInput) {
        jobDescriptionInput.addEventListener('input', function() {
            // Only update if we're on preview tab
            if (!previewPanel.classList.contains('hidden')) {
                const preview = document.getElementById('markdown-preview');
                if (preview) {
                    const text = this.value.trim();
                    if (text.length > 0) {
                        preview.innerHTML = parseMarkdown(text);
                    } else {
                        preview.innerHTML = '<p class="text-gray-400 text-sm italic">Nhập mô tả công việc để xem preview...</p>';
                    }
                }
            }
        });
    }

    // ==================== Job Form Submission ====================
    
    if (jobForm) {
        jobForm.addEventListener('submit', handleJobCreationSubmit);
    }

    // ==================== Initial Page Load ====================
    
    loadCompanyDetailAndJobs();
});
