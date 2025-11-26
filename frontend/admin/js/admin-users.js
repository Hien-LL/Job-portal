/*
 * File: frontend/admin/js/admin-users.js
 * Quản lí người dùng: gọi /admins/users, render bảng, search, phân trang, xóa, cập nhật vai trò
 */

let usersCache = [];
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let totalElements = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra đăng nhập
  if (!authService.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  // Load header/sidebar/footer rồi mới gọi API
  loadFragments().then(() => {
    attachSearchHandler();
    loadUsers(1);
  });
});

/* ================== HÀM PHỤ ROLE MAP ================== */

/**
 * Từ usersCache build map: { "ADMIN": 1, "USER": 2, ... }
 */
function buildRoleIdMapFromCache() {
  const map = {};
  usersCache.forEach((u) => {
    (u.roles || []).forEach((r) => {
      if (r && r.name && r.id != null) {
        map[r.name.toUpperCase()] = r.id;
      }
    });
  });
  return map;
}

/* ============== GỌI API LẤY DANH SÁCH USER ============== */

async function loadUsers(page = 1) {
  const loading = document.getElementById("loading");
  const errorState = document.getElementById("error-state");
  const usersContainer = document.getElementById("users-container");
  const emptyState = document.getElementById("empty-state");
  const pagination = document.getElementById("pagination");

  loading.classList.remove("hidden");
  usersContainer.classList.add("hidden");
  emptyState.classList.add("hidden");
  errorState.classList.add("hidden");
  pagination.classList.add("hidden");

  try {
    currentPage = page;

    // Endpoint đúng: /admins/users (nhóm Admin/User trong Postman)
    const res = await authService.apiRequest(
      `/admins/users?page=${page}&perPage=${pageSize}&sort=createdAt,desc`
    );

    if (!res || !res.ok) throw new Error("Request failed");

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || "API error");
    }

    const pageData = json.data; // Page object: content, totalPages,...

    usersCache = pageData.content || [];
    totalPages = pageData.totalPages || 1;
    totalElements = pageData.totalElements || usersCache.length;
    pageSize = pageData.size || pageSize;

    // backend trả pageNumber 0-based → +1 cho UI
    currentPage = (pageData.pageable?.pageNumber ?? page - 1) + 1;

    if (!usersCache.length) {
      loading.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    renderUsersTable(usersCache);
    renderPagination();

    loading.classList.add("hidden");
    usersContainer.classList.remove("hidden");
    pagination.classList.remove("hidden");
  } catch (err) {
    console.error("❌ Lỗi load users:", err);
    loading.classList.add("hidden");
    showErrorState("Không thể tải danh sách người dùng. Vui lòng thử lại.");
  }
}

/* ================= RENDER BẢNG NGƯỜI DÙNG ================= */

