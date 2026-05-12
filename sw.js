const CACHE_NAME = 'kis-communication-v2.0.0';
const urlsToCache = [
  './',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
];

// 설치 이벤트 - 필요한 파일들을 캐시에 저장
self.addEventListener('install', function (event) {
  console.log('🔧 Service Worker 설치 중...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('📦 캐시 준비 완료');
        return cache.addAll(urlsToCache);
      })
      .then(function () {
        console.log('✅ Service Worker 설치 완료');
        return self.skipWaiting(); // 즉시 활성화
      })
      .catch(function (error) {
        console.error('❌ Service Worker 설치 실패:', error);
      })
  );
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', function (event) {
  console.log('🚀 Service Worker 활성화 중...');

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      console.log('✅ Service Worker 활성화 완료');
      return self.clients.claim(); // 즉시 제어권 가져오기
    })
  );
});

// 네트워크 요청 가로채기 - index.html은 네트워크 우선, 나머지는 캐시 우선
self.addEventListener('fetch', function (event) {
  // Firebase API 요청 및 비-HTTP 요청(확장 프로그램 등)은 무시
  if (event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('firebase') ||
    !event.request.url.startsWith('http') ||
    event.request.method !== 'GET') {
    return; // 캐싱하지 않음
  }

  // index.html은 항상 네트워크 우선 (실시간 업데이트를 위해)
  const url = new URL(event.request.url);
  const isIndexHtml = url.pathname === '/' || url.pathname === '/index.html' || url.pathname.endsWith('/index.html');

  if (isIndexHtml) {
    // 네트워크 우선 전략 (index.html)
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          // 네트워크 응답을 캐시에 저장
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(function () {
          // 네트워크 실패 시 캐시에서 반환 (오프라인 지원)
          return caches.match(event.request);
        })
    );
  } else {
    // 캐시 우선 전략 (기타 파일)
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          // 캐시에서 발견되면 반환
          if (response) {
            return response;
          }

          // 캐시에 없으면 네트워크에서 가져와서 캐시에 저장
          return fetch(event.request).then(function (response) {
            // 유효한 응답이 아니면 그냥 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답을 복제해서 캐시에 저장
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function (cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }).catch(function () {
            // 네트워크 실패 시 오프라인 페이지 반환 (옵션)
            if (event.request.destination === 'document') {
              return caches.match('./');
            }
          });
        })
    );
  }
});

// 백그라운드 동기화 (옵션)
self.addEventListener('sync', function (event) {
  if (event.tag === 'background-sync') {
    console.log('🔄 백그라운드 동기화 시작');
    event.waitUntil(
      // 여기서 Firebase와 동기화 로직 구현 가능
      console.log('📊 데이터 동기화 완료')
    );
  }
});

// 푸시 알림 수신 처리
self.addEventListener('push', function (event) {
  var title = '📢 KIS 8학년 알림이';
  var body = '새 공지사항이 있습니다. 탭하여 확인하세요.';
  var tag = 'kis-announcement';

  if (event.data) {
    try {
      var data = event.data.json();
      if (data.title) title = data.title;
      if (data.body) body = data.body;
      if (data.tag) tag = data.tag;
    } catch (e) {
      var text = event.data.text();
      if (text) body = text;
    }
  }

  var options = {
    body: body,
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE5MiIgaGVpZ2h0PSIxOTIiIGZpbGw9IiM2NjdlZWEiIHJ4PSIyNCIvPjx0ZXh0IHg9Ijk2IiB5PSIxMjQiIGZvbnQtc2l6ZT0iOTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfk6I8L3RleHQ+PC9zdmc+',
    badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIGZpbGw9IiM2NjdlZWEiIHJ4PSIxMiIvPjx0ZXh0IHg9IjM2IiB5PSI0OCIgZm9udC1zaXplPSIzNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+ToTwvdGV4dD48L3N2Zz4=',
    tag: tag,
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: self.registration.scope }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 탭 → 앱 열기
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url)
    || self.registration.scope;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// 메시지 처리 (앱에서 서비스 워커로 메시지 전송 시)
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('👨‍💼 Service Worker 로드 완료 - KIS 소통창구');
