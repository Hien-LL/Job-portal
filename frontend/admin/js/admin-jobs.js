

let allJobs = [];           // dữ liệu gốc từ API
let filteredJobs = [];      // dữ liệu sau khi search/filter

let currentKeyword = "";
let currentStatusFilter = "all"; // all | true | false

document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra đăng nhập
  if (!authService.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  // Load header/sidebar/footer rồi mới gọi API
  loadFragments().then(() => {
    attachJobSearchHandler();
    attachStatusFilterHandler();
    loadJobs();
  });
});

/* ================== GỌI API LẤY DANH SÁCH JOB ================== */

async function loadJobs() {
  const loading = document.getElementById("loading");
  const errorState = document.getElementById("error-state");
  const jobsContainer = document.getElementById("jobs-container");
  const emptyState = document.getElementById("empty-state");
  const pagination = document.getElementById("pagination");

  if (!loading || !jobsContainer || !emptyState || !errorState) {
    console.error("Thiếu phần tử DOM trong admin-jobs.html");
    return;
  }

  loading.classList.remove("hidden");
  jobsContainer.classList.add("hidden");
  emptyState.classList.add("hidden");
  errorState.classList.add("hidden");
  pagination && pagination.classList.add("hidden");

  try {
    const res = await authService.apiRequest(`/admins/jobs?sort=published,asc`);

    if (!res) {
      throw new Error("No response from server");
    }
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Load jobs HTTP error:", txt);
      throw new Error("HTTP error");
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || "API error");
    }

    const pageData = json.data;
    allJobs = pageData.content || [];

    loading.classList.add("hidden");

    if (!allJobs.length) {
      emptyState.classList.remove("hidden");
      return;
    }

    // Áp dụng search + filter client-side
    applyFiltersAndRender();

    jobsContainer.classList.remove("hidden");
  } catch (err) {
    console.error("❌ Lỗi load jobs:", err);
    loading.classList.add("hidden");
    showJobsErrorState("Không thể tải danh sách tin tuyển dụng. Vui lòng thử lại.");
  }
}

/* =============== SEARCH & FILTER CLIENT-SIDE =============== */

function attachJobSearchHandler() {
  const input = document.getElementById("job-search-input");
  if (!input) return;

  input.addEventListener("input", () => {
    currentKeyword = input.value.trim().toLowerCase();
    applyFiltersAndRender();
  });
}

function attachStatusFilterHandler() {
  const select = document.getElementById("status-filter");
  if (!select) return;

  select.addEventListener("change", () => {
    currentStatusFilter = select.value; // all | true | false
    applyFiltersAndRender();
  });
}

