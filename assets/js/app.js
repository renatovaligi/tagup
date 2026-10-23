(function () {
  'use strict';
  var d = document, w = window;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = $('.site-header'), bar = $('.progress'), stage = $('.stage'), words = $$('.statement .wd');

  /* parola che ruota nell'hero */
  var rot = $('.rot');
  if (rot && !reduce) {
    var bs = $$('b', rot), cur = 0;
    bs[0].classList.add('on');
    setInterval(function () {
      var n = (cur + 1) % bs.length;
      bs[cur].classList.remove('on'); bs[cur].classList.add('out');
      bs[n].classList.remove('out'); bs[n].classList.add('on');
      var o = bs[cur]; setTimeout(function () { o.classList.remove('out'); }, 700);
      cur = n;
    }, 2200);
  } else if (rot) { $$('b', rot)[0].classList.add('on'); }

  /* scroll: header, barra, prodotto che si raddrizza, parole che si accendono */
  var tick = false;
  function frame() {
    tick = false;
    var y = w.pageYOffset, h = d.documentElement.scrollHeight - w.innerHeight;
    if (hdr) hdr.classList.toggle('is-scrolled', y > 30);
    if (bar) bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
    if (stage && !reduce) {
      var r = stage.getBoundingClientRect();
      var t = Math.max(0, Math.min(1, 1 - (r.top - w.innerHeight * 0.18) / (w.innerHeight * 0.75)));
      stage.style.setProperty('--t', t.toFixed(3));
    }
    if (words.length) {
      var sr = words[0].parentNode.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (w.innerHeight * 0.85 - sr.top) / (w.innerHeight * 0.6 + sr.height)));
      var on = Math.round(p * words.length * 1.15);
      words.forEach(function (x, i) { x.classList.toggle('on', i < on); });
    }
  }
  function req() { if (!tick) { tick = true; w.requestAnimationFrame(frame); } }
  w.addEventListener('scroll', req, { passive: true }); w.addEventListener('resize', req); frame();
  if (reduce) words.forEach(function (x) { x.classList.add('on'); });

  /* reveal e contatori */
  function count(el) {
    var to = parseFloat(el.getAttribute('data-count')), t0 = null;
    if (reduce) { el.textContent = to; return; }
    function st(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) w.requestAnimationFrame(st); }
    el.textContent = '0'; w.requestAnimationFrame(st);
  }
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        el.classList.add('is-in');
        $$('[data-count]', el).forEach(count);
        setTimeout(function () { el.removeAttribute('data-reveal'); el.classList.remove('is-in'); }, 1400);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else { $$('[data-reveal]').forEach(function (el) { el.removeAttribute('data-reveal'); }); }

  /* scene: la schermata cambia mentre scorri i passaggi */
  var steps = $$('.step[data-k]');
  var stack = $$('.stack > .frame'), pips = $$('.pips i');
  if (steps.length && 'IntersectionObserver' in w) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = e.target.getAttribute('data-k'), idx = steps.indexOf(e.target);
        steps.forEach(function (s) { s.classList.toggle('is-active', s === e.target); });
        stack.forEach(function (f) { f.classList.toggle('on', f.getAttribute('data-k') === k); });
        pips.forEach(function (p, i) { p.classList.toggle('on', i === idx); p.classList.toggle('done', i < idx); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { so.observe(s); });
    steps[0].classList.add('is-active'); if (stack[0]) stack[0].classList.add('on'); if (pips[0]) pips[0].classList.add('on');
  }
})();
(function () {
  'use strict';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* screens gallery */
  $$('[data-shots]').forEach(function (g) {
    var st = $$('.shot-tab', g);
    function pick(t, focus) {
      st.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
    }
    st.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(t, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = st[(i + 1) % st.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = st[(i - 1 + st.length) % st.length];
        if (n) { e.preventDefault(); pick(n, true); }
      });
    });
    g._pick = function (k) { var t = st.filter(function (x) { return x.getAttribute('data-shot') === k; })[0]; if (t) pick(t, false); };
  });
  function fromHash() {
    var k = (location.hash || '').replace('#', '');
    if (!k) return;
    var g = $('[data-shots]');
    if (g && g._pick) g._pick(k);
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
  $$('[data-goto]').forEach(function (a) {
    a.addEventListener('click', function () { var g = $('[data-shots]'); if (g && g._pick) g._pick(a.getAttribute('data-goto')); });
  });

  /* copy buttons */
  $$('[data-copy]').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.getAttribute('data-copy'));
      var text = src ? src.textContent : '';
      var done = function () { btn.textContent = 'Copiato'; setTimeout(function () { btn.textContent = label; }, 1800); };
      var fallback = function () {
        try { var r = document.createRange(); r.selectNodeContents(src); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
      };
      try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  /* model configurator */
  var cfg = $('#cfg');
  if (cfg) {
    var FEATS = {
      tag: 'Tagging video', cal: 'Impegni e calendario', roster: 'Roster', video: 'Video delle partite',
      scout: 'Scouting e avversari', play: 'Playbook e schemi', roles: 'Accessi per lo staff',
      multi: 'Più squadre e categorie', wl: 'Logo e colori della società'
    };
    var PRESET = {
      squadra: ['tag', 'cal', 'roster', 'video'],
      staff: ['tag', 'cal', 'roster', 'video', 'scout', 'play', 'roles'],
      societa: ['tag', 'cal', 'roster', 'video', 'scout', 'play', 'roles', 'multi', 'wl']
    };
    var NAMES = { squadra: 'Squadra', staff: 'Staff', societa: 'Società' };
    var base = 'staff', club = { name: 'Arancio', val: '#ff5a1f', ink: '#0B1420' };
    var boxes = $$('input[name="feat"]', cfg), wl = $('#wl');
    function applyPreset(b) { boxes.forEach(function (x) { x.checked = PRESET[b].indexOf(x.value) > -1; }); }
    function chosen() { return boxes.filter(function (x) { return x.checked; }).map(function (x) { return x.value; }); }
    function summary() {
      var sel = chosen();
      var same = PRESET[base].length === sel.length && PRESET[base].every(function (k) { return sel.indexOf(k) > -1; });
      var title = same ? 'Modello ' + NAMES[base] : 'Modello ' + NAMES[base] + ' personalizzato';
      $('#sum-title').textContent = title;
      var items = sel.map(function (k) { return FEATS[k]; });
      if (sel.indexOf('wl') > -1) items.push('Colore del club: ' + club.name);
      $('#sum-list').innerHTML = items.map(function (t) { return '<li>' + t + '</li>'; }).join('');
      var text = 'Ciao Renato, vorrei richiedere una demo di TagUp.\n\n' + title + ':\n' + items.map(function (t) { return '- ' + t; }).join('\n') + '\n\nDi che società si tratta: ';
      $('#sum-text').textContent = text;
      $('#sum-mail').setAttribute('href', 'mailto:renato.valigi@outlook.it?subject=' + encodeURIComponent('Demo TagUp: ' + title) + '&body=' + encodeURIComponent(text));
      var on = sel.indexOf('wl') > -1;
      wl.classList.toggle('plain', !on);
      wl.style.setProperty('--club', on ? club.val : '#ff5a1f');
      wl.style.setProperty('--club-ink', on ? club.ink : '#0B1420');
      $('#wl-name').textContent = on ? 'La tua società' : 'TagUp';
      $('#wl-nav').innerHTML = sel.map(function (k, i) { return '<li' + (i === 0 ? ' class="on"' : '') + '>' + FEATS[k] + '</li>'; }).join('');
      $('#swatch-box').hidden = !on;
    }
    $$('input[name="base"]', cfg).forEach(function (r) {
      r.addEventListener('change', function () { base = r.value; applyPreset(base); summary(); });
    });
    boxes.forEach(function (b) { b.addEventListener('change', summary); });
    $$('input[name="club"]', cfg).forEach(function (r) {
      r.addEventListener('change', function () { club = { name: r.getAttribute('data-name'), val: r.value, ink: r.getAttribute('data-ink') }; summary(); });
    });
    applyPreset(base); summary();
  }

  /* contact message builder */
  var form = $('#cform');
  if (form) {
    var f = { name: $('#f-name'), club: $('#f-club'), cat: $('#f-cat'), msg: $('#f-msg') };
    var build = function () {
      var lines = ['Ciao Renato,', ''];
      var who = (f.name.value.trim() || '[il tuo nome]') + (f.club.value.trim() ? ', della società ' + f.club.value.trim() : '');
      lines.push('sono ' + who + '. Categoria: ' + f.cat.value + '.');
      lines.push('');
      lines.push(f.msg.value.trim() || 'Vorrei vedere TagUp in azione e capire quale modello è adatto al mio staff.');
      lines.push('');
      lines.push('Grazie,');
      lines.push(f.name.value.trim() || '[il tuo nome]');
      var text = lines.join('\n');
      $('#f-prev').textContent = text;
      $('#f-mail').setAttribute('href', 'mailto:renato.valigi@outlook.it?subject=' + encodeURIComponent('Richiesta demo TagUp') + '&body=' + encodeURIComponent(text));
    };
    form.addEventListener('input', build);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    build();
  }

  /* demo tastiera: modifica colori e tagging live */
  var demo = $('#demo-kb');
  if (demo) {
    var pad = $('.pad', demo), feed = $('#demo-feed'), clockEl = $('#demo-clock');
    var modeBtns = $$('.seg button', demo), sel = null, secs = 9 * 60 + 12, n = 0, pts = { us: 0, th: 0 };
    var KEYS = [
      ['3PT', '#ff2929', '#fff', 3], ['2PT', '#ff2929', '#fff', 2], ['Assist', '#2dbd6e', '#0c1a12', 0], ['Rimbalzo', '#2f7fe0', '#fff', 0],
      ['Palla persa', '#ff9f2e', '#1b222b', 0], ['Stoppata', '#2dbd6e', '#0c1a12', 0], ['Fallo', '#a66be0', '#fff', 0], ['P&R', '#fbff12', '#1b222b', 0]
    ];
    var PL = ['4 Galli', '7 Moro', '9 Riva', '11 Costa', '14 Neri'];
    KEYS.forEach(function (k, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = k[0]; b.style.setProperty('--kc', k[1]); b.style.setProperty('--kc-ink', k[2]); b.dataset.i = i;
      pad.appendChild(b);
    });
    var edit = false;
    function fmt(s) { var m = Math.floor(s / 60), x = s % 60; return m + ':' + (x < 10 ? '0' : '') + x; }
    function setMode(e) {
      edit = e;
      demo.classList.toggle('is-edit', e);
      modeBtns.forEach(function (b) { b.setAttribute('aria-pressed', (b.dataset.mode === 'edit') === e ? 'true' : 'false'); });
      if (!e && sel) { sel.classList.remove('is-sel'); sel = null; }
      $('#demo-hint').textContent = e ? 'Tocca un pulsante, poi scegli il colore. Nell\'app puoi anche rinominarlo, spostarlo e crearne di nuovi.' : 'Tocca i pulsanti come faresti durante la partita: ogni tag prende il minuto del momento.';
    }
    modeBtns.forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode === 'edit'); }); });
    pad.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      if (edit) { if (sel) sel.classList.remove('is-sel'); sel = b; b.classList.add('is-sel'); return; }
      var k = KEYS[b.dataset.i];
      secs = Math.max(0, secs - (6 + Math.floor(Math.random() * 14)));
      n++;
      var first = feed.querySelector('.none'); if (first) first.remove();
      var li = document.createElement('li');
      var col = b.style.getPropertyValue('--kc');
      li.innerHTML = '<i style="--c:' + col + '"></i><span>' + k[0] + ' <small style="color:var(--muted)">· ' + PL[Math.floor(Math.random() * PL.length)] + '</small></span><time>Q2 ' + fmt(secs) + '</time>';
      feed.insertBefore(li, feed.firstChild);
      if (k[3]) pts.us += k[3];
      $('#demo-n').textContent = n; $('#demo-pts').textContent = pts.us; clockEl.textContent = 'Q2 ' + fmt(secs);
      b.classList.remove('is-hit'); void b.offsetWidth; b.classList.add('is-hit');
    });
    $$('.swatches button', demo).forEach(function (c) {
      c.addEventListener('click', function () {
        if (!sel) { $('#demo-hint').textContent = 'Prima tocca il pulsante da colorare.'; return; }
        var col = c.style.getPropertyValue('--c');
        sel.style.setProperty('--kc', col); sel.style.setProperty('--kc-ink', c.dataset.ink || '#fff');
      });
    });
    setMode(false);
  }

  /* demo RPE */
  var rr = $('#rpe-range');
  if (rr) {
    var L = ['', 'Riposo', 'Molto leggero', 'Leggero', 'Moderato', 'Un po\' duro', 'Duro', 'Molto duro', 'Molto duro', 'Quasi massimale', 'Massimale'];
    var C = ['', '#3fcf8e', '#3fcf8e', '#8ad45a', '#8ad45a', '#d7d64a', '#ffb02e', '#ff6a3d', '#ff6a3d', '#ff2929', '#ff2929'];
    var upd = function () { var v = +rr.value; $('#rpe-val').textContent = v; $('#rpe-lab').textContent = L[v]; $('#rpe-box').style.setProperty('--rc', C[v]); $('#rpe-min').textContent = v * 90; };
    rr.addEventListener('input', upd); upd();
  }
})();
