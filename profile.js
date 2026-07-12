// 멍냥계산기 공용 프로필 시스템 (localStorage 기반)
// 우리 아이 정보를 한 번 저장하면 모든 계산기가 자동으로 불러온다.
(function () {
  var KEY = 'mnyProfile';
  function dogAge(y, size) {
    if (y <= 0) return 0;
    if (y <= 1) return 15 * y;
    if (y <= 2) return 15 + 9 * (y - 1);
    var per = { small: 4, medium: 5, large: 6.5 }[size] || 5;
    return 24 + (y - 2) * per;
  }
  function catAge(y) {
    if (y <= 0) return 0;
    if (y <= 1) return 15 * y;
    if (y <= 2) return 15 + 9 * (y - 1);
    return 24 + (y - 2) * 4;
  }
  window.MNY = {
    get: function () {
      try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
    },
    save: function (patch) {
      var cur = window.MNY.get() || {};
      for (var k in patch) { if (patch.hasOwnProperty(k)) cur[k] = patch[k]; }
      try { localStorage.setItem(KEY, JSON.stringify(cur)); } catch (e) {}
      return cur;
    },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
    ageYears: function (birth) {
      if (!birth) return null;
      var b = new Date(birth + 'T00:00:00');
      return (Date.now() - b.getTime()) / (365.25 * 86400000);
    },
    humanAge: function (p) {
      if (!p || !p.birth) return null;
      var y = window.MNY.ageYears(p.birth);
      if (y == null) return null;
      return Math.round(p.species === 'cat' ? catAge(y) : dogAge(y, p.size || 'small'));
    },
    lifeStage: function (h) {
      if (h == null) return '';
      if (h < 18) return '어린이·청소년기';
      if (h < 40) return '활발한 청년기';
      if (h < 60) return '건강 관리가 중요한 중년기';
      return '세심한 돌봄이 필요한 노년기';
    },
    daysTogether: function (p) {
      if (!p) return null;
      var s = p.adopt || p.birth;
      if (!s) return null;
      var d = new Date(s + 'T00:00:00');
      var t = new Date(); t.setHours(0, 0, 0, 0);
      return Math.floor((t.getTime() - d.getTime()) / 86400000);
    },
    nextBirthdayD: function (p) {
      if (!p || !p.birth) return null;
      var b = new Date(p.birth + 'T00:00:00');
      var t = new Date(); t.setHours(0, 0, 0, 0);
      var nb = new Date(t.getFullYear(), b.getMonth(), b.getDate());
      if (nb < t) nb = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
      return Math.floor((nb.getTime() - t.getTime()) / 86400000);
    },
    emoji: function (p) {
      if (!p) return '🐾';
      return p.species === 'cat' ? '🐱' : '🐶';
    },
    sizeLabel: function (p) {
      if (!p || p.species === 'cat') return '고양이';
      return { small: '소형견', medium: '중형견', large: '대형견' }[p.size] || '강아지';
    },
    // 세그먼트 버튼(data-v) 선택 — 기존 onclick 핸들러를 그대로 실행해 UI+상태 동기화
    pickSeg: function (sel, v) {
      var b = document.querySelector(sel + ' button[data-v="' + v + '"]');
      if (b && !b.classList.contains('on')) b.click();
    },
    // 계산기 상단 자동채움 안내 배너
    banner: function (name) {
      var c = document.querySelector('.card');
      if (!c || document.querySelector('.mny-banner')) return;
      var d = document.createElement('div');
      d.className = 'mny-banner';
      d.style.cssText = 'background:#fff8ee;border:1px solid var(--accent);border-radius:10px;padding:10px 12px;margin-bottom:14px;font-size:.86rem;color:var(--accent-dark);line-height:1.45';
      d.innerHTML = '🐾 <b>' + (name || '우리 아이') + '</b> 정보로 미리 채웠어요. 다른 아이는 값을 바꿔서 계산하세요. · <a href="/" style="color:var(--accent-dark)">프로필 수정</a>';
      c.insertBefore(d, c.firstChild);
    },
    // 자동 계산 시 축하 효과(confetti) 없이 조용히 실행
    silent: function (fn) {
      var c = window.mnyCelebrate; window.mnyCelebrate = null;
      try { fn(); } catch (e) {}
      window.mnyCelebrate = c;
    }
  };
})();
