/* Comportamiento común a todas las páginas públicas. */
(function () {
  const ROOT = window.SITE_ROOT || '';
  const cfg = window.SITE_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  if (!hasGsap) document.documentElement.classList.remove('motion');

  const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="${ROOT}assets/img/icons.svg#i-${name}"></use></svg>`;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Dado 3D reutilizable (portada y juego)
  const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  function dieFaces() {
    return [1, 2, 3, 4, 5, 6].map((f) => `<div class="die-face f${f}">${PIPS[f].map((p) => `<i style="grid-area:${Math.ceil(p / 3)} / ${((p - 1) % 3) + 1}"></i>`).join('')}</div>`).join('');
  }
  // Rotación que deja la cara v mirando al frente
  const FACE_ROT = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };

  // Scroll suave
  let lenis = null;
  if (hasGsap && !reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((t) => lenis.raf(t * 1000));
    window.gsap.ticker.lagSmoothing(0);
  }
  if (hasGsap) window.gsap.registerPlugin(window.ScrollTrigger);

  function scrollToTarget(target, offset = 0) {
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
    else if (typeof target === 'number') window.scrollTo({ top: target + offset, behavior: reduce ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  // Navegación
  const nav = $('#nav');
  const menuBtn = $('.nav .menu-btn');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn && menuBtn.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('a', menu)?.focus();
  }
  menuBtn && menuBtn.addEventListener('click', () => setMenu(true));
  $('.menu-close')?.addEventListener('click', () => { setMenu(false); menuBtn?.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu?.classList.contains('is-open')) setMenu(false); });
  menu && $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  if (nav && hasGsap) {
    const solidFrom = nav.dataset.solidFrom;
    window.ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate(self) {
        const y = self.scroll();
        const threshold = solidFrom && $(solidFrom) && innerWidth > 900 ? $(solidFrom).getBoundingClientRect().top + y - 70 : 40;
        nav.classList.toggle('is-solid', y > threshold);
        nav.classList.toggle('is-hidden', self.direction === 1 && y > 600 && !menu?.classList.contains('is-open'));
      }
    });
  } else if (nav) nav.classList.add('is-solid');

  // Enlaces internos con scroll suave (las páginas pueden registrar destinos especiales)
  const specialTargets = {};
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    if (specialTargets[id]) { e.preventDefault(); specialTargets[id](); history.replaceState(null, '', '#' + id); return; }
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    scrollToTarget(el, id === 'inicio' ? 0 : -10);
    history.replaceState(null, '', '#' + id);
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  });

  // Toast
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 3600);
  }

  // Redes sociales (solo las configuradas)
  const socialsEl = $('#socials');
  if (socialsEl) {
    const s = cfg.SOCIAL || {};
    const labels = { instagram: 'Instagram', whatsapp: 'WhatsApp', facebook: 'Facebook', linkedin: 'LinkedIn' };
    socialsEl.innerHTML = Object.keys(labels).filter((k) => s[k]).map((k) =>
      `<li><a href="${esc(s[k])}" target="_blank" rel="noopener" aria-label="${labels[k]}">${icon('brand-' + k)}</a></li>`).join('');
  }
  const mail = cfg.CONTACT_EMAIL;
  $$('[data-mail]').forEach((a) => { a.href = 'mailto:' + mail; a.textContent = mail; });

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Formulario de contacto
  const form = $('#contact-form');
  if (form) {
    const status = $('#f-status');
    const fields = [
      ['f-name', (v) => v.trim().length > 1, 'Escribe tu nombre.'],
      ['f-email', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), 'Revisa el correo: falta algo (por ejemplo, la @).'],
      ['f-msg', (v) => v.trim().length > 9, 'Cuéntame un poco más (mínimo 10 caracteres).']
    ];
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let ok = true, first = null;
      fields.forEach(([id, test, msg]) => {
        const input = $('#' + id);
        const good = test(input.value);
        input.closest('.field').classList.toggle('has-error', !good);
        input.setAttribute('aria-invalid', String(!good));
        $('#' + id + '-err').textContent = good ? '' : msg;
        if (!good) { ok = false; first = first || input; }
      });
      const consent = $('#f-ok');
      $('#f-ok-err').textContent = consent.checked ? '' : 'Necesito tu permiso para poder responderte.';
      if (!consent.checked) { ok = false; first = first || consent; }
      if (!ok) { first.focus(); status.className = 'form-status ko'; status.textContent = 'Revisa los campos marcados.'; return; }

      const data = {
        name: $('#f-name').value.trim(), email: $('#f-email').value.trim(),
        topic: $('#f-topic').value, message: $('#f-msg').value.trim()
      };
      if (!cfg.WEB3FORMS_KEY) {
        const body = `${data.message}\n\n${data.name}\n${data.email}`;
        location.href = `mailto:${mail}?subject=${encodeURIComponent('Web: ' + data.topic)}&body=${encodeURIComponent(body)}`;
        status.className = 'form-status ok';
        status.textContent = 'Se ha abierto tu programa de correo con el mensaje listo. Solo tienes que enviarlo.';
        return;
      }
      const btn = $('#f-send');
      btn.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Enviando…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ access_key: cfg.WEB3FORMS_KEY, subject: 'Web: ' + data.topic, from_name: 'soyjosemarianavarro.com', ...data, botcheck: form.botcheck.checked })
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Mensaje enviado. Te responderé lo antes posible.';
      } catch (err) {
        status.className = 'form-status ko';
        status.textContent = `No se ha podido enviar. Escríbeme directamente a ${mail}.`;
      } finally { btn.disabled = false; }
    });
  }

  // Revelados suaves al entrar en pantalla
  if (hasGsap && !reduce) {
    window.ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: (els) => window.gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true })
    });
  } else {
    $$('[data-reveal]').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  window.Site = { $, $$, icon, esc, toast, dieFaces, FACE_ROT, scrollToTarget, specialTargets, reduce, hasGsap, get lenis() { return lenis; } };
})();
