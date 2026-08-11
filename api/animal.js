// 유기동물(입양 대기) 정보 프록시 (농림축산검역본부 국가동물보호정보시스템 — 구조동물/유기동물 조회 서비스)
// 인증키는 Vercel 환경변수 ANIMAL_KEY 에서만 읽는다. 코드/클라이언트에 노출 금지.
//
// ⚠️ 데이터 출처: data.go.kr 15098931 (구조동물 조회 서비스). serviceKey는
//    공공데이터포털에서 이 API를 별도로 "활용신청"해서 받아야 한다 —
//    관광공사(PETTOUR_KEY) 키와는 다른 신청 건이다. 관세청 3종과 같은 계정으로
//    신청은 가능하지만, 서비스별로 승인을 따로 받아야 한다(chukjemoa/tourapi.key 참고 사례).
//
// ⚠️ 필드명은 공개된 v2 스키마 기준 최선 추정치다. 실제 키로 첫 호출 후
//    응답 원본을 한 번 찍어보고 다르면 여기 KIND/AGE/WEIGHT 등 매핑만 고치면 된다.
//    (클라이언트 쪽도 여러 후보 필드명을 다 훑도록 방어적으로 짜 두었다)
const BASE = "https://apis.data.go.kr/1543061/abandonmentPublicSrvc_v2";

// 허용된 오퍼레이션만 프록시(임의 요청 차단)
const OPS = {
  sido: "sido_v2",           // 시도 코드 목록
  sigungu: "sigungu_v2",     // 시군구 코드 목록 (upr_cd 필요)
  abandon: "abandonmentPublic_v2", // 유기동물 목록 (메인)
};

// 전달 허용 파라미터 화이트리스트
const ALLOWED = new Set([
  "pageNo", "numOfRows", "upr_cd", "org_cd", "upkind", "kind",
  "state", "bgnde", "endde", "neuter_yn", "care_reg_no",
]);

export default async function handler(req, res) {
  try {
    const key = process.env.ANIMAL_KEY;
    if (!key) {
      res.status(500).json({ error: "server_key_missing" });
      return;
    }
    const q = req.query || {};
    const op = OPS[q.op];
    if (!op) {
      res.status(400).json({ error: "invalid_op" });
      return;
    }
    const params = new URLSearchParams();
    params.set("serviceKey", key);
    params.set("_type", "json");
    for (const [k, v] of Object.entries(q)) {
      if (ALLOWED.has(k) && v != null && v !== "") params.set(k, String(v));
    }
    const url = `${BASE}/${op}?${params.toString()}`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch { res.status(502).json({ error: "upstream_not_json", raw: text.slice(0, 300) }); return; }

    // 캐시: 공공데이터라 자주 안 바뀜. 브라우저/CDN 1시간 캐시로 트래픽 절약.
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "proxy_error", message: String(e && e.message || e) });
  }
}
