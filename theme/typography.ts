/**
 * 전역 타이포그래피 정의
 * Opal 스타일: 미니멀하고 현대적인 타이포그래피
 */

export const typography = {
  // 큰 제목 (서비스 타이틀) - 더 얇고 세련되게
  largeTitle: {
    fontSize: 52,
    fontWeight: '200' as const,  // 더 얇은 폰트 (ultra light)
    lineHeight: 60,
    letterSpacing: -2,           // 더 넓은 letter spacing
  },

  // 제목 스타일
  title: {
    fontSize: 28,
    fontWeight: '300' as const,
    lineHeight: 36,
    letterSpacing: -0.8,
  },

  // 부제목 - 더 미묘하고 차갑게
  subtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0.2,          // 약간의 letter spacing
  },

  // 본문
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },

  // 카드 타이틀 - 더 미니멀하고 세련되게
  cardTitle: {
    fontSize: 17,
    fontWeight: '300' as const,  // 더 얇게
    lineHeight: 24,
    letterSpacing: 0.5,          // 약간의 letter spacing
  },
} as const;

