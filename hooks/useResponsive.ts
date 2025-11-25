/**
 * 반응형 디자인을 위한 커스텀 훅
 * 화면 너비에 따라 mobile/tablet/desktop 구분 및 스케일링 제공
 */

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

// 브레이크포인트 정의
const BREAKPOINTS = {
  mobile: 600,    // 모바일: ≤600px
  tablet: 900,    // 태블릿: ≤900px
  desktop: 901,   // 데스크톱: ≥901px
} as const;

// 기준 디자인 너비 (iPhone 14 Pro 기준)
const BASE_WIDTH = 393;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  width: number;
  height: number;
  deviceType: DeviceType;
  gridColumns: 1 | 2;  // 그리드 컬럼 수 (1 또는 2)
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  // 스케일링 함수들
  scale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  verticalScale: (size: number) => number;
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

  const { width, height } = dimensions;

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

  // 스케일 비율 계산
  const scaleRatio = width / BASE_WIDTH;

  /**
   * 가로 기준 스케일링 (폰트, 아이콘 크기 등)
   * @param size 기준 크기
   * @returns 스케일된 크기
   */
  const scale = (size: number): number => {
    return Math.round(size * scaleRatio);
  };

  /**
   * 완화된 스케일링 (너무 커지거나 작아지지 않도록 조절)
   * @param size 기준 크기
   * @param factor 스케일 적용 비율 (0~1, 기본 0.5)
   * @returns 완화된 스케일 크기
   */
  const moderateScale = (size: number, factor: number = 0.5): number => {
    return Math.round(size + (scale(size) - size) * factor);
  };

  /**
   * 세로 기준 스케일링 (높이, 마진 등)
   * @param size 기준 크기
   * @returns 스케일된 크기
   */
  const verticalScale = (size: number): number => {
    const baseHeight = 852; // iPhone 14 Pro 높이
    return Math.round(size * (height / baseHeight));
  };

  return {
    width,
    height,
    deviceType,
    gridColumns,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    scale,
    moderateScale,
    verticalScale,
  };
};

