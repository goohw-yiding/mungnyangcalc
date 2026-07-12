// 멍냥계산기 재미 요소: 걸어다니는 반려동물 + 결과 축하 효과
document.addEventListener('DOMContentLoaded', () => {
  const w = document.createElement('div');
  w.id = 'walker';
  w.textContent = '🐕';
  w.setAttribute('aria-hidden', 'true');
  document.body.appendChild(w);
  const pets = ['🐕', '🐈', '🐩', '🐈‍⬛', '🐕‍🦺'];
  let i = 0;
  w.addEventListener('animationiteration', () => {
    i = (i + 1) % pets.length;
    w.textContent = pets[i];
  });
});

window.shareResult = function () {
  const t = window.__share || document.title;
  const url = location.origin + location.pathname;
  if (navigator.share) { navigator.share({ title: '멍냥계산기', text: t, url: url }).catch(function () {}); }
  else {
    const f = t + '\n' + url + '\n#멍냥계산기';
    if (navigator.clipboard) navigator.clipboard.writeText(f).then(function () { alert('결과가 복사됐어요! 원하는 곳에 붙여넣기 하세요 🐾'); }).catch(function () { prompt('아래 내용을 복사하세요', f); });
    else prompt('아래 내용을 복사하세요', f);
  }
};

function mnyCelebrate(anchor) {
  const emo = ['🐾', '🐶', '🐱', '💛', '🐾', '🦴', '🐟'];
  const el = anchor || document.body;
  const r = el.getBoundingClientRect();
  for (let k = 0; k < 8; k++) {
    const s = document.createElement('span');
    s.className = 'pop';
    s.textContent = emo[k % emo.length];
    s.style.left = (r.left + Math.random() * Math.max(r.width - 20, 40)) + 'px';
    s.style.top = (r.top + window.scrollY + Math.random() * 50) + 'px';
    s.style.animationDelay = (Math.random() * 0.35) + 's';
    s.setAttribute('aria-hidden', 'true');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1800);
  }
}

window.__brand = { name: '멍냥계산기', emoji: '🐾', tag: '#멍냥계산기', c1: '#f4a259', c2: '#e08a3c' };
/* ===== 공용 결과 이미지 카드 (무의존 캔버스) ===== */
(function () {
  function rr(x, l, t, w, h, r) { x.beginPath(); x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r); x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath(); }
  function wrap(x, text, cx, y, max, lh) { var words = (text || '').split(' '), line = '', yy = y; for (var i = 0; i < words.length; i++) { var test = line + words[i] + ' '; if (x.measureText(test).width > max && line) { x.fillText(line.trim(), cx, yy); line = words[i] + ' '; yy += lh; } else line = test; } if (line.trim()) x.fillText(line.trim(), cx, yy); return yy; }
  window.shareCard = function () {
    var B = window.__brand || { name: document.title, emoji: '📤', tag: '', c1: '#4b7bec', c2: '#3867d6' };
    var r = document.getElementById('result');
    if (!r || !r.querySelector('.big')) { return window.shareResult && window.shareResult(); }
    var big = r.querySelector('.big').textContent.trim();
    var label = r.firstElementChild ? r.firstElementChild.textContent.trim() : '';
    if (label === big) label = '';
    var sub = '', n = r.querySelector('.big').nextElementSibling;
    while (n) { var tx = (n.textContent || '').replace(/\s+/g, ' ').trim(); if (tx && tx.length <= 44) { sub = tx; break; } n = n.nextElementSibling; }
    var W = 1080, H = 1080, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d');
    var g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, B.c1); g.addColorStop(1, B.c2);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,255,0.96)'; rr(x, 90, 150, 900, 780, 44); x.fill();
    x.textAlign = 'center';
    x.fillStyle = B.c2; x.font = 'bold 48px sans-serif'; x.fillText(B.emoji + ' ' + B.name, W / 2, 290);
    if (label) { x.fillStyle = '#555'; x.font = '42px sans-serif'; wrap(x, label, W / 2, 420, 800, 50); }
    x.fillStyle = '#1a1a1a'; x.font = 'bold ' + (big.length > 11 ? 84 : 128) + 'px sans-serif';
    wrap(x, big, W / 2, 610, 860, 96);
    if (sub) { x.fillStyle = '#444'; x.font = '38px sans-serif'; wrap(x, sub, W / 2, 730, 800, 46); }
    x.fillStyle = B.c2; x.font = 'bold 44px sans-serif'; x.fillText(B.tag, W / 2, 858);
    x.fillStyle = '#999'; x.font = '30px sans-serif'; x.fillText((B.url || location.origin).replace(/^https?:\/\//, ''), W / 2, 905);
    cv.toBlob(function (blob) {
      var file = new File([blob], B.name + '_결과카드.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text: window.__share || B.name, title: B.name }).catch(function () {});
      } else {
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        alert('결과 카드 이미지를 저장했어요! 카카오톡·인스타 스토리에 공유해보세요 ' + (B.emoji || ''));
      }
    }, 'image/png');
  };
})();

/* ===== OneSignal 웹푸시 (재방문 유도) — mungnyangcalc.com / appId 입력 시 자동 활성화 ===== */
window.__onesignalAppId = 'PASTE_ONESIGNAL_APP_ID';
(function(){
  var id = window.__onesignalAppId;
  if(!id || id.indexOf('PASTE')===0) return;          // 미설정 = 완전 무동작
  if(location.protocol!=='https:') return;
  var s=document.createElement('script');
  s.src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'; s.defer=true;
  document.head.appendChild(s);
  window.OneSignalDeferred=window.OneSignalDeferred||[];
  window.OneSignalDeferred.push(function(OneSignal){ OneSignal.init({ appId:id }); });
})();