function renderUsersTable(users) {
  const tbody = document.getElementById("users-list");
  if (!tbody) return;

  if (!users || !users.length) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-6 text-center text-sm text-gray-500">
                    Không có dữ liệu.
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = users
    .map((user) => {
      const id = user.id ?? "";
      const name = user.name || user.fullName || "No Name";
      const email = user.email || "";
      const phone = user.phone || "";
      const rolesLabel =
        (user.roles || []).map((r) => r.name).join(", ") || "USER";

      return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm text-gray-900">#${id}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${escapeHtml(
                      name
                    )}</td>
                    <td class="px-6 py-4 text-sm text-gray-700">${escapeHtml(
                      email
                    )}</td>
                    <td class="px-6 py-4 text-sm text-gray-700">${escapeHtml(
                      phone
                    )}</td>
                    <td class="px-6 py-4 text-sm text-gray-700">${escapeHtml(
                      rolesLabel
                    )}</td>
<td class="px-6 py-4 text-sm">
    <div class="flex items-center justify-center gap-2">
        <a href="admin-user-detail.html?id=${id}"
           class="inline-flex items-center px-3 py-1.5 border border-gray-300 
                  rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50">
            Xem
        </a>

<button
    type="button"
    class="inline-flex items-center justify-center whitespace-nowrap 
           px-6 py-1.5 border border-amber-300 rounded-md text-xs 
           font-medium text-amber-700 hover:bg-amber-50"
    onclick="openUpdateRoleDialog(${id})"
>
    Cập nhật
</button>

        <button
            type="button"
            class="inline-flex items-center px-3 py-1.5 border border-red-300 
                   rounded-md text-xs font-medium text-red-700 hover:bg-red-50"
            onclick="deleteUser(${id})"
        >
            Xoá
        </button>
    </div>
</td>

                </tr>
            `;
    })
    .join("");
}

/* ======================= SEARCH ======================= */

function normalizeText(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function attachSearchHandler() {
  const input = document.getElementById("user-search-input");
  if (!input) return;

  input.addEventListener("input", () => {
    const keyword = normalizeText(input.value.trim());

    if (!keyword) {
      // Không search → render lại nguyên trang hiện tại
      renderUsersTable(usersCache);
      return;
    }

    const filtered = usersCache.filter((user) => {
      const name = normalizeText(user.name || user.fullName || "");
      const email = normalizeText(user.email || "");
      return name.includes(keyword) || email.includes(keyword);
    });

    renderUsersTable(filtered);
  });

  // Hàm global cho nút "Xóa bộ lọc"
  window.clearFilters = function () {
    input.value = "";
    renderUsersTable(usersCache);
  };
}

/* =================== PHÂN TRANG & UI PHỤ =================== */

function renderPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalElements);

  pagination.innerHTML = `
        <div class="text-sm text-gray-600">
            Hiển thị <span class="font-medium">${from}</span>–<span class="font-medium">${to}</span>
            trên tổng <span class="font-medium">${totalElements}</span> người dùng
        </div>
        <div class="flex items-center gap-2">
            <button
                type="button"
                class="px-3 py-1.5 border rounded-md text-sm ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }"
                ${currentPage === 1 ? "disabled" : ""}
                onclick="gotoPage(${currentPage - 1})"
            >
                Trước
            </button>
            <span class="text-sm text-gray-600">Trang ${currentPage} / ${totalPages}</span>
            <button
                type="button"
                class="px-3 py-1.5 border rounded-md text-sm ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }"
                ${currentPage === totalPages ? "disabled" : ""}
                onclick="gotoPage(${currentPage + 1})"
            >
                Sau
            </button>
        </div>
    `;

  pagination.classList.remove("hidden");
}

window.gotoPage = function (page) {
  if (page < 1 || page > totalPages) return;
  loadUsers(page);
};

function showErrorState(message) {
  const errorState = document.getElementById("error-state");
  if (!errorState) return;

  errorState.classList.remove("hidden");
  errorState.innerHTML = `
        <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>${escapeHtml(message || "Đã xảy ra lỗi.")}</span>
            <button
                type="button"
                class="ml-4 inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 hover:bg-red-100"
                onclick="loadUsers(${currentPage || 1})"
            >
                Thử lại
            </button>
        </div>
    `;
}

/* ======================= XOÁ USER ======================= */

// Xoá 1 user theo id: DELETE /admins/users/{id}
window.deleteUser = async function (id) {
  if (!id) return;

  const confirmDelete = window.confirm(
    `Bạn có chắc chắn muốn xoá người dùng #${id} không?`
  );
  if (!confirmDelete) return;

  try {
    // Gọi API xoá
    const res = await authService.apiRequest(`/admins/users/${id}`, {
      method: "DELETE",
    });

    if (!res || !res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Delete user HTTP error:", txt);
      alert("Xoá người dùng thất bại (HTTP error).");
      return;
    }

    let json = {};
    try {
      json = await res.json();
    } catch {
      // Có thể backend không trả JSON, bỏ qua
    }

    if (json.success === false) {
      alert(json.message || "Xoá người dùng thất bại.");
      return;
    }

    // Xoá thành công → load lại danh sách trang hiện tại
    alert(`Đã xoá người dùng #${id} thành công.`);
    loadUsers(currentPage);
  } catch (err) {
    console.error("❌ Lỗi khi xoá user:", err);
    alert("Đã xảy ra lỗi khi xoá người dùng. Vui lòng thử lại.");
  }
};

/* =================== CẬP NHẬT VAI TRÒ =================== */

// Mở prompt để admin nhập role mới cho user
window.openUpdateRoleDialog = function (userId) {
  const user = usersCache.find((u) => u.id === userId);
  const currentRoles =
    (user?.roles || []).map((r) => r.name).join(", ") || "USER";

  const input = window.prompt(
    `Role hiện tại của user #${userId}: ${currentRoles}\n\nNhập danh sách role mới (ví dụ: ADMIN,USER):`,
    currentRoles
  );

  if (input === null) return; // bấm Cancel

  const roles = input
    .split(",")
    .map((r) => r.trim().toUpperCase())
    .filter(Boolean);

  if (!roles.length) {
    alert("Bạn phải nhập ít nhất 1 role.");
    return;
  }

  updateUserRoles(userId, roles);
};

async function updateUserRoles(userId, roles) {
  try {
    // 1) Lấy map name -> id từ usersCache
    const roleIdMap = buildRoleIdMapFromCache();

    const roleIds = roles
      .map((name) => roleIdMap[name])
      .filter((id) => id != null);

    if (!roleIds.length) {
      alert(
        "Không tìm thấy role hợp lệ trong hệ thống. Kiểm tra lại tên role (ADMIN, USER, COMPANY...)."
      );
      return;
    }

    if (roleIds.length !== roles.length) {
      alert(
        "Một số role không hợp lệ (không có trong hệ thống). Chỉ các role có sẵn mới được chấp nhận."
      );
    }

    // 2) Gọi API PUT /admins/users/{id} với roleIds
    const res = await authService.apiRequest(`/admins/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roleIds: roleIds }),
    });

    if (!res || !res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Update role HTTP error:", txt);
      alert("Cập nhật vai trò thất bại (HTTP error).");
      return;
    }

    let json = {};
    try {
      json = await res.json();
    } catch {
      // Có thể backend không trả JSON đầy đủ, bỏ qua
    }

    if (json.success === false) {
      console.error("Update role API error:", json);
      alert(json.message || "Cập nhật vai trò thất bại.");
      return;
    }

    alert("Cập nhật vai trò thành công.");
    // Reload lại danh sách để thấy roles mới
    loadUsers(currentPage);
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật role:", err);
    alert("Đã xảy ra lỗi khi cập nhật vai trò. Vui lòng thử lại.");
  }
}

/* ======================= HELPER ======================= */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
