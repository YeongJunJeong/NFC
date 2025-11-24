# 설치 및 설정 가이드

## 필수 요구사항

- Node.js 20.19.4 이상 (권장)
- npm 또는 yarn
- Expo Go 앱 (모바일 테스트용)

## 설치

```bash
# 프로젝트 클론
git clone [repository-url]
cd NFC

# 의존성 설치
npm install
```

## 개발 환경 설정

### 1. Expo Go 앱 설치 (모바일 테스트)

#### iOS
- App Store에서 "Expo Go" 검색 후 설치

#### Android
- Play Store에서 "Expo Go" 검색 후 설치

### 2. 개발 서버 실행

```bash
npm start
```

터미널에 QR 코드가 표시됩니다.

### 3. 모바일에서 접속

1. Expo Go 앱 실행
2. QR 코드 스캔
3. 앱이 자동으로 로드됩니다

## 웹에서 실행

### 같은 기기에서 실행

```bash
npm run web
```

브라우저에서 `http://localhost:8081` 접속

### 다른 기기에서 접속 (같은 Wi-Fi 필요)

1. PC와 모바일이 같은 Wi-Fi에 연결되어 있는지 확인
2. 터미널에 표시된 로컬 IP 주소 확인
   - 예: `http://192.168.0.100:8081`
3. 모바일 브라우저에서 해당 주소 입력

## 문제 해결

### 캐시 문제

```bash
# Metro bundler 캐시 정리
npx expo start --clear
```

### 패키지 설치 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### TypeScript 오류

```bash
# TypeScript 서버 재시작 (VS Code)
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

