const CACHE_NAME = 'kis-communication-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
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

// 네트워크 요청 가로채기 - 캐시 우선 전략
self.addEventListener('fetch', function (event) {
  // Firebase API 요청 및 비-HTTP 요청(확장 프로그램 등)은 무시
  if (event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('firebase') ||
    !event.request.url.startsWith('http') ||
    event.request.method !== 'GET') {
    return; // 캐싱하지 않음
  }

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

// 푸시 알림 (미래 확장용)
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    console.log('📢 푸시 알림 수신:', data);

    const options = {
      body: data.body,
      icon: data.icon || './manifest.json',
      badge: './manifest.json',
      data: data.url,
      actions: [
        {
          action: 'open',
          title: '보기',
          icon: './manifest.json'
        },
        {
          action: 'close',
          title: '닫기'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'open') {
    const url = event.notification.data || './';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
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
