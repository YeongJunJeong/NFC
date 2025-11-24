/**
 * 전역 그림자 스타일 정의
 * Opal 스타일: 미묘하고 세련된 그림자 효과
 */

import { Platform } from 'react-native';

/**
 * 카드 그림자 스타일 - 더 미묘하고 세련되게
 */
export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,      // 더 미묘한 그림자
      shadowRadius: 4,
    },
    android: {
      elevation: 2,              // 더 낮은 elevation
    },
    web: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',  // 더 미묘한 그림자
    },
  }),

  // 호버 효과용 그림자 (웹) - 부드럽고 미묘하게
  cardHover: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    android: {
      elevation: 3,
    },
    web: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',  // 부드러운 호버 효과
    },
  }),
} as const;

