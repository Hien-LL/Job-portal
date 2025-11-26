/*
 * File: frontend/admin/js/admin-companies.js
 * Quản lí công ty: gọi /companies/list, render bảng, search, filter, verify, delete
 */

let companiesCache = [];
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
        attachFilterHandlers();
        loadCompanies();
    });
});

/* ============== GỌI API LẤY DANH SÁCH COMPANY ============== */

async function loadCompanies() {
    const loading = document.getElementById("loading");
    const errorState = document.getElementById("error-state");
    const companiesContainer = document.getElementById("companies-container");
    const emptyState = document.getElementById("empty-state");
    const pagination = document.getElementById("pagination");

    loading.classList.remove("hidden");
    companiesContainer.classList.add("hidden");
    emptyState.classList.add("hidden");
    errorState.classList.add("hidden");
    pagination.classList.add("hidden");

    try {
        currentPage = 1;

        // API: /companies/list?sort=followerCount,desc
        const res = await authService.apiRequest(
            `/companies/list?sort=followerCount,desc`
        );

        if (!res || !res.ok) throw new Error("Request failed");

        const json = await res.json();
        if (!json.success || !json.data) {
            throw new Error(json.message || "API error");
        }

        // Ở đây data là 1 mảng company
        companiesCache = json.data || [];
        totalElements = companiesCache.length;

        applyFiltersAndRender();

        loading.classList.add("hidden");
        companiesContainer.classList.remove("hidden");
        if (totalElements > 0) {
            pagination.classList.remove("hidden");
        }
    } catch (err) {
        console.error("❌ Lỗi load companies:", err);
        loading.classList.add("hidden");
        showErrorState("Không thể tải danh sách công ty. Vui lòng thử lại.");
    }
}

/* ======================= FILTER + SEARCH ======================= */

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

function attachFilterHandlers() {
    const searchInput = document.getElementById("company-search-input");
    const verifiedSelect = document.getElementById("verified-filter");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            currentPage = 1;
            applyFiltersAndRender();
        });
    }

    if (verifiedSelect) {
        verifiedSelect.addEventListener("change", () => {
            currentPage = 1;
            applyFiltersAndRender();
        });
    }
}

function applyFiltersAndRender() {
    const companiesContainer = document.getElementById("companies-container");
    const emptyState = document.getElementById("empty-state");

    let filtered = [...companiesCache];

    const searchInput = document.getElementById("company-search-input");
    const verifiedSelect = document.getElementById("verified-filter");

    const keyword = searchInput ? normalizeText(searchInput.value.trim()) : "";
    const verifiedFilter = verifiedSelect ? verifiedSelect.value : "all";

    if (keyword) {
        filtered = filtered.filter((c) => {
            const name = normalizeText(c.name || "");
            return name.includes(keyword);
        });
    }

    if (verifiedFilter === "true") {
        filtered = filtered.filter((c) => c.verified === true);
    } else if (verifiedFilter === "false") {
        filtered = filtered.filter((c) => c.verified === false);
    }

    totalElements = filtered.length;
    totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

    if (currentPage > totalPages) currentPage = totalPages;

    if (!filtered.length) {
        document.getElementById("companies-list").innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-6 text-center text-sm text-gray-500">
                    Không có công ty nào.
                </td>
            </tr>
        `;
        companiesContainer.classList.remove("hidden");
        emptyState.classList.add("hidden");
        renderPagination(); // hiển thị 0/0
        return;
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filtered.slice(start, end);

    renderCompaniesTable(pageItems);
    renderPagination();

    companiesContainer.classList.remove("hidden");
    emptyState.classList.add("hidden");
}

/* ================= RENDER BẢNG COMPANY ================= */

function renderCompaniesTable(companies) {
    const tbody = document.getElementById("companies-list");
    if (!tbody) return;

    if (!companies || !companies.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-6 text-center text-sm text-gray-500">
                    Không có dữ liệu.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = companies
        .map((c) => {
            const id = c.id ?? "";
            const name = c.name || "Không tên";
            const website = c.website || "";
            const verified = !!c.verified;

            const statusBadge = verified
                ? `<span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Đã xác thực</span>`
                : `<span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Chờ xác thực</span>`;

            const verifyButtonLabel = verified ? "Bỏ xác thực" : "Xác thực";

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm text-gray-900">#${id}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                        <div class="flex items-center gap-3">
                            ${
                                c.logoUrl
                                    ? `<img src="${escapeHtml(
                                          c.logoUrl
                                      )}" alt="${escapeHtml(
                                          name
                                      )}" class="w-8 h-8 rounded object-cover border border-gray-200" />`
                                    : ""
                            }
                            <div>
                                <div class="font-medium">${escapeHtml(name)}</div>
                                ${
                                    c.slug
                                        ? `<div class="text-xs text-gray-400">/${escapeHtml(
                                              c.slug
                                          )}</div>`
                                        : ""
                                }
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-blue-600">
                        ${
                            website
                                ? `<a href="${escapeHtml(
                                      website
                                  )}" target="_blank" rel="noopener" class="hover:underline">${escapeHtml(
                                      website
                                  )}</a>`
                                : `<span class="text-gray-400 text-xs">Không có</span>`
                        }
                    </td>
                    <td class="px-6 py-4 text-sm">
                        ${statusBadge}
                    </td>
                    <td class="px-6 py-4 text-sm">
                        <div class="flex items-center justify-center gap-2">
                            <button
                                type="button"
                                class="inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 
                                       border border-amber-300 rounded-md text-xs font-medium text-amber-700 hover:bg-amber-50"
                                onclick="verifyCompany(${id}, ${verified})"
                            >
                                ${verifyButtonLabel}
                            </button>
                            <button
                                type="button"
                                class="inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 
                                       border border-red-300 rounded-md text-xs font-medium text-red-700 hover:bg-red-50"
                                onclick="deleteCompany(${id})"
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

