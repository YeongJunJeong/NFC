# 개발 가이드

## 프로젝트 구조

```
NFC/
├── app/                      # Expo Router 페이지
│   ├── _layout.tsx          # 루트 레이아웃
│   ├── index.tsx            # 메인 화면
│   └── exhibition/
│       └── [id].tsx         # 동적 라우트 (전시 상세)
├── components/              # 재사용 가능한 컴포넌트
│   └── ExhibitionCard.tsx
├── hooks/                   # 커스텀 훅
│   └── useResponsive.ts
├── theme/                   # 디자인 시스템
│   ├── colors.ts
│   ├── typography.ts
│   └── shadows.ts
└── docs/                    # 문서
    ├── SETUP.md
    └── DEVELOPMENT.md
```

## 주요 기능

### 1. 메인 화면 (`app/index.tsx`)

- 진행중인 전시 목록 표시
- 미니멀한 블랙 컨셉 디자인
- 부드러운 fade-in 애니메이션

### 2. 전시 상세 페이지 (`app/exhibition/[id].tsx`)

- 전시 정보 표시
- 작품별 오디오 가이드 목록
- 뒤로가기 네비게이션

### 3. 전시 카드 컴포넌트 (`components/ExhibitionCard.tsx`)

- 전시 정보를 카드 형태로 표시
- 호버 효과 (웹)
- 클릭 시 상세 페이지로 이동

## 디자인 시스템

### 색상 (`theme/colors.ts`)

- **배경**: 순수 블랙 (#000000) 기반
- **텍스트**: 화이트 및 그레이 톤
- **카드**: 미묘한 그레이 배경

### 타이포그래피 (`theme/typography.ts`)

- 얇은 폰트 (fontWeight: 200-300)
- 넓은 letter spacing
- 미니멀한 스타일

### 반응형 (`hooks/useResponsive.ts`)

- 모바일: ≤600px (1컬럼)
- 태블릿/데스크톱: >600px (2컬럼)
- 웹: 최대 너비 800px 중앙 정렬

## 개발 워크플로우

### 새 페이지 추가

1. `app/` 디렉토리에 새 파일 생성
2. `app/_layout.tsx`에 라우트 추가 (필요시)

### 새 컴포넌트 추가

1. `components/` 디렉토리에 컴포넌트 파일 생성
2. TypeScript 인터페이스 정의
3. 테마 시스템 활용

### 스타일 수정

- 전역 색상: `theme/colors.ts`
- 타이포그래피: `theme/typography.ts`
- 그림자: `theme/shadows.ts`

## 코드 스타일

- TypeScript 사용
- 함수형 컴포넌트
- 명확한 주석 작성
- 일관된 네이밍 컨벤션

## 빌드 및 배포

### 개발 빌드

```bash
npm start
```

### 프로덕션 빌드

```bash
# 웹 빌드
npx expo export:web

# iOS 빌드 (EAS Build 필요)
eas build --platform ios

# Android 빌드 (EAS Build 필요)
eas build --platform android
```

## 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [Expo Router 문서](https://docs.expo.dev/router/introduction/)
- [React Native 문서](https://reactnative.dev/)

