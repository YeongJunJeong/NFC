/**
 * 전역 색상 테마 정의
 * Opal 앱 스타일: 미니멀하고 차갑고 도도한 블랙 컨셉
 */

export const colors = {
  // 배경 색상 - 더 깊고 차가운 블랙
  background: {
    primary: '#000000',      // 순수 블랙 메인 배경
    secondary: '#0A0A0A',    // 미묘한 그레이 블랙
    card: '#0A0A0A',         // 카드 배경 (더 미묘한 그레이)
    cardHover: '#151515',    // 카드 호버 배경 (부드러운 전환)
    border: '#1A1A1A',       // 보더 색상
  },

  // 텍스트 색상 - 더 정제되고 차가운 화이트
  text: {
    primary: '#FFFFFF',      // 순수 화이트 (더 강렬)
    secondary: '#B3B3B3',    // 차가운 그레이 (더 미묘)
    muted: '#666666',        // 비활성 텍스트 (더 차갑게)
    subtle: '#4A4A4A',       // 매우 미묘한 텍스트
  },

  // 액센트 색상 - 미니멀하고 차가운
  accent: {
    primary: '#FFFFFF',      // 순수 화이트
    secondary: '#E5E5E5',    // 차가운 화이트
    tertiary: '#CCCCCC',     // 부드러운 그레이
  },
} as const;

