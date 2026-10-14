/* Panel del autor: entrar, ver artículos, escribir y publicar. */
(function () {
  const app = document.getElementById('app');
  const ROOT = window.SITE_ROOT || '';
  const icon = (n, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="${ROOT}assets/img/icons.svg#i-${n}"></use></svg>`;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, el = document) => el.querySelector(s);
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 3200);
  }
  const errMsg = (e) => (e && e.message) || 'Algo ha fallado. Inténtalo de nuevo.';

  let session = null;
  let dirty = false;
  window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  function confirmBox(title, text, okLabel, danger) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'confirm';
      wrap.innerHTML = `<div class="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="cf-t"><h2 id="cf-t">${esc(title)}</h2><p>${esc(text)}</p>
        <div class="row"><button class="btn btn--ghost" type="button" data-v="0">Cancelar</button><button class="btn ${danger ? 'btn--danger' : ''}" type="button" data-v="1">${esc(okLabel)}</button></div></div>`;
      document.body.appendChild(wrap);
      const close = (v) => { wrap.remove(); resolve(v); };
      wrap.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) close(b.dataset.v === '1'); else if (e.target === wrap) close(false); });
      wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(false); });
      wrap.querySelector('[data-v="1"]').focus();
    });
  }

  function shell(inner) {
    app.innerHTML = `
      <header class="a-bar"><div class="wrap">
        <a class="brand" href="#/" aria-label="Panel del autor"><span class="brand-mark" aria-hidden="true">JMN</span><span>Panel del autor</span></a>
        <div class="a-bar-r">
          <span class="a-user">${esc(session?.user?.email || '')}</span>
          <a class="a-iconbtn" href="../" target="_blank" rel="noopener">${icon('eye')} Ver la web</a>
          <button class="a-iconbtn" type="button" id="logout">${icon('logout')} Salir</button>
        </div></div></header>
      ${Blog.live ? '' : `<div class="demo-banner"><div class="wrap">${icon('alert-triangle')}<span><strong>Modo demostración.</strong> Puedes probarlo todo: los artículos que escribas se guardan solo en este navegador y se ven en el blog de este mismo navegador. Cuando la web se active, se guardarán de verdad.</span></div></div>`}
      <main class="a-main"><div class="wrap">${inner}</div></main>`;
    $('#logout').addEventListener('click', async () => {
      if (dirty && !(await confirmBox('¿Salir sin guardar?', 'Tienes cambios sin guardar en este artículo.', 'Salir', true))) return;
      dirty = false; await Blog.signOut(); session = null; route();
    });
  }

  // ---------------------------------------------------------- Acceso
  function viewLogin() {
    app.innerHTML = `<div class="login"><div class="login-card">
      <img class="mago" src="${ROOT}assets/img/mago.webp" alt="">
      <h1>Hola, José María</h1>
      <p>${Blog.live ? 'Entra con tu correo y tu contraseña para escribir en el blog.' : 'La web todavía está en modo demostración. Entra y prueba a escribir un artículo: no se publicará en internet.'}</p>
      <form class="a-form" id="login-form" novalidate>
        ${Blog.live ? `
        <div class="a-field"><label for="l-email">Correo electrónico</label><input class="a-input" id="l-email" type="email" autocomplete="username" required></div>
        <div class="a-field"><label for="l-pass">Contraseña</label><input class="a-input" id="l-pass" type="password" autocomplete="current-password" required></div>` : ''}
        <p class="a-error" id="l-err" role="alert"></p>
        <button class="btn" type="submit" style="justify-content:center">${Blog.live ? 'Entrar' : 'Entrar en modo demostración'} ${icon('arrow-right', 'icon icon--go')}</button>
        ${Blog.live ? '<button class="a-link" type="button" id="forgot">He olvidado mi contraseña</button>' : ''}
      </form></div></div>`;
    const f = $('#login-form');
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('#l-err');
      err.textContent = '';
      const btn = f.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        session = await Blog.signIn($('#l-email')?.value.trim(), $('#l-pass')?.value);
        route();
      } catch (ex) { err.textContent = errMsg(ex); btn.disabled = false; }
    });
    $('#forgot')?.addEventListener('click', async () => {
      const email = $('#l-email').value.trim();
      const err = $('#l-err');
      if (!email) { err.textContent = 'Escribe primero tu correo y vuelve a pulsar.'; $('#l-email').focus(); return; }
      try { await Blog.resetPassword(email); err.textContent = 'Te he enviado un correo para crear una contraseña nueva.'; }
      catch (ex) { err.textContent = errMsg(ex); }
    });
    ($('#l-email') || f.querySelector('button')).focus();
  }

  // ---------------------------------------------------------- Lista
  async function viewList() {
    shell(`<div class="a-head"><div><h1>Tus artículos</h1><p>Escribe, guarda como borrador y publica cuando quieras.</p></div>
      <a class="btn" href="#/nuevo">${icon('plus')} Escribir artículo</a></div><div id="list"><div class="skeleton" style="height:90px"></div></div>`);
    const box = $('#list');
    try {
      const posts = await Blog.listPosts({ drafts: true });
      const importBtn = Blog.live && !posts.some((p) => (window.SEED_POSTS || []).some((s) => s.slug === p.slug))
        ? `<p style="margin-top:18px"><button class="a-btn-sm" type="button" id="import">${icon('upload')} Importar las dos entrevistas de la web antigua</button></p>` : '';
      if (!posts.length) {
        box.innerHTML = `<div class="a-empty"><img src="${ROOT}assets/img/mago.webp" alt=""><h2>Aún no hay artículos</h2><p>Pulsa «Escribir artículo» para empezar el primero.</p>${importBtn}</div>`;
      } else {
        box.innerHTML = `<ul class="a-list">${posts.map((p) => `
          <li class="a-row">
            ${p.cover_url ? `<img class="a-thumb" src="${esc(Blog.fixUrl(p.cover_url))}" alt="">` : `<span class="a-thumb">${icon('photo')}</span>`}
            <div style="min-width:0"><h2>${esc(p.title)}</h2>
              <div class="a-meta"><span class="pill ${p.status === 'published' ? 'pub' : 'draft'}">${p.status === 'published' ? 'Publicado' : 'Borrador'}</span><span>${esc(Blog.formatDate(p))}</span></div></div>
            <div class="a-actions">
              <a class="a-btn-sm" href="#/editar/${encodeURIComponent(p.id)}">${icon('pencil')} Editar</a>
              ${p.status === 'published' ? `<a class="a-btn-sm" href="../blog/articulo.html?slug=${encodeURIComponent(p.slug)}" target="_blank" rel="noopener">${icon('eye')} Ver</a>` : ''}
              <button class="a-btn-sm danger" type="button" data-del="${esc(p.id)}" data-title="${esc(p.title)}">${icon('trash')}<span class="sr-only">Borrar</span></button>
            </div></li>`).join('')}</ul>${importBtn}`;
      }
      box.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
        if (!(await confirmBox('¿Borrar este artículo?', `«${b.dataset.title}» desaparecerá de la web. No se puede deshacer.`, 'Borrar', true))) return;
        try { await Blog.deletePost(b.dataset.del); toast('Artículo borrado'); viewList(); } catch (ex) { toast(errMsg(ex)); }
      }));
      $('#import')?.addEventListener('click', async (e) => {
        e.target.disabled = true;
        try { const n = await Blog.importSeeds(); toast(`${n} artículos importados`); viewList(); } catch (ex) { toast(errMsg(ex)); e.target.disabled = false; }
      });
    } catch (ex) {
      box.innerHTML = `<div class="a-empty"><h2>No se han podido cargar los artículos</h2><p>${esc(errMsg(ex))}</p><button class="btn" type="button" onclick="location.reload()">${icon('refresh')} Reintentar</button></div>`;
    }
  }

  // ---------------------------------------------------------- Editor
  async function viewEditor(id) {
    let post = { title: '', excerpt: '', cover_url: '', content_html: '', status: 'draft' };
    if (id) {
      try { post = await Blog.getPostById(id); } catch (ex) { post = null; }
      if (!post) { toast('No encuentro ese artículo'); location.hash = '#/'; return; }
    }
    shell(`
      <div class="a-head"><div><a class="a-btn-sm" href="#/">${icon('arrow-left')} Volver a mis artículos</a></div></div>
      <form class="ed" id="ed" novalidate>
        <div class="ed-main">
          <div class="a-field"><label for="e-title">Título</label><input class="a-input a-title-input" id="e-title" value="${esc(post.title)}" placeholder="Un título claro y corto" required><span class="a-error" id="e-title-err"></span></div>
          <div class="a-field">
            <span class="a-label">Foto de portada</span>
            <div id="cover"></div>
          </div>
          <div class="a-field"><label for="e-excerpt">Resumen</label><span class="hint">Una o dos frases. Es lo que se ve en la lista del blog.</span>
            <textarea class="a-textarea" id="e-excerpt" maxlength="240" placeholder="¿De qué trata el artículo?">${esc(post.excerpt)}</textarea><span class="count" id="e-count"></span></div>
          <div class="a-field"><span class="a-label" id="e-body-l">Texto del artículo</span><span class="hint">Para añadir una foto dentro del texto, pulsa el botón de imagen de la barra o arrástrala aquí.</span>
            <div class="editor-wrap"><div id="editor"></div></div></div>
        </div>
        <aside class="ed-side">
          <div class="box"><h3>Estado</h3>
            <div class="status-toggle" role="radiogroup" aria-label="Estado del artículo">
              <label><input type="radio" name="status" value="draft" ${post.status !== 'published' ? 'checked' : ''}>Borrador</label>
              <label><input type="radio" name="status" value="published" ${post.status === 'published' ? 'checked' : ''}>Publicado</label>
            </div>
            <p class="hint" style="margin:10px 0 0;font-size:.88rem;color:var(--ink-soft)">Un borrador solo lo ves tú. Publicado aparece en el blog.</p>
          </div>
          <div class="box ed-buttons">
            <button class="btn" type="submit" id="e-save">${icon('device-floppy')} Guardar</button>
            <button class="btn btn--ghost" type="button" id="e-preview">${icon('eye')} Vista previa</button>
            <p class="saved-note" id="e-note" role="status"></p>
          </div>
          <div class="box"><h3>Consejos</h3><ul class="tips">
            <li>Las fotos se reducen solas: puedes usar las del móvil tal cual.</li>
            <li>Usa «Título» en la barra para separar partes del texto.</li>
            <li>Lo que escribes se guarda en este equipo mientras tanto, por si se cierra la ventana.</li>
          </ul></div>
        </aside>
      </form>`);

    // Recuperar texto no guardado
    const DRAFT_KEY = 'jmn_editor_' + (id || 'nuevo');
    let backup = null;
    try { backup = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (e) { backup = null; }

    const quill = new Quill('#editor', {
      theme: 'snow',
      placeholder: 'Escribe aquí tu artículo…',
      modules: {
        toolbar: {
          container: [[{ header: [2, 3, false] }], ['bold', 'italic', 'link'], ['blockquote', { list: 'ordered' }, { list: 'bullet' }], ['image'], ['clean']],
          handlers: { image: () => pickFile((f) => insertImage(f)) }
        }
      }
    });
    quill.root.setAttribute('aria-labelledby', 'e-body-l');
    const titles = { 'ql-bold': 'Negrita', 'ql-italic': 'Cursiva', 'ql-link': 'Enlace', 'ql-blockquote': 'Cita destacada', 'ql-image': 'Insertar foto', 'ql-clean': 'Quitar formato' };
    Object.entries(titles).forEach(([c, t]) => document.querySelectorAll('.ql-toolbar .' + c).forEach((b) => { b.title = t; b.setAttribute('aria-label', t); }));
    document.querySelectorAll('.ql-toolbar .ql-list').forEach((b) => { const t = b.value === 'ordered' ? 'Lista numerada' : 'Lista'; b.title = t; b.setAttribute('aria-label', t); });
    quill.clipboard.dangerouslyPasteHTML(Blog.fixPaths(post.content_html || ''));

    if (backup && backup.saved_at && (!post.updated_at || new Date(backup.saved_at) > new Date(post.updated_at))) {
      if (await confirmBox('Hay un texto sin guardar', 'La última vez dejaste cambios sin guardar en este artículo. ¿Quieres recuperarlos?', 'Recuperar')) {
        $('#e-title').value = backup.title || '';
        $('#e-excerpt').value = backup.excerpt || '';
        post.cover_url = backup.cover_url || post.cover_url;
        quill.clipboard.dangerouslyPasteHTML(backup.content_html || '');
        dirty = true;
      } else localStorage.removeItem(DRAFT_KEY);
    }

    function pickFile(cb) {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = () => inp.files[0] && cb(inp.files[0]);
      inp.click();
    }
    async function insertImage(file) {
      const range = quill.getSelection(true) || { index: quill.getLength() };
      const note = $('#e-note');
      note.textContent = 'Subiendo la foto…';
      try {
        const url = await Blog.uploadImage(file);
        quill.insertEmbed(range.index, 'image', url, 'user');
        quill.setSelection(range.index + 1);
        note.textContent = 'Foto añadida';
        markDirty();
      } catch (ex) { note.textContent = ''; toast(errMsg(ex)); }
    }
    // Arrastrar o pegar fotos en el texto: se suben en lugar de incrustarse
    quill.root.addEventListener('drop', (e) => {
      const f = [...(e.dataTransfer?.files || [])].find((x) => x.type.startsWith('image/'));
      if (f) { e.preventDefault(); e.stopPropagation(); insertImage(f); }
    }, true);
    quill.root.addEventListener('paste', (e) => {
      const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith('image/'));
      if (f) { e.preventDefault(); e.stopPropagation(); insertImage(f); }
    }, true);

    // Portada
    function renderCover() {
      const c = $('#cover');
      if (post.cover_url) {
        c.innerHTML = `<div class="cover-prev"><img src="${esc(Blog.fixUrl(post.cover_url))}" alt="Portada del artículo"><div class="cover-actions">
          <button class="a-btn-sm" type="button" id="c-change">${icon('photo')} Cambiar</button><button class="a-btn-sm danger" type="button" id="c-remove">${icon('trash')} Quitar</button></div></div>`;
        $('#c-change').onclick = () => pickFile(uploadCover);
        $('#c-remove').onclick = () => { post.cover_url = ''; renderCover(); markDirty(); };
      } else {
        c.innerHTML = `<label class="drop" id="drop">${'<input type="file" accept="image/*" id="c-file" aria-label="Elegir foto de portada">'}<div>${icon('upload')}<strong>Arrastra una foto aquí</strong><span>o pulsa para elegirla</span></div></label>`;
        const d = $('#drop');
        $('#c-file').onchange = (e) => e.target.files[0] && uploadCover(e.target.files[0]);
        ['dragenter', 'dragover'].forEach((t) => d.addEventListener(t, (e) => { e.preventDefault(); d.classList.add('is-over'); }));
        ['dragleave', 'drop'].forEach((t) => d.addEventListener(t, () => d.classList.remove('is-over')));
        d.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) uploadCover(f); });
      }
    }
    async function uploadCover(file) {
      const c = $('#cover');
      c.classList.add('is-loading');
      try { post.cover_url = await Blog.uploadImage(file); markDirty(); }
      catch (ex) { toast(errMsg(ex)); }
      finally { c.classList.remove('is-loading'); renderCover(); }
    }
    renderCover();

    const ex = $('#e-excerpt');
    const count = () => { $('#e-count').textContent = `${ex.value.length} / 240`; };
    count();
    ex.addEventListener('input', count);

    function collect() {
      return {
        ...post,
        title: $('#e-title').value,
        excerpt: $('#e-excerpt').value,
        content_html: quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML.replace(/ class="ql-[^"]*"/g, '').replace(/(src|href)="\.\.\/assets\//g, '$1="assets/'),
        status: $('input[name="status"]:checked').value
      };
    }
    let backupTimer;
    function markDirty() {
      dirty = true;
      $('#e-note').textContent = 'Cambios sin guardar';
      clearTimeout(backupTimer);
      backupTimer = setTimeout(() => {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...collect(), saved_at: new Date().toISOString() })); } catch (e) { /* sin espacio */ }
      }, 800);
    }
    quill.on('text-change', (d, o, source) => { if (source === 'user') markDirty(); });
    $('#e-title').addEventListener('input', markDirty);
    ex.addEventListener('input', markDirty);
    document.querySelectorAll('input[name="status"]').forEach((r) => r.addEventListener('change', markDirty));

    $('#ed').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = collect();
      const tErr = $('#e-title-err');
      if (!data.title.trim()) { tErr.textContent = 'Ponle un título al artículo.'; $('#e-title').focus(); return; }
      tErr.textContent = '';
      if (data.status === 'published' && !data.content_html.replace(/<[^>]+>/g, '').trim()) { toast('El artículo está vacío: escribe algo antes de publicarlo.'); return; }
      const btn = $('#e-save');
      btn.disabled = true;
      $('#e-note').textContent = 'Guardando…';
      try {
        const saved = await Blog.savePost(data);
        post = saved;
        dirty = false;
        localStorage.removeItem(DRAFT_KEY);
        $('#e-note').textContent = saved.status === 'published' ? 'Guardado y publicado' : 'Guardado como borrador';
        toast(saved.status === 'published' ? 'Publicado en el blog' : 'Borrador guardado');
        if (!id) { history.replaceState(null, '', '#/editar/' + encodeURIComponent(saved.id)); id = saved.id; }
      } catch (ex2) {
        $('#e-note').textContent = '';
        toast(errMsg(ex2));
      } finally { btn.disabled = false; }
    });

    $('#e-preview').addEventListener('click', () => {
      const p = collect();
      const wrap = document.createElement('div');
      wrap.className = 'preview';
      wrap.innerHTML = `<div class="preview-bar"><span>Vista previa${p.status === 'published' ? '' : ' (borrador)'}</span><button class="btn btn--yellow" type="button" id="pv-close">${icon('x')} Cerrar</button></div>
        <header class="article-head" style="padding-top:48px"><div class="wrap"><h1>${esc(p.title || 'Sin título')}</h1>${p.excerpt ? `<p class="excerpt">${esc(p.excerpt)}</p>` : '<div style="height:30px"></div>'}</div></header>
        ${p.cover_url ? `<div class="cover-band"><div class="article-cover"><img src="${esc(Blog.fixUrl(p.cover_url))}" alt=""></div></div>` : ''}
        <div class="article-body"><div class="prose">${Blog.sanitize(Blog.fixPaths(p.content_html))}</div></div>`;
      document.body.appendChild(wrap);
      const close = () => { wrap.remove(); $('#e-preview').focus(); };
      $('#pv-close').onclick = close;
      wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
      $('#pv-close').focus();
    });
    if (!id) $('#e-title').focus();
  }

  // ---------------------------------------------------------- Rutas
  async function route() {
    session = await Blog.getSession();
    if (!session) return viewLogin();
    const h = location.hash;
    if (h.startsWith('#/editar/')) return viewEditor(decodeURIComponent(h.slice(9)));
    if (h === '#/nuevo') return viewEditor(null);
    return viewList();
  }
  let lastHash = location.hash;
  window.addEventListener('hashchange', async () => {
    if (dirty && !(await confirmBox('¿Salir sin guardar?', 'Tienes cambios sin guardar en este artículo.', 'Salir sin guardar', true))) {
      history.replaceState(null, '', lastHash); return;
    }
    dirty = false; lastHash = location.hash; route();
  });
  route();
})();
