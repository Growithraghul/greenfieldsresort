(function () {
  var RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return document.querySelectorAll(s); };
  var hd = $('#hd'), links = $('#links'), menu = $('#menu');

  /* mobile menu */
  menu.onclick = function () {
    var o = links.classList.toggle('open');
    this.setAttribute('aria-expanded', o);
  };

  /* reveal on scroll */
  var els = $$('.rv');
  if (RM || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* journey steps (home) */
  var steps = $$('.step'), imgs = $$('.jimgs div'), jr = $('#jr');
  function setStep(i) {
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    imgs.forEach(function (s, k) { s.classList.toggle('on', k === i); });
  }
  steps.forEach(function (s, k) { s.onclick = function () { setStep(k); }; });

  /* centred card highlight (home) */
  var r = $('#rail');
  function rail() {
    if (!r) return;
    var cs = r.getBoundingClientRect(), c = cs.left + cs.width / 2, best = null, d = 1e9;
    r.querySelectorAll('article').forEach(function (a) {
      var b = a.getBoundingClientRect(), x = Math.abs(b.left + b.width / 2 - c);
      if (x < d) { d = x; best = a; }
      a.classList.remove('active');
    });
    if (best) best.classList.add('active');
  }
  if (r) { r.addEventListener('scroll', function () { requestAnimationFrame(rail); }, { passive: true }); rail(); }

  /* scroll: nav hide, capsule parallax, journey */
  var last = 0, tick = false;
  function onScroll() {
    var y = scrollY;
    hd.classList.toggle('hide', y > last && y > 240 && !links.classList.contains('open'));
    last = y;
    if (!RM) {
      $$('.cap[data-s]').forEach(function (c) {
        var p = c.parentNode.getBoundingClientRect();
        c.style.translate = '0 ' + (-p.top * c.dataset.s) + 'px';
      });
      if (jr) {
        var b = jr.getBoundingClientRect();
        var p = Math.min(0.999, Math.max(0, -b.top / (b.height - innerHeight)));
        setStep(Math.floor(p * 3));
      }
    }
    tick = false;
  }
  addEventListener('scroll', function () {
    if (!tick) { tick = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* placeholder items shared by the carousel and gallery */
  var items = [['g1', 'Green lawns'], ['g2', 'Pool waters'], ['g3', 'Dining'], ['g4', 'Open grounds'], ['g5', 'Celebrations'], ['g6', 'Garden paths']];

  /* 3D carousel (home) */
  var cf = $('#cf');
  if (cf) {
    var idx = 0, tiles = [];
    items.forEach(function (it, i) {
      var t = document.createElement('button');
      t.className = 't ' + it[0]; t.type = 'button';
      t.textContent = it[1] + ' (placeholder)';
      t.onclick = function () { go(i); };
      cf.appendChild(t); tiles.push(t);
    });
    var go = function (n) {
      idx = (n + items.length) % items.length;
      tiles.forEach(function (t, i) {
        var o = i - idx;
        if (o > items.length / 2) o -= items.length;
        if (o < -items.length / 2) o += items.length;
        var a = Math.abs(o);
        t.style.transform = 'translateX(' + o * 58 + '%) rotateY(' + (-o * 32) + 'deg) scale(' + (1 - Math.min(a, 3) * 0.1) + ')';
        t.style.zIndex = 10 - a;
        t.style.opacity = a > 2 ? 0 : 1 - a * 0.28;
        t.tabIndex = a ? -1 : 0;
        t.style.pointerEvents = a > 2 ? 'none' : '';
      });
      $('#cl').textContent = items[idx][1];
    };
    $('#pv').onclick = function () { go(idx - 1); };
    $('#nx').onclick = function () { go(idx + 1); };
    go(0);
  }

  /* ticker (home) */
  var mq = $('#mq');
  if (mq) { var w = 'LAWNS · POOL · DINING · WEDDINGS · EVENTS · '; mq.textContent = w + w + w + w; }

  /* gallery + lightbox */
  var gal = $('#gal'), lb = $('#lb');
  if (gal && lb) {
    var lbi = $('#lbimg');
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Open placeholder image: ' + it[1]);
      b.innerHTML = '<div class="img ' + it[0] + '">' + it[1] + ' (placeholder)</div>';
      b.onclick = function () {
        lbi.className = 'img ' + it[0];
        lbi.setAttribute('aria-label', 'Placeholder illustration: ' + it[1] + '. Replace with a resort photo.');
        lbi.textContent = it[1] + ' placeholder';
        lb.showModal();
      };
      gal.appendChild(b);
    });
    $('#lbclose').onclick = function () { lb.close(); };
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  /* forms: validate, never pretend to send */
  $$('form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = false, d = {};
      f.querySelectorAll('input,select,textarea').forEach(function (i) {
        var er = i.parentNode.querySelector('.err');
        if (er) er.textContent = '';
        d[i.name] = i.value.trim();
        if (i.required && !i.value.trim()) { er.textContent = 'Please fill in this field.'; bad = true; }
        else if (i.type === 'email' && i.value && !/^\S+@\S+\.\S+$/.test(i.value)) { er.textContent = 'Enter a valid email address.'; bad = true; }
      });
      if (d.from && d.to && d.to < d.from) {
        f.querySelector('[name=to]').parentNode.querySelector('.err').textContent = 'Departure must be after arrival.';
        bad = true;
      }
      var fe = f.querySelector('.err:not(:empty)');
      if (bad) { fe.parentNode.querySelector('input,select,textarea').focus(); return; }
      /* TODO: when a backend exists (Formspree, serverless function, etc.), POST `d` here instead. */
      var body = Object.keys(d).map(function (k) { return k + ': ' + d[k]; }).join('\n');
      var href = 'mailto:greenfieldsresort@gmail.com?subject=' + encodeURIComponent(f.dataset.subject) + '&body=' + encodeURIComponent(body);
      var out = f.querySelector('.out');
      out.innerHTML = '<div class="ok"><strong>Your details are ready, but nothing has been sent.</strong><p>Online submission is not connected yet. Send it by email below, or call +91 99400 39236. The resort will confirm any booking after replying.</p><a class="btn" href="' + href + '">Open email to send</a></div>';
      out.querySelector('a').focus();
    });
  });
})();
