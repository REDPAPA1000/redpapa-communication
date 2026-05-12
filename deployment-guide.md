# 🚀 2026학년도 빨간아빠 소통창구 배포 가이드

## 📋 목차
1. [페이징 기능 테스트](#페이징-기능-테스트)
2. [실제 관리자 계정 생성](#실제-관리자-계정-생성)
3. [GitHub 연동](#github-연동)
4. [Google Sheets 연동](#google-sheets-연동)
5. [Firebase 연동](#firebase-연동)
6. [PWA 변환](#pwa-변환)

---

## 🔢 페이징 기능 테스트

### ✅ **추가된 기능**
- **대시보드에 페이징**: 공지사항 5개씩 제한
- **페이지 네비게이션**: 이전/다음, 페이지 번호 (최대 5개 표시)
- **페이지 정보**: 현재 페이지/전체 페이지 (총 개수)
- **자동 페이징**: 5개 이하면 페이징 숨김

### 🧪 **테스트 방법**
1. 웹사이트 열기
2. 교사 계정으로 로그인 (`kim_teacher` / `teacher123`)
3. 대시보드에서 페이징 버튼 확인 (현재 8개 샘플 데이터)
4. 페이지 이동 테스트

---

## 👨‍🏫 실제 관리자 계정 생성

### 📝 **방법 1: 코드 수정으로 교사 계정 추가**

`loadSampleUsers()` 함수에 본인 계정 추가:

```javascript
// 교사 계정 (관리자 권한 포함)
{
    id: 'teacher002',
    role: 'teacher',
    name: '본인이름',
    userId: 'your_username',
    password: 'your_password',
    email: 'your_email@school.com',
    class: '원하는반',
    status: 'active',
    joinDate: '2024-11-17',
    lastLogin: null
}
```

### 📝 **방법 2: 브라우저에서 직접 추가**

1. 웹사이트 열기
2. F12 → Console 탭
3. 다음 코드 실행:

```javascript
// 새 교사 계정 추가
users.push({
    id: 'teacher_' + Date.now(),
    role: 'teacher',
    name: '본인이름',
    userId: 'your_username',
    password: 'your_password',
    email: 'your_email@school.com',
    class: '원하는반',
    status: 'active',
    joinDate: '2024-11-17',
    lastLogin: null
});

// 로컬스토리지에 저장
localStorage.setItem('users', JSON.stringify(users));
alert('계정이 추가되었습니다!');
```

---

## 🐙 GitHub 연동

### 🔧 **1. GitHub Repository 생성**

```bash
# 1. 로컬 폴더 생성
mkdir redpapa-communication
cd redpapa-communication

# 2. Git 초기화
git init

# 3. 파일 복사 (웹사이트 파일)
# redpapa-communication-web.html을 index.html로 이름 변경

# 4. README.md 생성
echo "# 2026학년도 빨간아빠 소통창구" > README.md

# 5. .gitignore 생성
cat > .gitignore << EOF
node_modules/
.env
*.log
.DS_Store
EOF

# 6. 첫 커밋
git add .
git commit -m "🎉 Initial commit: 빨간아빠 소통창구 웹사이트"

# 7. GitHub 원격 저장소 연결
git remote add origin https://github.com/yourusername/redpapa-communication.git
git branch -M main
git push -u origin main
```

### 🌐 **2. GitHub Pages 배포**

1. GitHub Repository → Settings
2. Pages 섹션
3. Source: Deploy from a branch
4. Branch: main / root
5. Save → 자동 배포 URL 생성

---

## 📊 Google Sheets 연동

### 🔧 **1. Google Apps Script 설정**

#### **Step 1: Google Sheets 생성**
```
1. 새 Google Sheets 생성
2. 시트 이름들:
   - announcements (공지사항)
   - questions (질문/상담)
   - users (회원)
   - calendar (일정)
```

#### **Step 2: Apps Script 코드**

```javascript
// 📁 Google Apps Script 코드
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'getAnnouncements':
        return ContentService.createTextOutput(
          JSON.stringify(getAnnouncements())
        ).setMimeType(ContentService.MimeType.JSON);
        
      case 'createAnnouncement':
        return ContentService.createTextOutput(
          JSON.stringify(createAnnouncement(data.announcement))
        ).setMimeType(ContentService.MimeType.JSON);
        
      case 'getUsers':
        return ContentService.createTextOutput(
          JSON.stringify(getUsers())
        ).setMimeType(ContentService.MimeType.JSON);
        
      case 'createUser':
        return ContentService.createTextOutput(
          JSON.stringify(createUser(data.user))
        ).setMimeType(ContentService.MimeType.JSON);
        
      default:
        return ContentService.createTextOutput(
          JSON.stringify({error: 'Invalid action'})
        ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(error) {
    return ContentService.createTextOutput(
      JSON.stringify({error: error.toString()})
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// 공지사항 조회
function getAnnouncements() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('announcements');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// 공지사항 생성
function createAnnouncement(announcement) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('announcements');
  
  // 헤더가 없으면 추가
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'id', 'title', 'content', 'author', 'authorEmail', 
      'date', 'urgent', 'category', 'comments', 'createdAt'
    ]);
  }
  
  sheet.appendRow([
    announcement.id,
    announcement.title,
    announcement.content,
    announcement.author,
    announcement.authorEmail,
    announcement.date,
    announcement.urgent,
    announcement.category,
    JSON.stringify(announcement.comments || []),
    new Date().toISOString()
  ]);
  
  return {success: true, id: announcement.id};
}

// 회원 조회
function getUsers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  if (sheet.getLastRow() === 0) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// 회원 생성
function createUser(user) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'id', 'role', 'name', 'userId', 'password', 'email', 
      'number', 'childNumber', 'class', 'status', 'joinDate', 'lastLogin'
    ]);
  }
  
  sheet.appendRow([
    user.id,
    user.role,
    user.name,
    user.userId,
    user.password,
    user.email || '',
    user.number || '',
    user.childNumber || '',
    user.class || '',
    user.status,
    user.joinDate,
    user.lastLogin
  ]);
  
  return {success: true, id: user.id};
}
```

#### **Step 3: 웹앱 배포**
```
1. Apps Script → 배포 → 새 배포
2. 유형: 웹앱
3. 실행 위치: 나
4. 액세스 권한: 모든 사용자
5. 배포 → 웹앱 URL 복사
```

### 🔗 **3. 웹사이트 연동 코드**

```javascript
// 웹사이트에 추가할 Google Sheets 연동 코드
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';

// 공지사항 저장
async function saveAnnouncementToSheets(announcement) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'createAnnouncement',
                announcement: announcement
            })
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Google Sheets 저장 실패:', error);
        return {error: error.message};
    }
}

// 공지사항 불러오기
async function loadAnnouncementsFromSheets() {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getAnnouncements'
            })
        });
        
        const announcements = await response.json();
        return announcements;
    } catch (error) {
        console.error('Google Sheets 로드 실패:', error);
        return [];
    }
}
```

---

## 🔥 Firebase 연동

### 🔧 **1. Firebase 프로젝트 생성**

```
1. https://console.firebase.google.com/
2. 프로젝트 추가 → "redpapa-communication"
3. Firestore Database 활성화
4. Authentication 활성화
```

### 🔧 **2. Firestore 규칙 설정**

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 공지사항 - 모든 사람이 읽기 가능, 교사만 쓰기
    match /announcements/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // 사용자 - 본인 데이터만 읽기, 교사는 모든 데이터
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                         (request.auth.uid == userId || 
                          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher');
    }
    
    // 질문 - 본인 질문만 읽기, 교사는 모든 질문
    match /questions/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 🔗 **3. 웹사이트 Firebase 연동**

```html
<!-- Firebase SDK 추가 -->
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js';
  import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
  import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

  // Firebase 설정
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Firebase 초기화
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // 공지사항 저장
  window.saveAnnouncementToFirebase = async function(announcement) {
    try {
      const docRef = await addDoc(collection(db, "announcements"), {
        ...announcement,
        createdAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding document: ", error);
      return { error: error.message };
    }
  }

  // 공지사항 불러오기
  window.loadAnnouncementsFromFirebase = async function() {
    try {
      const querySnapshot = await getDocs(collection(db, "announcements"));
      const announcements = [];
      querySnapshot.forEach((doc) => {
        announcements.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return announcements;
    } catch (error) {
      console.error("Error getting documents: ", error);
      return [];
    }
  }
</script>
```

---

## 📱 PWA 변환

### 🔧 **1. Manifest 파일 생성**

```json
<!-- manifest.json -->
{
  "name": "2026학년도 빨간아빠 소통창구",
  "short_name": "빨간아빠소통창구",
  "description": "교사, 학생, 학부모가 함께하는 소통 공간",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 🔧 **2. Service Worker 생성**

```javascript
// sw.js
const CACHE_NAME = 'redpapa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

### 🔧 **3. HTML 수정**

```html
<!-- head 태그에 추가 -->
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="빨간아빠소통창구">

<!-- body 끝에 추가 -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
          console.log('SW registered: ', registration);
        }, function(registrationError) {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
</script>
```

---

## 🚀 최종 배포 순서

### 📝 **추천 순서**

1. **🧪 로컬 테스트**: 페이징 기능 및 기본 기능 확인
2. **👨‍🏫 관리자 계정**: 본인 교사 계정 생성
3. **🐙 GitHub 연동**: 코드 버전 관리
4. **📊 데이터 저장**: Google Sheets 또는 Firebase 선택
5. **📱 PWA 변환**: 앱처럼 사용 가능
6. **🌐 배포**: GitHub Pages 또는 Firebase Hosting

### 🎯 **테스트 체크리스트**

- [ ] 페이징 기능 작동
- [ ] 교사 계정 로그인
- [ ] 공지사항 작성/수정/삭제
- [ ] 회원 관리 기능
- [ ] 질문/상담 기능
- [ ] 댓글 시스템
- [ ] 달력 기능
- [ ] 검색 기능

---

## 💡 추가 개선 사항

### 🔮 **향후 업데이트 예정**
- 실시간 알림 (Push Notification)
- 파일 첨부 기능
- 다크 모드
- 다국어 지원
- 성적 관리 시스템

---

**🎉 성공적인 배포를 위해 단계별로 진행하시기 바랍니다!**
