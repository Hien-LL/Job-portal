/**
 * Load HTML fragment(s) into elements with [data-fragment] or [fragment]
 * For Admin pages
 * - Parse an toàn (DOMParser), lấy <body> nếu lỡ là full HTML
 * - Thực thi <script> bên trong fragment
 * - Tránh cache khi dev
 */

async function loadFragments() {
  // Prevent duplicate runs: support concurrent callers
  if (window._adminFragmentsLoaded) return Promise.resolve();
  if (window._adminFragmentsLoading) {
    return new Promise(resolve => {
      const t = setInterval(() => {
        if (window._adminFragmentsLoaded) {
          clearInterval(t);
          resolve();
        }
      }, 50);
    });
  }
  window._adminFragmentsLoading = true;

  const hosts = document.querySelectorAll('[data-fragment], [fragment]');

  for (const host of hosts) {
    let path = host.getAttribute('data-fragment') || host.getAttribute('fragment');

    try {
      const res = await fetch(path, { cache: 'no-cache' });
      console.log('[Admin FragmentsLoader] fetch', path, res.status);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      console.log('[Admin FragmentsLoader] fetch', path, res.status);
      console.log('[Admin FragmentsLoader] html length', path, html.length);
      console.log('[Admin FragmentsLoader] html start', html.slice(0,200));
      console.log('[Admin FragmentsLoader] html end', html.slice(-200));

      // Parse bằng DOMParser để chịu được nội dung full HTML
      let doc = null;
      try {
        const parser = new DOMParser();
        doc = parser.parseFromString(html, 'text/html');
      } catch (e) {
        console.warn('[Admin FragmentsLoader] DOMParser failed for', path, e);
        doc = null;
      }

      // Lấy nodes để inject: ưu tiên body, fallback raw
      let nodes = [];
      if (doc && doc.body && doc.body.childNodes.length) {
        nodes = Array.from(doc.body.childNodes);
      } else {
        // Fallback: try template parsing; if still empty, inject raw HTML and skip script execution
        try {
          const tpl = document.createElement('template');
          tpl.innerHTML = html.trim();
          nodes = Array.from(tpl.content.childNodes);
        } catch (e) {
          console.warn('[Admin FragmentsLoader] template parsing failed for', path, e);
          nodes = [];
        }
        if (nodes.length === 0) {
          console.warn('[Admin FragmentsLoader] no nodes parsed for', path, '- injecting raw HTML without running scripts');
          host.innerHTML = html; // inject raw and skip script execution to avoid runtime errors
          continue; // move to next host
        }
      }

      // Tạo fragment thật để replace (clone nodes to avoid moving between documents)
      // Collect scripts separately so they don't execute during fragment append
      const frag = document.createDocumentFragment();
      const scriptsToEval = [];
      for (const node of nodes) {
        try {
          const clone = node.cloneNode(true);
          // Find and remove any <script> inside the clone; collect them instead
          try {
            const nestedScripts = clone.querySelectorAll ? clone.querySelectorAll('script') : [];
            nestedScripts.forEach(s => {
              scriptsToEval.push({ src: s.src || null, content: s.textContent, type: s.type || 'text/javascript' });
              s.remove();
            });
          } catch (innerE) {
            // ignore
            console.warn('[Admin FragmentsLoader] error extracting nested scripts', innerE);
          }
          frag.appendChild(clone);
        } catch (e) {
          console.warn('[Admin FragmentsLoader] skip node due to append error', e, node);
        }
      }

      // Replace host content
      host.innerHTML = '';
      host.appendChild(frag);

      // Thực thi any collected <script> tags safely (catch append/parse/runtime errors)
      for (const s of scriptsToEval) {
        // By default, do NOT execute inline scripts from fragments to avoid
        // runtime/syntax errors originating inside fragments. To allow inline
        // execution set `window._adminFragmentsAllowInlineScripts = true` before
        // loading the page (ONLY if you trust the fragment code).
        if (!s.src && s.content && !window._adminFragmentsAllowInlineScripts) {
          console.warn('[Admin FragmentsLoader] skipping inline script from fragment (enable with _adminFragmentsAllowInlineScripts)');
          console.log(s.content ? s.content.slice(0,200) : 'empty');
          continue;
        }

        if (s.src) {
          const newScript = document.createElement('script');
          newScript.src = s.src;
          newScript.async = false;
          newScript.onerror = function(e) { console.error('[Admin FragmentsLoader] external script load error', s.src, e); };
          try {
            document.head.appendChild(newScript);
          } catch (e) {
            console.error('[Admin FragmentsLoader] failed to append external script', s.src, e);
          }
        } else {
          const newScript = document.createElement('script');
          newScript.type = s.type || 'text/javascript';
          try {
            newScript.text = s.content;
            document.head.appendChild(newScript);
          } catch (e) {
            console.error('[Admin FragmentsLoader] failed to append inline script', e, s.content ? s.content.slice(0,200) : 'empty');
          }
        }
      }

    } catch (error) {
      console.error('[Admin FragmentsLoader] Error loading', path, error);
      host.innerHTML = `<div class="text-red-500 p-4">Error loading fragment: ${path}</div>`;
    }
  }

  window._adminFragmentsLoaded = true;
  window._adminFragmentsLoading = false;
  return Promise.resolve();
}

// Auto-run khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFragments);
} else {
  loadFragments();
}