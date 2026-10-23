(function () {
  'use strict';
  var d = document;
  var stage = d.getElementById('evo'); if (!stage) return;
  var scenes = [].slice.call(stage.querySelectorAll('.sc'));
  var tabs = [].slice.call(d.querySelectorAll('.evo__tabs button'));
  var cap = d.getElementById('evo-cap');
  var CAP = [
    'Il taccuino. Appunti a mano durante la partita, riletti a fine gara.',
    'Il foglio di calcolo. I numeri finiscono in tabella, ma solo il giorno dopo.',
    'Il video taggato. Ogni azione ha il suo minuto, ma serve tempo per prepararlo.',
    'TagUp. Il dato nasce mentre si gioca e il giorno dopo è già nell\'app, sul tablet.'
  ];
  var DUR = [5200, 4600, 4800, 6200], cur = 0, timer = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i) {
    cur = i;
    scenes.forEach(function (s, k) { s.classList.remove('on'); });
    void stage.offsetWidth;
    scenes[i].classList.add('on');
    tabs.forEach(function (t, k) {
      t.setAttribute('aria-selected', k === i ? 'true' : 'false');
      t.style.removeProperty('--dur');
      if (k === i) { void t.offsetWidth; t.style.setProperty('--dur', (DUR[i] / 1000) + 's'); }
    });
    cap.textContent = CAP[i];
    clearTimeout(timer);
    if (!reduce) timer = setTimeout(function () { show((cur + 1) % scenes.length); }, DUR[i]);
  }
  tabs.forEach(function (t, k) { t.addEventListener('click', function () { show(k); }); });
  show(reduce ? 3 : 0);
})();
