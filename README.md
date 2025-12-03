# 2026학년도 KIS 10학년 알림이

교사, 학생, 학부모가 함께하는 스마트 소통 플랫폼

## 📋 프로젝트 개요

이 프로젝트는 **Progressive Web App (PWA)** 기반의 학교 소통 플랫폼입니다. 

**Firebase Firestore**를 사용하여 실시간 데이터 동기화를 제공하며, **오프라인에서도 작동**합니다. 모든 기능이 단일 HTML 파일(`index.html`)에 통합되어 있어 배포와 관리가 간편합니다.

## 🚀 실행 방법

### 로컬 실행

이 프로젝트는 정적 파일로 구성되어 있어 **웹 서버가 필요**합니다.

**방법 1: Python 사용 (권장)**
```bash
# Python 3가 설치되어 있는 경우
python -m http.server 8000
```

**방법 2: Node.js 사용**
```bash
# http-server 설치 (한 번만)
npm install -g http-server

# 서버 실행
http-server -p 8000
```

**방법 3: VS Code Live Server 확장 사용**
- VS Code에서 `index.html` 파일을 열고
- 우클릭 → "Open with Live Server" 선택

**브라우저에서 접속**
- `http://localhost:8000` 접속

### 배포 방법

**GitHub Pages 배포**
```bash
# 1. GitHub 저장소에 파일 업로드
git add .
git commit -m "Deploy PWA"
git push origin main

# 2. Settings → Pages → Source를 "main branch"로 설정
# 3. https://[사용자명].github.io/[저장소명] 으로 접속
```

**Firebase Hosting 배포**
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인
firebase login

# 초기화
firebase init hosting

# 배포
firebase deploy
```

## ⚙️ Firebase 설정

### 자신의 Firebase 프로젝트 사용하기

1. **Firebase 프로젝트 생성**
   - [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성

2. **Firestore Database 활성화**
   - Firebase Console → Firestore Database → 데이터베이스 만들기

3. **`index.html` 파일의 Firebase 설정 수정**
   
   파일 내에서 다음 부분을 찾아 수정:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

4. **Firestore 보안 규칙 설정**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // 개발용 - 프로덕션에서는 적절한 규칙 설정 필요
       }
     }
   }
   ```

## 📁 파일 구조

```
2026KIS/
├── index.html      # 메인 애플리케이션 (모든 HTML, CSS, JavaScript 포함)
├── manifest.json   # PWA 매니페스트 (앱 정보, 아이콘)
├── sw.js          # Service Worker (오프라인 지원, 캐싱)
├── README.md      # 프로젝트 문서
└── .gitignore     # Git 제외 파일 목록
```

### 파일 설명

- **`index.html`** (215KB, 5,087줄)
  - 완전한 독립 실행형 애플리케이션
  - 모든 HTML, CSS, JavaScript 코드 포함
  - Firebase Firestore 연동 코드 내장
  - 실시간 데이터 동기화 기능

- **`sw.js`** (4.9KB)
  - Service Worker: PWA 오프라인 지원
  - 캐시 우선 전략으로 빠른 로딩
  - 백그라운드 동기화 지원

- **`manifest.json`** (1.6KB)
  - PWA 설정 파일
  - 앱 이름, 아이콘, 테마 색상 정의
  - 홈 화면 추가 시 사용

## 🔑 주요 기능

### 📊 대시보드
- 실시간 통계 (공지사항, 댓글, 질문, 사용자 수)
- 최근 공지사항 미리보기
- 빠른 네비게이션

### 📢 공지사항
- **작성 및 관리** (교사 전용)
  - 제목, 내용, 카테고리 설정
  - 긴급 공지 표시 (🚨)
  - 파일 첨부 지원 (이미지, PDF, 문서)
  - 관련 날짜 설정
- **댓글 시스템**
  - 실시간 댓글 작성 및 표시
  - 익명 댓글 지원
- **실시간 동기화**
  - Firebase Firestore 연동
  - 모든 사용자에게 즉시 반영

### ❓ 질문/상담
- **익명 질문 작성** (학생/학부모)
  - 카테고리별 분류 (학습, 생활, 진로, 기타)
  - 비공개 질문 가능
- **교사 답변**
  - 실시간 답변 작성
  - 답변 상태 표시 (미답변/답변완료)