/* =================== PHÂN TRANG =================== */

function renderPagination() {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    if (totalElements === 0) {
        pagination.innerHTML = `
            <div class="text-sm text-gray-600">
                Không có công ty nào.
            </div>
        `;
        pagination.classList.remove("hidden");
        return;
    }

    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalElements);

    pagination.innerHTML = `
        <div class="text-sm text-gray-600">
            Hiển thị <span class="font-medium">${from}</span>–<span class="font-medium">${to}</span>
            trên tổng <span class="font-medium">${totalElements}</span> công ty
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
                onclick="gotoCompanyPage(${currentPage - 1})"
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
                onclick="gotoCompanyPage(${currentPage + 1})"
            >
                Sau
            </button>
        </div>
    `;

    pagination.classList.remove("hidden");
}

window.gotoCompanyPage = function (page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    applyFiltersAndRender();
};

/* =================== VERIFY & DELETE =================== */

// PATCH /admins/companies/{id}/verify
window.verifyCompany = async function (id, currentlyVerified) {
    if (!id) return;

    const confirmMsg = currentlyVerified
        ? "Bạn có chắc muốn bỏ xác thực công ty này?"
        : "Bạn có chắc muốn xác thực công ty này?";

    if (!window.confirm(confirmMsg)) return;

    try {
        const res = await authService.apiRequest(`/admins/companies/${id}/verify`, {
            method: "PATCH",
        });

        if (!res || !res.ok) {
            const txt = await res.text().catch(() => "");
            console.error("Verify company HTTP error:", txt);
            alert("Cập nhật trạng thái xác thực thất bại.");
            return;
        }

        alert("Cập nhật trạng thái xác thực thành công.");
        await loadCompanies();
    } catch (err) {
        console.error("❌ Lỗi verify company:", err);
        alert("Đã xảy ra lỗi khi cập nhật trạng thái xác thực.");
    }
};

// DELETE /admins/companies/{id}
window.deleteCompany = async function (id) {
    if (!id) return;

    if (!window.confirm(`Bạn có chắc chắn muốn xoá công ty #${id} không?`)) return;

    try {
        const res = await authService.apiRequest(`/admins/companies/${id}`, {
            method: "DELETE",
        });

        if (!res || !res.ok) {
            const txt = await res.text().catch(() => "");
            console.error("Delete company HTTP error:", txt);
            alert("Xoá công ty thất bại.");
            return;
        }

        alert("Đã xoá công ty thành công.");
        await loadCompanies();
    } catch (err) {
        console.error("❌ Lỗi delete company:", err);
        alert("Đã xảy ra lỗi khi xoá công ty.");
    }
};

/* ======================= ERROR & HELPER ======================= */

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
                onclick="loadCompanies()"
            >
                Thử lại
            </button>
        </div>
    `;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
