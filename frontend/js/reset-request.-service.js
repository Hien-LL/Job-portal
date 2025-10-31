        const API_BASE_URL = 'http://localhost:8080/api';
        const SEND_OTP_ENDPOINT = `${API_BASE_URL}/password/otp/send`;
        const RESET_PASSWORD_ENDPOINT = `${API_BASE_URL}/password/reset`;

        let currentEmail = '';
        let otpSent = false;

        function showMessage(container, message, type = 'error') {
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

        function backToStep1() {
            document.getElementById('step1').classList.remove('hidden');
            document.getElementById('step2').classList.add('hidden');
            document.getElementById('email').value = currentEmail;
            document.getElementById('otp').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            otpSent = false;
        }

        // Step 1: Send OTP
        document.getElementById('resetRequestForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const resultDiv = document.getElementById('result1');
            const submitBtn = document.getElementById('submitBtn');

            if (!email) {
                showMessage(resultDiv, 'Vui lòng nhập email.');
                return;
            }

            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Đang gửi...';

            try {
                const resp = await fetch(SEND_OTP_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await resp.json();

                if (resp.ok && data.success) {
                    currentEmail = email;
                    otpSent = true;
                    showMessage(resultDiv, 'Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra inbox.', 'success');
                    
                    // Move to step 2 after 1.5 seconds
                    setTimeout(() => {
                        document.getElementById('step1').classList.add('hidden');
                        document.getElementById('step2').classList.remove('hidden');
                    }, 1500);
                } else {
                    showMessage(resultDiv, data.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
                }
            } catch (err) {
                console.error('Send OTP error:', err);
                showMessage(resultDiv, 'Lỗi kết nối. Vui lòng thử lại sau.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });

        // Step 2: Reset Password with OTP
        document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const otp = document.getElementById('otp').value.trim();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const resultDiv = document.getElementById('result2');
            const resetBtn = document.getElementById('resetBtn');

            if (!otp || !newPassword || !confirmPassword) {
                showMessage(resultDiv, 'Vui lòng điền tất cả các trường.');
                return;
            }

            if (newPassword.length < 6) {
                showMessage(resultDiv, 'Mật khẩu phải tối thiểu 6 ký tự.');
                return;
            }

            if (newPassword !== confirmPassword) {
                showMessage(resultDiv, 'Mật khẩu không khớp.');
                return;
            }

            if (otp.length !== 6 || isNaN(otp)) {
                showMessage(resultDiv, 'Mã OTP phải là 6 chữ số.');
                return;
            }

            resetBtn.disabled = true;
            const originalText = resetBtn.textContent;
            resetBtn.textContent = 'Đang xử lý...';

            try {
                const resp = await fetch(RESET_PASSWORD_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: currentEmail,
                        otp: otp,
                        newPassword: newPassword
                    })
                });
                const data = await resp.json();

                if (resp.ok && data.success) {
                    showMessage(resultDiv, 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.', 'success');
                    
                    // Redirect to login after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showMessage(resultDiv, data.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
                }
            } catch (err) {
                console.error('Reset password error:', err);
                showMessage(resultDiv, 'Lỗi kết nối. Vui lòng thử lại sau.');
            } finally {
                resetBtn.disabled = false;
                resetBtn.textContent = originalText;
            }
        });
