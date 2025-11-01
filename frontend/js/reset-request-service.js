// ==================== Reset Password Service ====================
// Handles password reset flow: Send OTP -> Verify OTP -> Reset Password

let currentEmail = '';
let otpSent = false;

/**
 * Show message alert
 * @param {string} containerId - ID of container element
 * @param {string} message - Message text
 * @param {string} type - 'success' or 'error'
 */
function showMessage(containerId, message, type = 'error') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    const div = document.createElement('div');
    
    if (type === 'success') {
        div.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative';
    } else {
        div.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
    }
    
    div.textContent = message;
    container.appendChild(div);
}

/**
 * Go back from Step 2 to Step 1
 */
function backToStep1() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    if (step1 && step2) {
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        
        // Reset form fields
        const emailInput = document.getElementById('email');
        const otpInput = document.getElementById('otp');
        const passwordInput = document.getElementById('newPassword');
        const confirmInput = document.getElementById('confirmPassword');
        
        if (emailInput) emailInput.value = currentEmail;
        if (otpInput) otpInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (confirmInput) confirmInput.value = '';
        
        otpSent = false;
    }
}

// ==================== Step 1: Send OTP ====================
document.addEventListener('DOMContentLoaded', function() {
    const resetRequestForm = document.getElementById('resetRequestForm');
    
    if (resetRequestForm) {
        resetRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('email');
            const submitBtn = document.getElementById('submitBtn');
            const resultDiv = document.getElementById('result1');
            
            if (!emailInput || !submitBtn) return;
            
            const email = emailInput.value.trim();
            
            if (!email) {
                showMessage('result1', 'Vui lòng nhập email.');
                return;
            }
            
            if (!isValidEmail(email)) {
                showMessage('result1', 'Email không hợp lệ.');
                return;
            }
            
            // Disable button and show loading
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Đang gửi...';
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            
            try {
                const sendOtpUrl = buildCompleteUrl(API_CONFIG.PASSWORD.SEND_OTP);
                
                const response = await fetch(sendOtpUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    currentEmail = email;
                    otpSent = true;
                    
                    showMessage('result1', '✓ Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra inbox.', 'success');
                    
                    // Move to step 2 after 1.5 seconds
                    setTimeout(() => {
                        const step1 = document.getElementById('step1');
                        const step2 = document.getElementById('step2');
                        
                        if (step1 && step2) {
                            step1.classList.add('hidden');
                            step2.classList.remove('hidden');
                        }
                    }, 1500);
                } else {
                    showMessage('result1', data.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
                }
            } catch (error) {
                console.error('Send OTP error:', error);
                showMessage('result1', 'Lỗi kết nối. Vui lòng thử lại sau.');
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }
});

// ==================== Step 2: Reset Password ====================
document.addEventListener('DOMContentLoaded', function() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const otpInput = document.getElementById('otp');
            const passwordInput = document.getElementById('newPassword');
            const confirmInput = document.getElementById('confirmPassword');
            const resetBtn = document.getElementById('resetBtn');
            
            if (!otpInput || !passwordInput || !confirmInput || !resetBtn) return;
            
            const otp = otpInput.value.trim();
            const newPassword = passwordInput.value;
            const confirmPassword = confirmInput.value;
            
            // Validation
            const validationError = validatePasswordReset(otp, newPassword, confirmPassword);
            if (validationError) {
                showMessage('result2', validationError);
                return;
            }
            
            // Disable button and show loading
            resetBtn.disabled = true;
            const originalText = resetBtn.textContent;
            resetBtn.textContent = 'Đang xử lý...';
            resetBtn.classList.add('opacity-50', 'cursor-not-allowed');
            
            try {
                const resetUrl = buildCompleteUrl(API_CONFIG.PASSWORD.RESET);
                
                const response = await fetch(resetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: currentEmail,
                        otp: otp,
                        newPassword: newPassword
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    showMessage('result2', '✓ Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.', 'success');
                    
                    // Clear sensitive data
                    currentEmail = '';
                    otpSent = false;
                    
                    // Redirect to login after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showMessage('result2', data.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
                }
            } catch (error) {
                console.error('Reset password error:', error);
                showMessage('result2', 'Lỗi kết nối. Vui lòng thử lại sau.');
            } finally {
                // Restore button state
                resetBtn.disabled = false;
                resetBtn.textContent = originalText;
                resetBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }
});

// ==================== Validation Functions ====================

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password reset form
 */
function validatePasswordReset(otp, newPassword, confirmPassword) {
    if (!otp || !newPassword || !confirmPassword) {
        return 'Vui lòng điền tất cả các trường.';
    }
    
    if (otp.length !== 6 || isNaN(otp)) {
        return 'Mã OTP phải là 6 chữ số.';
    }
    
    if (newPassword.length < 6) {
        return 'Mật khẩu phải tối thiểu 6 ký tự.';
    }
    
    if (newPassword !== confirmPassword) {
        return 'Mật khẩu không khớp.';
    }
    
    return null; // All validations passed
}
