// Service Worker for 2026학년도 빨간아빠 소통창구
const CACHE_NAME = 'redpapa-v1.1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap'
];

// 설치 이벤트
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker: 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 캐시 생성됨:', CACHE_NAME);
        return cache.addAll(CACHE_URLS);
      })
      .then(function() {
        console.log('✅ 모든 파일 캐시됨');
        return self.skipWaiting();
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', function(event) {
  console.log('🚀 Service Worker: 활성화됨');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch 이벤트 (네트워크 요청 가로채기)
self.addEventListener('fetch', function(event) {
  // HTML 페이지는 네트워크 우선, 실패시 캐시
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          // 성공적인 응답을 캐시에 저장
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(function() {
          // 네트워크 실패시 캐시에서 가져오기
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 기타 리소스는 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          // 캐시에 있으면 캐시에서 반환
          return response;
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request)
          .then(function(response) {
            // 유효한 응답인지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 응답을 캐시에 저장
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});

// 백그라운드 동기화 (향후 기능)
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('🔄 백그라운드 동기화 실행');
    // 추후 오프라인 데이터 동기화 구현
  }
});

// 푸시 알림 (향후 기능)
self.addEventListener('push', function(event) {
  console.log('📱 푸시 알림 수신');
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('빨간아빠 소통창구', options)
  );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', function(event) {
  console.log('🖱️ 알림 클릭됨:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // 앱 열기
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 오류 처리
self.addEventListener('error', function(event) {
  console.error('❌ Service Worker 오류:', event.error);
});

// 메시지 처리 (메인 앱과의 통신)
self.addEventListener('message', function(event) {
  console.log('💬 메시지 수신:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // 캐시 강제 업데이트
    caches.delete(CACHE_NAME).then(() => {
      caches.open(CACHE_NAME).then(cache => {
        cache.addAll(CACHE_URLS);
      });
    });
  }
});

console.log('🎉 Service Worker 로드됨: redpapa-communication v1.1');
