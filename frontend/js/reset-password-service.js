        // Assumption: endpoint to confirm/reset password
        const CONFIRM_ENDPOINT = buildApiUrl(API_CONFIG.PASSWORD.RESET);

        function showMessage(container, message, type = 'error') {
            container.innerHTML = '';
            const div = document.createElement('div');
            if (type === 'success') {
                div.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded';
            } else {
                div.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
            }
            div.textContent = message;
            container.appendChild(div);
        }

        // Parse query params
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email') || '';
        const otpParam = params.get('otp') || '';

        document.getElementById('email').value = emailParam;
        document.getElementById('otp').value = otpParam;

        const notice = document.getElementById('notice');

        if (!emailParam || !otpParam) {
            showMessage(notice, 'Liên kết không hợp lệ hoặc thiếu thông tin (email/otp). Vui lòng kiểm tra email.', 'error');
        }

        document.getElementById('resetForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const otp = document.getElementById('otp').value.trim();
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('submitBtn');

            if (!email || !otp) {
                showMessage(notice, 'Thiếu email hoặc OTP.', 'error');
                return;
            }

            if (!password || password.length < 6) {
                showMessage(notice, 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
                return;
            }

            if (password !== confirm) {
                showMessage(notice, 'Mật khẩu xác nhận không trùng khớp.', 'error');
                return;
            }

            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Đang xử lý...';

            try {
                const resp = await fetch(CONFIRM_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, newPassword: password })
                });
                const data = await resp.json();

                if (resp.ok && data.success) {
                    showMessage(notice, data.message || 'Đổi mật khẩu thành công. Đang chuyển hướng tới đăng nhập...', 'success');
                    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                } else {
                    showMessage(notice, data.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
                }
            } catch (err) {
                console.error('Confirm reset error:', err);
                showMessage(notice, 'Lỗi kết nối. Vui lòng thử lại sau.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
