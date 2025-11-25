# 📚 2026학년도 KIS 10학년 알림이

👨‍🏫 교사, 👨‍🎓 학생, 👨‍👩‍👧‍👦 학부모가 함께하는 스마트 소통 플랫폼

## ✨ 주요 기능

- 📢 **공지사항**: 실시간 알림, 댓글, 긴급 공지, Firebase 실시간 동기화
- ❓ **질문/상담**: 익명 질문, 교사 답변
- 👥 **회원관리**: 학생/학부모 가입 승인
- 📅 **달력**: 학교 일정, 공휴일 표시
- 📱 **PWA**: 앱처럼 설치 및 사용 가능, 오프라인 지원
- 🔄 **Firebase 연동**: 실시간 데이터 동기화
- 🔢 **페이징 시스템**: 대시보드 5개씩 제한 표시
- ⚙️ **관리자 패널**: 교사 계정 생성, 데이터 백업/복원

## 🚀 사용 방법

### 테스트 계정
- **교사 로그인**: `kim_teacher` / `teacher123`
- **학생 로그인**: `01` / `student123`
- **학부모 로그인**: `01` / `parent123`

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Firestore (실시간 데이터베이스)
- **PWA**: Service Worker, Web App Manifest
- **Storage**: Firebase + LocalStorage (백업)

## 📱 설치 방법 (PWA)

1. 웹사이트 접속
2. 브라우저 주소창에서 "앱 설치" 아이콘 클릭 (Chrome/Edge)
3. 또는 모바일에서 "공유" → "홈 화면에 추가"
4. 앱처럼 사용 가능 (오프라인 지원)

## 🎯 주요 특징

### ✅ 최신 업데이트 (v1.2)
- ✅ Firebase 실시간 동기화 (교사 글 작성 시 학생에게 즉시 표시)
- ✅ PWA 설치 상태 확인 (이미 설치된 경우 프롬프트 표시 안 함)
- ✅ 데이터 지속성 개선 (재로그인 시 모든 기록 유지)
- ✅ 페이징 시스템 (대시보드 5개씩 제한)

### 🔄 실시간 기능
- 교사가 공지사항 작성 → 학생에게 즉시 표시
- 모든 변경사항 실시간 동기화
- 오프라인 지원 (Service Worker)

## 📂 파일 구조

```
2026 kis/
├── index.html              # 메인 애플리케이션
├── manifest.json           # PWA 매니페스트
├── sw.js                   # Service Worker (오프라인 지원)
├── firebase-functions.js   # Firebase 연동 함수
└── README.md               # 이 파일
```

## 🔥 Firebase 설정

이 프로젝트는 Firebase Firestore를 사용합니다. 

1. Firebase Console에서 프로젝트 생성
2. Firestore Database 활성화
3. `index.html`의 `firebaseConfig` 설정 확인

## 📖 배포 가이드

자세한 배포 방법은 다음 파일을 참고하세요:
- `github-deployment-guide.md` - GitHub Pages 배포 가이드
- `deployment-guide.md` - 전체 배포 가이드

## 🛡️ 보안

- 개인정보는 최소한으로 수집
- 비밀번호는 정기적으로 변경 권장
- 교사만 관리자 권한 보유

---

**Made with ❤️ for 교육 현장**

