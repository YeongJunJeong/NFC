/**
 * 반응형 디자인을 위한 커스텀 훅
 * 화면 너비에 따라 mobile/tablet/desktop 구분
 */

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

// 브레이크포인트 정의
const BREAKPOINTS = {
  mobile: 600,    // 모바일: ≤600px
  tablet: 900,    // 태블릿: ≤900px
  desktop: 901,   // 데스크톱: ≥901px
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  width: number;
  deviceType: DeviceType;
  gridColumns: 1 | 2;  // 그리드 컬럼 수 (1 또는 2)
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * 화면 너비를 기반으로 반응형 정보를 제공하는 훅
 * @returns {ResponsiveState} 반응형 상태 정보
 */
export const useResponsive = (): ResponsiveState => {
  const [dimensions, setDimensions] = useState<ScaledSize>(
    Dimensions.get('window')
  );

  useEffect(() => {
    // 화면 크기 변경 감지
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        setDimensions(window);
      }
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  const { width } = dimensions;

  // 디바이스 타입 결정
  let deviceType: DeviceType;
  if (width <= BREAKPOINTS.mobile) {
    deviceType = 'mobile';
  } else if (width <= BREAKPOINTS.tablet) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }

  // 그리드 컬럼 수 결정
  // 모바일: 1컬럼, 태블릿/데스크톱: 2컬럼
  const gridColumns: 1 | 2 = width <= BREAKPOINTS.mobile ? 1 : 2;

  return {
    width,
    deviceType,
    gridColumns,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  };
};

