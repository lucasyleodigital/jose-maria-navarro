/* Portada: blog, manifiesto y cartas de valores. */
(function () {
  const { $, $$, icon, esc, reduce, hasGsap } = window.Site;
  const Blog = window.Blog;
  const gsap = hasGsap ? window.gsap : null;

  // Blog en portada
  const feature = $('#blog-feature');
  const rows = $('#blog-rows');
  const url = (p) => `blog/articulo.html?slug=${encodeURIComponent(p.slug)}`;
  Blog.listPosts().then((posts) => {
    if (!posts.length) {
      feature.innerHTML = '<div class="empty">Muy pronto, nuevos artículos.</div>';
      return;
    }
    const [first, ...rest] = posts;
    feature.innerHTML = `<a class="feature" href="${url(first)}" data-reveal>
        <div class="feature-media">${first.cover_url ? `<img src="${esc(Blog.fixUrl(first.cover_url))}" alt="" loading="lazy">` : ''}</div>
        <div>
          <div class="meta-line"><span>${icon('calendar')} ${esc(Blog.formatDate(first))}</span></div>
          <h3>${esc(first.title)}</h3>
          <p>${esc(first.excerpt)}</p>
          <span class="link-arrow">Leer el artículo ${icon('arrow-right')}</span>
        </div></a>`;
    rows.innerHTML = rest.slice(0, 4).map((p) => `<li class="post-row" data-reveal><a href="${url(p)}">
        ${p.cover_url ? `<img src="${esc(Blog.fixUrl(p.cover_url))}" alt="" loading="lazy">` : `<span class="post-row-ph"></span>`}
        <span><span class="d">${esc(Blog.formatDate(p))}</span><span class="t">${esc(p.title)}</span></span></a></li>`).join('');
    if (gsap && !reduce) {
      gsap.set('#blog [data-reveal]', { opacity: 0, y: 28 });
      window.ScrollTrigger.batch('#blog [data-reveal]', { start: 'top 90%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }) });
      window.ScrollTrigger.refresh();
    }
  }).catch(() => {
    feature.innerHTML = '<div class="empty">No se han podido cargar los artículos. Vuelve a intentarlo en un momento.</div>';
  });

  if (!gsap || reduce) return;

  // Manifiesto: las palabras se encienden al leerlas
  const m = $('.manifesto');
  if (m) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    m.setAttribute('aria-label', m.textContent);
    walk(m);
    gsap.fromTo($$('.w', m), { opacity: 0.14, y: 18 }, {
      opacity: 1, y: 0, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: m, start: 'top 85%', end: 'top 35%', scrub: 0.6 }
    });
  }

  // Cartas: salen del mazo y se abren en abanico
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1001px)', () => {
    const cartas = $$('#deck .carta');
    gsap.from(cartas, {
      x: 0, y: 140, rotation: 0, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '#deck', start: 'top 80%', once: true },
      onComplete() { gsap.set(cartas, { clearProps: 'transform,opacity' }); }
    });
  });

  // Recortes de prensa y contacto
  $$('.recorte, .prensa-intro, .contacto-grid > *').forEach((el) => el.setAttribute('data-reveal', ''));
  gsap.set('.recorte, .prensa-intro, .contacto-grid > *', { opacity: 0, y: 28 });
  window.ScrollTrigger.batch('.recorte, .prensa-intro, .contacto-grid > *', { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1 }) });
})();
