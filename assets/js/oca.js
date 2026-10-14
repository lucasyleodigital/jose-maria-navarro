/* La Oca vial: juego de tablero con preguntas de educación vial.
   Las preguntas siguen el Reglamento General de Circulación y la Ley de Tráfico vigentes (2026). */
(function () {
  const { $, $$, icon, esc, dieFaces, FACE_ROT, reduce, hasGsap } = window.Site;
  const grid = $('#oca-grid');
  const panel = $('#panel');
  if (!grid || !panel) return;
  const ROOT = window.SITE_ROOT || '';
  const gsap = hasGsap ? window.gsap : null;

  const SIGN = {
    peligro: '<svg viewBox="0 0 60 60"><polygon points="30,5 56,52 4,52" fill="#fffefa" stroke="#d63a25" stroke-width="6" stroke-linejoin="round"/><rect x="27.5" y="22" width="5" height="16" rx="2" fill="#17181c"/><circle cx="30" cy="44" r="3" fill="#17181c"/></svg>',
    prohibido: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="25" fill="#fffefa" stroke="#d63a25" stroke-width="7"/></svg>',
    obligacion: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="#1d3f91"/><path d="M30 44V18M20 28l10-10 10 10" fill="none" stroke="#fffefa" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    stop: '<svg viewBox="0 0 60 60"><polygon points="19,4 41,4 56,19 56,41 41,56 19,56 4,41 4,19" fill="#d63a25" stroke="#17181c" stroke-width="2"/><polygon points="20,8 40,8 52,20 52,40 40,52 20,52 8,40 8,20" fill="none" stroke="#fffefa" stroke-width="2"/><text x="30" y="35.5" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="800" font-size="14" fill="#fffefa">STOP</text></svg>',
    ceda: '<svg viewBox="0 0 60 60"><polygon points="4,8 56,8 30,54" fill="#fffefa" stroke="#d63a25" stroke-width="6" stroke-linejoin="round"/></svg>',
    linea: '<svg viewBox="0 0 60 60"><rect x="4" y="4" width="52" height="52" rx="8" fill="#3b3c43"/><rect x="28" y="4" width="4" height="52" fill="#fffefa"/></svg>',
    ambar: '<svg viewBox="0 0 60 60"><rect x="18" y="3" width="24" height="54" rx="8" fill="#17181c"/><circle cx="30" cy="15" r="6" fill="#5a2a22"/><circle cx="30" cy="30" r="6" fill="#f4b400"/><circle cx="30" cy="45" r="6" fill="#1f3a2a"/></svg>',
    peatonal: '<svg viewBox="0 0 60 60"><rect x="16" y="3" width="28" height="54" rx="8" fill="#17181c"/><circle cx="30" cy="17" r="8" fill="#3a1d18"/><circle cx="30" cy="42" r="8" fill="#3fbf6a"/></svg>'
  };

  const KIND = {
    senales: { name: 'Aprendemos las señales', icon: 'alert-triangle' },
    calle: { name: '¿Sabemos movernos hoy?', icon: 'walk' },
    volante: { name: 'Nos movemos al volante', icon: 'steering-wheel' }
  };

  const QUESTIONS = {
    senales: [
      { sign: 'peligro', q: '¿Qué te dice una señal triangular con el borde rojo?', a: ['Que hay un peligro más adelante', 'Que algo está prohibido', 'Que es obligatorio hacer algo'], ok: 0, why: 'Las señales triangulares de borde rojo avisan de un peligro. Toca reducir la velocidad y prestar más atención.' },
      { sign: 'prohibido', q: 'Una señal redonda con el borde rojo indica…', a: ['Una recomendación', 'Una prohibición', 'Un servicio cercano'], ok: 1, why: 'Las señales circulares con borde rojo prohíben algo. Esta, vacía por dentro, prohíbe la circulación de vehículos en ambos sentidos.' },
      { sign: 'obligacion', q: 'Una señal redonda azul con una flecha blanca significa…', a: ['Dirección recomendada', 'Sentido obligatorio', 'Prohibido seguir recto'], ok: 1, why: 'Las señales redondas azules son de obligación: hay que seguir la dirección que marca la flecha.' },
      { sign: 'stop', q: 'Llegas a un STOP y no viene nadie. ¿Qué haces?', a: ['Paso despacio sin parar', 'Me detengo por completo y después sigo', 'Toco el claxon y paso'], ok: 1, why: 'El STOP obliga a detenerse siempre, aunque no venga nadie, y a ceder el paso antes de continuar.' },
      { sign: 'ceda', q: '¿Qué te pide un triángulo invertido con borde rojo?', a: ['Ceder el paso a quien circula por la otra vía', 'Detenerte siempre', 'Que está prohibido entrar'], ok: 0, why: 'Es la señal de ceda el paso: si viene alguien, tiene preferencia. Solo te detienes si hace falta.' },
      { sign: 'linea', q: '¿Se puede pisar o cruzar una línea continua?', a: ['Sí, si vas con cuidado', 'Solo para adelantar', 'No, ni pisarla ni cruzarla'], ok: 2, why: 'La línea continua no se puede pisar ni cruzar. Separa sentidos o carriles donde cambiar es peligroso.' },
      { q: 'Un agente de tráfico te indica que pases, pero el semáforo está en rojo. ¿A quién haces caso?', a: ['Al semáforo', 'Al agente', 'A las marcas del suelo'], ok: 1, why: 'Las indicaciones de los agentes están por encima de todo: después van la señalización circunstancial, los semáforos, las señales verticales y, por último, las marcas viales.' }
    ],
    calle: [
      { sign: 'peatonal', q: 'El semáforo de peatones parpadea en verde y aún no has empezado a cruzar.', a: ['Cruzo corriendo', 'Espero al siguiente verde', 'Cruzo mirando a los coches'], ok: 1, why: 'El verde intermitente avisa de que va a ponerse en rojo. Si ya estás cruzando, termina sin pararte; si no, espera.' },
      { q: 'Caminas por una carretera sin acera ni arcén preparado para peatones. ¿Por qué lado vas?', a: ['Por la izquierda, de cara a los coches', 'Por la derecha, como los coches', 'Por el centro'], ok: 0, why: 'Por la izquierda ves venir de frente a los vehículos que pasan más cerca de ti y puedes apartarte a tiempo.' },
      { q: 'De noche caminas por una carretera fuera de la ciudad. ¿Qué debes llevar?', a: ['Ropa oscura', 'Una prenda o chaleco reflectante', 'Nada especial'], ok: 1, why: 'Es obligatorio en vías interurbanas de noche o con poca visibilidad. Un conductor te ve a muchos más metros.' },
      { q: 'Vas a cruzar por un paso de peatones. ¿Qué es lo más seguro?', a: ['Cruzar directamente: tengo prioridad', 'Pararme en el bordillo, mirar y asegurarme de que los coches se detienen', 'Cruzar mirando el móvil'], ok: 1, why: 'Tener prioridad no te protege si el conductor no te ha visto. Busca su mirada antes de cruzar.' },
      { q: 'Un niño de 12 años va en bici por la ciudad. ¿Debe llevar casco?', a: ['Sí, los menores de 16 años siempre', 'Solo en carretera', 'No es obligatorio'], ok: 0, why: 'Para los menores de 16 años el casco es obligatorio en cualquier vía. Para todos, en vías interurbanas.' },
      { q: 'Un coche adelanta a una bicicleta en carretera. ¿Qué distancia lateral mínima debe dejar?', a: ['50 centímetros', '1 metro', '1,5 metros'], ok: 2, why: 'Al menos 1,5 metros. Y si la vía tiene más de un carril por sentido, hay que cambiarse de carril.' },
      { q: '¿Por dónde puede circular un patinete eléctrico?', a: ['Por la acera, despacio', 'Por la calzada o el carril bici, nunca por la acera', 'Por donde quiera'], ok: 1, why: 'Los patinetes eléctricos son vehículos: no pueden circular por aceras ni zonas peatonales.' },
      { q: 'Estás en una calle residencial (señal azul con una casa y personas jugando).', a: ['Los peatones pueden usar toda la calzada y los coches van a 20 km/h como máximo', 'Es una calle normal a 50 km/h', 'Los peatones no pueden pisar la calzada'], ok: 0, why: 'En las calles residenciales los peatones tienen prioridad, pueden usar toda la calzada y los vehículos no pasan de 20 km/h.' }
    ],
    volante: [
      { q: '¿Quién tiene que llevar el cinturón de seguridad abrochado?', a: ['Solo el conductor', 'Las personas que van delante', 'Todas las personas del coche, delante y detrás'], ok: 2, why: 'El cinturón es obligatorio en todos los asientos. Detrás también salva vidas, la tuya y la de quien va delante.' },
      { q: 'Un niño que mide menos de 135 cm viaja en coche. ¿Cómo?', a: ['Delante, con el cinturón', 'Detrás, en una silla o alzador adecuado a su talla y peso', 'En brazos de un adulto'], ok: 1, why: 'Por norma general, los menores de 135 cm van detrás y con un sistema de retención infantil adecuado.' },
      { q: '¿Por qué lado es más seguro bajar del coche?', a: ['Por el lado de la acera', 'Por el lado de la calzada', 'Da igual'], ok: 0, why: 'Bajando por el lado de la acera no te expones al tráfico que pasa.' },
      { q: '¿Cuánto alcohol es seguro beber si vas a conducir?', a: ['Una caña', 'Ninguno', 'Un vino con la comida'], ok: 1, why: 'Ninguno. Como contestó José María en El Punt en 1998: «Alcohol: mejor no tomarlo».' },
      { sign: 'ambar', q: 'El semáforo se pone en ámbar fijo. ¿Qué haces?', a: ['Acelero para pasar', 'Me detengo, salvo que ya no pueda hacerlo con seguridad', 'Es igual que el verde'], ok: 1, why: 'El ámbar significa detenerse. Solo se sigue si estás tan cerca que frenar sería peligroso.' },
      { q: 'Conduces y te llega un mensaje al móvil.', a: ['Lo leo en el siguiente semáforo en rojo', 'Lo leo rápido, es solo un momento', 'Ni lo cojo ni lo miro: si es importante, paro en un lugar seguro'], ok: 2, why: 'Está prohibido usar el móvil con la mano mientras conduces, también parado en un semáforo. Un segundo sin mirar es mucho camino a ciegas.' },
      { q: 'Velocidad máxima en una calle de ciudad con un solo carril por sentido:', a: ['50 km/h', '30 km/h', '40 km/h'], ok: 1, why: 'Desde 2021, 30 km/h en las vías urbanas de un único carril por sentido.' },
      { q: 'Un peatón ha empezado a cruzar por un paso de peatones. Tú conduces.', a: ['Me detengo y le cedo el paso', 'Paso si me da tiempo', 'Le aviso con el claxon'], ok: 0, why: 'Los conductores deben ceder el paso a los peatones en los pasos señalizados. El paso de peatones es su refugio.' }
    ]
  };

  // Tablero de 30 casillas en zigzag (6 x 5)
  const COLS = 6, CELLS = 30;
  const ZEBRA = [5, 14, 23];
  const RED = [10, 19, 27];
  const kinds = ['senales', 'calle', 'volante'];
  const type = {};
  let k = 0;
  for (let i = 1; i <= CELLS; i++) {
    if (i === 1) type[i] = 'salida';
    else if (i === CELLS) type[i] = 'meta';
    else if (ZEBRA.includes(i)) type[i] = 'zebra';
    else if (RED.includes(i)) type[i] = 'rojo';
    else type[i] = kinds[k++ % 3];
  }
  const posOf = (i) => { const r = Math.floor((i - 1) / COLS); const c = (i - 1) % COLS; return { r, c: r % 2 ? COLS - 1 - c : c }; };
  const cellIcon = { senales: 'alert-triangle', calle: 'walk', volante: 'steering-wheel' };

  let cellsHtml = '<svg class="oca-path" aria-hidden="true"><polyline class="road"/></svg>';
  const byPos = [];
  for (let i = 1; i <= CELLS; i++) { const { r, c } = posOf(i); byPos[r * COLS + c] = i; }
  byPos.forEach((i) => {
    const t = type[i];
    let inner = `<span class="n">${i}</span>`;
    let cls = 'ocell';
    if (kinds.includes(t)) { cls += ' k-' + t; inner += icon(cellIcon[t], 'glyph'); }
    else if (t === 'zebra') { cls += ' t-zebra'; }
    else if (t === 'rojo') { cls += ' t-rojo'; inner += `<span class="glyph" style="display:grid">${SIGN.ambar.replace('#f4b400', '#3a3218').replace('#5a2a22', '#d63a25')}</span><span class="lbl">Rojo</span>`; }
    else if (t === 'salida') { cls += ' t-salida'; inner += '<span class="lbl">Salida</span>' + icon('flag', 'glyph'); }
    else if (t === 'meta') { cls += ' t-meta'; inner += '<span class="lbl">Meta</span>' + icon('trophy', 'glyph'); }
    const label = { salida: 'Salida', meta: 'Meta', zebra: 'Paso de cebra', rojo: 'Semáforo en rojo' }[t] || KIND[t].name;
    cellsHtml += `<div class="${cls}" data-i="${i}" role="img" aria-label="Casilla ${i}: ${label}">${inner}</div>`;
  });
  cellsHtml += `<div class="ficha" id="ficha"><img src="${ROOT}assets/img/mago.webp" alt="" width="230" height="365"></div>`;
  grid.innerHTML = cellsHtml;
  const cellEl = (i) => grid.querySelector(`.ocell[data-i="${i}"]`);
  const ficha = $('#ficha');

  function centerOf(i) {
    const el = cellEl(i);
    return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight * 0.62 };
  }
  function drawRoad() {
    const pts = [];
    for (let i = 1; i <= CELLS; i++) { const el = cellEl(i); pts.push(`${el.offsetLeft + el.offsetWidth / 2},${el.offsetTop + el.offsetHeight / 2}`); }
    grid.querySelector('.oca-path .road').setAttribute('points', pts.join(' '));
  }
  function placeFicha(i) { const { x, y } = centerOf(i); if (gsap) gsap.set(ficha, { x, y }); else ficha.style.transform = `translate(${x}px, ${y}px)`; }

  // Estado
  const SAVE = 'jmn_oca_v1';
  let S;
  function fresh() { return { pos: 1, rolls: 0, waits: 0, right: 0, asked: 0, used: { senales: [], calle: [], volante: [] }, phase: 'start' }; }
  try { S = JSON.parse(localStorage.getItem(SAVE)) || fresh(); } catch (e) { S = fresh(); }
  if (S.phase !== 'end') S.phase = S.rolls ? 'roll' : 'start';
  const save = () => { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ } };

  function markCells() {
    $$('.ocell', grid).forEach((el) => {
      const i = Number(el.dataset.i);
      el.classList.toggle('is-here', i === S.pos);
      el.classList.toggle('is-done', i < S.pos);
    });
  }

  const statsHtml = () => `<div class="panel-stats">
      <span class="stat">${icon('flag')} Casilla ${S.pos} de ${CELLS}</span>
      <span class="stat">${icon('dice-5')} ${S.rolls} tiradas</span>
      <span class="stat">${icon('check')} ${S.right} de ${S.asked} aciertos</span></div>`;
  const dieHtml = (id = 'oca-die') => `<div class="die roll-die"><div class="die-cube" id="${id}">${dieFaces()}</div></div>`;

  function render(view) { panel.innerHTML = statsHtml() + `<div class="panel-body">${view}</div>`; markCells(); }

  function viewRoll(title, text) {
    render(`<h3>${title}</h3><p>${text}</p>
      <div class="roll-row">${dieHtml()}<p style="margin:0">Pulsa el botón y el mago avanzará lo que salga en el dado.</p></div>
      <div class="panel-actions"><button class="btn" type="button" id="btn-roll">${S.skip ? `${icon('clock')} Esperar el verde` : `${icon('dice-5')} Tirar el dado`}</button>
      ${S.rolls ? `<button class="btn btn--ghost" type="button" id="btn-reset">${icon('refresh')} Empezar de nuevo</button>` : ''}</div>`);
    $('#btn-roll').addEventListener('click', roll);
    $('#btn-reset')?.addEventListener('click', reset);
  }

  function reset() { S = fresh(); save(); placeFicha(1); viewRoll('Nueva partida', 'Llega a la casilla 30 contestando bien las preguntas de las casillas de color.'); $('#btn-roll')?.focus(); }

  function animateDie(v) {
    const cube = $('#oca-die');
    const [rx, ry] = FACE_ROT[v];
    if (!gsap || reduce) { cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; return Promise.resolve(); }
    return new Promise((res) => {
      gsap.fromTo(cube, { rotationX: -20, rotationY: 30 }, { rotationX: rx + 720, rotationY: ry + 720, duration: 1.1, ease: 'power3.out', onComplete: res });
    });
  }

  function moveTo(target) {
    const path = [];
    const step = target > S.pos ? 1 : -1;
    for (let i = S.pos + step; step > 0 ? i <= target : i >= target; i += step) path.push(i);
    S.pos = target;
    if (!gsap || reduce || !path.length) { placeFicha(target); markCells(); return Promise.resolve(); }
    return new Promise((res) => {
      const tl = gsap.timeline({ onComplete: () => { markCells(); res(); } });
      const img = ficha.querySelector('img');
      path.forEach((i) => {
        const { x, y } = centerOf(i);
        tl.to(ficha, { x, y, duration: 0.26, ease: 'power1.inOut' })
          .to(img, { yPercent: -28, duration: 0.13, ease: 'power2.out' }, '<')
          .to(img, { yPercent: 0, duration: 0.13, ease: 'power2.in' }, '>');
      });
    });
  }

  let busy = false;
  async function roll() {
    if (busy) return;
    if (S.skip) { S.skip = false; S.rolls++; save(); viewRoll('Ya está en verde', 'Has esperado tu turno. Ahora sí: tira el dado.'); $('#btn-roll').focus(); return; }
    busy = true;
    $('#btn-roll').disabled = true;
    const v = 1 + Math.floor(Math.random() * 6);
    S.rolls++;
    await animateDie(v);
    const target = Math.min(CELLS, S.pos + v);
    await moveTo(target);
    save();
    busy = false;
    resolveCell(v);
  }

  function resolveCell(v) {
    const t = type[S.pos];
    if (S.pos >= CELLS) return finish();
    if (t === 'zebra') {
      const next = ZEBRA.find((z) => z > S.pos);
      if (next) {
        render(`<h3>De paso de cebra a paso de cebra</h3><p>Has sacado un ${v}. ¡Y tiro porque me lleva la corriente! Avanzas hasta la casilla ${next} y vuelves a tirar.</p>`);
        setTimeout(async () => { await moveTo(next); save(); viewRoll('Vuelves a tirar', 'El paso de cebra es el refugio del peatón: úsalo siempre.'); }, 900);
      } else viewRoll('Último paso de cebra', `Has sacado un ${v}. El paso de cebra te da otra tirada.`);
      return;
    }
    if (t === 'rojo') {
      S.waits++; S.skip = true; save();
      viewRoll('Semáforo en rojo', `Has sacado un ${v} y pierdes un turno. Aunque no venga nadie, en rojo se espera: «cumplir las normas es ir a contracorriente», decía José María.`);
      return;
    }
    if (QUESTIONS[t]) return ask(t, v);
    viewRoll('Tu turno', `Has sacado un ${v}.`);
  }

  function ask(kind, v) {
    const bank = QUESTIONS[kind];
    if (S.used[kind].length >= bank.length) S.used[kind] = [];
    const free = bank.map((_, i) => i).filter((i) => !S.used[kind].includes(i));
    const qi = free[Math.floor(Math.random() * free.length)];
    S.used[kind].push(qi); save();
    const q = bank[qi];
    const from = S.pos - v;
    render(`<span class="q-kind">${icon(KIND[kind].icon)} ${KIND[kind].name}</span>
      ${q.sign ? `<div class="q-sign" aria-hidden="true">${SIGN[q.sign]}</div>` : ''}
      <h3 id="q-title">${esc(q.q)}</h3>
      <ul class="answers" aria-labelledby="q-title">${q.a.map((a, i) => `<li><button class="answer" type="button" data-i="${i}"><span class="key">${'ABC'[i]}</span><span>${esc(a)}</span></button></li>`).join('')}</ul>
      <div id="fb"></div>`);
    const btns = $$('.answer', panel);
    btns[0].focus();
    btns.forEach((b) => b.addEventListener('click', async () => {
      const pick = Number(b.dataset.i);
      const good = pick === q.ok;
      S.asked++; if (good) S.right++;
      btns.forEach((x) => { x.disabled = true; });
      btns[q.ok].classList.add('is-right');
      if (!good) b.classList.add('is-wrong');
      const back = Math.max(1, from);
      $('#fb').innerHTML = `<div class="feedback ${good ? 'ok' : 'ko'}"><strong>${good ? '¡Correcto!' : 'No es así'}</strong>${esc(q.why)}${good ? '' : ` Vuelves a la casilla ${back}.`}</div>
        <div class="panel-actions"><button class="btn" type="button" id="btn-next">Seguir ${icon('arrow-right', 'icon icon--go')}</button></div>`;
      save();
      $('#btn-next').focus();
      $('#btn-next').addEventListener('click', async () => {
        if (!good) { await moveTo(back); save(); }
        viewRoll(good ? 'Muy bien, sigue así' : 'Otra oportunidad', good ? 'Te quedas en la casilla. Vuelve a tirar.' : 'Así se aprende. Tira otra vez.');
      });
    }));
  }

  function finish() {
    S.phase = 'end'; save();
    const pct = S.asked ? Math.round((S.right / S.asked) * 100) : 100;
    render(`<h3>¡Has llegado a la meta!</h3>
      <p>${S.rolls} tiradas, ${S.right} respuestas correctas de ${S.asked}${S.waits ? ` y ${S.waits} ${S.waits === 1 ? 'semáforo' : 'semáforos'} en rojo respetados` : ''}.
      ${pct >= 80 ? 'Te mueves por la calle con mucha cabeza.' : 'Cada fallo es una lección: vuelve a jugar y verás.'}</p>
      <p>La educación vial es cosa de todos. ¿Juegas otra vez?</p>
      <div class="panel-actions"><button class="btn" type="button" id="btn-again">${icon('refresh')} Jugar otra vez</button></div>`);
    $('#btn-again').addEventListener('click', reset);
  }

  function boot() {
    drawRoad();
    placeFicha(S.pos);
    if (S.phase === 'end') finish();
    else if (S.rolls) viewRoll('Seguimos la partida', `Estás en la casilla ${S.pos}. Tira el dado para continuar.`);
    else viewRoll('Tu turno', 'Llega a la casilla 30. Las casillas de color tienen pregunta; el paso de cebra te adelanta; en el semáforo rojo esperas.');
  }
  boot();
  new ResizeObserver(() => { drawRoad(); if (!busy) placeFicha(S.pos); }).observe(grid);
})();