### 👥 회원관리
- **사용자 등록 시스템**
  - 역할별 가입 (교사/학생/학부모)
  - 학생: 학번, 이름
  - 학부모: 자녀 학번, 관계
- **승인 시스템** (교사 전용)
  - 대기 중인 회원 목록
  - 승인/거부 기능
  - 역할별 필터링

### 📅 달력
- **월별 달력 표시**
  - 이전/다음 달 네비게이션
  - 오늘 날짜 강조
  - 주말 및 공휴일 표시
- **일정 관리** (교사 전용)
  - 학교 일정 추가/수정/삭제
  - 일정 카테고리 (학사, 행사, 시험, 방학, 기타)
  - 날짜별 일정 표시

### 📱 PWA 기능
- **앱처럼 설치 가능**
  - 홈 화면에 추가
  - 전체 화면 모드
  - 네이티브 앱 느낌
- **오프라인 지원**
  - Service Worker 캐싱
  - 오프라인에서도 기본 기능 사용 가능
- **푸시 알림** (확장 가능)
  - 새 공지사항 알림
  - 질문 답변 알림

## 📱 PWA 설치 방법

### 데스크톱 (Chrome/Edge)
1. 웹사이트 접속
2. 주소창 오른쪽의 "앱 설치" 아이콘 클릭
3. "설치" 버튼 클릭

### 모바일 (iOS/Android)
1. 웹사이트 접속
2. **iOS**: 공유 버튼 → "홈 화면에 추가"
3. **Android**: 메뉴 → "홈 화면에 추가"

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 
  - 그라데이션 디자인
  - 애니메이션 효과
  - 반응형 레이아웃
- **JavaScript (ES6+)**:
  - 모듈 패턴
  - Async/Await
  - DOM 조작

### Backend
- **Firebase Firestore**
  - 실시간 데이터베이스
  - NoSQL 구조
  - 자동 동기화

### PWA
- **Service Worker**: 오프라인 지원, 캐싱
- **Web App Manifest**: 앱 메타데이터
- **LocalStorage**: 로컬 데이터 백업

### 외부 라이브러리
- **Firebase SDK 9.23.0**: Firestore 연동
- **Google Fonts**: Noto Sans KR

## 🎨 디자인 특징

- **모던한 UI/UX**
  - 그라데이션 배경 (#667eea → #764ba2)
  - 부드러운 애니메이션
  - 직관적인 네비게이션
- **반응형 디자인**
  - 모바일, 태블릿, 데스크톱 지원
  - 유연한 그리드 레이아웃
- **접근성**
  - 시맨틱 HTML
  - 명확한 레이블
  - 키보드 네비게이션 지원

## ⚠️ 주의사항

- 이 프로젝트는 **교육 목적**으로 제작되었습니다.
- Firebase 무료 플랜 사용 시 **일일 사용량 제한**이 있습니다.
  - Firestore: 읽기 50,000회/일, 쓰기 20,000회/일
  - 저장소: 1GB
- **프로덕션 환경**에서는 반드시 Firestore 보안 규칙을 설정하세요.
- 개인정보는 최소한으로 수집하며, **비밀번호는 정기적으로 변경**을 권장합니다.
- 파일 첨부 기능은 현재 **Base64 인코딩** 방식으로 구현되어 있어 대용량 파일에는 적합하지 않습니다.

## 🔧 문제 해결

### Firebase 연결 오류
```
❌ Firebase 초기화 실패
```
**해결 방법**: `index.html`의 Firebase 설정이 올바른지 확인하세요.

### Service Worker 등록 실패
```
❌ Service Worker 등록 실패
```
**해결 방법**: HTTPS 또는 localhost에서만 Service Worker가 작동합니다.

### 오프라인에서 작동하지 않음
**해결 방법**: 
1. 온라인 상태에서 한 번 이상 접속
2. Service Worker가 캐시를 생성할 시간 필요
3. 브라우저 캐시 확인 (개발자 도구 → Application → Cache Storage)

## 📝 라이선스

이 프로젝트는 교육 목적으로 자유롭게 사용할 수 있습니다.

---

**Made with ❤️ for 교육 현장**

**버전**: 1.0.0  
**최종 업데이트**: 2025-12-02

