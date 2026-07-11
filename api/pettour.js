// 반려동물 동반여행 프록시 (한국관광공사 KorPetTourService2)
// 인증키는 Vercel 환경변수 PETTOUR_KEY 에서만 읽는다. 코드/클라이언트에 노출 금지.
const BASE = "https://apis.data.go.kr/B551011/KorPetTourService2";

// 허용된 오퍼레이션만 프록시(임의 요청 차단)
const OPS = {
  area: "areaBasedList2",       // 지역기반
  location: "locationBasedList2", // 위치기반(내 주변)
  keyword: "searchKeyword2",     // 키워드검색
  detail: "detailPetTour2",      // 반려동물 동반 상세조건
};

// 전달 허용 파라미터 화이트리스트
const ALLOWED = new Set([
  "numOfRows", "pageNo", "arrange", "areaCode", "sigunguCode",
  "contentTypeId", "mapX", "mapY", "radius", "keyword", "contentId",
]);

export default async function handler(req, res) {
  try {
    const key = process.env.PETTOUR_KEY;
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
    params.set("MobileOS", "ETC");
    params.set("MobileApp", "mungnyangcalc");
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
