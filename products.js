/* 멍냥계산기 상품 카탈로그
 *
 * url이 비어 있으면 → 상품 버튼을 아예 렌더하지 않는다.
 *   (진단 문장과 근거 글은 그대로 나가므로, 링크가 없어도 페이지는 유용하다)
 *
 * kind:
 *   'affiliate' … 쿠팡 파트너스 링크. 반드시 고지문구가 함께 출력된다.
 *   'own'       … 자사(쿠웅샵) 스마트스토어. 파트너스 금지.
 *                 URL 형식: https://smartstore.naver.com/…?nt_source=mungnyang&nt_medium=site&nt_detail=<키>
 *
 * ▶ 링크 채우는 법
 *   쿠팡 파트너스에서 링크를 만든 뒤 아래 url:'' 안에 붙여넣기만 하면 즉시 노출된다.
 *   상품 선택 기준(합의) — 오가닉 상위·리뷰 1000+·평점 4.5+·로켓배송·1.5~4만원대·글 내용과 일치.
 */
window.MNYPROD = {

  /* ── 1순위: 소싱 후보(자사 전환 예정) ─────────────── */
  mat_nonslip: {
    name: '미끄럼방지 매트',
    ico: '🧩',
    sub: '마루 미끄러짐을 줄여 관절 부담을 낮춥니다',
    kind: 'affiliate',
    url: '',            // ← 쿠팡 파트너스 링크
  },
  pet_stairs: {
    name: '반려동물 계단',
    ico: '🪜',
    sub: '소파·침대 오르내림 충격을 줄여 줍니다',
    kind: 'affiliate',
    url: '',
  },
  cool_mat: {
    name: '쿨매트',
    ico: '❄️',
    sub: '바닥 체감온도를 낮춰 줍니다',
    kind: 'affiliate',
    url: '',
  },
  cat_tower: {
    name: '캣타워',
    ico: '🏗️',
    sub: '수직 공간은 고양이 스트레스를 줄입니다',
    kind: 'affiliate',
    url: '',
  },
  cat_scratcher: {
    name: '스크래처',
    ico: '🪵',
    sub: '긁는 본능을 대체할 자리를 만들어 줍니다',
    kind: 'affiliate',
    url: '',
  },
  cat_hideout: {
    name: '숨숨집',
    ico: '🏠',
    sub: '숨을 곳이 있으면 낯선 상황에 덜 예민해집니다',
    kind: 'affiliate',
    url: '',
  },

  /* ── 이미 운영 중인 링크 ─────────────────────────── */
  pet_scale: {
    name: '반려동물 체중계',
    ico: '⚖️',
    sub: '체중 변화가 가장 빠른 건강 신호입니다',
    kind: 'affiliate',
    url: 'https://link.coupang.com/a/fiyb17qpqu',
  },
};

/* 링크가 채워진 상품 수 (콘솔 확인용) */
window.MNYPROD.__ready = function () {
  var k = Object.keys(window.MNYPROD).filter(function (x) { return x.indexOf('__') !== 0; });
  return k.filter(function (x) { return !!window.MNYPROD[x].url; }).length + '/' + k.length;
};
