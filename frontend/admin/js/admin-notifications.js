/*
 * File: frontend/admin/js/admin-notifications.js
 * Quản lí thông báo:
 *  - GET  /admins/notifications              (lấy lịch sử thông báo đã gửi)
 *  - POST /admins/notifications/all          (gửi cho tất cả user)
 *  - POST /admins/notifications/candidates   (gửi cho Candidates)
 *  - POST /admins/notifications/recruiters   (gửi cho Recruiters)
 */

let notificationsCache = [];

document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra đăng nhập giống admin-users.js
  if (!authService.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  // Load header/sidebar/footer rồi mới gắn handler + gọi API
  loadFragments().then(() => {
    attachNotificationFormHandler();
    loadAdminNotifications();
  });
});

/* ================== GỬI THÔNG BÁO (POST) ================== */

function attachNotificationFormHandler() {
  const form = document.getElementById("notification-form");
  if (!form) return;

  form.addEventListener("submit", handleSendNotification);
}

/**
 * Xác định endpoint theo target-group:
 *  - ALL        -> POST /admins/notifications/all
 *  - CANDIDATE  -> POST /admins/notifications/candidates
 *  - RECRUITER  -> POST /admins/notifications/recruiters
 * (Nếu sau này bạn muốn gửi riêng 1 user: thêm case "USER" trả về /admins/notifications/{userId})
 */
function buildSendNotificationPath(targetType) {
  switch (targetType) {
    case "ALL":
      return "/admins/notifications/all";
    case "CANDIDATE":
      return "/admins/notifications/candidates";
    case "RECRUITER":
      return "/admins/notifications/recruiters";
    default:
      // fallback: cứ coi như ALL
      return "/admins/notifications/all";
  }
}

async function handleSendNotification(e) {
  e.preventDefault();

  const titleInput = document.getElementById("title");
  const bodyInput = document.getElementById("body");
  const targetSelect = document.getElementById("target-group");
  const successMessage = document.getElementById("success-message");
  const sendBtn = document.getElementById("send-btn");

  if (!titleInput || !bodyInput || !targetSelect || !sendBtn) return;

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const targetType = targetSelect.value; // ALL | CANDIDATE | RECRUITER

  if (!title || !body) {
    alert("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
    return;
  }

  const path = buildSendNotificationPath(targetType);
  const payload = { title, body };

  sendBtn.disabled = true;
  sendBtn.classList.add("opacity-60", "cursor-not-allowed");

  try {
    const res = await authService.apiRequest(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res) {
      throw new Error("No response from server");
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Send notification HTTP error:", txt);
      throw new Error("HTTP error khi gửi thông báo");
    }

    const json = await res.json().catch(() => ({}));
    console.log("Send notification result:", json);

    if (json.success === false) {
      alert(json.message || "Gửi thông báo thất bại.");
      return;
    }

    // Hiển thị message thành công
    if (successMessage) {
      successMessage.classList.remove("hidden");
      successMessage.textContent = "Gửi thông báo thành công!";
      setTimeout(() => {
        successMessage.classList.add("hidden");
      }, 3000);
    }

    // Nếu muốn reset form:
    // titleInput.value = "";
    // bodyInput.value = "";
    // targetSelect.value = "ALL";

    // Load lại lịch sử thông báo
    loadAdminNotifications();
  } catch (err) {
    console.error("❌ Lỗi khi gửi thông báo:", err);
    alert("Đã xảy ra lỗi khi gửi thông báo. Vui lòng thử lại.");
  } finally {
    sendBtn.disabled = false;
    sendBtn.classList.remove("opacity-60", "cursor-not-allowed");
  }
}

/* =============== GET LỊCH SỬ THÔNG BÁO (GET) =============== */

async function loadAdminNotifications() {
  const historyList = document.getElementById("history-list");
  const loadingEl = document.getElementById("loading");
  const emptyStateEl = document.getElementById("empty-state");

  if (!historyList) return;

  historyList.innerHTML = "";
  loadingEl && loadingEl.classList.remove("hidden");
  emptyStateEl && emptyStateEl.classList.add("hidden");

  try {
    const res = await authService.apiRequest("/admins/notifications");

    if (!res) {
      throw new Error("No response from server");
    }
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Load notifications HTTP error:", txt);
      throw new Error("HTTP error khi load notifications");
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || "API error");
    }

    const page = json.data;
    const items = page.content || [];

    notificationsCache = items;

    if (loadingEl) loadingEl.classList.add("hidden");

    if (!items.length) {
      emptyStateEl && emptyStateEl.classList.remove("hidden");
      return;
    }

    renderNotificationsTable(items);
  } catch (err) {
    console.error("❌ Lỗi load notifications:", err);
    if (loadingEl) loadingEl.classList.add("hidden");
    if (emptyStateEl) {
      emptyStateEl.classList.remove("hidden");
      emptyStateEl.textContent =
        "Không thể tải lịch sử thông báo. Vui lòng thử lại.";
    }
  }
}

/* =========== RENDER BẢNG LỊCH SỬ THÔNG BÁO =========== */

function renderNotificationsTable(notifications) {
  const tbody = document.getElementById("history-list");
  if (!tbody) return;

  if (!notifications || !notifications.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-6 text-center text-sm text-gray-500">
          Chưa có thông báo nào được gửi.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = notifications
    .map((n) => {
      const title = n.title || "Không có tiêu đề";
      const body = n.body || "";
      const shortBody =
        body.length > 80 ? body.slice(0, 80) + "..." : body;

      const userEmail = n.user?.email || "Không rõ";
      const userName = n.user?.name || "";
      const target = userName || userEmail;

      const createdAt = n.createdAt
        ? formatDateTime(n.createdAt)
        : "";

      return `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 text-sm font-medium text-gray-900">
            ${escapeHtml(title)}
          </td>
          <td class="px-6 py-4 text-sm text-gray-700">
            ${escapeHtml(shortBody)}
          </td>
          <td class="px-6 py-4 text-sm text-gray-700">
            ${escapeHtml(target)}
            <div class="text-xs text-gray-500">
              ${escapeHtml(userEmail)}
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            ${escapeHtml(createdAt)}
          </td>
        </tr>
      `;
    })
    .join("");
}

/* ======================= HELPER ======================= */

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    pad(d.getDate()) +
    "/" +
    pad(d.getMonth() + 1) +
    "/" +
    d.getFullYear() +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&quot;")
    .replace(/'/g, "&#039;");
}
