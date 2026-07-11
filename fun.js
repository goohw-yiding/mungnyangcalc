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
