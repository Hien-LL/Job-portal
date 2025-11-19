// Tab switch functionality
let selectedUserType = "candidate"; // Default to candidate

document.querySelectorAll("button[data-type]").forEach((btn) => {
  btn.addEventListener("click", function () {
    selectedUserType = this.getAttribute("data-type");

    // Update button styles
    document.querySelectorAll("button[data-type]").forEach((b) => {
      b.classList.remove("bg-blue-600", "text-white");
      b.classList.add("bg-gray-100", "text-gray-700");
    });
    this.classList.remove("bg-gray-100", "text-gray-700");
    this.classList.add("bg-blue-600", "text-white");

    console.log("Selected user type:", selectedUserType);
  });
});

// Show loading state
function showLoading(button) {
  button.disabled = true;
  button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Đang đăng nhập...
    `;
}

// Hide loading state
function hideLoading(button) {
  button.disabled = false;
  button.innerHTML = "Đăng nhập";
}

// Show error message
function showError(message) {
  // Remove existing error
  const existingError = document.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  // Create error element
  const errorDiv = document.createElement("div");
  errorDiv.className =
    "error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4";
  errorDiv.innerHTML = `
        <span class="block sm:inline">${message}</span>
    `;

  // Insert before form
  const form = document.querySelector("form");
  form.parentNode.insertBefore(errorDiv, form);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

// Show success message
function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className =
    "success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4";
  successDiv.innerHTML = `
        <span class="block sm:inline">${message}</span>
    `;

  const form = document.querySelector("form");
  form.parentNode.insertBefore(successDiv, form);

  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.remove();
    }
  }, 3000);
}

// Form submission
document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const submitButton = this.querySelector('button[type="submit"]');
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validation
  if (!email || !password) {
    showError("Vui lòng điền đầy đủ email và mật khẩu");
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    showError("Vui lòng nhập email hợp lệ");
    return;
  }

  if (password.length < 6) {
    showError("Mật khẩu phải có ít nhất 6 ký tự");
    return;
  }

  // Show loading
  showLoading(submitButton);

  try {
    // ✅ SỬA: Truyền selectedUserType vào login
    const result = await authService.login(email, password, selectedUserType);

    if (result.success) {
      // Show success message
      showSuccess("Đăng nhập thành công! Đang chuyển hướng...");

      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      showError(result.message);
    }
  } catch (error) {
    console.error("Login error:", error);
    showError("Có lỗi xảy ra. Vui lòng thử lại.");
  } finally {
    hideLoading(submitButton);
  }
});

// Check if already logged in on page load - ✅ ĐÃ SỬA
document.addEventListener("DOMContentLoaded", function () {
  // ✅ SỬA: Dùng authService.isAuthenticated()
  if (authService.isAuthenticated()) {
    const userId = authService.getUserId();
    const loginTime = authService.getLoginTime();
    console.log("User already logged in:", {
      userId: userId,
      loginTime: loginTime,
    });

    // Auto redirect to index
    window.location.href = "index.html";
  }
});

// Google login (placeholder)
document.querySelector("button").addEventListener("click", function () {
  if (this.textContent.includes("Google")) {
    showError("Đăng nhập Google chưa được hỗ trợ");
  }
});

//show password
const pwd = document.getElementById("password");
const btn = document.getElementById("togglePassword");
const icon = btn.querySelector("i");

btn.addEventListener("click", () => {
  const isHidden = pwd.type === "password";
  pwd.type = isHidden ? "text" : "password";

  // đổi icon
  if (isHidden) {
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});
