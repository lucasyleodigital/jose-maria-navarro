/* El tablero en espiral de la portada y el recorrido por la vida de José María.
   La cámara es un punto fijo con perspectiva; el tablero se desplaza debajo para
   que la casilla activa quede en el centro, y el mago-ficha salta de casilla en casilla. */
(function () {
  const { $, $$, dieFaces, reduce, hasGsap, scrollToTarget, specialTargets } = window.Site;
  const board = $('#board');
  if (!board) return;
  const ROOT = window.SITE_ROOT || '';
  const tilt = $('#tilt');
  const N = 7;
  const TOTAL = N * N;

  // Orden en espiral: de la casilla 1 (arriba a la izquierda) hacia el centro.
  function spiral(n) {
    const out = [];
    let top = 0, left = 0, bottom = n - 1, right = n - 1;
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) out.push([c, top]);
      top++;
      for (let r = top; r <= bottom; r++) out.push([right, r]);
      right--;
      if (top <= bottom) { for (let c = right; c >= left; c--) out.push([c, bottom]); bottom--; }
      if (left <= right) { for (let r = bottom; r >= top; r--) out.push([left, r]); left++; }
    }
    return out;
  }
  const order = spiral(N);
  const caps = $$('#capitulos .cap');
  const stops = caps.map((li) => ({ cell: Number(li.dataset.cell), color: li.dataset.color, yr: li.dataset.yr || '' }));
  const stopAt = new Map(stops.map((s) => [s.cell, s]));

  // Casillas decorativas del mundo vial (no son paradas del recorrido)
  const ZEBRA = new Set([4, 16, 28, 40]);
  const GLYPH = {
    10: 'stop', 22: 'semaforo', 34: 'peligro', 46: 'ceda',
    3: 'peligro', 9: 'prohibido', 15: 'obligacion', 21: 'ceda', 27: 'stop', 33: 'semaforo', 39: 'prohibido', 45: 'obligacion'
  };
  const SIGNS = {
    stop: '<svg class="glyph" viewBox="0 0 60 60"><polygon points="19,4 41,4 56,19 56,41 41,56 19,56 4,41 4,19" fill="#b4442e" stroke="#17181c" stroke-width="3"/><text x="30" y="36" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="800" font-size="15" fill="#fffefa">STOP</text></svg>',
    semaforo: '<svg class="glyph" viewBox="0 0 60 60"><rect x="18" y="3" width="24" height="54" rx="8" fill="#17181c"/><circle cx="30" cy="15" r="6" fill="#b4442e"/><circle cx="30" cy="30" r="6" fill="#6a5512"/><circle cx="30" cy="45" r="6" fill="#1f5a35"/></svg>',
    peligro: '<svg class="glyph" viewBox="0 0 60 60"><polygon points="30,5 56,52 4,52" fill="#fffefa" stroke="#b4442e" stroke-width="6" stroke-linejoin="round"/><rect x="27.5" y="22" width="5" height="16" rx="2" fill="#17181c"/><circle cx="30" cy="44" r="3" fill="#17181c"/></svg>',
    ceda: '<svg class="glyph" viewBox="0 0 60 60"><polygon points="4,8 56,8 30,54" fill="#fffefa" stroke="#b4442e" stroke-width="6" stroke-linejoin="round"/></svg>',
    prohibido: '<svg class="glyph" viewBox="0 0 60 60"><circle cx="30" cy="30" r="25" fill="#fffefa" stroke="#b4442e" stroke-width="7"/></svg>',
    obligacion: '<svg class="glyph" viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="#1f2f5a"/><path d="M30 44V18M20 28l10-10 10 10" fill="none" stroke="#fffefa" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    estrella: '<svg class="glyph" viewBox="0 0 60 60"><polygon points="30,4 37.6,21.6 56,23 42,35.4 46.2,54 30,44.2 13.8,54 18,35.4 4,23 22.4,21.6" fill="#1f2f5a" stroke="#17181c" stroke-width="3" stroke-linejoin="round"/></svg>'
  };

  // Medidas del tablero (deben coincidir con el CSS)
  const C = 112, G = 10, PAD = 24;
  const W = C * N + G * (N - 1) + PAD * 2;
  const cellXY = (i) => { const [c, r] = order[i - 1]; return [PAD + c * (C + G), PAD + r * (C + G)]; };
  const cellCenter = (i) => { const [x, y] = cellXY(i); return [x + C / 2, y + C / 2]; };

  // Carretera bajo las casillas
  const pts = order.map((_, k) => cellCenter(k + 1).join(',')).join(' ');
  let html = `<svg class="board-path" viewBox="0 0 ${W} ${W}" aria-hidden="true"><polyline class="road" points="${pts}"/><polyline class="lane" points="${pts}"/></svg>`;
  for (let i = 1; i <= TOTAL; i++) {
    const [x, y] = cellXY(i);
    const s = stopAt.get(i);
    let cls = 'cell', inner = `<span class="n">${i}</span>`;
    if (i === TOTAL) { cls += ' cell--meta'; inner = SIGNS.estrella + '<span class="meta-label">META</span>'; }
    else if (s) { cls += ` cell--stop c-${s.color}`; inner += `<span class="yr">${s.yr}</span>`; }
    else if (ZEBRA.has(i)) cls += ' cell--zebra';
    else if (GLYPH[i]) inner += SIGNS[GLYPH[i]];
    else if (i % 2) cls += ' cell--a';
    html += `<div class="${cls}" data-i="${i}" style="left:${x}px;top:${y}px">${inner}</div>`;
  }
  html += `<div class="token" id="token"><div class="token-shadow"></div></div>`;
  board.innerHTML = html;
  const cells = $$('.cell', board);
  const token = $('#token');
  // El mago se dibuja en 2D encima de la escena, siempre de pie, proyectado sobre la ficha.
  const sprite = document.createElement('div');
  sprite.className = 'token-sprite';
  sprite.innerHTML = `<img src="${ROOT}assets/img/mago.webp" alt="" width="230" height="365">`;
  $('.scene').appendChild(sprite);
  const lift = { h: 0 };
  function drawSprite() {
    const r = token.getBoundingClientRect();
    const host = sprite.parentElement.getBoundingClientRect();
    const k = r.width / C; // escala proyectada de la casilla
    const x = r.left + r.width / 2 - host.left;
    const y = r.top + r.height * 0.58 - host.top - lift.h * k;
    sprite.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${Math.min(1.05, Math.max(0.5, k * 0.62))})`;
  }
  const die = $('#die');
  if (die) die.innerHTML = dieFaces();
  const hud = $('#hud-label');

  const placeToken = (i) => { const [x, y] = cellXY(i); token.style.transform = `translate3d(${x}px, ${y}px, 0)`; };
  placeToken(1);
  requestAnimationFrame(drawSprite);
  window.addEventListener('resize', drawSprite);

  if (!hasGsap || reduce) return;
  const gsap = window.gsap;
  board.style.transform = 'none';
  gsap.set(board, { x: -W / 2, y: -W / 2 });
  gsap.set(token, { x: cellXY(1)[0], y: cellXY(1)[1] });
  gsap.ticker.add(drawSprite);

  const heroCopy = $('.hero-copy');
  const skip = $('#skip-tour');
  const cam = $('.cam');
  const proxy = { cell: 1 };
  let lastCell = 0;

  function onCell() {
    const c = Math.round(proxy.cell);
    if (c === lastCell) return;
    lastCell = c;
    cells.forEach((el) => el.classList.toggle('is-visited', Number(el.dataset.i) < c));
    const s = stopAt.get(c);
    if (hud) hud.textContent = c === 1 ? 'Salida' : c === TOTAL ? 'Meta' : s ? `Casilla ${c}` : `Casilla ${c} de ${TOTAL}`;
  }

  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 901px)', mob: '(max-width: 900px)' }, (ctx) => {
    const { desk } = ctx.conditions;
    const V = desk
      ? { hero: { rx: 54, rz: 64, s: 0.64 }, tour: { rx: 50, rz: -18, s: 1.25 }, end: { rx: 38, rz: -10, s: 0.62 }, camTop: '56%', camTourTop: '54%', camLeft: '73%', camTourLeft: '64%', camEndLeft: '66%' }
      : { hero: { rx: 54, rz: 64, s: 0.5 }, tour: { rx: 50, rz: -18, s: 0.82 }, end: { rx: 40, rz: -12, s: 0.42 }, camTop: '83%', camTourTop: '34%', camLeft: '52%', camTourLeft: '50%', camEndLeft: '50%' };
    const deg = (v) => v + 'deg';

    gsap.set(tilt, { '--rx': deg(V.hero.rx), '--rz': deg(V.hero.rz), '--s': V.hero.s });
    gsap.set(cam, { top: V.camTop, left: V.camLeft });
    gsap.set(caps, { autoAlpha: 0 });
    gsap.set('#outro', { autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    // 0. Salida: el título se aparta y la cámara baja hasta la casilla 1
    tl.addLabel('hero');
    tl.to(heroCopy, { autoAlpha: 0, x: desk ? -80 : 0, y: desk ? 0 : -40, filter: 'blur(10px)', duration: 0.6, ease: 'power2.in' }, 0)
      .to(skip, { autoAlpha: 0, duration: 0.3 }, 0)
      .to(tilt, { '--rx': deg(V.tour.rx), '--rz': deg(V.tour.rz), '--s': V.tour.s, duration: 1 }, 0)
      .to(cam, { top: V.camTourTop, left: V.camTourLeft, duration: 1 }, 0)
      .to(board, { x: -cellCenter(1)[0], y: -cellCenter(1)[1], duration: 1 }, 0)
      .fromTo(caps[0], { autoAlpha: 0, y: 40, clipPath: 'inset(0% 0% 100% 0% round 18px)' }, { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 0.6, ease: 'expo.out' }, 0.55)
      .addLabel('stop0');

    // 1..n. Cada tirada: seis saltos de casilla, la cámara sigue a la ficha y cambia la carta
    for (let k = 1; k < stops.length; k++) {
      const from = stops[k - 1].cell, to = stops[k].cell;
      const start = tl.duration() + 0.9; // pausa para leer la carta
      tl.to(caps[k - 1], { autoAlpha: 0, y: -30, filter: 'blur(6px)', duration: 0.3, ease: 'power2.in' }, start + 0.95);
      const hops = to - from;
      const hopDur = 1.6 / hops;
      for (let h = 1; h <= hops; h++) {
        const [x, y] = cellXY(from + h);
        const t = start + (h - 1) * hopDur;
        tl.to(token, { x, y, duration: hopDur, ease: 'none' }, t)
          .to(lift, { h: 42, duration: hopDur / 2, ease: 'power2.out' }, t)
          .to(lift, { h: 0, duration: hopDur / 2, ease: 'power2.in' }, t + hopDur / 2);
      }
      tl.to(proxy, { cell: to, duration: 1.6, ease: 'none', onUpdate: onCell }, start)
        .to(board, { x: -cellCenter(to)[0], y: -cellCenter(to)[1], duration: 1.6, ease: 'power1.inOut' }, start)
        .to(die, { rotationX: '+=' + (180 + k * 90), rotationY: '+=' + 270, duration: 1.6, ease: 'power1.inOut' }, start)
        .fromTo(caps[k], { autoAlpha: 0, y: 40, filter: 'blur(0px)', clipPath: 'inset(0% 0% 100% 0% round 18px)' }, { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 0.5, ease: 'expo.out' }, start + 1.2)
        .addLabel('stop' + k);
    }
    // Final: la carta se retira y la cámara se aleja para ver el tablero recorrido entero
    const endAt = tl.duration() + 0.9;
    const outro = $('#outro');
    tl.to(caps[caps.length - 1], { autoAlpha: 0, y: -30, duration: 0.4, ease: 'power2.in' }, endAt)
      .fromTo(outro, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, endAt + 0.45)
      .to(tilt, { '--rx': deg(V.end.rx), '--rz': deg(V.end.rz), '--s': V.end.s, duration: 1 }, endAt)
      .to(cam, { left: V.camEndLeft, top: desk ? '52%' : '45%', duration: 1 }, endAt)
      .to(board, { x: -W / 2, y: -W / 2, duration: 1 }, endAt)
      .to({}, { duration: 0.6 })
      .addLabel('end');

    const st = window.ScrollTrigger.create({
      trigger: '.stage-pin', start: 'top top', end: () => '+=' + Math.round(window.innerHeight * (desk ? 12 : 11)),
      pin: true, scrub: 0.8, animation: tl, anticipatePin: 1, invalidateOnRefresh: true,
      // Al dejar de hacer scroll, el recorrido se detiene en la carta más cercana, entera y quieta
      snap: { snapTo: 'labels', duration: { min: 0.35, max: 0.9 }, delay: 0.12, ease: 'power2.inOut' }
    });

    window.__tour = { tl, st };
    // Enlace directo a una carta del recorrido: #parada-1 ... #parada-9
    const m = location.hash.match(/^#parada-(\d)$/);
    if (m) requestAnimationFrame(() => {
      const k = Math.min(stops.length, Number(m[1])) - 1;
      const t = tl.labels['stop' + k];
      window.scrollTo(0, st.start + (st.end - st.start) * t / tl.duration());
      window.ScrollTrigger.update();
    });
    // "Quién soy" lleva directamente a la primera casilla del recorrido
    specialTargets['quien-soy'] = () => {
      const p = tl.labels.stop0 / tl.duration();
      scrollToTarget(st.start + (st.end - st.start) * p + 2);
    };
    return () => { delete specialTargets['quien-soy']; };
  });
})();
