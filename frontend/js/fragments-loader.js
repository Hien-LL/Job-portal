/**
 * Load HTML fragment(s) into elements with [data-fragment]
 * - Hỗ trợ auto header theo user type (recruiter/candidate)
 * - Parse an toàn (DOMParser), lấy <body> nếu lỡ là full HTML
 * - Thực thi <script> bên trong fragment
 * - Tránh cache khi dev
 */

async function loadFragments() {
  const hosts = document.querySelectorAll('[data-fragment]');

  for (const host of hosts) {
    let path = host.getAttribute('data-fragment');

    // Header auto-detect (guarded: authService may load after fragments-loader)
    if (path === 'fragments/header.html') {
      const headerType = host.getAttribute('data-header-type') || 'auto';
      if (headerType === 'auto') {
        try {
          if (window.authService && typeof authService.getUserType === 'function') {
            const userType = authService.getUserType();
            if (userType === 'recruiter') path = 'fragments/header-recruiter.html';
            else if (userType === 'candidate') path = 'fragments/header-candidate.html';
          } else {
            // authService not ready yet — keep default header for now
          }
        } catch (e) {
          console.warn('[FragmentsLoader] header auto-detect failed, using default header', e);
        }
      } else if (headerType === 'recruiter') {
        path = 'fragments/header-recruiter.html';
      } else if (headerType === 'candidate') {
        path = 'fragments/header-candidate.html';
      }
    }

    try {
      const res = await fetch(path, { cache: 'no-cache' });
      console.log('[FragmentsLoader] fetch', path, res.status);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();

      // Parse bằng DOMParser để chịu được nội dung full HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Lấy nodes để inject: ưu tiên body, fallback raw
      let nodes = [];
      if (doc.body && doc.body.childNodes.length) {
        nodes = Array.from(doc.body.childNodes);
      } else {
        const tpl = document.createElement('template');
        tpl.innerHTML = html.trim();
        nodes = Array.from(tpl.content.childNodes);
      }

      // Tạo fragment thật để replace
      const frag = document.createDocumentFragment();

      // Duyệt từng node: nếu là <script> thì tạo script mới cho thực thi
      nodes.forEach(node => {
        if (node.nodeName.toLowerCase() === 'script') {
          const s = document.createElement('script');
          // copy attributes
          for (const attr of node.attributes) s.setAttribute(attr.name, attr.value);
          s.textContent = node.textContent;
          frag.appendChild(s);
        } else {
          frag.appendChild(node);
        }
      });

      // Replace host
      host.replaceWith(frag);

    } catch (err) {
      console.error('[FragmentsLoader] error', path, err);
    }
  }

  // Sau khi tất cả fragment đã inject xong
  try {
    updateAuthUI && updateAuthUI();
  } catch (e) {
    console.warn('[FragmentsLoader] updateAuthUI not ready', e);
  }

  // Dispatch an event so other scripts (loaded as fragments) can react
  try {
    document.dispatchEvent(new CustomEvent('fragments:loaded'));
  } catch (e) {
    console.warn('[FragmentsLoader] could not dispatch fragments:loaded', e);
  }

  // After fragments loaded, attach header/menu handlers (delegated) if present
  try {
    setupHeaderMenuHandlers && setupHeaderMenuHandlers();
  } catch (e) { /* ignore */ }
}

/* =======================
   Auth-related helpers
   (giữ nguyên flow cũ của m)
======================= */

// Update UI based on authentication status
function updateAuthUI() {
  const loggedInMenu = document.getElementById('logged-in-menu');
  const notLoggedInMenu = document.getElementById('not-logged-in-menu');

  if (!loggedInMenu || !notLoggedInMenu) {
    setTimeout(updateAuthUI, 100);
    return;
  }

  const isLoggedIn = authService.isAuthenticated();

  if (isLoggedIn) {
    loggedInMenu.classList.remove('hidden');
    loggedInMenu.classList.add('flex');
    notLoggedInMenu.classList.add('hidden');
    // User menu is now handled by header.js delegated handlers
  } else {
    notLoggedInMenu.classList.remove('hidden');
    loggedInMenu.classList.add('hidden');
  }
}

// Note: User menu functionality is now handled by header.js delegated event handlers.
// setupUserMenu() removed to avoid conflicts with header.js dropdown logic.

