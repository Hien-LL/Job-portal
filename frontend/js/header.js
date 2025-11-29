(function(){
  // Responsive header behaviors: mobile menu toggle, user dropdown, auth visibility
  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  function $all(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }
  let _globalListenersAttached = false;

  function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
    } else {
      menu.classList.add('hidden');
    }
    const btn = document.querySelector('.mobile-menu-trigger');
    if (btn) btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  }

  function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
    const btn = document.querySelector('.mobile-menu-trigger');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function toggleUserDropdown() {
    const dd = $('#user-dropdown');
    if (!dd) return;
    const isHidden = dd.classList.contains('invisible') || dd.classList.contains('opacity-0');
    if (isHidden) {
      dd.classList.remove('invisible', 'opacity-0', 'scale-95', 'pointer-events-none');
      dd.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
    } else {
      dd.classList.add('invisible', 'opacity-0', 'scale-95', 'pointer-events-none');
      dd.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
    }
  }

  function closeUserDropdown() {
    const dd = $('#user-dropdown');
    if (dd && !(dd.classList.contains('invisible') || dd.classList.contains('opacity-0'))) {
      dd.classList.add('invisible', 'opacity-0', 'scale-95', 'pointer-events-none');
      dd.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
    }
  }

  function attachHandlers(root) {
    const mobileBtns = $all('.mobile-menu-trigger', root);
    mobileBtns.forEach(b => {
      b.addEventListener('click', (e) => { e.stopPropagation(); toggleMobileMenu(); });
      b.setAttribute('aria-controls', 'mobile-menu');
      b.setAttribute('aria-expanded', 'false');
    });

    const userTrigger = $('#user-menu-trigger', root);
    if (userTrigger) {
      userTrigger.addEventListener('click', (e) => { e.stopPropagation(); toggleUserDropdown(); });
      // close on logout selection
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          if (window.authService && typeof authService.logout === 'function') {
            await authService.logout();
          } else {
            // fallback: clear storage
            if (window.AUTH_CONFIG) {
              authService && authService.clearAuthData && authService.clearAuthData();
            } else {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_id');
              localStorage.removeItem('user_type');
            }
          }
        } catch (err) {
          console.warn('Logout failed', err);
        } finally {
          closeUserDropdown();
          closeMobileMenu();
          window.location.href = 'login.html';
        }
      });
    }

    // Note: document-level click/keydown handlers are attached once globally below (delegation)
  }

  function syncAuthUI() {
    try {
      const logged = document.getElementById('logged-in-menu');
      const notLogged = document.getElementById('not-logged-in-menu');
      const mobileAuthArea = document.getElementById('mobile-auth-area');
      if (window.authService && typeof authService.isAuthenticated === 'function') {
        if (authService.isAuthenticated()) {
          if (logged) logged.classList.remove('hidden');
          if (notLogged) notLogged.classList.add('hidden');
          if (mobileAuthArea) mobileAuthArea.innerHTML = `
              <a href=\"profile.html\" class=\"block text-gray-700 hover:text-blue-600\">Hồ sơ của tôi</a>
              <a href=\"notifications.html\" class=\"block mt-2 text-gray-700 hover:text-blue-600\">Thông báo</a>
              <button id=\"mobile-logout-btn\" class=\"block mt-3 w-full text-left text-red-600\">Đăng xuất</button>
          `;
          const mobLogout = document.getElementById('mobile-logout-btn');
          if (mobLogout) mobLogout.addEventListener('click', async (e)=>{ e.preventDefault(); await authService.logout(); window.location.href='login.html'; });
        } else {
          if (logged) logged.classList.add('hidden');
          if (notLogged) notLogged.classList.remove('hidden');
          if (mobileAuthArea) mobileAuthArea.innerHTML = `
              <a href=\"login.html\" class=\"block text-gray-700 hover:text-blue-600\">Đăng nhập</a>
              <a href=\"register.html\" class=\"block mt-2 bg-blue-600 text-white px-4 py-2 rounded text-center\">Đăng ký</a>
          `;
        }
      }
    } catch (err) { console.warn('syncAuthUI error', err); }
  }

  // When fragments are injected the header fragment may be added later.
  function init() {
    // Attach handlers for current document (works for injected fragments too)
    attachHandlers(document);
    syncAuthUI();

    // If fragments are loaded later, re-run handlers
    if (typeof loadFragments === 'function') {
      // run after fragments injection
      setTimeout(()=>{ attachHandlers(document); syncAuthUI(); }, 100);
    }
  }

  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);

  // Also re-init when fragments-loader finishes injecting fragments
  document.addEventListener('fragments:loaded', function() {
    try { attachHandlers(document); syncAuthUI(); } catch (e) { console.warn('fragments:loaded handler error', e); }
  });
  // Fallback: observe DOM for header fragment insertion (covers edge timing cases)
  try {
    const observer = new MutationObserver((mutations, obs) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.id === 'main-header' || node.querySelector && node.querySelector('#main-header')) {
            try { attachHandlers(document); syncAuthUI(); } catch (e) { console.warn('MutationObserver init error', e); }
            obs.disconnect();
            return;
          }
          // If fragment is a wrapper that contains header fragment placeholder
          if (node.querySelector && (node.querySelector('[data-fragment="fragments/header.html"]') || node.querySelector('[data-fragment="fragments/header-recruiter.html"]') || node.querySelector('[data-fragment="fragments/header-candidate.html"]'))) {
            // wait a tick for fragments-loader to inject
            setTimeout(()=>{ try { attachHandlers(document); syncAuthUI(); } catch(e){ console.warn('MutationObserver delayed init', e); } }, 50);
            obs.disconnect();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* ignore if MutationObserver unsupported */ }
  // Poll for authService if it's not yet available (some pages load header.js before auth.js)
  (function waitForAuthService(){
    if (window.authService && typeof authService.isAuthenticated === 'function') {
      try { syncAuthUI(); } catch (e) { console.warn('syncAuthUI error after auth ready', e); }
      return;
    }
    let retries = 0;
    const maxRetries = 30; // ~3 seconds
    const iv = setInterval(()=>{
      retries++;
      if (window.authService && typeof authService.isAuthenticated === 'function') {
        clearInterval(iv);
        try { syncAuthUI(); } catch (e) { console.warn('syncAuthUI error after auth ready', e); }
      } else if (retries >= maxRetries) {
        clearInterval(iv);
      }
    }, 100);
  })();
  // Attach a single delegated document handler (global) to reliably handle trigger clicks
  if (!window.__jp_header_delegation_attached) {
    window.__jp_header_delegation_attached = true;
    
    document.addEventListener('click', function(e) {
      try {
        // user menu trigger — IMPORTANT: must use e.target.closest() with null-check
        if (e.target && e.target.closest && e.target.closest('#user-menu-trigger')) {
          e.stopPropagation();
          toggleUserDropdown();
          return;
        }

        // mobile menu trigger
        if (e.target && e.target.closest && e.target.closest('.mobile-menu-trigger')) {
          e.stopPropagation();
          toggleMobileMenu();
          return;
        }

        // clicks outside dropdowns/menus: close them
        const dd = document.getElementById('user-dropdown');
        const mm = document.getElementById('mobile-menu');
        
        if (dd && e.target && e.target.closest) {
          if (!e.target.closest('#user-dropdown') && !e.target.closest('#user-menu-trigger')) {
            closeUserDropdown();
          }
        }
        if (mm && e.target && e.target.closest) {
          if (!e.target.closest('#mobile-menu') && !e.target.closest('.mobile-menu-trigger')) {
            closeMobileMenu();
          }
        }
      } catch (err) { console.warn('Delegation handler error:', err); }
    });
    
    document.addEventListener('keydown', function(e) {
      try {
        if (e.key === 'Escape') { 
          closeMobileMenu(); 
          closeUserDropdown(); 
        }
      } catch (err) { console.warn('Keydown handler error:', err); }
    });
  }
})();
