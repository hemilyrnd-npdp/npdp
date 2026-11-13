/* NPDP 일정 보드 — 앱 껍데기만 저장합니다. 일정 데이터(Firestore)와 로그인은 항상 서버에서 직접 받습니다. */
const C = "npdp-shell-v2";
self.addEventListener("install", e => { self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./manifest.webmanifest", "./app-icon-192.png"])).catch(() => {})); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    if (r.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith(".html")) {
      // 페이지는 항상 최신 버전 우선, 오프라인일 때만 저장본
      e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put("./", cp)); } return res; })
        .catch(() => caches.match("./")));
      return;
    }
    e.respondWith(caches.match(r).then(m => m || fetch(r)));
    return;
  }
  // 글꼴·Firebase 라이브러리(버전 고정 파일)만 저장해 두고 재사용
  if (u.hostname === "cdn.jsdelivr.net" || (u.hostname === "www.gstatic.com" && u.pathname.startsWith("/firebasejs/"))) {
    e.respondWith(caches.open(C).then(c => c.match(r).then(m => m || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }))));
  }
});
