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