// Delegated header/menu handlers (robust: works with checkbox "peer" toggles or JS toggles)
function setupHeaderMenuHandlers() {
  // Delegated click handler covers mobile menu toggles, logout, and clicking outside
  document.addEventListener('click', function(e) {
    try {
      // Mobile menu trigger
      const mobileBtn = e.target.closest && e.target.closest('.mobile-menu-trigger');
      if (mobileBtn) {
        e.stopPropagation();
        const menu = document.getElementById('mobile-menu');
        const isHidden = menu && menu.classList.contains('hidden');
        if (menu) {
          if (isHidden) menu.classList.remove('hidden'); else menu.classList.add('hidden');
        }
        // toggle aria
        mobileBtn.setAttribute('aria-expanded', menu && !menu.classList.contains('hidden') ? 'true' : 'false');
        return;
      }

      // Logout
      if (e.target.closest && e.target.closest('#logout-btn')) {
        e.preventDefault();
        (async () => {
          try {
            if (window.authService && typeof authService.logout === 'function') {
              await authService.logout();
            } else if (window.authUtils && typeof authUtils.logout === 'function') {
              await authUtils.logout();
            } else {
              // best-effort clear
              try { authService && authService.clearAuthData && authService.clearAuthData(); } catch(_) {}
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_id');
              localStorage.removeItem('user_type');
            }
          } catch (err) {
            console.warn('[FragmentsLoader] logout error', err);
          } finally {
            window.location.href = 'login.html';
          }
        })();
        return;
      }

      // Clicks outside header dropdowns should close mobile menu and uncheck peer toggles
      const dd = document.getElementById('user-dropdown');
      const mm = document.getElementById('mobile-menu');
      if (dd && !e.target.closest('#user-dropdown') && !e.target.closest('label[for="user-menu-toggle"]') && !e.target.closest('#user-menu-toggle')) {
        // if dropdown uses peer/checkbox, uncheck it; otherwise hide
        const checkbox = document.getElementById('user-menu-toggle');
        if (checkbox) checkbox.checked = false;
        dd.classList.add('hidden');
      }
      if (mm && !e.target.closest('#mobile-menu') && !e.target.closest('.mobile-menu-trigger')) {
        mm.classList.add('hidden');
        document.querySelectorAll('.mobile-menu-trigger').forEach(b => b.setAttribute('aria-expanded', 'false'));
      }
    } catch (err) { console.warn('[FragmentsLoader] header handler error', err); }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    try {
      if (e.key === 'Escape') {
        const checkbox = document.getElementById('user-menu-toggle');
        if (checkbox) checkbox.checked = false;
        const dd = document.getElementById('user-dropdown');
        if (dd) dd.classList.add('hidden');
        const mm = document.getElementById('mobile-menu');
        if (mm) mm.classList.add('hidden');
      }
    } catch (err) { console.warn('[FragmentsLoader] key handler error', err); }
  });
}

// Logout -> delegate sang authService
async function logout() {
  await authService.logout();
  window.location.href = 'index.html';
}

// Auth protection
function requireAuth() {
  return authService.requireAuth();
}

// Token expiry periodic checking
let tokenCheckInterval;
function startTokenExpirationCheck() {
  tokenCheckInterval = setInterval(() => {
    if (authService.isAuthenticated()) checkTokenExpiration();
  }, 30000);
}
function stopTokenExpirationCheck() {
  if (tokenCheckInterval) { clearInterval(tokenCheckInterval); tokenCheckInterval = null; }
}
function checkTokenExpiration() {
  const loginExpiry = localStorage.getItem('login_expiry');
  const accessToken = authService.getToken();
  if (!loginExpiry || !accessToken) return;

  const currentTime = Date.now();
  const expiryTime = parseInt(loginExpiry, 10);
  if (currentTime > expiryTime) {
    authService.clearAuthData();
    showTokenExpirationModal();
  }
}
function showTokenExpirationModal() {
  const existing = document.getElementById('token-expiration-modal');
  if (existing) existing.remove();

  const html = `
    <div id="token-expiration-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Phiên đăng nhập hết hạn</h3>
        <p class="text-gray-600 text-sm mb-4">Phiên làm việc của bạn đã hết hạn. Bạn có muốn tiếp tục sử dụng?</p>
        <div class="flex gap-3">
          <button id="refresh-token-btn" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Tiếp tục</button>
          <button id="logout-modal-btn" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400">Đăng xuất</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('refresh-token-btn').addEventListener('click', handleRefreshToken);
  document.getElementById('logout-modal-btn').addEventListener('click', () => {
    document.getElementById('token-expiration-modal').remove();
    logout();
  });
}
async function handleRefreshToken() {
  try {
    const ok = await authService.refreshToken();
    const modal = document.getElementById('token-expiration-modal');
    if (ok) { modal && modal.remove(); }
    else throw new Error('Refresh token expired');
  } catch (e) {
    const modal = document.getElementById('token-expiration-modal');
    modal && modal.remove();
    typeof showErrorToast === 'function' && showErrorToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 3000);
    logout();
  }
}

// Expose helpers (giống bản trước)
window.authUtils = {
  logout,
  requireAuth,
  apiRequest: (endpoint, options) => authService.apiRequest(endpoint, options),
  updateAuthUI,
  checkTokenExpiration,
  handleRefreshToken,
  clearAuthData: () => authService.clearAuthData(),
  startTokenExpirationCheck,
  stopTokenExpirationCheck,
  isLoggedIn: () => authService.isAuthenticated()
};

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadFragments();
    startTokenExpirationCheck();
  });
} else {
  loadFragments();
  startTokenExpirationCheck();
}

// Minor UI handlers
document.addEventListener('click', function(e) {
  if (e.target.closest('.mobile-menu-trigger')) console.log('Mobile menu toggled');
});
document.addEventListener('click', function(e) {
  if (e.target.closest('.favorite-btn')) e.target.closest('.favorite-btn').classList.toggle('text-red-500');
});
