/* 멍냥계산기 처방 엔진 (advice.js)
 *
 * 원칙
 *  1. 조건이 맞지 않으면 아무것도 렌더하지 않는다. 전 페이지 공통 배너는 만들지 않는다.
 *  2. 처방은 상품이 아니라 조언이다. 상품 링크가 비어 있어도 진단 문장과 근거 글은 나간다.
 *  3. 한 페이지에 최대 2개(메인 + 보조). 그 이상은 광고다.
 *  4. 의료 정보 페이지(접종)·기념일 페이지·재미 테스트에는 붙이지 않는다.
 *  5. 단정하지 않는다. "낫는다"가 아니라 "부담을 줄인다"로 쓴다.
 *
 * 의존: profile.js(window.MNY), products.js(window.MNYPROD)
 */
(function () {
  'use strict';
  if (!window.MNY) return;
  var PROD = window.MNYPROD || {};

  function ev(name, params) {
    try { if (typeof gtag === 'function') gtag('event', name, params || {}); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
    });
  }
  function month() { return new Date().getMonth() + 1; }
  function ageYears(p) { var y = p && p.birth ? window.MNY.ageYears(p.birth) : null; return (y == null || isNaN(y)) ? null : y; }

  /* ── 처방 규칙 ─────────────────────────────────────
     when(c) → true면 후보. c = {p, human, ageY, m, page, calc}
     우선순위는 배열 순서(위가 높음).                        */
  var RULES = [

    /* 블로그 글은 글 주제 자체가 맥락이므로 프로필이 없어도 노출한다 */
    { id: 'blog_patella',
      pages: ['blog-dog-patella'],
      when: function () { return true; },
      msg: function () {
        return '슬개골은 한 번 나빠지면 되돌리기 어려운 대신, 생활 환경으로 부담을 크게 줄일 수 있습니다. ' +
               '가장 손쉬운 순서는 자주 다니는 길목의 미끄러움을 없애고, 뛰어내리는 높이를 낮추는 것입니다.';
      },
      why: null, prod: 'mat_nonslip', prod2: 'pet_stairs' },

    { id: 'blog_senior',
      pages: ['blog-senior-dog'],
      when: function () { return true; },
      msg: function () {
        return '노령기에 가장 먼저 손보면 좋은 건 약이 아니라 바닥과 높이입니다. ' +
               '소파를 뛰어내리는 충격과 미끄러짐만 줄여도 관절이 버티는 기간이 달라집니다.';
      },
      why: null, prod: 'pet_stairs', prod2: 'mat_nonslip' },

    { id: 'blog_cat_env',
      pages: ['blog-cat'],
      when: function () { return true; },
      msg: function () {
        return '고양이 문제 행동의 상당수는 환경으로 풀립니다. 올라갈 높은 자리, 마음껏 긁을 자리, 숨을 자리 ' +
               '— 이 세 가지가 있으면 훨씬 덜 예민해집니다.';
      },
      why: null, prod: 'cat_tower', prod2: 'cat_scratcher' },

    { id: 'senior_joint',
      pages: ['age', 'cost', 'walk', 'home'],
      when: function (c) { return c.human != null && c.human >= 60; },
      msg: function (c) {
        return (c.name ? c.name + '는 ' : '지금은 ') + '사람 나이로 ' + c.human + '세, 노년기에 들어섰어요. ' +
               '관절에 부담이 쌓이는 시기라 소파나 침대를 뛰어내릴 때의 충격부터 줄여 주는 게 순서입니다.';
      },
      why: { href: '/blog/senior-dog/', label: '노령기에 달라지는 것들' },
      prod: 'pet_stairs', prod2: 'mat_nonslip' },

    { id: 'small_patella',
      pages: ['age', 'cost', 'walk', 'home'],
      when: function (c) { return c.p && c.p.species !== 'cat' && c.p.size === 'small' && c.ageY != null && c.ageY >= 1; },
      msg: function (c) {
        return '소형견은 슬개골 탈구가 흔한 편이고, 미끄러운 마룻바닥이 가장 자주 지목되는 악화 요인입니다. ' +
               '자주 다니는 길목만 덮어 줘도 부담이 줄어듭니다.';
      },
      why: { href: '/blog/dog-patella/', label: '슬개골 탈구, 무엇을 조심해야 하나' },
      prod: 'mat_nonslip', prod2: 'pet_stairs' },

    { id: 'large_slip',
      pages: ['age', 'cost', 'walk', 'home'],
      when: function (c) { return c.p && c.p.species !== 'cat' && c.p.size === 'large'; },
      msg: function () {
        return '대형견은 체중이 실린 상태로 미끄러지면 부상 정도가 커집니다. 거실처럼 뛰는 구간을 먼저 덮어 주세요.';
      },
      why: null,
      prod: 'mat_nonslip' },

    { id: 'summer_heat',
      pages: ['walk', 'home'],
      when: function (c) { return c.m >= 6 && c.m <= 8; },
      msg: function (c) {
        return '여름엔 바닥 체감온도가 관건입니다. 사람 키에서 느끼는 온도와 아이 키 높이의 온도는 꽤 다릅니다. ' +
               '산책 시간대를 옮기고, 집 안에도 시원한 자리를 하나 만들어 주세요.';
      },
      why: function (c) {
        return c.p && c.p.species === 'cat'
          ? { href: '/blog/cat-summer-heat/', label: '고양이 여름나기' }
          : { href: '/blog/dog-summer-walk/', label: '여름 산책, 시간대가 전부' };
      },
      prod: 'cool_mat' },

    { id: 'cat_vertical',
      pages: ['age', 'cost', 'home'],
      when: function (c) { return c.p && c.p.species === 'cat'; },
      msg: function () {
        return '고양이는 높은 곳에 올라가 주변을 내려다볼 수 있을 때 스트레스가 줄어듭니다. ' +
               '바닥 면적을 늘리는 것보다 수직 공간을 하나 만드는 편이 효과적입니다.';
      },
      why: null,
      prod: 'cat_tower', prod2: 'cat_scratcher' },

    { id: 'puppy_start',
      pages: ['age', 'home'],
      when: function (c) { return c.ageY != null && c.ageY < 1; },
      msg: function (c) {
        return '생후 1년은 평생 습관이 만들어지는 시기예요. 지금 챙겨 두면 나중에 훨씬 편해지는 것들이 있습니다.';
      },
      why: { href: '/blog/puppy-checklist/', label: '첫 1년 체크리스트' },
      prod: null },

    { id: 'weight_track',
      pages: ['walk', 'cost'],
      when: function (c) { return true; },   // 보조 처방으로만 사용
      msg: function () {
        return '체중 변화는 가장 빨리 나타나는 건강 신호입니다. 2~4주 간격으로 같은 조건에서 재 보세요.';
      },
      why: { href: '/blog/dog-weight/', label: '우리 아이 비만일까?' },
      prod: 'pet_scale' },
  ];

  /* ── 후보 선정 ───────────────────────────────────── */
  function advise(page, extra) {
    var p = window.MNY.get() || null;
    var c = {
      p: p,
      name: p && p.name ? p.name : '',
      human: p ? window.MNY.humanAge(p) : null,
      ageY: p ? ageYears(p) : null,
      m: month(),
      page: page,
      calc: extra || {},
    };
    // 계산기에서 넘겨준 값이 프로필보다 우선
    if (extra && extra.human != null) c.human = extra.human;
    if (extra && extra.ageY != null) c.ageY = extra.ageY;
    if (extra && extra.species) c.p = Object.assign({}, c.p || {}, { species: extra.species });
    if (extra && extra.size) c.p = Object.assign({}, c.p || {}, { size: extra.size });

    var out = [];
    for (var i = 0; i < RULES.length; i++) {
      var r = RULES[i];
      if (r.pages.indexOf(page) < 0) continue;
      if (r.id === 'weight_track') continue;      // 보조 전용, 아래에서 따로
      var pass = false;
      try { pass = !!r.when(c); } catch (e) { pass = false; }
      if (pass) out.push({ rule: r, c: c });
      if (out.length >= 2) break;
    }
    return { list: out, ctx: c };
  }

  /* ── 렌더 ────────────────────────────────────────── */
  function prodHTML(key, adviceId, page) {
    var d = PROD[key];
    if (!d || !d.url) return { html: '', affiliate: false };   // 링크 없으면 버튼 생략
    var rel = d.kind === 'own' ? 'noopener' : 'nofollow sponsored noopener';
    var html = '<a class="adv-buy" href="' + esc(d.url) + '" target="_blank" rel="' + rel + '"' +
      ' data-adv="' + esc(adviceId) + '" data-prod="' + esc(key) + '" data-page="' + esc(page) + '">' +
      '<span class="ab-i">' + d.ico + '</span>' +
      '<span class="ab-b"><b>' + esc(d.name) + '</b><span>' + esc(d.sub) + '</span></span>' +
      '<span class="ab-r">›</span></a>';
    return { html: html, affiliate: d.kind !== 'own' };
  }

  function render(elId, page, extra) {
    var el = document.getElementById(elId);
    if (!el) return 0;
    var res = advise(page, extra);
    if (!res.list.length) { el.innerHTML = ''; return 0; }

    var parts = [], anyAff = false, ids = [];
    for (var i = 0; i < res.list.length; i++) {
      var r = res.list[i].rule, c = res.list[i].c;
      var why = typeof r.why === 'function' ? r.why(c) : r.why;
      var msg = r.msg(c);
      var b1 = prodHTML(r.prod, r.id, page);
      var b2 = i === 0 ? prodHTML(r.prod2, r.id, page) : { html: '', affiliate: false };
      if (b1.affiliate || b2.affiliate) anyAff = true;
      ids.push(r.id);
      parts.push(
        '<div class="adv-item">' +
          '<p class="adv-msg">' + msg + '</p>' +
          (why ? '<a class="adv-why" href="' + why.href + '" data-adv="' + r.id + '">📖 ' + esc(why.label) + ' ›</a>' : '') +
          b1.html + b2.html +
        '</div>'
      );
    }
    el.innerHTML =
      '<section class="advice" aria-label="우리 아이에게 지금 챙길 것">' +
        '<h4 class="adv-h">우리 아이에게 지금 챙길 것</h4>' +
        parts.join('') +
        (anyAff ? '<p class="adv-disc">※ 일부 링크는 쿠팡 파트너스 활동의 일환으로 구매 시 일정 수수료를 제공받습니다. 이용자에게 추가 비용은 없으며, 수수료는 위 조언 내용에 영향을 주지 않습니다.</p>' : '') +
        '<p class="adv-note">이 안내는 입력하신 정보에 따라 달라지며, 수의학적 진단이 아닙니다.</p>' +
      '</section>';

    // 노출 이벤트 — 상품 링크가 없어도 기록한다(어떤 처방이 뜨는지 측정)
    ev('advice_view', { page: page, advice_ids: ids.join(','), has_product: anyAff ? 1 : 0 });

    // 클릭 위임 (재렌더 시 중복 등록 방지)
    if (!el.__advBound) {
      el.__advBound = true;
      el.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        if (a.classList.contains('adv-buy')) {
          ev('advice_click', { page: page, advice_id: a.getAttribute('data-adv'), product: a.getAttribute('data-prod') });
        } else if (a.classList.contains('adv-why')) {
          ev('advice_source_click', { page: page, advice_id: a.getAttribute('data-adv') });
        }
      });
    }
    return res.list.length;
  }

  window.MNY.advise = advise;
  window.MNY.renderAdvice = render;
  window.MNY.ADVICE_RULES = RULES;   // 검증 스크립트에서 사용
})();
