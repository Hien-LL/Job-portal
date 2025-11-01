// ==================== Recruiter Job Detail - Main Coordinator ====================
// Handles modal interactions and main event orchestration
// Depends on: recruiter-job-detail-api.js, recruiter-job-detail-ui.js, common-helpers.js

// ==================== Event Listeners ====================

document.addEventListener('DOMContentLoaded', async function() {
    // ==================== Initialize Page ====================
    
    // Load categories first
    const categoriesResult = await getCategories();
    if (categoriesResult.success) {
        console.log('Categories loaded:', allCategories);
    }

    // ==================== Get DOM Elements ====================
    
    const editJobBtn = document.getElementById('edit-job-btn');
    const deleteJobBtn = document.getElementById('delete-job-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    const editForm = document.getElementById('edit-form');
    const editModal = document.getElementById('edit-modal');

    // ==================== Edit Modal Events ====================
    
    if (editJobBtn) {
        editJobBtn.addEventListener('click', openJobEditModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeJobEditModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeJobEditModal);
    }

    // Close modal when clicking outside
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeJobEditModal();
            }
        });
    }

    // ==================== Form Submission ====================
    
    if (editForm) {
        editForm.addEventListener('submit', handleJobEditSubmit);
    }

    // ==================== Delete Job ====================
    
    if (deleteJobBtn) {
        deleteJobBtn.addEventListener('click', handleJobDeletion);
    }

    // ==================== Load Job Detail ====================
    
    loadJobDetail();
});

// ==================== Modal Helper Functions ====================

/**
 * Open job edit modal
 */
function openJobEditModal() {
    openModal('edit-modal');
    openEditModalInternal();
}

/**
 * Close job edit modal
 */
function closeJobEditModal() {
    closeModal('edit-modal');
}

/**
 * Handle job edit submission
 */
async function handleJobEditSubmit(e) {
    handleEditFormSubmitInternal(e);
}

/**
 * Handle job deletion
 */
async function handleJobDeletion() {
    handleDeleteJobInternal();
}
