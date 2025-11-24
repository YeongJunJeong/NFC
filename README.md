# 오디오 가이드 앱

React Native + Expo SDK 50을 사용한 오디오 가이드 서비스 앱

## 시작하기

### 설치

```bash
npm install
```

### 실행 방법

#### 방법 1: 웹 브라우저에서 실행 (가장 쉬움!)

```bash
npm run web
```

터미널에 표시된 주소(보통 http://localhost:8081)를 브라우저에서 열면 됩니다.

#### 방법 2: Expo Go 앱 사용 (스마트폰에서 실행)

1. 스마트폰에 "Expo Go" 앱 설치 (안드로이드: Play Store, iOS: App Store)
2. 터미널에서 다음 명령어 실행:

```bash
npm start
```

3. 터미널에 QR 코드가 표시되면, Expo Go 앱으로 스캔
4. 앱이 자동으로 로드됩니다!

#### 방법 3: 안드로이드 에뮬레이터 (나중에 필요할 때)

- 안드로이드 스튜디오 설치 필요
- 에뮬레이터 실행 후 `npm run android` 명령어 사용

## 프로젝트 구조

- `App.tsx` - 메인 앱 컴포넌트
- `app.json` - Expo 설정 파일
