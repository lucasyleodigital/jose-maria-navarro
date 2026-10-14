/* Capa de datos del blog.
   - Con Supabase configurado (config.js): artículos en la tabla `posts`, imágenes en Storage.
   - Sin configurar: modo demostración. Artículos iniciales + lo que se escriba en este navegador. */
(function () {
  const cfg = window.SITE_CONFIG || {};
  const ROOT = window.SITE_ROOT || '';
  const DEMO_KEY = 'jmn_demo_posts_v1';
  const live = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const sb = live ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  const seeds = () => (window.SEED_POSTS || []).map((p) => ({ ...p, seed: true }));

  function readDemo() {
    try { return JSON.parse(localStorage.getItem(DEMO_KEY) || '[]'); } catch (e) { return []; }
  }
  function writeDemo(list) {
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(list)); }
    catch (e) { throw new Error('El navegador no tiene espacio para guardar más en modo demostración. Prueba con imágenes más pequeñas.'); }
  }
  function demoAll() {
    const own = readDemo();
    const ids = new Set(own.map((p) => p.id));
    return own.concat(seeds().filter((p) => !ids.has(p.id)));
  }
  const byDate = (a, b) => new Date(b.published_at || b.updated_at || 0) - new Date(a.published_at || a.updated_at || 0);

  function slugify(s) {
    return (s || 'articulo').toString().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'articulo';
  }

  // Rutas relativas guardadas como "assets/..." funcionan desde cualquier carpeta.
  function fixPaths(html) {
    return (html || '').replace(/(src|href)="assets\//g, `$1="${ROOT}assets/`);
  }
  function fixUrl(u) { return u && u.startsWith('assets/') ? ROOT + u : u; }

  function readingMinutes(html) {
    const words = (html || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }

  function formatDate(p) {
    if (p.date_label) return p.date_label;
    const d = new Date(p.published_at || p.updated_at || Date.now());
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  async function listPosts({ drafts = false } = {}) {
    if (live) {
      let q = sb.from('posts').select('id,slug,title,excerpt,cover_url,status,published_at,updated_at,date_label').order('published_at', { ascending: false, nullsFirst: true });
      if (!drafts) q = q.eq('status', 'published');
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }
    return demoAll().filter((p) => p.status !== 'deleted' && (drafts || p.status === 'published')).sort(byDate);
  }

  async function getPost(slug) {
    if (live) {
      const { data, error } = await sb.from('posts').select('*').eq('slug', slug).maybeSingle();
      if (error) throw error;
      return data;
    }
    return demoAll().find((p) => p.slug === slug && p.status !== 'deleted') || null;
  }

  async function getPostById(id) {
    if (live) {
      const { data, error } = await sb.from('posts').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    }
    return demoAll().find((p) => p.id === id) || null;
  }

  async function uniqueSlug(base, id) {
    const all = await listPosts({ drafts: true });
    let slug = base, n = 2;
    while (all.some((p) => p.slug === slug && p.id !== id)) slug = `${base}-${n++}`;
    return slug;
  }

  async function savePost(post) {
    const now = new Date().toISOString();
    const clean = {
      title: post.title.trim(),
      excerpt: (post.excerpt || '').trim(),
      cover_url: post.cover_url || null,
      content_html: post.content_html || '',
      status: post.status === 'published' ? 'published' : 'draft',
      date_label: post.date_label || null,
      updated_at: now
    };
    clean.slug = await uniqueSlug(post.slug ? slugify(post.slug) : slugify(post.title), post.id);
    if (clean.status === 'published') clean.published_at = post.published_at || now;
    else clean.published_at = post.published_at || null;

    if (live) {
      const res = post.id
        ? await sb.from('posts').update(clean).eq('id', post.id).select().single()
        : await sb.from('posts').insert(clean).select().single();
      if (res.error) throw res.error;
      return res.data;
    }
    const list = readDemo();
    const id = post.id || `demo-${Date.now().toString(36)}`;
    const saved = { ...clean, id };
    const i = list.findIndex((p) => p.id === id);
    if (i >= 0) list[i] = saved; else list.unshift(saved);
    writeDemo(list);
    return saved;
  }

  async function deletePost(id) {
    if (live) {
      const { error } = await sb.from('posts').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const list = readDemo().filter((p) => p.id !== id);
    // Un artículo inicial borrado en demo se oculta guardando una marca.
    if (id.startsWith('seed-')) {
      const s = seeds().find((p) => p.id === id);
      if (s) list.push({ ...s, status: 'deleted' });
    }
    writeDemo(list);
  }

  // Reduce la imagen en el navegador antes de subirla: el autor puede usar fotos del móvil tal cual.
  function compressImage(file, maxSide = 1800, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) return reject(new Error('El archivo no es una imagen.'));
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen.'))), 'image/webp', quality);
      };
      img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      img.src = url;
    });
  }

  async function uploadImage(file) {
    const blob = await compressImage(file, live ? 1800 : 1100, live ? 0.82 : 0.72);
    if (live) {
      const path = `${new Date().getFullYear()}/${Date.now().toString(36)}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.webp`;
      const { error } = await sb.storage.from(cfg.STORAGE_BUCKET || 'blog').upload(path, blob, { contentType: 'image/webp', upsert: false });
      if (error) throw error;
      return sb.storage.from(cfg.STORAGE_BUCKET || 'blog').getPublicUrl(path).data.publicUrl;
    }
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  }

  // Sesión del autor
  async function getSession() {
    if (live) return (await sb.auth.getSession()).data.session;
    return sessionStorage.getItem('jmn_demo_session') ? { user: { email: 'modo demostración' } } : null;
  }
  async function signIn(email, password) {
    if (live) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'El correo o la contraseña no son correctos.' : error.message);
      return data.session;
    }
    sessionStorage.setItem('jmn_demo_session', '1');
    return getSession();
  }
  async function signOut() {
    if (live) await sb.auth.signOut();
    sessionStorage.removeItem('jmn_demo_session');
  }
  async function resetPassword(email) {
    if (!live) throw new Error('En modo demostración no hay contraseñas.');
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split('#')[0] });
    if (error) throw error;
  }

  async function importSeeds() {
    if (!live) return 0;
    const existing = await listPosts({ drafts: true });
    let n = 0;
    for (const s of seeds()) {
      if (existing.some((p) => p.slug === s.slug)) continue;
      const { seed, id, ...row } = s;
      const { error } = await sb.from('posts').insert({ ...row, updated_at: new Date().toISOString() });
      if (error) throw error;
      n++;
    }
    return n;
  }

  function sanitize(html) {
    return window.DOMPurify ? window.DOMPurify.sanitize(html, { ADD_ATTR: ['target'] }) : html;
  }

  window.Blog = {
    live, listPosts, getPost, getPostById, savePost, deletePost, uploadImage,
    getSession, signIn, signOut, resetPassword, importSeeds,
    slugify, fixPaths, fixUrl, readingMinutes, formatDate, sanitize
  };
})();
