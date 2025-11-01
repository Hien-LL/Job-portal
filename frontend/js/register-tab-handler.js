// ==================== Tab Handler for Register ====================
// Handles switching between Candidate and Recruiter registration

let currentUserType = 'candidate'; // 'candidate' or 'recruiter'

// Initialize tab handler
function initializeTabHandler() {
    const tabCandidate = document.getElementById('tab-candidate');
    const tabRecruiter = document.getElementById('tab-recruiter');

    if (!tabCandidate || !tabRecruiter) {
        console.error('Tab buttons not found');
        return;
    }

    // Candidate tab click
    tabCandidate.addEventListener('click', function(e) {
        e.preventDefault();
        switchToCandidate();
    });

    // Recruiter tab click
    tabRecruiter.addEventListener('click', function(e) {
        e.preventDefault();
        switchToRecruiter();
    });

    // Setup form submission guards
    setupFormGuards();
}

// Setup form guards to prevent both services from handling same form
function setupFormGuards() {
    const registerForm = document.getElementById('register-form');
    const verifyForm = document.getElementById('verify-form');

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            // Only allow candidate service if candidate is active
            if (currentUserType === 'recruiter') {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
        });
    }

    if (verifyForm) {
        verifyForm.addEventListener('submit', function(e) {
            // Only allow candidate service if candidate is active
            if (currentUserType === 'recruiter') {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
        });
    }
}

// Switch to Candidate registration
function switchToCandidate() {
    currentUserType = 'candidate';
    
    // Update tab styling
    document.getElementById('tab-candidate').classList.remove('bg-gray-100', 'text-gray-700');
    document.getElementById('tab-candidate').classList.add('bg-blue-600', 'text-white');
    
    document.getElementById('tab-recruiter').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('tab-recruiter').classList.add('bg-gray-100', 'text-gray-700');
    
    // Reset to step 1
    resetRegistration();
    showStep(1);
    
    console.log('Switched to Candidate registration');
}

// Switch to Recruiter registration
function switchToRecruiter() {
    currentUserType = 'recruiter';
    
    // Update tab styling
    document.getElementById('tab-recruiter').classList.remove('bg-gray-100', 'text-gray-700');
    document.getElementById('tab-recruiter').classList.add('bg-blue-600', 'text-white');
    
    document.getElementById('tab-candidate').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('tab-candidate').classList.add('bg-gray-100', 'text-gray-700');
    
    // Reset to step 1
    resetRegistration();
    showStep(1);
    
    console.log('Switched to Recruiter registration');
}

// Reset registration form
function resetRegistration() {
    // Clear step 1 form
    if (document.getElementById('register-form')) {
        document.getElementById('register-form').reset();
    }
    
    // Clear step 2 form
    if (document.getElementById('verify-form')) {
        document.getElementById('verify-form').reset();
    }
    
    // Clear errors
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.remove());
    
    // Reset indicators
    updateStepIndicators(1);
}

// Override showStep to handle both candidate and recruiter
const originalShowStep = window.showStep;
if (originalShowStep) {
    window.showStep = function(step) {
        // Hide all steps
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-3-candidate')?.classList.add('hidden');
        document.getElementById('step-3-recruiter')?.classList.add('hidden');
        
        // Show current step
        if (step === 1 || step === 2) {
            document.getElementById(`step-${step}`).classList.remove('hidden');
        } else if (step === 3) {
            if (currentUserType === 'candidate') {
                document.getElementById('step-3-candidate').classList.remove('hidden');
            } else {
                document.getElementById('step-3-recruiter').classList.remove('hidden');
            }
        }
        
        // Update indicators
        updateStepIndicators(step);
        currentStep = step;
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for other scripts to load
    setTimeout(() => {
        initializeTabHandler();
    }, 100);
});
