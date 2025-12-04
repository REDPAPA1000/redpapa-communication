# 🚨 긴급: 앱 실행 방법 변경 필요

## ❌ 현재 문제

`file:///D:/project/2026KIS/index.html`로 실행 중이어서 **모든 버튼이 작동하지 않습니다:**
- 회원가입 버튼 ❌
- 로그아웃 버튼 ❌
- 공지사항 삭제 버튼 ❌
- Firebase 연동 ❌

## ✅ 즉시 해결 방법

### 방법 1: Python 웹서버 (가장 간단)

1. **명령 프롬프트(CMD) 또는 PowerShell 열기**
2. **다음 명령어 실행:**

```bash
cd d:\project\2026KIS
python -m http.server 8000
```

3. **브라우저에서 접속:**
```
http://localhost:8000
```

4. **서버 종료:** `Ctrl + C`

### 방법 2: VS Code Live Server

1. VS Code에서 `index.html` 열기
2. 우클릭 → **"Open with Live Server"** 선택
3. 자동으로 브라우저가 열림

### 방법 3: GitHub Pages (영구 해결책)

1. GitHub 저장소 설정: https://github.com/REDPAPA1000/redpapa-communication/settings/pages
2. **Source:** `main` branch, `/ (root)` 선택
3. **Save** 클릭
4. 1-2분 후 접속: `https://redpapa1000.github.io/redpapa-communication/`

## 🎯 지금 당장 해야 할 일

**아래 명령어를 복사해서 실행하세요:**

```bash
cd d:\project\2026KIS
python -m http.server 8000
```

그 다음 브라우저에서:
```
http://localhost:8000
```

이렇게 하면 **모든 버튼이 정상 작동**합니다! 🎉

## ⚠️ 절대 사용 금지

```
file:///D:/project/2026KIS/index.html  ❌❌❌
```

이 방법으로는 앱이 제대로 작동하지 않습니다!
