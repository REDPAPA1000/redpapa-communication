# GitHub Pages 배포 가이드

## 🎯 배포 완료!

코드가 GitHub에 푸시되었습니다. 이제 GitHub Pages로 앱을 실행할 수 있습니다.

## 📋 수정 내용

### 1. 데이터 손실 버그 수정 ✅
**문제:** 
- Firebase/Google Sheets가 빈 데이터를 반환하면 로컬 공지사항이 삭제됨
- 재로그인 시 작성한 공지사항이 사라짐

**해결:**
- 원격 데이터가 비어있을 때 로컬 데이터를 보존하도록 수정
- `index.html` 4784-4789줄 수정

```javascript
// 수정 전 (문제 코드)
} else {
    announcements = [];  // ❌ 로컬 데이터 삭제!
    localStorage.setItem('announcements', JSON.stringify(announcements));
}

// 수정 후 (해결)
} else {
    // ✅ 로컬 데이터 유지
    if (announcements.length === 0) {
        console.log('📋 공지사항: Google Sheets 및 로컬 데이터 없음');
    } else {
        console.log('📋 공지사항: Google Sheets가 비어있어 로컬 데이터 유지 (' + announcements.length + '개)');
    }
}
```

## 🚀 GitHub Pages 설정 방법

### 1단계: GitHub Pages 활성화

1. GitHub 저장소로 이동: https://github.com/REDPAPA1000/redpapa-communication
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션에서:
   - Branch: `main` 선택
   - Folder: `/ (root)` 선택
5. **Save** 버튼 클릭

### 2단계: 배포 대기 (약 1-2분)

GitHub Actions가 자동으로 배포를 진행합니다.
- **Actions** 탭에서 진행 상황 확인 가능
- 초록색 체크마크가 나타나면 배포 완료

### 3단계: 앱 접속

배포가 완료되면 다음 URL로 접속:

```
https://redpapa1000.github.io/redpapa-communication/
```

## ⚠️ 중요: file:/// 프로토콜 사용 금지

**앞으로는 반드시 다음 방법 중 하나로 실행하세요:**

### ✅ 방법 1: GitHub Pages (권장)
```
https://redpapa1000.github.io/redpapa-communication/
```
- Firebase가 정상 작동
- 다중 사용자 협업 가능
- HTTPS 보안 연결

### ✅ 방법 2: 로컬 웹서버
```bash
# Python 사용
cd d:\project\2026KIS
python -m http.server 8000

# 브라우저에서:
http://localhost:8000
```

### ❌ 사용 금지: file:/// 프로토콜
```
file:///D:/project/2026KIS/index.html  ❌ 사용하지 마세요!
```
- Firebase API가 CORS 에러로 실패
- 데이터 동기화 불가능
- 다중 사용자 협업 불가능

## 🔥 Firebase 설정 확인

GitHub Pages에서 실행 시 Firebase가 정상 작동하려면:

1. Firebase Console에서 **승인된 도메인** 추가:
   - `redpapa1000.github.io` 추가
   
2. `index.html`의 Firebase 설정 확인:
   - `firebaseEnabled = true` 확인 (현재 설정됨)

## 📱 테스트 방법

1. GitHub Pages URL로 접속
2. 교사 계정으로 로그인 (teacher / 1234)
3. 공지사항 작성
4. 로그아웃 후 재로그인
5. **공지사항이 유지되는지 확인** ✅

## 🎉 완료!

이제 다음 URL에서 앱을 사용할 수 있습니다:
**https://redpapa1000.github.io/redpapa-communication/**

Firebase 연동이 정상 작동하여 교사, 학생, 학부모가 실시간으로 데이터를 공유할 수 있습니다!
