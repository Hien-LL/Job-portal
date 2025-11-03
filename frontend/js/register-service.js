// API Configuration
        const API_BASE_URL = 'http://localhost:8080/api';
        
        // Current step and user data
        let currentStep = 1;
        let userData = {
            email: '',
            password: '',
            accessToken: ''
        };

        // Update step indicators
        function updateStepIndicators(step) {
            // Reset all steps
            for (let i = 1; i <= 3; i++) {
                const indicator = document.getElementById(`step-${i}-indicator`);
                const text = document.getElementById(`step-${i}-text`);
                const line = document.getElementById(`line-${i}`);
                
                if (i < step) {
                    // Completed steps
                    indicator.classList.remove('bg-gray-300', 'text-gray-500', 'bg-blue-600', 'text-white');
                    indicator.classList.add('bg-green-500', 'text-white');
                    indicator.innerHTML = '✓';
                    text.classList.remove('text-gray-500', 'text-blue-600');
                    text.classList.add('text-green-500');
                    if (line) {
                        line.classList.remove('bg-gray-300');
                        line.classList.add('bg-green-500');
                    }
                } else if (i === step) {
                    // Current step
                    indicator.classList.remove('bg-gray-300', 'text-gray-500', 'bg-green-500');
                    indicator.classList.add('bg-blue-600', 'text-white');
                    indicator.innerHTML = i;
                    text.classList.remove('text-gray-500', 'text-green-500');
                    text.classList.add('text-blue-600');
                } else {
                    // Future steps
                    indicator.classList.remove('bg-blue-600', 'text-white', 'bg-green-500');
                    indicator.classList.add('bg-gray-300', 'text-gray-500');
                    indicator.innerHTML = i;
                    text.classList.remove('text-blue-600', 'text-green-500');
                    text.classList.add('text-gray-500');
                    if (line) {
                        line.classList.remove('bg-green-500');
                        line.classList.add('bg-gray-300');
                    }
                }
            }
        }

        // Show specific step
        function showStep(step) {
            // Hide all steps
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.add('hidden');
            document.getElementById('step-3').classList.add('hidden');
            
            // Show current step
            document.getElementById(`step-${step}`).classList.remove('hidden');
            
            // Update indicators
            updateStepIndicators(step);
            currentStep = step;
        }

        // Show loading state
        function showLoading(button, text = 'Đang xử lý...') {
            button.disabled = true;
            button.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ${text}
            `;
        }

        // Hide loading state
        function hideLoading(button, text) {
            button.disabled = false;
            button.innerHTML = text;
        }

        // Show error message
        function showError(message) {
            // Remove existing error
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            // Create error element
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
            errorDiv.innerHTML = `<span class="block sm:inline">${message}</span>`;

            // Insert before current step
            const currentStepElement = document.getElementById(`step-${currentStep}`);
            currentStepElement.insertBefore(errorDiv, currentStepElement.firstChild);

            // Auto remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        }

        // Show success message
        function showSuccess(message) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
            successDiv.innerHTML = `<span class="block sm:inline">${message}</span>`;

            const currentStepElement = document.getElementById(`step-${currentStep}`);
            currentStepElement.insertBefore(successDiv, currentStepElement.firstChild);

            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 3000);
        }

        // API: Register - ✅ ĐÃ SỬA
        async function registerUser(email, password) {
            try {
                const registerUrl = buildApiUrl(API_CONFIG.AUTH.REGISTER);
                const response = await fetch(registerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                return {
                    success: response.ok && data.success,
                    message: data.message,
                    data: data.data
                };
            } catch (error) {
                console.error('Register API Error:', error);
                return {
                    success: false,
                    message: 'Lỗi kết nối. Vui lòng thử lại sau.'
                };
            }
        }

        // API: Verify Email - ✅ THÊM MỚI VÀO CONFIG
        async function verifyEmail(email, otp) {
            try {
                // Endpoint này cần thêm vào config.js
                const verifyUrl = `${API_CONFIG.BASE_URL}/auth/verify-email`;
                const response = await fetch(verifyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, otp })
                });

                const data = await response.json();
                return {
                    success: response.ok && data.success,
                    message: data.message
                };
            } catch (error) {
                console.error('Verify Email API Error:', error);
                return {
                    success: false,
                    message: 'Lỗi kết nối. Vui lòng thử lại sau.'
                };
            }
        }

        // API: Resend OTP - ✅ THÊM MỚI VÀO CONFIG
        async function resendOTP(email) {
            try {
                // Endpoint này cần thêm vào config.js
                const resendUrl = `${API_CONFIG.BASE_URL}/auth/resend-otp`;
                const response = await fetch(resendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                return {
                    success: response.ok && data.success,
                    message: data.message
                };
            } catch (error) {
                console.error('Resend OTP API Error:', error);
                return {
                    success: false,
                    message: 'Lỗi kết nối. Vui lòng thử lại sau.'
                };
            }
        }

        // API: Login (after email verification) - ✅ ĐÃ SỬA
        async function loginUser(email, password) {
            try {
                const loginUrl = buildApiUrl(API_CONFIG.AUTH.LOGIN);
                const response = await fetch(loginUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                return {
                    success: response.ok && data.success,
                    message: data.message,
                    data: data.data
                };
            } catch (error) {
                console.error('Login API Error:', error);
                return {
                    success: false,
                    message: 'Lỗi kết nối. Vui lòng thử lại sau.'
                };
            }
        }

        // API: Update Profile - ✅ ĐÃ SỬA
        async function updateProfile(profileData, token) {
            try {
                const profileUrl = buildApiUrl(API_CONFIG.USERS.UPDATE_PROFILE);
                const response = await fetch(profileUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(profileData)
                });

                const data = await response.json();
                return {
                    success: response.ok && data.success,
                    message: data.message,
                    data: data.data
                };
            } catch (error) {
                console.error('Update Profile API Error:', error);
                return {
                    success: false,
                    message: 'Lỗi kết nối. Vui lòng thử lại sau.'
                };
            }
        }

        // Store authentication data
        function storeAuthData(data) {
            try {
                localStorage.setItem('access_token', data.token);
                localStorage.setItem('refresh_token', data.refreshToken);
                localStorage.setItem('user_id', data.user.id.toString());
                localStorage.setItem('login_time', Date.now().toString());
                
                console.log('Auth data stored successfully');
            } catch (error) {
                console.error('Error storing auth data:', error);
            }
        }

// Step 1: Register Form Handler
document.getElementById('register-form').addEventListener('submit', async function(e) {
    // Only handle if candidate is active
    if (typeof currentUserType !== 'undefined' && currentUserType === 'recruiter') {
        return;
    }
    
    e.preventDefault();            const submitButton = this.querySelector('button[type="submit"]');
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const agreeTerms = document.getElementById('agree-terms').checked;
            
            // Validation
            if (!email || !password || !confirmPassword) {
                showError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            if (!email.includes('@') || !email.includes('.')) {
                showError('Vui lòng nhập email hợp lệ');
                return;
            }

            if (password.length < 6) {
                showError('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }

            if (password !== confirmPassword) {
                showError('Mật khẩu xác nhận không khớp');
                return;
            }

            if (!agreeTerms) {
                showError('Vui lòng đồng ý với điều khoản sử dụng');
                return;
            }

            // Show loading
            showLoading(submitButton, 'Đang đăng ký...');

            try {
                const result = await registerUser(email, password);

                if (result.success) {
                    userData.email = email;
                    userData.password = password;
                    
                    showSuccess(result.message);
                    
                    setTimeout(() => {
                        document.getElementById('verify-email').textContent = email;
                        showStep(2);
                    }, 1500);
                } else {
                    showError(result.message);
                }
            } catch (error) {
                console.error('Register error:', error);
                showError('Có lỗi xảy ra. Vui lòng thử lại.');
            } finally {
                hideLoading(submitButton, 'Tiếp tục');
            }
        });

// Step 2: Verify Email Form Handler
document.getElementById('verify-form').addEventListener('submit', async function(e) {
    // Only handle if candidate is active
    if (typeof currentUserType !== 'undefined' && currentUserType === 'recruiter') {
        return;
    }
    
    e.preventDefault();            const submitButton = this.querySelector('button[type="submit"]');
            const otpCode = document.getElementById('otp-code').value.trim();
            
            // Validation
            if (!otpCode || otpCode.length !== 6) {
                showError('Vui lòng nhập mã OTP 6 chữ số');
                return;
            }

            // Show loading
            showLoading(submitButton, 'Đang xác thực...');

            try {
                const verifyResult = await verifyEmail(userData.email, otpCode);

                if (verifyResult.success) {
                    showSuccess(verifyResult.message);
                    
                    // Login to get token
                    const loginResult = await loginUser(userData.email, userData.password);
                    
                    if (loginResult.success) {
                        userData.accessToken = loginResult.data.token;
                        storeAuthData(loginResult.data);
                        
                        setTimeout(() => {
                            showStep(3);
                        }, 1500);
                    } else {
                        showError('Đã xác thực thành công nhưng không thể đăng nhập. Vui lòng đăng nhập thủ công.');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    }
                } else {
                    showError(verifyResult.message);
                }
            } catch (error) {
                console.error('Verify error:', error);
                showError('Có lỗi xảy ra. Vui lòng thử lại.');
            } finally {
                hideLoading(submitButton, 'Xác thực');
            }
        });

        // Step 3: Profile Form Handler (Candidate only)
        const candidateProfileForm = document.getElementById('candidate-profile-form');
        if (candidateProfileForm) {
            candidateProfileForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitButton = this.querySelector('button[type="submit"]');
                const name = document.getElementById('full-name').value.trim();
                const phone = document.getElementById('phone-number').value.trim();
                const address = document.getElementById('address').value.trim();
                const headline = document.getElementById('headline').value.trim();
                const summary = document.getElementById('summary').value.trim();
                
                // Validation
                if (!name || !phone || !address) {
                    showError('Vui lòng điền đầy đủ thông tin bắt buộc');
                    return;
                }

                if (phone.length < 10) {
                    showError('Số điện thoại không hợp lệ');
                    return;
                }

                // Show loading
                showLoading(submitButton, 'Đang hoàn tất...');

                try {
                    const profileData = {
                        name,
                        phone,
                        address,
                        headline: headline || null,
                        summary: summary || null
                    };

                    const result = await updateProfile(profileData, userData.accessToken);

                    if (result.success) {
                        showSuccess('Đăng ký thành công! Đang chuyển hướng...');
                        
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2000);
                    } else {
                        showError(result.message);
                    }
                } catch (error) {
                    console.error('Update profile error:', error);
                    showError('Có lỗi xảy ra. Vui lòng thử lại.');
                } finally {
                    hideLoading(submitButton, 'Hoàn tất đăng ký');
                }
            });
        }

        // Resend OTP Handler
        let resendCountdown = 0;
        document.getElementById('resend-otp-btn').addEventListener('click', async function() {
            if (resendCountdown > 0) return;
            
            const button = this;
            const originalText = button.textContent;
            
            button.disabled = true;
            button.textContent = 'Đang gửi...';

            try {
                const result = await resendOTP(userData.email);
                
                if (result.success) {
                    showSuccess(result.message);
                    
                    // Start countdown
                    resendCountdown = 60;
                    document.getElementById('resend-countdown').classList.remove('hidden');
                    button.classList.add('hidden');
                    
                    const countdownInterval = setInterval(() => {
                        resendCountdown--;
                        document.getElementById('countdown').textContent = resendCountdown;
                        
                        if (resendCountdown <= 0) {
                            clearInterval(countdownInterval);
                            document.getElementById('resend-countdown').classList.add('hidden');
                            button.classList.remove('hidden');
                            button.disabled = false;
                            button.textContent = originalText;
                        }
                    }, 1000);
                } else {
                    showError(result.message);
                    button.disabled = false;
                    button.textContent = originalText;
                }
            } catch (error) {
                console.error('Resend OTP error:', error);
                showError('Có lỗi xảy ra. Vui lòng thử lại.');
                button.disabled = false;
                button.textContent = originalText;
            }
        });

        // Back button handlers
        document.getElementById('back-to-register').addEventListener('click', function() {
            showStep(1);
        });

        const backToVerifyCandidate = document.getElementById('back-to-verify-candidate');
        if (backToVerifyCandidate) {
            backToVerifyCandidate.addEventListener('click', function() {
                showStep(2);
            });
        }

        // Tab switch functionality
        document.querySelectorAll('button').forEach((btn, index) => {
            if (index < 2) {
                btn.addEventListener('click', function() {
                    // Remove active class from all tabs
                    document.querySelectorAll('button').forEach((b, i) => {
                        if (i < 2) {
                            b.classList.remove('bg-blue-600', 'text-white');
                            b.classList.add('bg-gray-100', 'text-gray-700');
                        }
                    });
                    
                    // Add active class to clicked tab
                    this.classList.remove('bg-gray-100', 'text-gray-700');
                    this.classList.add('bg-blue-600', 'text-white');
                });
            }
        });

        // OTP input formatting
        document.getElementById('otp-code').addEventListener('input', function(e) {
            // Only allow numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // Initialize first step
        updateStepIndicators(1);