function applyFiltersAndRender() {
  const jobsContainer = document.getElementById("jobs-container");
  const emptyState = document.getElementById("empty-state");
  const loading = document.getElementById("loading");

  if (!jobsContainer || !emptyState || !loading) return;

  loading.classList.add("hidden");

  filteredJobs = allJobs.filter((job) => {
    let ok = true;

    // Filter theo keyword: tiêu đề + tên công ty
    if (currentKeyword) {
      const title = (job.title || "").toLowerCase();
      const companyName = (job.company?.name || "").toLowerCase();
      if (!title.includes(currentKeyword) && !companyName.includes(currentKeyword)) {
        ok = false;
      }
    }

    // Filter theo trạng thái published
    if (currentStatusFilter !== "all") {
      const publishedStr = job.published ? "true" : "false";
      if (publishedStr !== currentStatusFilter) {
        ok = false;
      }
    }

    return ok;
  });

  if (!filteredJobs.length) {
    document.getElementById("jobs-list").innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-6 text-center text-sm text-gray-500">
          Không tìm thấy tin tuyển dụng phù hợp.
        </td>
      </tr>
    `;
    emptyState.classList.add("hidden");
    jobsContainer.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  renderJobsTable(filteredJobs);
  jobsContainer.classList.remove("hidden");
}

/* ================= RENDER BẢNG JOBS ================= */

function renderJobsTable(jobs) {
  const tbody = document.getElementById("jobs-list");
  if (!tbody) return;

  if (!jobs || !jobs.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-6 text-center text-sm text-gray-500">
          Không có tin tuyển dụng nào.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = jobs
    .map((job) => {
      const id = job.id ?? "";
      const title = job.title || "Không có tiêu đề";
      const companyName = job.company?.name || "Không rõ công ty";
      const isPublished = job.published === true;
      const statusLabel = isPublished ? "Đã đăng" : "Nháp";
      const statusClass = isPublished
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-gray-50 text-gray-700 border-gray-200";

      // Hiện tại API chưa trả số ứng tuyển → để "-" hoặc 0
      const applicationsCount = job.applicationCount ?? "-";

      return `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 text-sm text-gray-900">
            ${escapeHtml(title)}
          </td>
          <td class="px-6 py-4 text-sm text-gray-700">
            ${escapeHtml(companyName)}
          </td>
          <td class="px-6 py-4 text-sm">
            <span class="inline-flex px-2 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${statusClass}">
              ${statusLabel}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-700">
            ${applicationsCount}
          </td>
          <td class="px-6 py-4 text-sm">
            <div class="flex items-center justify-center gap-2">
              <a
                href="admin-job-detail.html?id=${id}"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 
                       rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Xem
              </a>

              <button
                type="button"
                class="inline-flex items-center justify-center whitespace-nowrap 
                       px-3 py-1.5 border rounded-md text-xs font-medium
                       ${
                         isPublished
                           ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                           : "border-blue-300 text-blue-700 hover:bg-blue-50"
                       }"
                onclick="togglePublishJob(${id}, ${isPublished})"
              >
                ${isPublished ? "Gỡ đăng" : "Đăng tin"}
              </button>

              <button
                type="button"
                class="inline-flex items-center px-3 py-1.5 border border-red-300 
                       rounded-md text-xs font-medium text-red-700 hover:bg-red-50"
                onclick="deleteJob(${id})"
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

/* =================== ERROR STATE =================== */

function showJobsErrorState(message) {
  const errorState = document.getElementById("error-state");
  if (!errorState) return;

  errorState.classList.remove("hidden");
  errorState.innerHTML = `
    <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
      <span>${escapeHtml(message || "Đã xảy ra lỗi.")}</span>
      <button
        type="button"
        class="ml-4 inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 hover:bg-red-100"
        onclick="loadJobs()"
      >
        Thử lại
      </button>
    </div>
  `;
}

/* ======================= XOÁ JOB (DELETE) ======================= */

window.deleteJob = async function (id) {
  if (!id) return;

  const confirmDelete = window.confirm(
    `Bạn có chắc chắn muốn xoá tin tuyển dụng #${id} không?`
  );
  if (!confirmDelete) return;

  try {
    const res = await authService.apiRequest(`/admins/jobs/${id}`, {
      method: "DELETE",
    });

    if (!res) {
      console.error("Delete job: no response from server");
      alert("Không nhận được phản hồi từ server.");
      return;
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Delete job HTTP error:", txt);
      alert("Xoá tin tuyển dụng thất bại (HTTP error).");
      return;
    }

    let json = {};
    try {
      json = await res.json();
    } catch {
      // Có thể backend không trả JSON, bỏ qua
    }

    if (json.success === false) {
      alert(json.message || "Xoá tin tuyển dụng thất bại.");
      return;
    }

    alert(`Đã xoá tin tuyển dụng #${id} thành công.`);

    // Xoá khỏi mảng và render lại
    allJobs = allJobs.filter((j) => j.id !== id);
    applyFiltersAndRender();
  } catch (err) {
    console.error("❌ Lỗi khi xoá job:", err);
    alert("Đã xảy ra lỗi khi xoá tin tuyển dụng. Vui lòng thử lại.");
  }
};

/* ======================= PUBLISH / UNPUBLISH (UPDATE) ======================= */

/**
 * Gọi PUT /admins/jobs/{id}/publish
 * Backend của bạn lo set published true/false.
 */
window.togglePublishJob = async function (id, currentlyPublished) {
  if (!id) return;

  const actionText = currentlyPublished ? "gỡ đăng" : "đăng tin";
  const confirmToggle = window.confirm(
    `Bạn có chắc chắn muốn ${actionText} tin tuyển dụng #${id} không?`
  );
  if (!confirmToggle) return;

  try {
    const res = await authService.apiRequest(`/admins/jobs/${id}/publish`, {
      method: "PUT",
    });

    if (!res) {
      console.error("Publish job: no response from server");
      alert("Không nhận được phản hồi từ server.");
      return;
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Publish job HTTP error:", txt);
      alert("Cập nhật trạng thái đăng tin thất bại (HTTP error).");
      return;
    }

    let json = {};
    try {
      json = await res.json();
    } catch {
      // có thể backend không trả JSON chi tiết
    }

    if (json.success === false) {
      alert(json.message || "Cập nhật trạng thái đăng tin thất bại.");
      return;
    }

    alert("Cập nhật trạng thái đăng tin thành công.");

    // Cập nhật trạng thái trong allJobs (chỉ để UI phản ánh nhanh)
    allJobs = allJobs.map((job) =>
      job.id === id ? { ...job, published: !currentlyPublished } : job
    );

    applyFiltersAndRender();
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật publish:", err);
    alert("Đã xảy ra lỗi khi cập nhật trạng thái đăng tin. Vui lòng thử lại.");
  }
};

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
